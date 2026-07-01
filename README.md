# rod's to-do(s) ⚡

Personal to-do, ideas, and journal app for Rod — same features as Belle's app, with a bold cartoon vibe (ocean blue, sponge yellow, Johnny Bravo orange).

## Features

- To-dos with due dates, categories, drag reorder, daily rituals
- Idea flow with voice transcription
- Journal with daily Bible verse, missed-day backfill, archive by month/year
- Cloud sync across devices (Vercel Blob)
- Due-date push reminders (Web Push + daily cron)
- PIN gate (6 digits)

## Local dev

```bash
npm install
cp .env.example .env.local
# Fill AUTH_TOKEN and blob vars after Vercel setup
npm run dev
```

## Deploy

Connected to GitHub + Vercel. Set production env vars:

- `APP_PIN` — 6-digit login PIN
- `AUTH_TOKEN` — session secret (must match cookie validation)
- `BLOB_STORE_ID` — Vercel Blob store for sync
- `BLOB_WEBHOOK_PUBLIC_KEY` — from Blob store settings
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — Web Push keys (`npx web-push generate-vapid-keys`)
- `VAPID_SUBJECT` — contact URL or `mailto:…` for push (optional)
- `CRON_SECRET` — secret Vercel Cron sends as `Authorization: Bearer …`
- `APP_TIMEZONE` — IANA timezone for due-date reminders (e.g. `America/New_York`; default `UTC`)
