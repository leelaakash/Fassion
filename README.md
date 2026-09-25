<div align="center">

# 👗 Fassion — AI-Powered Generative Fashion Stylist

**A multi-agent conversational fashion platform with virtual try-on, vector wardrobe search, skin-tone analysis, and real-time e-commerce discovery.**

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.124+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.0+-1C3C3C?style=flat)](https://langchain-ai.github.io/langgraph/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC143C?style=flat)](https://qdrant.tech)

*Built by [Leela Akash](https://github.com/leelaakash)*

</div>

---

## 📌 What is Fassion?

Fassion is a full-stack AI fashion stylist that combines **five autonomous agents** orchestrated by LangGraph, a **512-dim CLIP vector wardrobe**, **Gemini multimodal vision**, and a **Three.js WebGL frontend** — all wired together into a single conversational chat interface.

You describe what you want, upload your photo, and the agent pipeline:
1. Understands your intent and routes to the right tools
2. Retrieves visually matching clothes from your wardrobe via cosine similarity
3. Analyzes your skin tone and body type from your portrait
4. Generates a virtual try-on image of the outfit on your photo
5. Finds real products on Amazon, Flipkart, and Meesho in real-time

---

## ✨ Features

| Feature | Description |
|---|---|
| 🕸️ **5-Spoke Agent Orchestrator** | LangGraph hub routing queries across 5 specialist tool agents |
| 🧥 **Vector Smart Closet** | 512-dim Fashion-CLIP embeddings stored in Qdrant with sub-50ms cosine search |
| 📸 **Generative Virtual Try-On** | Gemini 1.5 Pro multimodal image synthesis — drape outfits onto your photo |
| ✨ **Skin Tone & Body Analysis** | Gemini 1.5 Flash analyzes undertone, flattering colors, and silhouette guidelines |
| 🛍️ **Live E-Commerce Discovery** | Real-time DuckDuckGo scraping across Amazon, Flipkart, and Meesho |
| 🌐 **Internet Fashion Search** | Web search for trends, styling advice, and outfit inspiration |
| 💬 **Persistent Chat Sessions** | MD5-keyed image store with full message history across turns |
| 📊 **LangSmith Tracing** | End-to-end observability and prompt versioning across all agent nodes |
| 🎮 **3D WebGL Interface** | Interactive Three.js gem scene with mouse-driven physics on the landing page |
| 🔑 **Role-Based Demo Access** | Admin and VIP Stylist accounts with 1-click demo credentials |

---

## 🏗️ Architecture

```
User Message
     │
     ▼
┌─────────────────────────────────────────────────────┐
│                   LangGraph Agent Hub               │
│   (agent_node ──► tool_router ──► tool_node loop)   │
└───────────────────────┬─────────────────────────────┘
                        │ routes to one or more of:
         ┌──────────────┼──────────────────┐
         ▼              ▼                  ▼
   ┌───────────┐  ┌───────────┐    ┌────────────────┐
   │Descriptor │  │Recommender│    │Vector Retrieval│
   │  Agent    │  │  Agent    │    │  (CLIP+Qdrant) │
   └───────────┘  └───────────┘    └────────────────┘
         ▼              ▼                  ▼
   ┌───────────┐  ┌───────────┐    ┌────────────────┐
   │  VTON     │  │Web Search │    │Profile Analyzer│
   │  Agent    │  │  (DDG)    │    │ (Gemini Flash) │
   └───────────┘  └───────────┘    └────────────────┘
         │
         ▼
  ChatResponse (answer + images + analysis + products)
```

### Agent Toolkit

| Agent / Tool | Model | Role |
|---|---|---|
| **Agent Node** | GPT-4o (LiteLLM) | Orchestrates tool calls and composes final answer |
| **Descriptor** | GPT-4o multimodal | Extracts visual descriptions from uploaded item images |
| **Recommender** | GPT-4o | Suggests outfit combinations from item lists |
| **Vector Retrieval** | Fashion-CLIP | Encodes text queries → cosine search over Qdrant wardrobe |
| **VTON** | Gemini 1.5 Pro | Synthesizes try-on image from model photo + item images |
| **Profile Analyzer** | Gemini 1.5 Flash | Skin tone, undertone, body type, and tailoring guidelines |
| **Web Search** | DuckDuckGo | Real-time fashion search and e-commerce product scraping |

---

## 🗂️ Project Structure

```
Fassion-main/
├── src/
│   ├── backend/
│   │   └── app/
│   │       ├── main.py              # FastAPI entrypoint — all 8 API routes
│   │       ├── config.py            # Pydantic settings (models, Qdrant, CLIP)
│   │       ├── dependencies.py      # App-wide singleton container
│   │       ├── prompt_manager.py    # LangSmith + local YAML prompt loader
│   │       ├── models/
│   │       │   └── schemas.py       # All Pydantic models + LangGraph State
│   │       ├── services/
│   │       │   ├── agent.py         # Agent node — LiteLLM + instructor call
│   │       │   ├── graph.py         # LangGraph workflow definition
│   │       │   ├── descriptor.py    # Fashion item image descriptor
│   │       │   ├── recommender.py   # Outfit recommendation engine
│   │       │   ├── retrieval.py     # CLIP text → Qdrant vector search
│   │       │   ├── search.py        # DuckDuckGo + e-commerce scraper
│   │       │   ├── vton.py          # Gemini virtual try-on synthesizer
│   │       │   ├── profile_analyzer.py # Skin tone & body type analysis
│   │       │   └── session.py       # In-memory session + image store manager
│   │       └── utils/
│   │           ├── image_utils.py   # PIL loader (URL / base64 / local path)
│   │           └── utils.py         # Tool description parser, message formatter
│   └── frontend/
│       └── src/
│           ├── app/                 # Next.js App Router pages
│           │   ├── page.tsx         # Landing page (3D WebGL + features)
│           │   ├── app/page.tsx     # Main chat studio
│           │   ├── dashboard/       # Smart Closet dashboard
│           │   ├── login/           # Auth page
│           │   └── admin/           # Admin panel (Qdrant stats, seeding)
│           ├── components/          # ChatMessage, WardrobeDrawer, Modals, ThreeJS
│           ├── context/             # AuthContext (demo login)
│           ├── lib/api.ts           # All fetch wrappers for backend
│           └── types/index.ts       # TypeScript interfaces
├── prompts/                         # YAML prompt templates
│   ├── agent.yaml
│   ├── descriptor.yaml
│   ├── recommender.yaml
│   └── vton.yaml
├── data/example/
│   └── sample_5.jsonl               # Sample wardrobe dataset (5 items)
├── utils/
│   ├── create_collection_ctl.py     # Qdrant collection bootstrapper
│   ├── seed_wardrobe_qdrant.py      # Bulk wardrobe seeder
│   └── push_prompt.py               # Push prompts to LangSmith
├── docker-compose.yml               # Qdrant service
├── Makefile                         # Dev convenience commands
├── pyproject.toml                   # Python deps (uv, CUDA 12.8 PyTorch)
└── requirements.txt                 # Pip-compatible dependency list
```

---

## 🔧 Tech Stack

### Backend
| Library | Version | Purpose |
|---|---|---|
| FastAPI | ≥ 0.124 | REST API + async request handling |
| LangGraph | ≥ 1.0 | Multi-agent state machine orchestration |
| LangChain | ≥ 1.1 | Message conversion, tool wrappers |
| LangSmith | ≥ 0.4 | Tracing, prompt versioning, observability |
| LiteLLM | ≥ 1.77 | Unified LLM API (OpenAI + Gemini) |
| Instructor | ≥ 1.13 | Structured JSON output from LLMs |
| Qdrant Client | ≥ 1.16 | Vector DB for wardrobe cosine search |
| Transformers + PyTorch | ≥ 4.40 | Fashion-CLIP model inference |
| Google GenAI | ≥ 1.43 | Gemini multimodal (VTON + profile) |
| Pillow | ≥ 10.0 | Image loading and preprocessing |
| DDGS | ≥ 9.9 | DuckDuckGo web + product search |
| Pydantic | ≥ 2.12 | Data validation + settings |

### Frontend
| Library | Version | Purpose |
|---|---|---|
| Next.js | 16.1 | React framework with App Router |
| React | 19.2 | UI components |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 4 | Styling |
| Three.js | 0.186 | 3D WebGL gem scene on landing page |

---

## ⚙️ Prerequisites

- **Python** 3.12+
- **Node.js** 18+ and npm
- **Docker** (for Qdrant)
- **GPU** (optional — CUDA 12.8 for faster CLIP inference; CPU works too)
- API keys: OpenAI, Google AI Studio, LangSmith (optional)

---

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/leelaakash/Fassion.git
cd Fassion/Fassion-main
```

### 2. Install Python dependencies

Using `uv` (recommended):
```bash
# Install uv if you don't have it
curl -LsSf https://astral.sh/uv/install.sh | sh   # Linux/macOS
# or on Windows:
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

uv sync
```

Or using pip:
```bash
pip install -r requirements.txt
```

### 3. Install frontend dependencies
```bash
cd src/frontend
npm install
cd ../..
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
OPENAI_API_KEY=sk-...          # → platform.openai.com → API Keys
GOOGLE_API_KEY=AIza...         # → aistudio.google.com → Get API Key
LANGSMITH_API_KEY=lsv2_...     # → smith.langchain.com → Settings (optional)
```

> All other variables (`LLM_MODEL`, `VTON_MODEL`, `QDRANT_URL`, `COLLECTION_NAME`) have correct defaults already set.

### 5. Start Qdrant (vector database)
```bash
docker compose up -d
```
Qdrant runs on `http://localhost:6333`.

### 6. Seed the wardrobe (optional but recommended)
```bash
# Creates the Qdrant collection and seeds it with sample fashion data
uv run python utils/create_collection_ctl.py
```

Or use the **Admin Panel** in the UI → click "Load Benchmark Clothes into Qdrant".

---

## ▶️ Running the App

### Option A — Makefile (easiest)
```bash
make start-backend    # Starts Qdrant + FastAPI on :8000
make start-frontend   # Starts Next.js on :3000 (new terminal)
```

### Option B — Manual
```bash
# Terminal 1 — Backend
uvicorn src.backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Frontend
cd src/frontend && npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Credentials

The app ships with two built-in demo accounts (no sign-up needed):

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin / Director** | `admin@luminacouture.ai` | `admin123` | Full access — Qdrant stats, dataset seeding, all features |
| **VIP Stylist Client** | `vip@luminacouture.ai` | `user123` | Chat studio, wardrobe, try-on, skin-tone analysis |

> These credentials are for local demo use only — the backend has no auth enforcement.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service info |
| `GET` | `/health` | Health check |
| `POST` | `/chat` | Main chat endpoint — runs the LangGraph agent pipeline |
| `GET` | `/session/{id}` | Retrieve session history and image store |
| `GET` | `/wardrobe` | List all wardrobe items from Qdrant |
| `POST` | `/wardrobe/add` | Embed and upsert a new clothing item |
| `POST` | `/wardrobe/seed` | Load sample data from `data/example/sample_5.jsonl` |
| `POST` | `/analyze-profile` | Run Gemini skin-tone and body-type analysis on an image URL |

Interactive API docs available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 💬 Example Prompts

```
"Analyze my skin tone and body type, and suggest flattering outfit colors."

"Find a velvet blazer under ₹2,999 on Amazon and Flipkart that matches my trousers."

"Retrieve items from my wardrobe and build a complete gala evening look."

"Try on the black dress and white sneakers from my closet on my photo."

"What are the trending minimalist outfit ideas for a corporate boardroom?"
```

---

## 🧠 Context Engineering Design

The agent pipeline is designed to keep LLM inference bounded:

- **Session-scoped image store** — images are referenced by 7-char MD5 IDs in messages, not embedded as base64 blobs in every prompt
- **Compacted message history** — image IDs replace full URLs across chat turns to minimize token usage
- **Tool isolation** — each tool (Descriptor, VTON, etc.) is a closed function with its own context; it doesn't see the full agent state
- **Structured outputs via instructor** — all LLM responses are parsed into typed Pydantic models, eliminating hallucinated field names
- **Prompt-as-artefact** — YAML prompt templates are versioned locally and optionally synced to LangSmith for rollback and A/B comparison

---

## 📋 Environment Variables Reference

| Variable | Default | Required | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | — | ✅ Yes | OpenAI key for GPT-4o (agent, descriptor, recommender) |
| `GOOGLE_API_KEY` | — | ✅ Yes | Google key for Gemini (VTON + profile analyzer) |
| `LANGSMITH_API_KEY` | — | ❌ Optional | LangSmith tracing and prompt versioning |
| `LANGSMITH_TRACING` | `true` | ❌ Optional | Enable/disable LangSmith trace export |
| `LLM_MODEL` | `gpt-4o` | ❌ Optional | LiteLLM model string for the main agent |
| `VTON_MODEL` | `gemini-1.5-pro` | ❌ Optional | Gemini model for virtual try-on image generation |
| `QDRANT_URL` | `http://localhost:6333` | ❌ Optional | Qdrant vector DB connection URL |
| `COLLECTION_NAME` | `ctl_sample_5` | ❌ Optional | Qdrant collection name for wardrobe items |
| `CLIP_MODEL_NAME` | `patrickjohncyh/fashion-clip` | ❌ Optional | HuggingFace model for CLIP embeddings |
| `ALLOWED_ORIGIN` | — | ❌ Production | Comma-separated allowed CORS origins |

---

## 🙏 Acknowledgements

- [fashion-clip](https://huggingface.co/patrickjohncyh/fashion-clip) — Fine-tuned CLIP model for the fashion domain
- [LangChain / LangGraph](https://github.com/langchain-ai/langgraph) — Multi-agent orchestration framework
- [Qdrant](https://qdrant.tech/) — Vector similarity search engine
- [FastAPI](https://fastapi.tiangolo.com/) — Modern async Python web framework
- [Next.js](https://nextjs.org/) — React framework with App Router
- [CTL Dataset](https://github.com/eileenforwhat/complete-the-look-dataset) — Complete The Look dataset used for sample wardrobe seeding

---

<div align="center">

Built by **[Leela Akash](https://github.com/leelaakash)** · [GitHub](https://github.com/leelaakash/Fassion)

</div>


## 📋 Environment Variables Reference

| Variable | Default | Required | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | — | ✅ Yes | OpenAI key for GPT-4o (agent, descriptor, recommender) |
| `GOOGLE_API_KEY` | — | ✅ Yes | Google key for Gemini (VTON + profile analyzer) |
| `LANGSMITH_API_KEY` | — | ❌ Optional | LangSmith tracing and prompt versioning |
| `LANGSMITH_TRACING` | `true` | ❌ Optional | Enable/disable LangSmith trace export |
| `LLM_MODEL` | `gpt-4o` | ❌ Optional | LiteLLM model string for the main agent |
| `VTON_MODEL` | `gemini-1.5-pro` | ❌ Optional | Gemini model for virtual try-on image generation |
| `QDRANT_URL` | `http://localhost:6333` | ❌ Optional | Qdrant vector DB connection URL |
| `COLLECTION_NAME` | `ctl_sample_5` | ❌ Optional | Qdrant collection name for wardrobe items |
| `CLIP_MODEL_NAME` | `patrickjohncyh/fashion-clip` | ❌ Optional | HuggingFace model for CLIP embeddings |
| `ALLOWED_ORIGIN` | — | ❌ Production | Comma-separated allowed CORS origins |

---

## 🙏 Acknowledgements

- [fashion-clip](https://huggingface.co/patrickjohncyh/fashion-clip) — Fine-tuned CLIP model for the fashion domain
- [LangChain / LangGraph](https://github.com/langchain-ai/langgraph) — Multi-agent orchestration framework
- [Qdrant](https://qdrant.tech/) — Vector similarity search engine
- [FastAPI](https://fastapi.tiangolo.com/) — Modern async Python web framework
- [Next.js](https://nextjs.org/) — React framework with App Router
- [CTL Dataset](https://github.com/eileenforwhat/complete-the-look-dataset) — Complete The Look dataset used for sample wardrobe seeding

---

<div align="center">

Built by **[Leela Akash](https://github.com/leelaakash)** · [GitHub](https://github.com/leelaakash/Fassion)

</div>