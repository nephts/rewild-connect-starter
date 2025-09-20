# ReWild Connect (Vite + React + TS + Tailwind)

## Quick start
```bash
npm install
npm run dev
```

Demo access codes (no backend yet): `VIEW-123`, `VOL-123`, `INT-123`, `ADMIN-123`

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
- State is in-memory (Zustand). Wire it to Cloudflare D1/Supabase later.
- Replace demo access codes with a real auth flow when ready.