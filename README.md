# ReWild Connect (Vite + React + TS + Tailwind)

## Quick start
```bash
npm install
npm run dev
```

Demo access codes (no backend yet): `VIEW-123`, `VOL-123`, `INT-123`, `ADMIN-123`

## Worker-backed auth
```bash
# first time
cp .dev.vars.example .dev.vars   # set COOKIE_SECRET
npm run build                     # ensures dist/ exists
npx wrangler d1 execute rewild-db --local --file=schema.sql

# run worker + build watchers (serves http://127.0.0.1:8788)
npm run dev:worker

# optional: run Vite dev alongside for HMR (proxies /api to worker)
# npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: `Vite`
- Route base: `/`

## Notes
- Auth uses the Cloudflare Worker + D1 flow locally and in Pages; the dashboard data is still in-memory mock state.
- Rotate the demo access codes once real onboarding is ready.
