from typing import List
import torch
from langsmith import traceable
from src.backend.app.models.schemas import ImageSource
from qdrant_client import QdrantClient
from transformers import CLIPModel, CLIPProcessor
from src.backend.app.config import settings
from src.backend.app.dependencies import deps


@traceable(
    name="get_text_features",
    run_type="embedding",
    metadata={
        "ls_provider": "huggingface",
        "ls_model_name": settings.clip_model_name
    },
)
def get_text_features(model: CLIPModel, processor: CLIPProcessor, text_query: list[str]):
    if not text_query:
        return []
    if isinstance(text_query, str):
        text_query = [text_query]
    cleaned = [str(q).strip() for q in text_query if str(q).strip()]
    if not cleaned:
        return []
    text_inputs = processor.tokenizer(text=cleaned, return_tensors="pt", padding=True)
    device = next(model.parameters()).device
    input_ids = text_inputs["input_ids"].to(device)
    attention_mask = text_inputs["attention_mask"].to(device)
    with torch.no_grad():
        text_features = model.get_text_features(input_ids, attention_mask)
    return text_features.cpu().numpy().tolist()


@traceable(
    name="retrieve_item",
    run_type="retriever",
)
def retrieve_item(text_features: List[float], q_client: QdrantClient, top_k: int = 1):
    if not text_features:
        return []
    payloads = []
    for text_feature in text_features:
        try:
            res = q_client.query_points(
                collection_name=settings.collection_name,
                query=text_feature,
                with_payload=True,
                limit=top_k,
            )
            if res and res.points:
                payloads.append(res.points[0].payload)
        except Exception as e:
            print(f"Error querying Qdrant: {e}")
            continue

    images = [
        ImageSource(path=item["image_url"], bbox=tuple(item["bbox"]) if item.get("bbox") else None)
        for item in payloads
        if "image_url" in item
    ]

    return images


def parse_retrieved_items(image_ids: list[str], item_list: list[str]) -> str:
    """Parse the retrieved items from the database.

    Args:
        image_ids: List of image ids.
        item_list: List of item names.
    
    Returns:
        A string of the retrieved items.
    """
    return "\n".join([f"{image_id}: {item}" for item, image_id in zip(item_list, image_ids)])


def create_retrieve_item_from_wardrobe(
    session_id: str,
    model: CLIPModel,
    processor: CLIPProcessor,
    q_client: QdrantClient,
):

    def retrieve_item_from_wardrobe(item_list: list[str]) -> str:
        """Retrieve items from the wardrobe.

        Args:
            item_list: List of item names.

        Returns:
            A string describing retrieved items with image ids.
        """
        try:
            if not item_list:
                return "No items specified to retrieve from wardrobe."
            if isinstance(item_list, str):
                item_list = [item_list]
            cleaned_items = [str(item).strip() for item in item_list if str(item).strip()]
            if not cleaned_items:
                return "No valid item names provided."

            text_features = get_text_features(model, processor, cleaned_items)
            if not text_features:
                return "Could not compute feature embeddings for the requested items."

            images = retrieve_item(text_features, q_client, top_k=1)
            if not images:
                return "No matching clothing items found in the wardrobe."

            image_ids = [deps.session_manager.store_image_source(session_id, image) for image in images]
            parsed_retrieved_items = parse_retrieved_items(image_ids, cleaned_items)
            return parsed_retrieved_items
        except Exception as e:
            return f"Error retrieving items from wardrobe: {str(e)}"

    return retrieve_item_from_wardrobe
