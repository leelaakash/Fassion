from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.backend.app.dependencies import deps
from src.backend.app.config import settings
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from qdrant_client import models as qdrant_models
from transformers import CLIPModel, CLIPProcessor
from src.backend.app.services.session import SessionManager
from src.backend.app.models.schemas import ChatRequest, ChatResponse, SessionDataResponse
from src.backend.app.services.graph import invoke_graph
from src.backend.app.prompt_manager import PromptManager
from src.backend.app.utils.image_utils import get_image_from_source
from pydantic import BaseModel
from typing import Optional
import torch
import uuid
import os
import pandas as pd
from io import BytesIO
import requests as http_requests


@asynccontextmanager
async def lifespan(app: FastAPI):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    deps.qdrant_client = QdrantClient(url=settings.qdrant_url, check_compatibility=False)
    deps.clip_model = CLIPModel.from_pretrained(settings.clip_model_name).to(device)
    deps.clip_processor = CLIPProcessor.from_pretrained(settings.clip_model_name)
    deps.session_manager = SessionManager()
    deps.prompt_manager = PromptManager()

    yield

    deps.qdrant_client.close()


app = FastAPI(lifespan=lifespan)

# Build allowed origins: always include localhost + any env-defined production origins
_PROD_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "")
_EXTRA_ORIGINS = [o.strip() for o in _PROD_ORIGIN.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        *_EXTRA_ORIGINS,
    ],
    allow_origin_regex=r"https?://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_qdrant_client() -> QdrantClient:
    return deps.qdrant_client


def get_clip_model():
    return deps.clip_model, deps.clip_processor


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Lumina Couture 3D Fashion Recommender API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "chat": "/chat",
            "wardrobe": "/wardrobe",
            "session": "/session/{session_id}"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "lumina-couture"}


@app.get("/v1/models")
async def list_models():
    """Compatibility endpoint for AI agents/extensions probing OpenAI-style endpoints."""
    return {
        "object": "list",
        "data": [
            {"id": "lumina-couture-gemini-3.1", "object": "model", "owned_by": "lumina-couture"},
            {"id": "fashion-clip-512", "object": "model", "owned_by": "lumina-couture"},
        ],
    }



@app.post("/chat")
async def chat(
        request: ChatRequest,
        qdrant_client: QdrantClient = Depends(get_qdrant_client),
        clip: tuple = Depends(get_clip_model),
):
    try:
        return invoke_graph(request, qdrant_client, clip)
    except Exception as e:
        print(f"Chat route error: {e}")
        return ChatResponse(
            session_id=request.session_id or "default",
            answer=(
                "I'm your AI stylist. I encountered a momentary hiccup while processing that request. "
                "Please tell me what you'd like to style or coordinate (e.g. casual weekend, formal dinner, pairing with your closet items)!"
            ),
            images=None,
            analysis=None,
            products=None,
        )


@app.get("/session/{session_id}")
async def get_session(session_id: str):
    session_data = deps.session_manager.get_session_data(session_id)
    if session_data is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return session_data


@app.get("/wardrobe")
async def get_wardrobe(qdrant_client: QdrantClient = Depends(get_qdrant_client)):
    try:
        points, _ = qdrant_client.scroll(
            collection_name=settings.collection_name,
            limit=200,
            with_payload=True,
        )
        items = []
        for p in points:
            items.append({
                "id": p.id,
                "label": p.payload.get("label", "Fashion Item"),
                "image_url": p.payload.get("image_url"),
                "bbox": p.payload.get("bbox"),
            })
        return {"items": items, "total": len(items)}
    except Exception as e:
        return {"items": [], "total": 0, "error": str(e)}


class ProfileAnalysisRequest(BaseModel):
    image_url: str


@app.post("/analyze-profile")
async def analyze_profile(req: ProfileAnalysisRequest):
    from src.backend.app.services.profile_analyzer import analyze_user_appearance_from_image
    try:
        image = get_image_from_source(req.image_url, None)
        analysis = analyze_user_appearance_from_image(image)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Wardrobe: Add a single clothing item ─────────────────────────────────────

class AddWardrobeItemRequest(BaseModel):
    image: str          # base64 data-URL or http(s) URL
    label: str          # e.g. "Shirt", "Dress"
    image_url: Optional[str] = None  # optional original URL to store in payload


def _embed_image(image_source: str) -> list[float]:
    """Embed a single image via the loaded CLIP model."""
    device = next(deps.clip_model.parameters()).device
    pil_image = get_image_from_source(image_source)
    pixel_values = deps.clip_processor.image_processor.preprocess(
        [pil_image], return_tensors="pt"
    )["pixel_values"].to(device)
    with torch.no_grad():
        features = deps.clip_model.get_image_features(pixel_values)
    return features.cpu().numpy().tolist()[0]


@app.post("/wardrobe/add")
async def add_wardrobe_item(
    req: AddWardrobeItemRequest,
    qdrant_client: QdrantClient = Depends(get_qdrant_client),
):
    """Embed a clothing image and upsert it into the Qdrant wardrobe collection."""
    try:
        # Ensure collection exists (create only if missing)
        try:
            if not qdrant_client.collection_exists(settings.collection_name):
                qdrant_client.create_collection(
                    collection_name=settings.collection_name,
                    vectors_config=VectorParams(size=512, distance=Distance.COSINE),
                )
        except Exception:
            pass  # collection already exists or Qdrant handled it

        vector = _embed_image(req.image)
        item_id = str(uuid.uuid4())

        display_url = req.image_url or req.image

        qdrant_client.upsert(
            collection_name=settings.collection_name,
            points=qdrant_models.Batch(
                ids=[item_id],
                vectors=[vector],
                payloads=[{
                    "label": req.label,
                    "image_url": display_url,
                    "bbox": None,
                    "image_signature": item_id,
                }],
            ),
        )
        return {"success": True, "id": item_id, "label": req.label}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"add_wardrobe_item error: {e}")


# ── Wardrobe: Seed from sample JSONL ─────────────────────────────────────────

@app.post("/wardrobe/seed")
async def seed_wardrobe(
    qdrant_client: QdrantClient = Depends(get_qdrant_client),
    clip: tuple = Depends(get_clip_model),
):
    """Load sample clothing items from data/example/sample_5.jsonl into Qdrant."""
    data_path = os.path.join(os.getcwd(), "data", "example", "sample_5.jsonl")
    if not os.path.exists(data_path):
        raise HTTPException(status_code=404, detail=f"Sample data not found at {data_path}")

    clip_model, clip_processor = clip
    device = next(clip_model.parameters()).device

    # Ensure collection exists (tolerate if already present)
    try:
        if not qdrant_client.collection_exists(settings.collection_name):
            qdrant_client.create_collection(
                collection_name=settings.collection_name,
                vectors_config=VectorParams(size=512, distance=Distance.COSINE),
            )
    except Exception:
        pass

    df = pd.read_json(data_path, orient="records", lines=True)
    added = 0
    errors = []
    for idx, row in df.iterrows():
        try:
            bbox_val = row.get("bbox")
            bbox_tuple = tuple(bbox_val) if bbox_val is not None else None
            pil_image = get_image_from_source(row["image_url"], bbox_tuple)
            pixel_values = clip_processor.image_processor.preprocess(
                [pil_image], return_tensors="pt"
            )["pixel_values"].to(device)
            with torch.no_grad():
                features = clip_model.get_image_features(pixel_values)
            vector = features.cpu().numpy().tolist()[0]

            qdrant_client.upsert(
                collection_name=settings.collection_name,
                points=qdrant_models.Batch(
                    ids=[idx],
                    vectors=[vector],
                    payloads=[{
                        "label": row["label"],
                        "image_url": row["image_url"],
                        "bbox": row.get("bbox"),
                        "image_signature": row["image_signature"],
                    }],
                ),
            )
            added += 1
        except Exception as e:
            errors.append({"idx": int(idx), "error": str(e)})

    return {"success": True, "added": added, "errors": errors, "total": len(df)}
