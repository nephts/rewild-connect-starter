Node version: 20.x

Frontend only (mock data):
- npm install
- npm run dev

Worker-backed auth + API:
- cp .dev.vars.example .dev.vars  # set COOKIE_SECRET
- npm run build  # ensure dist exists once
- npx wrangler d1 execute rewild-db --local --file=schema.sql
- npm run dev:worker
- open http://127.0.0.1:8788

Alt HMR flow:
- Terminal A: npm run pages:dev
- Terminal B: npm run dev  # Vite proxies /api to the worker

Env vars: COOKIE_SECRET
