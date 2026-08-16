# GROW — Hostinger Deployment Guide (free tier, $0)

## Production today: growcdx.com

`growcdx.com` is a Hostinger **Node.js** website connected to this monorepo
(`Oudoo/Grow`). **Pushing to `main` is the deploy.** Hostinger clones the repo, runs
`npm install`, then `npm run build`, then boots it with `npm start`.

| Setting | Value |
| :-- | :-- |
| Source | git — `Oudoo/Grow`, branch `main` |
| Node | 20 |
| Build script | `npm run build` |
| Output directory | `.next` (root symlink → `apps/grow/.next`, created by the build) |
| Start | `npm start` → `apps/grow/scripts/start.mjs` |
| Secrets | `.grow.env`, kept **outside** the deploy directory so redeploys preserve it |

> **Never commit `.next`.** Hostinger genuinely runs `next build` on the server — its
> build logs show it emitting all 68 routes. A committed build was checked out and then
> built over, leaving the app serving a mix of two builds: `/portfolio` and `/engine`
> 404'd while the homepage loaded chunks that existed in no build in the repo. Build
> output is ignored in `.gitignore` and must stay that way.

Useful checks: `hosting_listJsDeployments` for status, `hosting_getNodeJSBuildLogsV1`
for build output, `hosting_restartNode_jsApplicationV1` to reboot the process. Note the
`dawak.growcdx.com` subdomain lives at `growcdx.com/public_html/dawak` — deleting the
growcdx.com website in hPanel would take it with it.

---

## The multi-repo split (historical / other apps)

> The layout below describes splitting each app into its own deploy repo. `growcdx.com`
> does **not** use it — it deploys the monorepo root as described above. Kept for the
> Producer and Engine apps, which are still deployed as separate sites.

Hostinger Node.js hosting deploys **one app per website**, from a **repository root**. This
monorepo is your development source of truth; each app also lives in its own **deploy repo**
(the app at the root) so Hostinger auto-detects it. You create one Hostinger Node.js website
per deploy repo.

| App | Deploy repo | Hostinger framework | Database | Cost |
| :-- | :-- | :-- | :-- | :-- |
| GROW Hub | `Oudoo/Grow-Hub` | Next.js (auto) | Hostinger **MySQL** | $0 |
| Growees Producer | `Oudoo/Grow-Producer` | Next.js (auto) | SQLite file (seeded on boot) | $0 |
| Grow Engine — Web | `Oudoo/Grow-Engine-Web` | Next.js (auto) | **Supabase** Postgres + **Upstash** Redis | $0 |
| Grow Engine — Worker | `Oudoo/Grow-Engine-Worker` | **Other** (entry `dist/main.js`) | same Supabase + Upstash | $0 |

> Node version for every site: **20.x** (or 22.x).

---

## 0. One-time: free external services for the Engine

The Engine needs Postgres + Redis, which Hostinger shared Node hosting doesn't provide. Both
have free tiers:

### Supabase (Postgres + pgvector) — free
1. Create a project at **supabase.com** (free plan).
2. In **Project Settings → Database → Connection string → URI**, copy the connection string
   (looks like `postgres://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`).
   Use the **"Session"/direct** connection (port 5432), not the pooled 6543 one, for migrations.
3. In **SQL Editor**, run once: `create extension if not exists vector;`
   (Supabase supports pgvector — the Engine uses it.)
4. This URL is your `DATABASE_URL`.

### Upstash (Redis) — free
1. Create a database at **upstash.com** (free plan, choose a region near your Hostinger server).
2. Copy the **Redis connection string** (`rediss://default:[PASSWORD]@xxxx.upstash.io:6379`).
3. This is your `REDIS_URL`. (BullMQ requires `maxRetriesPerRequest=null`; the Engine sets that.)

### Generate two secrets (run locally)
```bash
openssl rand -base64 32   # → AUTH_SECRET
openssl rand -hex 32      # → CREDENTIAL_ENCRYPTION_KEY
```

---

## 1. GROW Hub → Hostinger (Next.js + MySQL)

**Repo:** `Oudoo/Grow-Hub`

1. **hPanel → Websites → Add Website → Node.js Apps → Import Git Repository** → pick `Grow-Hub`.
2. Framework auto-detects **Next.js**. Build command `npm run build`, start handled by Hostinger.
3. **Create the database:** the site's **Databases** tab → create a MySQL database + user; note host, db, user, password.
4. **Environment Variables** (Settings → Environment Variables):
   ```
   DATABASE_URL = mysql://USER:PASSWORD@HOST:3306/DBNAME
   ADMIN_PASSWORD = GrowDemo2026         # or set ADMIN_PASSWORD_HASH (preferred)
   AUTH_SECRET = <openssl rand -base64 32>
   GROW_ENGINE_URL = https://<your-engine-web>.hostingersite.com
   GROWEES_PRODUCER_URL = https://<your-producer>.hostingersite.com
   ```
   (Set the two URLs after you deploy those apps in steps 2–3; then redeploy the hub.)
5. **Deploy.** On boot the hub runs `prisma db push` automatically (creates all tables) — no manual migration.
6. Seed the catalog + demo data: in the site's terminal/console, or locally pointed at the same DB:
   `npm run seed && node scripts/demo-seed.mjs`.

Admin login: `/admin/login` → **GrowDemo2026**.

---

## 2. Growees Producer → Hostinger (Next.js + SQLite)

**Repo:** `Oudoo/Grow-Producer`

1. Add Website → Node.js Apps → Import `Grow-Producer`. Framework: **Next.js**.
2. Environment Variables:
   ```
   DATABASE_URL = file:./production.db
   NODE_ENV = production
   ```
3. **Deploy.** On boot `scripts/start.mjs` runs `prisma db push` and **seeds demo data if the DB is empty** — so the site comes up populated.

> Note: the SQLite file lives in the app's `nodejs` directory and is re-seeded after a redeploy.
> For data that must persist across redeploys, point `DATABASE_URL` at a MySQL database instead
> (the schema is portable) — optional, not needed for the demo.

---

## 3. Grow Engine — Web → Hostinger (Next.js + Supabase + Upstash)

**Repo:** `Oudoo/Grow-Engine-Web` (engine web with `core`+`db` vendored in, so it's a standalone Next.js app)

1. Add Website → Node.js Apps → Import `Grow-Engine-Web`. Framework: **Next.js**.
2. Environment Variables:
   ```
   NODE_ENV = production
   APP_URL = https://<your-engine-web>.hostingersite.com
   DATABASE_URL = <Supabase URI from step 0>
   REDIS_URL = <Upstash URI from step 0>
   AUTH_SECRET = <openssl rand -base64 32>           # same value as the worker
   CREDENTIAL_ENCRYPTION_KEY = <openssl rand -hex 32> # same value as the worker
   AI_PRIMARY_PROVIDER = anthropic
   ANTHROPIC_API_KEY =                                # optional — enables AI features
   ```
3. **Migrate + seed the database once** (locally, pointing at Supabase):
   ```bash
   git clone https://github.com/Oudoo/Grow-Engine-Web && cd Grow-Engine-Web
   npm install
   DATABASE_URL="<supabase>" npm run db:migrate --prefix packages/db
   DATABASE_URL="<supabase>" npm run db:seed   --prefix packages/db
   ```
   (Creates the `demo-agency` workspace and demo metrics.)
4. **Deploy.**

Login: workspace `demo-agency` · `admin@demo.growengine.app` / `DemoAdmin2026!`.

---

## 4. Grow Engine — Worker → Hostinger (Other)

**Repo:** `Oudoo/Grow-Engine-Worker`

1. Add Website → Node.js Apps → Import `Grow-Engine-Worker`. Framework: **Other**.
   - **Build command:** `npm run build`
   - **Entry file:** `dist/main.js`
2. Environment Variables: the **same** `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`,
   `CREDENTIAL_ENCRYPTION_KEY`, AI keys as the Engine web (step 3).
3. **Deploy.** It connects to Upstash and processes the Engine's background jobs.

> The worker and web must share the same Redis (Upstash) and Postgres (Supabase).

---

## 5. Wire the admin consoles

After the Engine web and Producer are live, set in the **Hub**'s env:
```
GROW_ENGINE_URL = https://<engine-web>.hostingersite.com
GROWEES_PRODUCER_URL = https://<producer>.hostingersite.com
```
…and redeploy the hub. Admin → **Grow Systems** then shows both as Operational and embeds them.

---

## Keeping deploy repos in sync (when you add tools later)

From the monorepo root, re-split and force-push the changed app:
```bash
# Hub
git subtree split --prefix=apps/grow -b deploy/hub
git push https://github.com/Oudoo/Grow-Hub.git deploy/hub:main --force

# Producer
git subtree split --prefix=apps/producer -b deploy/producer
git push https://github.com/Oudoo/Grow-Producer.git deploy/producer:main --force
```
The Engine repos are vendored (core+db copied in); re-run `scripts/stage-engine.sh` (in the repo)
to regenerate them after changing engine packages, then push. Hostinger redeploys on push.

**Total monthly cost: $0** (Hostinger plan + Supabase free + Upstash free).
