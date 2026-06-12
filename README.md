# Grow Eco System

**Integrated Creative & Enterprise Infrastructure Operating as One.**

The mega-project unifying three systems under the GROW "Institutional Tech" brand (see [BRAND.md](BRAND.md)):

| System | Folder | Port | Role |
| :--- | :--- | :--- | :--- |
| **Grow** (hub) | `Aura/` | `3000` | Marketing-agency website (with Business Solutions upsell) + the Grow Admin OS (CRM, Finance, Help Desk, Content, Projects, IAM, White-Label) |
| **The Grow Engine** | `The Grow Engine/` | `3030` (web) | Multi-tenant Growth Intelligence Platform — verified metrics, forecasting, AI analysis, client portal, public API. Background worker runs alongside (BullMQ). |
| **The Growees Producer** | `The Growees Producer/` | `3040` | Deterministic recruitment engine — vacancy blueprints, CV parsing, multi-rater scorecards, offers |

Both subsystems are embedded in the hub's admin under **Grow Systems** (`/admin/grow-engine`, `/admin/growees-producer`) with live health probes; endpoints configured via `GROW_ENGINE_URL` / `GROWEES_PRODUCER_URL` in `Aura/.env`.

## Local services (Homebrew)

- **MariaDB** (`brew services start mariadb`) — hub database `grow_os_core` (user `grow_admin` / `GrowOS2026Local`)
- **PostgreSQL 16 + pgvector** (`brew services start postgresql@16`) — Grow Engine database `growengine`
- **Redis** (`brew services start redis`) — Grow Engine queues

## Run everything (production mode)

```bash
# 1. Grow hub (port 3000)
cd Aura && npm run build && npm start

# 2. The Grow Engine — web (3030) + worker
cd "The Grow Engine" && npm run build && npm run start:web   # terminal A
cd "The Grow Engine" && npm run start:worker                  # terminal B

# 3. The Growees Producer (port 3040)
cd "The Growees Producer" && npm run build && npm start
```

## Access (demo)

- **Grow site**: http://localhost:3000 — admin at `/admin/login`, access code in `Aura/.env` notes (see final handover report)
- **Grow Engine**: http://localhost:3030 — workspace `demo-agency`, team `admin@demo.growengine.app` / `DemoAdmin2026!`, client portal `client@acme-outdoor.com` / `DemoClient2026!`
- **Growees Producer**: http://localhost:3040 — no login; seeded with vacancies, candidates, and scorecards

## Demo data

- Hub: `Aura/scripts/demo-seed.mjs` (CRM leads, invoices, tickets, tenant config) + `npx prisma db seed` (solution catalog, launch project)
- Engine: `npm run db:seed` (demo-agency, 120 days of synthetic verified metrics)
- Producer: `npm run db:seed:demo` (vacancies/candidates/scorecards into the DB set by `DATABASE_URL`)

> Note: this folder is not a single git repository — `Aura/` and `The Grow Engine/` carry their own repos from before the merge. Do **not** `git pull` inside `Aura/` until its `origin` is repointed to the new client's repository (the old remote contains the pre-rebrand codebase).
