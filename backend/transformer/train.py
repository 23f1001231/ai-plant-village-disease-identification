import os
import shutil
import random
import logging
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms
from torch.utils.data import DataLoader, random_split
from torchvision.datasets import ImageFolder
from transformers import ViTForImageClassification
from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Constants
NUM_CLASSES = 38
BATCH_SIZE = 32  # 32 is more memory-safe for local machines than 64
EPOCHS = 3
LR = 1e-4

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Using device: {device}")

def clone_and_prepare_dataset(base_path: str):
    """Clones PlantVillage dataset from GitHub if not present locally."""
    color_dir = os.path.join(base_path, "color")
    dataset_dir = os.path.join(base_path, "dataset")

    if os.path.exists(dataset_dir):
        logger.info(f"Dataset directory already exists at '{dataset_dir}'. Skipping download/split.")
        return

    if not os.path.exists(color_dir):
        logger.info("PlantVillage 'color' directory not found locally. Cloning from GitHub...")
        clone_cmd = "git clone --depth 1 https://github.com/spMohanty/PlantVillage-Dataset.git"
        os.system(clone_cmd)
        
        repo_color_path = "PlantVillage-Dataset/raw/color"
        if os.path.exists(repo_color_path):
            shutil.copytree(repo_color_path, color_dir)
            logger.info("Raw PlantVillage color folder copied.")
        
        # Clean up cloned repository folder
        if os.path.exists("PlantVillage-Dataset"):
            shutil.rmtree("PlantVillage-Dataset")

    # Split dataset into train and validation
    split_train_test(color_dir, dataset_dir)

def split_train_test(source_path: str, output_path: str, split_ratio: float = 0.8, seed: int = 42):
    """Splits raw classes into clean train/test folders."""
    random.seed(seed)
    train_dir = os.path.join(output_path, "train")
    test_dir = os.path.join(output_path, "test")

    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(test_dir, exist_ok=True)

    classes = sorted(os.listdir(source_path))
    logger.info(f"Found {len(classes)} classes for split.")

    for class_name in classes:
        class_path = os.path.join(source_path, class_name)
        if not os.path.isdir(class_path):
            continue

        images = [f for f in os.listdir(class_path) if os.path.isfile(os.path.join(class_path, f))]
        random.shuffle(images)

        split_idx = int(len(images) * split_ratio)
        train_files = images[:split_idx]
        test_files = images[split_idx:]

        os.makedirs(os.path.join(train_dir, class_name), exist_ok=True)
        os.makedirs(os.path.join(test_dir, class_name), exist_ok=True)

        for f in train_files:
            shutil.copy2(os.path.join(class_path, f), os.path.join(train_dir, class_name, f))
        for f in test_files:
            shutil.copy2(os.path.join(class_path, f), os.path.join(test_dir, class_name, f))

    logger.info("Dataset train/test split successfully completed!")

def main():
    # Resolve paths relative to train.py location
    transformer_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(transformer_dir)
    
    logger.info("Preparing datasets...")
    clone_and_prepare_dataset(backend_dir)
    
    train_dir = os.path.join(backend_dir, "dataset", "train")
    
    # Transformations
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3)
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3)
    ])

    # Loading dataset
    full_dataset = ImageFolder(train_dir, transform=train_transform)
    class_names = full_dataset.classes
    
    train_size = int(0.85 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    
    train_data, val_data = random_split(full_dataset, [train_size, val_size])
    val_data.dataset.transform = val_transform  # Apply validation transforms
    
    num_workers = 2 if device.type == "cuda" else 0
    train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_data, batch_size=BATCH_SIZE, shuffle=False, num_workers=num_workers)

    logger.info("Initializing HuggingFace Vision Transformer (ViT)...")
    # Load model pre-trained weights
    model = ViTForImageClassification.from_pretrained(
        "google/vit-base-patch16-224",
        num_labels=NUM_CLASSES,
        ignore_mismatched_sizes=True
    )
    model.to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.Adam(model.parameters(), lr=LR)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)
    
    # Use PyTorch AMP for faster training
    scaler = torch.amp.GradScaler("cuda") if device.type == "cuda" else None

    logger.info("Starting training loop...")
    best_acc = 0.0

    for epoch in range(EPOCHS):
        model.train()
        train_loss = 0.0
        train_correct = 0
        
        for images, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS}"):
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()

            if scaler:
                with torch.amp.autocast("cuda"):
                    outputs = model(images)
                    loss = criterion(outputs.logits, labels)
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                outputs = model(images)
                loss = criterion(outputs.logits, labels)
                loss.backward()
                optimizer.step()

            train_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs.logits, 1)
            train_correct += (preds == labels).sum().item()

        epoch_loss = train_loss / len(train_loader.dataset)
        epoch_acc = train_correct / len(train_loader.dataset)

        # Validation phase
        model.eval()
        val_correct = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, preds = torch.max(outputs.logits, 1)
                val_correct += (preds == labels).sum().item()

        val_acc = val_correct / len(val_loader.dataset)
        logger.info(f"Epoch {epoch+1}: Train Loss = {epoch_loss:.4f} | Train Acc = {epoch_acc:.4f} | Val Acc = {val_acc:.4f}")

        # Save the best model in custom backend checkpoint format
        if val_acc > best_acc:
            best_acc = val_acc
            models_dir = os.path.join(backend_dir, "models")
            os.makedirs(models_dir, exist_ok=True)
            save_path = os.path.join(models_dir, "plant_disease.pt")
            
            logger.info(f"Saving new best checkpoint to '{save_path}' with validation accuracy: {val_acc:.4f}")
            checkpoint = {
                "model_name": "vit_huggingface",
                "num_classes": NUM_CLASSES,
                "class_names": class_names,
                "model_state": model.state_dict()
            }
            torch.save(checkpoint, save_path)

        scheduler.step()

    logger.info("Training completed successfully!")

if __name__ == "__main__":
    main()
