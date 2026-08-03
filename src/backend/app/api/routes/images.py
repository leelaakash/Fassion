# Image routes are defined directly in src/backend/app/main.py:
#   POST /analyze-profile   → analyze_user_appearance_from_image
#   POST /wardrobe/add      → add_wardrobe_item
#   POST /wardrobe/seed     → seed_wardrobe
#   GET  /wardrobe          → get_wardrobe
#
# This module is reserved for future route extraction.
# To use as a router, uncomment and move the routes here:
#
# from fastapi import APIRouter, Depends, HTTPException
# from qdrant_client import QdrantClient
# from src.backend.app.dependencies import deps
#
# router = APIRouter(tags=["images"])
#
# @router.post("/analyze-profile")
# async def analyze_profile(...):
#     ...
