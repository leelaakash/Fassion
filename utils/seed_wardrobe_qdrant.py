"""
Seed 35+ stylish clothing items with working Unsplash images into the Qdrant wardrobe collection.
Uses the cached Fashion-CLIP model to generate 512-dim vectors for each piece,
storing labels, names, and high-res image URLs in Qdrant's 'ctl_sample_5' collection.
"""
import uuid
import torch
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
from transformers import CLIPModel, CLIPProcessor

ITEMS = [
    # Tops & Shirts
    {"name": "Silk Button-Down Ivory Blouse", "label": "Shirts & Tops", "url": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&auto=format&fit=crop&q=80"},
    {"name": "Classic Oxford Sky Blue Shirt", "label": "Shirts & Tops", "url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80"},
    {"name": "Casual White Minimalist Tee", "label": "Shirts & Tops", "url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80"},
    {"name": "Charcoal Black Ribbed Turtleneck", "label": "Shirts & Tops", "url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80"},
    {"name": "Striped French Breton Longsleeve", "label": "Shirts & Tops", "url": "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&auto=format&fit=crop&q=80"},
    {"name": "Bohemian Floral Print Blouse", "label": "Shirts & Tops", "url": "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600&auto=format&fit=crop&q=80"},

    # Pants & Trousers
    {"name": "Vintage Wash High-Rise Denim", "label": "Pants", "url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80"},
    {"name": "Tailored Sand Beige Chinos", "label": "Pants", "url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80"},
    {"name": "Pleated Italian Wool Black Trousers", "label": "Pants", "url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80"},
    {"name": "Relaxed Wide-Leg Linen Pants", "label": "Pants", "url": "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80"},
    {"name": "Cargo Khaki Streetwear Pants", "label": "Pants", "url": "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80"},

    # Dresses
    {"name": "Botanical Floral Summer Midi Dress", "label": "Dresses", "url": "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&auto=format&fit=crop&q=80"},
    {"name": "Cocktail Little Black Slip Dress", "label": "Dresses", "url": "https://images.unsplash.com/photo-1539109136-85eda5ef3509?w=600&auto=format&fit=crop&q=80"},
    {"name": "Boho Tiered Emerald Maxi Dress", "label": "Dresses", "url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80"},
    {"name": "Red Silk Evening Wrap Dress", "label": "Dresses", "url": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80"},

    # Coats & Jackets
    {"name": "Camel Wool Double-Breasted Overcoat", "label": "Coats & Jackets", "url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80"},
    {"name": "Biker Grain Black Leather Jacket", "label": "Coats & Jackets", "url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80"},
    {"name": "Structured Navy Blue Tailored Blazer", "label": "Coats & Jackets", "url": "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&auto=format&fit=crop&q=80"},
    {"name": "Heritage Double-Breasted Trench Coat", "label": "Coats & Jackets", "url": "https://images.unsplash.com/photo-1548624313-0396b75f4a44?w=600&auto=format&fit=crop&q=80"},
    {"name": "Light Indigo Trucker Denim Jacket", "label": "Coats & Jackets", "url": "https://images.unsplash.com/photo-1527016021513-b09758b777bd?w=600&auto=format&fit=crop&q=80"},

    # Shoes & Footwear
    {"name": "Clean White Minimalist Leather Sneakers", "label": "Shoes", "url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"},
    {"name": "Handcrafted Chestnut Brown Oxford Brogues", "label": "Shoes", "url": "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600&auto=format&fit=crop&q=80"},
    {"name": "Pointed Toe Nude Stiletto Pumps", "label": "Shoes", "url": "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&auto=format&fit=crop&q=80"},
    {"name": "Chelsea Black Polished Leather Boots", "label": "Shoes", "url": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80"},
    {"name": "Artisanal Strappy Tan Leather Sandals", "label": "Shoes", "url": "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80"},

    # Handbags & Bags
    {"name": "Pebbled Cognac Leather Everyday Tote", "label": "Handbags", "url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80"},
    {"name": "Black Satin Evening Clutch Bag", "label": "Handbags", "url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"},
    {"name": "Quilted Burgundy Chain Crossbody Bag", "label": "Handbags", "url": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&auto=format&fit=crop&q=80"},

    # Jewelry & Accessories
    {"name": "18K Gold Herringbone Chain Necklace", "label": "Jewelry", "url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80"},
    {"name": "Freshwater Pearl Dangle Drop Earrings", "label": "Jewelry", "url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80"},
    {"name": "Tortoise Shell Designer Cat-Eye Sunglasses", "label": "Sunglasses", "url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80"},
    {"name": "Gold Frame Polarized Classic Aviators", "label": "Sunglasses", "url": "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80"},

    # Skirts & Sweaters
    {"name": "Sunray Accordion Pleated Metallic Midi Skirt", "label": "Skirts", "url": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80"},
    {"name": "Classic Distressed Button-Front Denim Skirt", "label": "Skirts", "url": "https://images.unsplash.com/photo-1594938298603-c8148c4b4c4c?w=600&auto=format&fit=crop&q=80"},
    {"name": "Oversized Cream Chunky Cable-Knit Sweater", "label": "Sweaters", "url": "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=600&auto=format&fit=crop&q=80"},
    {"name": "Heritage Mulberry Hand-Rolled Silk Scarf", "label": "Scarves & Shawls", "url": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80"},
]


def seed_wardrobe():
    print(f"Loading CLIP model patrickjohncyh/fashion-clip...")
    model_name = "patrickjohncyh/fashion-clip"
    model = CLIPModel.from_pretrained(model_name)
    processor = CLIPProcessor.from_pretrained(model_name)
    model.eval()

    print(f"Connecting to Qdrant at localhost:6333...")
    client = QdrantClient(host="localhost", port=6333)
    collection_name = "ctl_sample_5"

    if not client.collection_exists(collection_name):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=512, distance=Distance.COSINE),
        )
        print(f"Created collection {collection_name}")

    existing_count = client.get_collection(collection_name).points_count
    print(f"Existing points in {collection_name}: {existing_count}")

    print(f"Generating embeddings for {len(ITEMS)} fashion items...")
    text_queries = [f"{item['label']} {item['name']}" for item in ITEMS]

    inputs = processor.tokenizer(text=text_queries, return_tensors="pt", padding=True)
    with torch.no_grad():
        features = model.get_text_features(**inputs)
        # Normalize vectors for cosine distance
        features = torch.nn.functional.normalize(features, p=2, dim=1)
        vectors = features.cpu().numpy().tolist()

    points = []
    for i, (item, vector) in enumerate(zip(ITEMS, vectors)):
        pt_id = str(uuid.uuid4())
        points.append(
            PointStruct(
                id=pt_id,
                vector=vector,
                payload={
                    "label": item["label"],
                    "name": item["name"],
                    "image_url": item["url"],
                    "bbox": None,
                    "image_signature": pt_id,
                },
            )
        )

    print(f"Upserting {len(points)} points into Qdrant...")
    client.upsert(collection_name=collection_name, points=points)

    updated_count = client.get_collection(collection_name).points_count
    print(f"\nSUCCESS: Collection now has {updated_count} clothing items in 'My Smart Closet'!")


if __name__ == "__main__":
    seed_wardrobe()
