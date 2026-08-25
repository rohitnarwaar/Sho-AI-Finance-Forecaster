# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AXIOMÉ is an AI-powered personal finance app: a Next.js frontend backed by a Flask API. The frontend persists data to Firebase Firestore in real time and calls the Flask backend for forecasting math, ML clustering, and AI-generated insights.

The repo is split into two independently run/deployed halves:
- `web/` — Next.js 16 (App Router) frontend
- `Server/` — Flask backend (Python)

There is also a stray root-level `package.json`/`package-lock.json` (with `firebase`, `openai`, `recharts`, `tesseract.js`) that is **not** the frontend's real package manifest — the actual frontend dependencies live in `web/package.json`. Don't run installs from the repo root; always `cd web` or `cd Server` first.

## Common Commands

### Frontend (`web/`)
```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint      # eslint (flat config, next/core-web-vitals)
```
There is no configured test runner in `web/`.

### Backend (`Server/`)
```bash
cd Server
python -m venv venv
.\venv\Scripts\activate      # Windows
pip install -r requirements.txt
python app.py                # http://localhost:8080 (reads PORT env, defaults 10000 if unset via env var path)
```
There is no configured test runner in `Server/`. `wsgi.py` is the production entrypoint (gunicorn), `app.py` is used for local dev (`app.run` with `PORT` env var).

### Environment variables
- `Server/.env` (see `Server/.env.example`): `GEMINI_API_KEY`, and staging deploy also injects `GROQ_API_KEY`.
- `web/.env.local`: `NEXT_PUBLIC_API_BASE_URL` (backend base URL — used consistently across the frontend, note the `_URL` suffix), plus `NEXT_PUBLIC_FIREBASE_*` config values.

## Architecture

### Frontend structure (`web/src/`)
- `app/` — Next.js App Router pages: `page.js` (landing), `login/`, `register/`, `onboarding/` (multi-step financial profile form), `input/`, `upload/` (receipt/statement OCR), `dashboard/` (the core app — a single large client component, `dashboard/page.js`, that owns most dashboard state and Firestore listeners).
- `contexts/AuthContext.jsx` — global auth state via Firebase Auth (`onAuthStateChanged`), plus onboarding-status helpers (`checkOnboardingStatus`, `markOnboardingComplete` against the `userProfiles` Firestore collection). Wraps the whole app in `app/layout.js`.
- `lib/firebase.js` — Firebase app/Firestore/Auth initialization from `NEXT_PUBLIC_FIREBASE_*` env vars.
- `components/` — flat directory of dashboard widgets (`GoalsWidget`, `BudgetWidget`, `StreaksWidget`, `AchievementsWidget`, `DailyScoreWidget`, `QuickAddTransaction`, `RecentTransactions`, etc.) plus onboarding step components (`StepIncome`, `StepAssets`, `StepExpenses`, `StepLiabilities`, `StepReview`, orchestrated by `MultiStepForm.jsx`). Desktop and mobile have separate top-level layout components (`HomeDesktop`/`HomeMobile`, `DashboardMobile*`) — the dashboard renders different component trees per breakpoint rather than one fully-responsive tree; check `useIsMobile.js` when touching dashboard layout.
- `utils/analyzeFinance.js` — client-side finance metric calculations (savings rate, net worth, etc.) that mirror/complement backend forecast logic; also calls the backend `/analyze` endpoint.
- `utils/parseOCR.js`, `utils/keywordCategoryMap.js` — receipt/statement OCR (`tesseract.js`, `pdfjs-dist`) and keyword-based expense categorization for the `upload` flow.

**Data flow**: Firestore is the source of truth for user data (transactions, goals, budgets, subscriptions) and is read via `onSnapshot` real-time listeners directly in `dashboard/page.js` — there is no separate data-fetching/state layer. The Flask backend is stateless and only does computation (forecasts, clustering, AI analysis) on data the frontend sends it in the request body; it does not read/write Firestore itself.

**Role-based UI**: `dashboard/page.js` holds a local `userRole` state (`"admin"` | `"viewer"`, not persisted/enforced server-side) that gates mutation-capable UI (Add Transaction, Set Budget, Simulator, Create Goal) purely client-side.

`app/layout.js` sets `export const dynamic = "force-dynamic"` on the root layout — this was added deliberately to fix a Vercel build hang (see commit `87f8f46`); don't revert to static/ISR without confirming the hang is otherwise resolved.

### Backend structure (`Server/`)
- `app.py` — Flask app and all routes. CORS is handled manually via `after_request` + an explicit `OPTIONS` handler (no `flask-cors` middleware wired in despite being a dependency) — `Access-Control-Allow-Origin: *`. Route handlers wrap logic in broad `try/except` and always return `{"error": ...}` JSON on failure with a stack trace printed server-side.
- `forecast_module.py` — pure forecasting math: `forecast_savings` (compound growth), `forecast_loan_payoff`, `forecast_retirement_corpus`, `forecast_spending_clusters` (K-Means via scikit-learn).
- `reasoning_engine.py` — `analyze_portfolio`, the AI/rules-based advisor logic backing `/analyze`.
- `transaction_manager.py` — daily/weekly summaries, budget status, transaction CRUD helpers (operate on transaction lists passed in the request, not a DB).
- `goals_manager.py` — goal creation and projection math.
- `gamification.py` — streaks, achievements, active challenges.
- `wsgi.py` — gunicorn entrypoint for deployed environments; `Dockerfile` builds the backend container used by the CI deploy workflows.

Most endpoints are effectively stateless calculators: the frontend sends the relevant Firestore-sourced data (transactions, user profile, goals) in the POST body, and the backend returns derived numbers/analysis without persisting anything itself.

### API surface (`Server/app.py`)
`/health`, `/forecast`, `/loan-payoff`, `/retirement`, `/simulate`, `/analyze`, `/analyze/clusters`, `/insights/daily`, `/budget/status`, `/transactions/add`, `/transactions/recent`, `/goals/create`, `/goals/projection`, `/streaks`, `/achievements`, `/challenges/active`, `/ai/daily-tip`.

### Deployment
- `.github/workflows/backend-deploy.yml` / `backend-deploy-staging.yml` — build the `Server/` Docker image and deploy to EC2 via SSH on push to `main`/`staging`.
- `.github/workflows/frontend-deploy.yml` — deploys to S3/CloudFront from a `client/` directory using Vite env vars; this does **not** match the current `web/` Next.js app (no `client/` directory exists) and appears stale/inactive — the frontend is actually deployed via Vercel (see the `force-dynamic` fix in `web/src/app/layout.js` referencing a Vercel build hang). Don't assume this workflow reflects how frontend deploys actually happen; verify with whoever owns deployment before relying on it.
