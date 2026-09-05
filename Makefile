.PHONY: start-backend start-frontend start-qdrant

start-qdrant:
	./qdrant/qdrant.exe

start-backend:
	.venv/Scripts/python.exe -m uvicorn src.backend.app.main:app --host 0.0.0.0 --port 8000

start-frontend:
	cd src/frontend && npm run dev