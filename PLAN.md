# CodeSync — Complete Revamp Plan

> Status as of: March 2026
> Goal: Transform this MVP into a production-grade, visually stunning collaborative cloud IDE deployable on Vercel.

---

## Current State Audit

### What's Working
| Feature | Status | Notes |
|---------|--------|-------|
| Monaco editor (VS Code core) | [x] Done | Python only |
| WebSocket real-time sync | [x] Done | Full-code broadcast (no CRDT) |
| Docker sandboxed execution | [x] Done | Python 3.9-slim, 128MB, 5s timeout |
| AST-based complexity analysis | [x] Done | Heuristic Big-O, Python only |
| GitHub-dark UI theme | [x] Done | Tailwind CSS |
| Peer avatar display | [x] Done | Static initials |
| Multi-file tabs | [x] Done | Frontend only, not persisted |
| File sidebar | [x] Done | No create/delete yet |
| REST execution API | [x] Done | `/api/v1/execute` |

### Critical Gaps
- No authentication — anyone can join any room
- No persistence — everything resets on refresh
- No CRDT — concurrent edits will conflict
- Python-only — no JS, TS, Go, C++, etc.
- No user cursors — you don't see where others are typing
- Vite/React SPA — not optimized for Vercel (no SSR, no API routes)
- UI is functional but not "wow" — no animations, no command palette, no polish
- No real terminal — just an output box
- No AI assistance

---

## Tech Stack Upgrade

### Frontend: Vite/React → Next.js 14 (App Router)
This is the single most important change for Vercel deployment.

| Current | Upgraded | Why |
|---------|----------|-----|
| Vite + React SPA | Next.js 14 App Router | SSR, API routes, edge functions, Vercel-native |
| Plain Tailwind | Tailwind + shadcn/ui | Production-grade components |
| No animations | Framer Motion | Buttery smooth UI |
| useState/useRef | Zustand + Jotai | Clean global state |
| Raw WebSocket | Yjs + y-websocket | True CRDT conflict-free merging |
| No auth | Supabase Auth (GitHub OAuth) | Persistent sessions |
| localStorage | Supabase DB + Vercel KV | Real persistence |

### Backend: Keep FastAPI, Add More
- Add multi-language Docker images (Node.js, Go, C++, Java, Rust)
- Add Supabase integration for file/session persistence
- Add rate limiting (slowapi)
- Add WebSocket Yjs relay server
- Deploy backend on Railway/Render (free tier) or keep local

---

## Phase-by-Phase Roadmap

---

### PHASE 1 — Foundation Migration (Next.js + shadcn/ui)
**Goal**: New project skeleton with killer UI shell

**Tasks:**
1. Create new Next.js 14 project with App Router
2. Set up Tailwind CSS + shadcn/ui component library
3. Configure Monaco editor (`@monaco-editor/react`) in Next.js
4. Port existing components (CodeEditor, Terminal, Complexity, Sidebar)
5. Build the new layout:
   - Activity bar (leftmost, VS Code-style icons)
   - Collapsible file explorer sidebar
   - Tab bar for open files
   - Editor pane
   - Bottom panel (terminal/output/problems)
   - Right sidebar (AI assistant / analytics)
6. Add Framer Motion page transitions and micro-animations
7. Command palette (`Cmd/Ctrl+K`) with `cmdk` library
8. Toast notification system (`sonner`)
9. Theme system (dark/light/high-contrast)

**Key UI Elements:**
- Glassmorphism panels with backdrop-blur
- Animated gradient header
- Smooth sidebar collapse/expand
- File tabs with icons per language
- Status bar (bottom) with connection indicator, language, line:col

**Deliverable**: Beautiful empty shell that looks like a real IDE

---

### PHASE 2 — Real Collaboration with Yjs
**Goal**: Replace naive full-code broadcast with proper CRDT

**Problem with current approach**: If User A types on line 1 and User B types on line 50 at the same time, one change will overwrite the other.

**Tasks:**
1. Install Yjs + y-monaco + y-websocket
2. Set up y-websocket server (can run alongside FastAPI or as Node.js service)
3. Bind Yjs document to Monaco editor
4. Implement presence (cursors + selections):
   - Each user gets a random color + name
   - Colored cursor labels show username
   - Colored selection highlights
5. User list panel showing connected users with avatars + colors
6. Awareness protocol for "user is typing" indicator
7. Room creation with shareable URL (`/room/[roomId]`)
8. Copy invite link button

**Deliverable**: True real-time collaboration, zero conflicts, with live cursors

---

### PHASE 3 — Multi-Language Execution Engine
**Goal**: Run Python, JavaScript, TypeScript, Go, C++, Java, Rust

**Backend changes:**
```python
LANGUAGE_CONFIGS = {
  "python":     { "image": "python:3.12-slim",   "cmd": ["python", "/app/script.py"] },
  "javascript": { "image": "node:20-alpine",      "cmd": ["node", "/app/script.js"] },
  "typescript": { "image": "node:20-alpine",      "cmd": ["npx", "ts-node", "/app/script.ts"] },
  "go":         { "image": "golang:1.21-alpine",  "cmd": ["go", "run", "/app/script.go"] },
  "cpp":        { "image": "gcc:13-alpine",        "cmd": ["sh", "-c", "g++ /app/script.cpp -o /tmp/a.out && /tmp/a.out"] },
  "rust":       { "image": "rust:1.75-slim",      "cmd": ["sh", "-c", "rustc /app/script.rs -o /tmp/a.out && /tmp/a.out"] },
  "java":       { "image": "openjdk:21-slim",     "cmd": ["sh", "-c", "javac /app/Main.java && java -cp /app Main"] },
}
```

**Frontend changes:**
- Language selector dropdown in header
- Language auto-detection from file extension
- Monaco language mode automatically switches
- Starter templates per language
- Complexity analysis extended to JS/TS (using AST parsers)

**Deliverable**: Run 7 languages with same Docker isolation

---

### PHASE 4 — Authentication & Persistence
**Goal**: Save your work, have an identity

**Auth (Supabase):**
- GitHub OAuth sign-in
- Google OAuth sign-in
- Anonymous guest mode (with upgrade prompt)
- User profile (avatar from GitHub, username)
- Protected rooms (only invited users)

**Database Schema (Supabase/PostgreSQL):**
```sql
users (id, email, github_username, avatar_url, created_at)
rooms (id, name, owner_id, language, created_at, updated_at, is_public)
files (id, room_id, name, content, language, created_at, updated_at)
room_members (room_id, user_id, role, joined_at)
executions (id, room_id, user_id, code, output, error, language, duration_ms, created_at)
```

**Features:**
- Dashboard: list of your rooms
- Create new room (name, language, public/private)
- Invite collaborators by email or link
- Auto-save every 30 seconds
- Manual save (Ctrl+S)
- File browser persisted across sessions
- Execution history panel

**Deliverable**: Sign in, create rooms, invite friends, come back later and your code is still there

---

### PHASE 5 — AI Code Assistant
**Goal**: Integrated AI that understands your code

**Using Claude API (Anthropic):**
- Code explanation: select code → "Explain this"
- Bug fix suggestions: red squiggles → "Fix with AI"
- Code generation: comment → Tab to generate
- Chat panel: Ask questions about the code
- Refactor: "Make this more efficient"
- Add tests: "Generate unit tests"
- Translate language: "Convert this Python to JavaScript"

**UI:**
- Floating AI button (bottom-right)
- Slide-in AI chat panel (right side)
- Inline ghost text suggestions (like GitHub Copilot)
- Code diff view for AI suggestions (accept/reject)

**Deliverable**: AI-powered pair programmer built into the IDE

---

### PHASE 6 — Terminal & Advanced Features
**Goal**: Full developer experience

**Real Terminal (xterm.js + PTY):**
- xterm.js for terminal UI
- WebSocket relay to backend PTY process
- Full ANSI color support
- Resizable terminal panels
- Multiple terminal tabs
- Shell: `/bin/sh` inside Docker container

**Live Preview (HTML/CSS/JS):**
- Sandboxed iframe for web code
- Auto-refresh on save
- Split: editor | preview
- Responsive viewport simulator (mobile/tablet/desktop)

**Git Integration:**
- Show git diff in editor gutter (green/red indicators)
- Stage/commit UI panel
- Branch switcher
- GitHub push/pull (if user has connected GitHub)

**Version History:**
- Timeline of executions
- Restore previous code versions
- Diff viewer between versions
- Named snapshots ("before refactor", etc.)

**Keyboard Shortcuts:**
- `Ctrl+K` — Command palette
- `Ctrl+\`` — Toggle terminal
- `Ctrl+B` — Toggle sidebar
- `Ctrl+Enter` — Run code
- `Ctrl+Shift+P` — Settings
- `Ctrl+/` — Toggle comment
- `Ctrl+Shift+L` — Trigger AI

**Deliverable**: Full IDE power in the browser

---

### PHASE 7 — Polish & Vercel Deployment
**Goal**: Production-ready, fast, shareable

**Performance:**
- Dynamic import Monaco editor (heavy, ~6MB)
- Code splitting per route
- Optimize images with next/image
- Edge caching for static assets
- Preload fonts (Fira Code, Geist Mono)

**SEO & Marketing:**
- Landing page (`/`) — showcase with live demo
- Beautiful OG image for room share links
- `robots.txt`, `sitemap.xml`
- Proper `<meta>` tags

**Landing Page Sections:**
1. Hero: Animated code editor demo (pre-recorded or live)
2. Features grid: Real-time, Multi-language, AI-powered, Secure
3. Language showcase: Rotating code examples
4. "How it works": 3-step visual
5. CTA: "Start Coding" button

**Vercel Config:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "...",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "...",
    "ANTHROPIC_API_KEY": "...",
    "BACKEND_URL": "..."
  }
}
```

**Deliverable**: Live at `codesync.vercel.app`, shareable, fast

---

## Summary Table

| Phase | Feature | Effort | Impact |
|-------|---------|--------|--------|
| 1 | Next.js + shadcn/ui + Framer Motion | High | ***** |
| 2 | Yjs CRDT real collaboration + cursors | Medium | ***** |
| 3 | Multi-language execution (7 languages) | Medium | **** |
| 4 | Auth + Supabase persistence | High | **** |
| 5 | AI assistant (Claude API) | Medium | ***** |
| 6 | Terminal + Live preview + Git | High | **** |
| 7 | Landing page + Vercel deploy | Medium | ***** |

---

## Suggested Libraries

```json
{
  "frontend": {
    "framework": "next@14",
    "ui": "shadcn/ui + tailwindcss + framer-motion",
    "editor": "@monaco-editor/react",
    "collab": "yjs + y-monaco + y-websocket",
    "state": "zustand",
    "auth": "@supabase/auth-helpers-nextjs",
    "terminal": "xterm + xterm-addon-fit",
    "ai": "@anthropic-ai/sdk",
    "commands": "cmdk",
    "notifications": "sonner",
    "icons": "lucide-react",
    "charts": "recharts"
  },
  "backend": {
    "framework": "fastapi",
    "server": "uvicorn",
    "containers": "docker",
    "db": "supabase-py",
    "rate_limit": "slowapi",
    "yjs_relay": "y-py or node y-websocket server"
  }
}
```

---

## Where to Start (Recommendation)

If you want maximum visual impact first, do **Phase 1 → Phase 7 landing page → Phase 2** in that order.

The new Next.js shell + beautiful landing page will immediately make this look like a real product. Then add collaboration, then languages.

If you want maximum functionality first, do **Phase 2 → Phase 3 → Phase 1** in that order.

**My recommendation**: Phase 1 (UI revamp to Next.js) + Phase 7 (landing page) first, since you said Vercel is the goal. This will make it look stunning immediately and be properly deployable.
