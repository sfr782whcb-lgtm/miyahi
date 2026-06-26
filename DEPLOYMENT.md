# Deployment Guide — مياهي

## Prerequisites

- Node.js 20+
- GitHub account
- Vercel account
- **PostgreSQL database** (Vercel Postgres, Neon, or Supabase) — SQLite files do not persist on Vercel

---

## Step 1: Push to GitHub

### 1.1 Commit locally

```bash
cd /Users/yaramhmdalhwytat/miyyahi
git add .
git status   # verify .env is NOT listed
git commit -m "Migrate to PostgreSQL and prepare for Vercel deployment"
```

### 1.2 Create GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `miyyahi`
3. Visibility: Private (recommended) or Public
4. **Do not** initialize with README (project already has one)
5. Click **Create repository**

### 1.3 Push code

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/miyyahi.git
git branch -M main
git push -u origin main
```

If `origin` already exists, update it:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/miyyahi.git
git push -u origin main
```

---

## Step 2: Set up PostgreSQL (production)

### Option A — Vercel Postgres (recommended)

1. Deploy the project on Vercel first (Step 3) **or** create the project and add Storage
2. Vercel Dashboard → your project → **Storage** → **Create Database** → **Postgres**
3. Connect the database to your project — Vercel sets `POSTGRES_URL` / `DATABASE_URL` automatically
4. Ensure the connected variable name is `DATABASE_URL` (or map it in env vars)

### Option B — Neon (free tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a project named `miyyahi-prod`
3. Copy the **connection string** (use the pooled URL for serverless if offered)
4. Format: `postgresql://user:password@host/dbname?sslmode=require`

### 2.1 Run migrations on production database

From your machine, pointing at the production Postgres URL:

```bash
export DATABASE_URL="postgresql://..."
cd /Users/yaramhmdalhwytat/miyyahi
npx prisma migrate deploy
npm run db:seed
```

This creates all tables and demo login accounts.

---

## Step 3: Deploy on Vercel

### 3.1 Import project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub and authorize Vercel
3. Click **Import Git Repository**
4. Select your `miyyahi` repo
5. Framework Preset: **Next.js** (auto-detected)

### 3.2 Environment variables

Add these in Vercel → Project → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | Production, Preview |
| `SESSION_SECRET` | Run `openssl rand -base64 32` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (set after first deploy) | Production |

Generate session secret locally:

```bash
openssl rand -base64 32
```

### 3.3 Deploy

Click **Deploy**. Vercel runs:

```
prisma generate && prisma migrate deploy && next build
```

### 3.4 After first deploy

1. Copy your Vercel URL (e.g. `https://miyyahi-xxx.vercel.app`)
2. Set `NEXT_PUBLIC_APP_URL` to that URL
3. **Redeploy** (Deployments → ⋮ → Redeploy)

If login fails, seed the production database (Step 2.1).

---

## Step 4: Verify production

### Authentication

| Role | Phone | Password | Expected redirect |
|------|-------|----------|-------------------|
| Admin | 0500000001 | admin123 | `/dashboard` |
| Driver | 0501111111 | driver123 | `/driver` |
| Customer | 0503333333 | customer123 | `/customer` |

- Unauthenticated access to `/dashboard` → redirects to `/`
- Logout button → returns to `/`

### PWA

1. Open production URL in Chrome (Android) or Safari (iOS)
2. **Android:** Menu → Install app
3. **iOS:** Share → Add to Home Screen
4. Enable airplane mode → visit cached page → offline page for new navigations

### Responsive

- Mobile: bottom navigation visible
- Desktop (≥768px): admin top navigation bar visible

---

## Step 5: Custom domain (optional)

1. Vercel → Project → Settings → Domains
2. Add your domain
3. Update `NEXT_PUBLIC_APP_URL` to your domain
4. Redeploy

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on `migrate deploy` | Ensure `DATABASE_URL` is set and points to PostgreSQL |
| Login fails | Run `npm run db:seed` against production `DATABASE_URL`; check `SESSION_SECRET` |
| PWA not installable | Must use HTTPS; set `NEXT_PUBLIC_APP_URL` and redeploy |
| Database empty after deploy | Run Step 2.1 (migrate + seed) against production DB |
| Local dev after migration | Update `.env` `DATABASE_URL` from `file:./dev.db` to a PostgreSQL URL |

---

## Demo accounts (after seed)

See README.md for login credentials.
