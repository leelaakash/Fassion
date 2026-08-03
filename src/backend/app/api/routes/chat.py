# Chat routes are defined directly in src/backend/app/main.py:
#   POST /chat        → invoke_graph (LangGraph agent pipeline)
#   GET  /session/{session_id} → session data retrieval
#
# This module is reserved for future route extraction.
# To use as a router, uncomment and move the routes here:
#
# from fastapi import APIRouter, Depends
# from qdrant_client import QdrantClient
# from src.backend.app.models.schemas import ChatRequest, ChatResponse
# from src.backend.app.services.graph import invoke_graph
# from src.backend.app.dependencies import deps
#
# router = APIRouter(prefix="/chat", tags=["chat"])
#
# @router.post("", response_model=ChatResponse)
# async def chat(request: ChatRequest, ...):
#     ...
