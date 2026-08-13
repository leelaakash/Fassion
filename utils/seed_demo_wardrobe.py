"""
Seed the wardrobe with 32 high-quality fashion items using Unsplash CDN URLs.
Sends each item to the running backend's /wardrobe/add endpoint which embeds
them with the already-loaded CLIP model and upserts into Qdrant.
"""
import requests
import time

BACKEND_URL = "http://localhost:8000"

FASHION_ITEMS = [
    # ── Shirts & Tops ────────────────────────────────────────
    {"label": "Shirts & Tops", "name": "White Classic Shirt",
     "url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"},
    {"label": "Shirts & Tops", "name": "Blue Linen Shirt",
     "url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80"},
    {"label": "Shirts & Tops", "name": "Striped Crew Tee",
     "url": "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&q=80"},
    {"label": "Shirts & Tops", "name": "Black Turtleneck",
     "url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80"},
    {"label": "Shirts & Tops", "name": "Floral Print Blouse",
     "url": "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=500&q=80"},

    # ── Pants ───────────────────────────────────────────────
    {"label": "Pants", "name": "Slim-Fit Blue Jeans",
     "url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80"},
    {"label": "Pants", "name": "Beige Chino Trousers",
     "url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80"},
    {"label": "Pants", "name": "Black Formal Trousers",
     "url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80"},
    {"label": "Pants", "name": "Wide-Leg Linen Pants",
     "url": "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=500&q=80"},

    # ── Dresses ─────────────────────────────────────────────
    {"label": "Dresses", "name": "Floral Sundress",
     "url": "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=500&q=80"},
    {"label": "Dresses", "name": "Little Black Dress",
     "url": "https://images.unsplash.com/photo-1539109136-85eda5ef3509?w=500&q=80"},
    {"label": "Dresses", "name": "Boho Maxi Dress",
     "url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80"},
    {"label": "Dresses", "name": "Silk Wrap Dress",
     "url": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80"},

    # ── Coats & Jackets ──────────────────────────────────────
    {"label": "Coats & Jackets", "name": "Camel Wool Overcoat",
     "url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80"},
    {"label": "Coats & Jackets", "name": "Black Leather Jacket",
     "url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80"},
    {"label": "Coats & Jackets", "name": "Navy Blazer",
     "url": "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=500&q=80"},
    {"label": "Coats & Jackets", "name": "Classic Trench Coat",
     "url": "https://images.unsplash.com/photo-1548624313-0396b75f4a44?w=500&q=80"},
    {"label": "Coats & Jackets", "name": "Light Wash Denim Jacket",
     "url": "https://images.unsplash.com/photo-1527016021513-b09758b777bd?w=500&q=80"},

    # ── Shoes ───────────────────────────────────────────────
    {"label": "Shoes", "name": "White Leather Sneakers",
     "url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"},
    {"label": "Shoes", "name": "Brown Oxford Brogues",
     "url": "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=500&q=80"},
    {"label": "Shoes", "name": "Nude Stiletto Heels",
     "url": "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=500&q=80"},
    {"label": "Shoes", "name": "Black Ankle Boots",
     "url": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80"},
    {"label": "Shoes", "name": "Tan Leather Sandals",
     "url": "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=500&q=80"},

    # ── Handbags ────────────────────────────────────────────
    {"label": "Handbags", "name": "Tan Leather Tote",
     "url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80"},
    {"label": "Handbags", "name": "Black Clutch Evening Bag",
     "url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80"},
    {"label": "Handbags", "name": "Mini Crossbody Bag",
     "url": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500&q=80"},

    # ── Jewelry ─────────────────────────────────────────────
    {"label": "Jewelry", "name": "Gold Chain Necklace",
     "url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80"},
    {"label": "Jewelry", "name": "Pearl Drop Earrings",
     "url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80"},

    # ── Sunglasses ──────────────────────────────────────────
    {"label": "Sunglasses", "name": "Cat-Eye Sunglasses",
     "url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80"},
    {"label": "Sunglasses", "name": "Classic Aviators",
     "url": "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=500&q=80"},

    # ── Skirts ──────────────────────────────────────────────
    {"label": "Skirts", "name": "Pleated Midi Skirt",
     "url": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&q=80"},
    {"label": "Skirts", "name": "Denim Mini Skirt",
     "url": "https://images.unsplash.com/photo-1594938298603-c8148c4b4c4c?w=500&q=80"},

    # ── Sweaters ────────────────────────────────────────────
    {"label": "Sweaters", "name": "Cream Cable-Knit Sweater",
     "url": "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=500&q=80"},

    # ── Scarves & Shawls ────────────────────────────────────
    {"label": "Scarves & Shawls", "name": "Printed Silk Scarf",
     "url": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&q=80"},
]


def add_item(item: dict, idx: int, total: int) -> bool:
    """POST a single item to the backend /wardrobe/add endpoint."""
    try:
        resp = requests.post(
            f"{BACKEND_URL}/wardrobe/add",
            json={"image": item["url"], "label": item["label"], "image_url": item["url"]},
            timeout=60,
        )
        if resp.status_code == 200:
            data = resp.json()
            print(f"  [{idx+1}/{total}] ✓  {item['name']} ({item['label']}) → id={data['id'][:8]}")
            return True
        else:
            print(f"  [{idx+1}/{total}] ✗  {item['name']} — HTTP {resp.status_code}: {resp.text[:120]}")
            return False
    except Exception as e:
        print(f"  [{idx+1}/{total}] ✗  {item['name']} — Error: {e}")
        return False


def main():
    total = len(FASHION_ITEMS)
    print(f"\n{'='*60}")
    print(f"  Seeding {total} fashion items into My Smart Closet")
    print(f"{'='*60}\n")

    # Check backend is up
    try:
        r = requests.get(f"{BACKEND_URL}/wardrobe", timeout=5)
        current = r.json().get("total", 0)
        print(f"  Current wardrobe size: {current} items\n")
    except Exception as e:
        print(f"  ERROR: Cannot reach backend at {BACKEND_URL} — {e}")
        return

    added = 0
    failed = 0
    for i, item in enumerate(FASHION_ITEMS):
        success = add_item(item, i, total)
        if success:
            added += 1
        else:
            failed += 1
        time.sleep(0.3)  # brief pause between requests

    # Final count
    try:
        r = requests.get(f"{BACKEND_URL}/wardrobe", timeout=5)
        final_total = r.json().get("total", "?")
    except Exception:
        final_total = "?"

    print(f"\n{'='*60}")
    print(f"  Done! Added {added}/{total}  |  Failed: {failed}")
    print(f"  Total wardrobe items now: {final_total}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
