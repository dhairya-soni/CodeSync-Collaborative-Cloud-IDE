# CodeSync — Collaborative Cloud IDE

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Sandboxed-2496ed?logo=docker)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

A production-grade, real-time collaborative cloud IDE built with Next.js 14, FastAPI, and Monaco Editor. Multiple developers can edit the same file simultaneously, see each other's live cursors, run code in isolated Docker containers, and get instant Big-O complexity analysis — all in the browser with no setup required.

---

## Features

### Real-Time Collaboration
- WebSocket-powered code sync — edits broadcast to all peers instantly
- Live cursor positions with colored name labels per user
- Active collaborators panel with join/leave/run activity feed
- Room PIN system — share a 6-digit PIN to grant access
- Auto-reconnect with exponential backoff (up to 5 retries)

### Multi-Language Execution
- Runs **Python, JavaScript, TypeScript, Go, C++, Java, Rust** in Docker containers
- Air-gapped containers: no network, 128 MB RAM, 0.5 CPU, 5 s timeout
- In-browser JavaScript fallback for demos without a backend
- Execution time displayed in the status bar after every run

### Big-O Complexity Analysis
- AST-based static analysis — no execution required
- Detects: O(1), O(log n), O(n), O(n log n), O(n^2), O(n^3), O(2^n)
- Space complexity analysis alongside time complexity
- Metadata: loop depth, loop count, recursion detection, sort detection
- Animated complexity breakdown panel with color-coded indicators

### Monaco Editor (VS Code Core)
- GitHub Dark theme with full syntax highlighting
- IntelliSense, bracket pair colorization, indent guides
- Smooth cursor animation, minimap, word wrap toggle
- Settings panel: font size slider, tab size, minimap, line numbers, font ligatures
- All settings persist in global store and apply to the editor instantly

### File System
- Multi-file tabs with per-language color dots and dirty indicators
- Folder creation and collapsible folder tree (VS Code-style)
- Create files inside folders via inline form — hover a folder and click +
- Cross-file search with line-level match highlighting

### UI / UX
- VS Code-inspired layout: activity bar, collapsible sidebar, tab bar, bottom panel, status bar
- Framer Motion animations throughout — sidebar, panels, landing page
- Sonner toast notifications for connection events, run results, errors
- Fully keyboard-driven: Ctrl/Cmd + Enter to run code

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| State | Zustand |
| Animations | Framer Motion |
| Backend | FastAPI, Python 3.12, Uvicorn |
| WebSocket | FastAPI WebSocket, native browser WebSocket |
| Execution | Docker SDK (`docker-py`), ephemeral containers |
| Analysis | Python `ast` module — static Big-O estimation |
| Deployment | Vercel (frontend), Railway / Render (backend) |

---

## Project Structure

```
CodeSync-Collaborative-Cloud-IDE/
├── frontend-next/                  # Next.js 14 application
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   └── editor/
│   │       └── page.tsx            # Main IDE page
│   ├── components/
│   │   └── editor/
│   │       ├── MonacoEditor.tsx    # Editor + live peer cursors
│   │       ├── Sidebar.tsx         # Explorer / Search / Collab / Settings
│   │       ├── Toolbar.tsx         # Language picker, room PIN, run button
│   │       ├── BottomPanel.tsx     # Output / Complexity / Problems tabs
│   │       ├── TabBar.tsx          # Open file tabs
│   │       ├── ActivityBar.tsx     # Left icon bar
│   │       └── StatusBar.tsx       # Bottom status bar
│   └── lib/
│       ├── store.ts                # Zustand global state
│       ├── socket.ts               # WebSocket manager with reconnect
│       ├── api.ts                  # Backend API client
│       └── utils.ts                # Language configs, helpers
│
└── backend/                        # FastAPI execution engine
    └── app/
        ├── main.py                 # Routes, WebSocket hub
        ├── sandbox.py              # Docker container execution
        ├── complexity.py           # AST-based Big-O analysis
        └── schemas.py              # Pydantic models
```

---

## Local Development

You need **two terminals** running simultaneously.

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker Desktop (running) — required for code execution

### Terminal 1 — Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at `http://localhost:8000`

### Terminal 2 — Frontend

```bash
cd frontend-next
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

> To test live collaboration: open `http://localhost:3000/editor` in two different browser tabs or windows.

---

## Deployment

### Frontend — Vercel

```bash
cd frontend-next
vercel deploy
```

Set environment variables in the Vercel dashboard:

```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
```

### Backend — Railway / Render

Deploy the `backend/` directory. Docker must be available on the host (Railway supports Docker-in-Docker via privileged mode).

---

## API Reference

### POST `/api/v1/execute`

Request:
```json
{
  "code": "print('hello')",
  "language": "python"
}
```

Response:
```json
{
  "output": "hello\n",
  "error": "",
  "duration_ms": 312,
  "complexity": {
    "big_o": "O(1)",
    "space_complexity": "O(1)",
    "loop_depth": 0,
    "loop_count": 0,
    "has_recursion": false,
    "has_sort": false,
    "explanation": "No loops detected.",
    "space_explanation": "No dynamic allocations detected."
  }
}
```

### WebSocket `/ws/{room_id}`

| Message type | Direction | Key fields |
|---|---|---|
| `CODE_UPDATE` | bidirectional | `code` |
| `CURSOR_UPDATE` | bidirectional | `userId`, `name`, `color`, `line`, `column` |
| `PEER_LIST` | server to client | `peers` (array of IDs) |
| `ACTIVITY` | bidirectional | `userId`, `name`, `color`, `action`, `timestamp` |

---

## Roadmap

- [ ] Yjs CRDT for conflict-free concurrent editing
- [ ] Supabase auth (GitHub OAuth) and persistent rooms
- [ ] Real xterm.js terminal with PTY relay
- [ ] Live HTML/CSS/JS preview panel
- [ ] Execution history timeline
- [ ] AI code assistant (explain, fix, generate)

---

## License

MIT
