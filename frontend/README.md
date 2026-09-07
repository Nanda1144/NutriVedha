# NutriVedha — Frontend (Role-Based App)

Vite + React 19 + TypeScript + React Router 7 + Zustand.

## Purpose
Authenticated application for 6 roles. NOT the public entry — public visitors use `../Main_interface`.

## Entry Point
- `src/main.tsx` mounts `App.tsx` inside `BrowserRouter`
- `src/App.tsx` defines 23 routes: `/`, `/login` + protected `/dashboard`, `/scan`, `/diet`, `/doctor/*`, `/farmer/*`, etc. Guarded by `src/components/PrivateRoute.tsx` (`getAuthToken()` + `userProfile.role`).

## Structure
- `src/pages/` — 24 pages (Home, Scan, Diet, Recipes, Fitness, Telemedicine, Marketplace, AdminDashboard, Dashboards switcher …)
- `src/components/` — Layout, Navbar (Bell polling 30s), Sidebar (14 items role-filtered), PrivateRoute, Chatbot, Modal, Map
- `src/services/client.ts` — `API_BASE = VITE_API_BASE_URL || http://localhost:8080/api` + `Bearer nv_token`
- `src/services/*.ts` — 14 microservice clients (auth, user, ai, medical, telemedicine, marketplace, delivery, fitness, doctor, farmer, notification, analytics, trainer)
- `src/store/userStore.ts` — Zustand persist `ayurai-health-storage-v8`
- `src/types/index.ts` — shared domain types (UserRole, HealthReport, Crop, etc.)
- `src/hooks/useApi.ts` — data-fetch hook

## Run
```bash
cd frontend
npm install
npm run dev      # http://localhost:5174 (or 5173 if Main_interface not running)
npm run build    # tsc -b && vite build -> dist/
VITE_API_BASE_URL=http://localhost:8080/api npm run dev
```

## Env
Use root `../.env` or `../.env.example`. Frontend reads `VITE_*` at build time.

## Deploy — Vercel
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install: `npm install`
- Env: `VITE_API_BASE_URL=https://api.nutrivedha.com/api`
- Do NOT put backend secrets in Vercel frontend env — only `VITE_API_BASE_URL`.

## Responsive
Container 1200px, breakpoints 768px/1024px, glass cards, Outfit/Inter fonts.
