# Deployment Guide — مياهي

## Prerequisites

- Node.js 20+
- GitHub account
- Vercel account
- **Turso account** (free) for production database — SQLite files do not persist on Vercel

---

## Step 1: Push to GitHub

### 1.1 Commit locally

```bash
cd /Users/yaramhmdalhwytat/miyyahi
git add .
git status   # verify .env is NOT listed
git commit -m "Prepare miyyahi for production deployment"
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

## Step 2: Set up Turso database (production)

Vercel serverless cannot use local SQLite files. Turso provides cloud SQLite compatible with this project.

### 2.1 Install Turso CLI

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
```

### 2.2 Create database

```bash
turso db create miyyahi-prod
turso db show miyyahi-prod --url
turso db tokens create miyyahi-prod
```

Save the **URL** (`libsql://...`) and **token**.

### 2.3 Run migrations on Turso

```bash
export DATABASE_URL="libsql://your-db.turso.io"
export TURSO_AUTH_TOKEN="your-token"
npx prisma migrate deploy
npm run db:seed
```

---

## Step 3: Deploy on Vercel

### 3.1 Import project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `miyyahi` repo
4. Framework Preset: **Next.js** (auto-detected)

### 3.2 Environment variables

Add these in Vercel → Project → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | `libsql://...` from Turso | Production, Preview |
| `TURSO_AUTH_TOKEN` | Turso auth token | Production, Preview |
| `SESSION_SECRET` | Run `openssl rand -base64 32` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |

### 3.3 Deploy

Click **Deploy**. Vercel runs:

```
prisma generate && prisma migrate deploy && next build
```

### 3.4 Seed production data (first time only)

After first deploy, seed demo accounts locally pointing at Turso:

```bash
DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:seed
```

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
4. Enable airplane mode → visit cached page → should show offline page for new navigations

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
| Build fails on `migrate deploy` | Ensure `DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in Vercel |
| Login fails | Run `db:seed` against Turso; check `SESSION_SECRET` is set |
| PWA not installable | Must use HTTPS (Vercel provides this automatically) |
| Database empty after deploy | Seed Turso DB manually (Step 2.3) |

---

## Demo accounts (after seed)

See README.md for login credentials.
