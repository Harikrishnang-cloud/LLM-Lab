# LLM Lab — Phase 1: Complete Frontend and Backend Foundation

> An educational platform for learning, testing, and experimenting with Large Language Models.

---

## 1. Overview & Architecture

LLM Lab provides an interactive learning environment for AI engineers and developers. Phase 1 establishes the complete foundation:

- **Frontend**: Next.js 14 App Router, TypeScript (strict), Tailwind CSS, Lucide React icons, and a typed native API client.
- **Backend API**: Node.js + Express, TypeScript (`NodeNext`), Zod schema validation, CORS security, centralized error handling, and structured JSON responses.
- **Local LLM Engine**: Native integration with [Ollama](https://ollama.com)'s local HTTP REST API (`/api/tags`, `/api/generate`), non-streaming inference, configurable timeout, model selection, and request cancellation support.

```
Ask AI/ (Root Workspace)
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express application & middleware setup
│   │   ├── server.ts               # HTTP Server listener & graceful shutdown
│   │   ├── config/env.ts           # Zod-validated environment config
│   │   ├── controllers/            # Health, Status, and Ollama controllers
│   │   ├── services/ollama.service # Ollama HTTP API communication
│   │   ├── middleware/             # Centralized errors & 404 handler
│   │   ├── schemas/                # Zod request validation
│   │   └── types/                  # Typed API request/response contracts
│   ├── tests/api.test.ts           # Automated tests (Node test runner)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout with dark theme & shell
│   │   │   ├── page.tsx            # Main Dashboard & First Prompt Lab
│   │   │   ├── globals.css         # Tailwind & theme variables
│   │   │   └── api-status/page.tsx # Telemetry & Health diagnostics
│   │   ├── components/             # Sidebar, Header, StatusCards, Playground
│   │   ├── lib/api.ts              # Typed API client with abort signals
│   │   └── hooks/useAppStatus.ts   # Auto-polling hook with clean unmounting
│   ├── .env.local.example
│   ├── package.json
│   └── tsconfig.json
├── package.json                    # Root scripts (concurrently dev, build, test, typecheck)
└── README.md
```

---

## 2. Prerequisites

- **Node.js**: v18+ (tested and verified on Node v20+)
- **npm**: v9+ / v11+
- **Ollama**: (Optional for backend boot, required for local inference tests). Download from [https://ollama.com/download](https://ollama.com/download).

---

## 3. Quickstart & Installation

From the repository root directory:

```bash
# 1. Install all dependencies across root, backend, and frontend
npm run install:all
```

Or install individually:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Environment Configuration

1. **Backend Environment**:
   Copy `backend/.env.example` to `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   OLLAMA_DEFAULT_MODEL=
   OLLAMA_TIMEOUT_MS=60000
   MAX_PROMPT_LENGTH=10000
   ```

2. **Frontend Environment**:
   Copy `frontend/.env.local.example` to `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```

---

## 4. Running the Applications

### Option A: Run Both Together (Recommended)
Runs frontend and backend concurrently with color-coded log streams:
```bash
npm run dev
```
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)

### Option B: Run Separately
**Backend:**
```bash
npm run dev:backend
# or cd backend && npm run dev
```

**Frontend:**
```bash
npm run dev:frontend
# or cd frontend && npm run dev
```

---

## 5. Available Scripts

The root `package.json` contains cross-platform scripts that function on Windows PowerShell, macOS, and Linux:

| Command | Description |
|---|---|
| `npm run dev` | Runs backend (`:5000`) and frontend (`:3000`) concurrently |
| `npm run dev:backend` | Runs backend in hot-reload watch mode with `tsx` |
| `npm run dev:frontend` | Runs Next.js App Router development server |
| `npm run typecheck` | Concurrently checks TypeScript types across backend & frontend |
| `npm run test` | Executes backend automated tests via Node test runner |
| `npm run build` | Builds both backend (TypeScript compiler) and frontend (Next.js bundle) |
| `npm run build:backend` | Compiles backend TypeScript to `./backend/dist` |
| `npm run build:frontend` | Compiles Next.js production bundle |

---

## 6. Ollama Setup & Model Guide

Ollama runs local models on your GPU or CPU without sharing prompts with third parties.

1. **Start Ollama**:
   Launch Ollama desktop app or run:
   ```bash
   ollama serve
   ```

2. **Verify Ollama is Reachable**:
   ```bash
   curl http://127.0.0.1:11434/api/tags
   ```

3. **Download a Recommended Model**:
   - **Low RAM / Fast Test (1-4 GB RAM)**:
     ```bash
     ollama run smollm2:135m
     # or
     ollama pull qwen2.5:0.5b
     ```
   - **Balanced Development (8 GB RAM)**:
     ```bash
     ollama pull llama3.2:1b
     # or
     ollama pull llama3.2:3b
     ```
   - **Higher Quality (16 GB+ RAM)**:
     ```bash
     ollama pull mistral
     ```

4. Discovered models automatically populate the model dropdown in LLM Lab!

---

## 7. API Endpoints Reference

| Method | Endpoint | Description | Sample Curl |
|---|---|---|---|
| `GET` | `/api/health` | Backend server health | `curl http://localhost:5000/api/health` |
| `GET` | `/api/health/ready` | Readiness probe (decoupled from Ollama) | `curl http://localhost:5000/api/health/ready` |
| `GET` | `/api/status` | Aggregated telemetry & model counts | `curl http://localhost:5000/api/status` |
| `GET` | `/api/ollama/health` | Pings local Ollama service | `curl http://localhost:5000/api/ollama/health` |
| `GET` | `/api/ollama/models` | Returns installed local models | `curl http://localhost:5000/api/ollama/models` |
| `POST` | `/api/ollama/generate` | Generates prompt completion | *See below* |
| `POST` | `/api/tokenizer/encode` | Tokenizes text using verified model BPE tokenizer | *See below* |
| `GET` | `/api/tokenizer/supported` | Returns list of verified model tokenizers | `curl http://localhost:5000/api/tokenizer/supported` |

### Example Inference Request
```bash
curl -X POST http://localhost:5000/api/ollama/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain self-attention in simple terms.", "model": "llama3.2"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "model": "llama3.2",
    "response": "Self-attention allows tokens to look at each other...",
    "durationMs": 1140,
    "totalTokens": 64
  }
}
```

### Example Tokenization Request (Phase 2 — Tokenizer Lab)
```bash
curl -X POST http://localhost:5000/api/tokenizer/encode \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world!", "model": "llama3.2:1b"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "model": "llama3.2:1b",
    "tokenizerName": "Llama 3 BPE Tokenizer (tiktoken 128k vocabulary)",
    "vocabularySize": 128256,
    "tokenCount": 3,
    "characterCount": 12,
    "wordCount": 2,
    "tokens": [
      { "id": 9906, "text": "Hello", "index": 0 },
      { "id": 1917, "text": " world", "index": 1 },
      { "id": 0, "text": "!", "index": 2 }
    ],
    "tokenIds": [9906, 1917, 0],
    "specialTokensIncluded": false,
    "notes": "Exact BPE tokenization matching Meta LLaMA 3 / 3.1 / 3.2."
  }
}
```

---

## 8. Automated Testing

Run the test suite:
```bash
npm test
```
Automated tests verify:
- Backend health endpoints return `200 OK`.
- Readiness probe properly differentiates backend state from Ollama state.
- Prompt validation rejects empty, whitespace, and missing fields.
- 404 response on uninstalled model requests.
- 503 response and graceful error formatting when Ollama is offline.
- Successful text generation with duration measurement.

---

## 9. Troubleshooting & FAQ

1. **"Ollama service is unreachable or not running"**:
   - Ensure Ollama is running (`ollama serve`). Verify that `curl http://127.0.0.1:11434/` returns `Ollama is running`.
2. **"No Ollama models found locally"**:
   - Run `ollama pull smollm2:135m` or `ollama pull llama3.2:1b` in your terminal. Click "Refresh" in the frontend.
3. **CORS Error in Browser**:
   - Check `backend/.env`. Ensure `FRONTEND_URL` is set to `http://localhost:3000`.
4. **Port 5000 Already in Use**:
   - Update `PORT=5001` in `backend/.env` and update `NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api` in `frontend/.env.local`.
