# How to run CodeSync locally

## 1 — Backend (FastAPI)

```bash
cd backend
# First time only:
pip install -r requirements.txt

# Start server:
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000

---

## 2 — Frontend (Next.js)

```bash
cd frontend-next

# First time only:
npm install

# Copy env:
cp .env.example .env.local

# Start dev server:
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Deploy to Vercel

1. Push `frontend-next/` to GitHub
2. Import into Vercel — it auto-detects Next.js
3. Set env vars in Vercel dashboard:
   - `NEXT_PUBLIC_BACKEND_URL` → your Railway/Render backend URL
   - `NEXT_PUBLIC_WS_URL` → same but with `wss://`

## Deploy backend to Railway

1. Push repo to GitHub
2. Create new Railway project → Deploy from GitHub
3. Set root directory to `backend/`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
