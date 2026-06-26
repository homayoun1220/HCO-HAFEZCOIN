# HCO Human Study Web Application

A web application for conducting human-subject experiments on real-time challenge-response tasks, designed for academic security research (IEEE S&P) and Prolific participant recruitment.

## Architecture

- **Backend**: Python + FastAPI + SQLite (aiosqlite)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Analysis**: Python scripts for statistics and paper figures

## Prerequisites

- Python 3.10+
- Node.js 18+

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Health check: `GET /api/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend.

For Prolific testing with participant IDs:

```
http://localhost:5173/?PROLIFIC_PID=TEST123&STUDY_ID=STUDY456
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HCO_DB_PATH` | SQLite database file path | `backend/hco_study.db` |
| `HCO_COMPLETION_CODE` | Prolific completion code | `HCO-STUDY-COMPLETE` |
| `FRONTEND_URL` | Production frontend URL (CORS) | — |
| `VITE_API_URL` | Backend URL for frontend build | `` (same origin / proxy) |

## Study Flow

1. **Landing** — Introduction and start button (reads Prolific URL params)
2. **Consent** — Informed consent form
3. **Practice** — One unscored trial per challenge family
4. **Study** — 20 timed trials (5 per family, randomized block order)
5. **Debrief** — Score summary and Prolific completion code

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/session/start` | Create session, return block order |
| POST | `/api/challenge/issue` | Issue challenge with binding tag |
| POST | `/api/challenge/submit` | Submit response (server-side timestamps) |
| POST | `/api/session/complete` | Mark session complete |
| GET | `/api/admin/export` | Export all trials as CSV |

## Data Export

Download trial data as CSV:

```bash
curl -o trials.csv http://localhost:8000/api/admin/export
```

Or analyze directly with Python:

```bash
cd analysis
python stats.py ../backend/hco_study.db
python figures.py ../backend/hco_study.db
```

## Deploy to Render.com (Backend)

1. Push the repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set **Root Directory** to `hco-study/backend`.
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `HCO_COMPLETION_CODE` — your Prolific completion code
   - `FRONTEND_URL` — your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
7. Add a **Persistent Disk** mounted at `/data` and set `HCO_DB_PATH=/data/hco_study.db`.

## Deploy to Vercel (Frontend)

1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `hco-study/frontend`.
3. **Framework Preset**: Vite
4. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://your-api.onrender.com`)
5. Deploy. Update `FRONTEND_URL` on Render to match your Vercel domain.

## Cryptographic Binding

Each challenge receives an opaque `challenge_id` computed server-side as:

```
SHA3-256(participant_id || window_id || challenge_index || nonce)
```

Timestamps (`t_issue`, `t_recv`) and latency are always recorded server-side. Duplicate submissions for the same `challenge_id` are rejected.

## Analysis

The `analysis/` directory contains:

- **stats.py** — Load data, compute success rates with 95% CIs, Cohen's d, Bonferroni correction, LaTeX tables
- **figures.py** — Generate PDF figures (success rates, latency violin plots, failure breakdown)

## License

For academic research use. See paper for citation details.
