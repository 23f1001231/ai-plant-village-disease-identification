# Frontend

1. cd `frontend`  
2. `npm install`  
3. `npm run dev`

For build  
`npm run build`

# .env
Create `backend/.env` using below format:
```
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# OpenAI Integration
# Using langchain_openai to call direct OpenAI API
# You have to set OpenAI API key below
OPENAI_API_KEY=
LLM_MODEL=gpt-5.4-nano
EMBEDDING_MODEL=text-embedding-3-small

# Vector Database (Local Chroma)
CHROMA_PERSIST_DIR=./data/vector_store

# Local SQLite Database
DATABASE_URL=sqlite:///./plant_disease.db

# Vision Model Configuration
VISION_MODEL_PATH=./models/plant_disease.pt
CONFIDENCE_THRESHOLD=0.70
```
# Download Vision Model
- [Click here to download]("https://drive.google.com/file/d/1sNJPNS0WH2PKwxqobWEj3w0QdhOLz8_c/view?usp=sharing")
- Create `backend/models` directory 
- Paste the downloaded model to the newly create `backend/models` directory 

# Backend

1. `pip install uv`  
2. cd `backend`  
3. `uv sync`  
4. `uv run uvicorn main:app --reload`
