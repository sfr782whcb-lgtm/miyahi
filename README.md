# مياهي — Miyyahi

Arabic RTL PWA for managing water bottle delivery.

## Setup

```bash
npm install
npm run db:setup   # migrate + seed
npm run dev
```

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
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run generate:icons` | Regenerate PWA icons |

## Environment variables

Copy `.env.example` to `.env`:

- `DATABASE_URL` — SQLite locally (`file:./dev.db`)
- `SESSION_SECRET` — min 32 chars for JWT session cookies
- `NEXT_PUBLIC_APP_URL` — app URL for deployment

## PostgreSQL migration (future)

The Prisma schema uses standard types compatible with PostgreSQL. To migrate:

1. Change `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`
2. Update `DATABASE_URL` to your Postgres connection string
3. Run `npx prisma migrate dev`

## PWA

PWA works in production mode:

```bash
npm run build && npm start
```

- Install on Android (Chrome) or iOS (Safari → Add to Home Screen)
- Offline fallback at `/~offline`
- Service worker via Serwist at `/serwist/sw.js`

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables: `SESSION_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`
4. For production DB, use Vercel Postgres / Neon / Supabase (SQLite does not persist on Vercel serverless)
5. Run migrations: add `prisma migrate deploy` to build command or use a post-deploy hook

Suggested build command:

```
prisma generate && prisma migrate deploy && next build
```

## Tech stack

- Next.js 16 (App Router, Turbopack)
- Prisma 6 + SQLite
- Serwist PWA
- Zod validation
- Sonner toasts
- Tailwind CSS 4
