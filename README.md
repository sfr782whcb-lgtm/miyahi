# مياهي — Miyyahi

Arabic RTL PWA for managing water bottle delivery.

## Setup

```bash
npm install
cp .env.example .env   # set DATABASE_URL to your PostgreSQL connection string
npm run db:setup       # migrate + seed (products + optional admin)
npm run dev
```

For local PostgreSQL, use [Neon](https://neon.tech) (free), [Supabase](https://supabase.com), Docker, or a local Postgres install.

To create the first admin account during seed, set `ADMIN_PHONE`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME` in `.env` before running `npm run db:seed`. After that, admins can create customers and drivers from the dashboard.

## Authentication

- **Customers** — self-register at `/register` (phone + password)
- **Admins** — created via seed env vars or by another admin
- **Drivers** — created by admin from the dashboard (with optional login account)
- **Login** — `/login` (httpOnly JWT session cookie, 7 days)
- **Logout** — available in all role layouts

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:setup` | Migrate + seed database |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:seed` | Seed products and optional admin user |
| `npm run db:reset` | Reset database and re-seed |
| `npm run generate:icons` | Regenerate PWA icons |

## Environment variables

Copy `.env.example` to `.env`:

- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — min 32 chars for JWT session cookies
- `NEXT_PUBLIC_APP_URL` — app URL for deployment
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — Web Push notifications (run `npm run generate:vapid`)
- `ADMIN_PHONE`, `ADMIN_PASSWORD`, `ADMIN_NAME` — optional, creates first admin during seed

## PWA

PWA works in production mode:

```bash
npm run build && npm start
```

- Install on Android (Chrome) or iOS (Safari → Add to Home Screen)
- Enable push notifications from the in-app banner after login
- Offline fallback at `/~offline`
- Service worker via Serwist at `/serwist/sw.js`

## Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide.

## Tech stack

- Next.js 16 (App Router, Turbopack)
- Prisma 6 + PostgreSQL
- Serwist PWA
- Zod validation
- Sonner toasts
- Tailwind CSS 4
