# مياهي — Miyyahi

Arabic RTL PWA for managing water bottle delivery.

## Setup

```bash
npm install
cp .env.example .env   # set DATABASE_URL to your PostgreSQL connection string
npm run db:setup       # migrate + seed
npm run dev
```

For local PostgreSQL, use [Neon](https://neon.tech) (free), [Supabase](https://supabase.com), Docker, or a local Postgres install.

## Demo accounts

| Role | Phone | Password |
|------|-------|----------|
| Admin | 0500000001 | admin123 |
| Driver | 0501111111 | driver123 |
| Customer | 0503333333 | customer123 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:setup` | Migrate + seed database |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset database and re-seed |
| `npm run generate:icons` | Regenerate PWA icons |

## Environment variables

Copy `.env.example` to `.env`:

- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — min 32 chars for JWT session cookies
- `NEXT_PUBLIC_APP_URL` — app URL for deployment

## PWA

PWA works in production mode:

```bash
npm run build && npm start
```

- Install on Android (Chrome) or iOS (Safari → Add to Home Screen)
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
