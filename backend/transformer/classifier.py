import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# 38-class labels for PlantVillage dataset
DISEASE_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy",
]

# Standard normalization for torchvision inference
_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

class DiseaseClassifier:
    """Loads a pre-trained PyTorch model (EfficientNet/ViT) and does top-3 inference."""
    def __init__(self, checkpoint_path: str):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load the saved state dict and configurations
        checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=True)
        self.model_name = checkpoint["model_name"]
        self.num_classes = checkpoint["num_classes"]
        self.class_names = checkpoint.get("class_names", DISEASE_CLASSES[:self.num_classes])
        
        # Recreate the model structure
        self.model = self._create_empty_model(self.model_name, self.num_classes)
        self.model.load_state_dict(checkpoint["model_state"])
        self.model.to(self.device)
        self.model.eval()

    def _create_empty_model(self, model_name: str, num_classes: int) -> nn.Module:
        """Helper to instantiate the model architecture."""
        if model_name.startswith("efficientnet"):
            model = models.efficientnet_v2_s(weights=None)
            num_features = model.classifier[1].in_features
            model.classifier[1] = nn.Linear(num_features, num_classes)
        elif model_name == "vit_b16":
            model = models.vit_b_16(weights=None)
            num_features = model.heads.head.in_features
            model.heads.head = nn.Linear(num_features, num_classes)
        elif model_name == "vit_huggingface":
            from transformers import ViTForImageClassification, ViTConfig
            config = ViTConfig.from_pretrained("google/vit-base-patch16-224", num_labels=num_classes)
            model = ViTForImageClassification(config)
            return model
        else:
            raise ValueError(f"Unknown architecture: {model_name}")
        return model

    def preprocess(self, image_bytes: bytes) -> torch.Tensor:
        """Preprocesses raw image bytes into a PyTorch batch tensor."""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = _TRANSFORM(image)
        return tensor.unsqueeze(0).to(self.device)

    def predict_top_3(self, image_bytes: bytes):
        """Returns the top 3 predictions with disease names and probabilities."""
        tensor = self.preprocess(image_bytes)
        with torch.no_grad():
            outputs = self.model(tensor)
            logits = outputs.logits if hasattr(outputs, "logits") else outputs
            probs = torch.softmax(logits, dim=1)[0]
        
        # Sort and pick top 3
        top_probs, top_idxs = torch.topk(probs, k=3)
        
        results = []
        for prob, idx in zip(top_probs, top_idxs):
            disease_raw = self.class_names[idx.item()]
            # Simplify label name for English reading
            disease_en = disease_raw.split("___")[-1].replace("_", " ").strip()
            results.append({
                "disease_raw": disease_raw,
                "disease_name_en": disease_en,
                "confidence": round(prob.item(), 4)
            })
        return results
