# GROW Eco System

> **Integrated Creative & Enterprise Infrastructure Operating as One.**

A single monorepo housing the entire GROW product family under one "Institutional Tech" brand
(see [BRAND.md](BRAND.md)). One repository, clear modules, one set of commands.

```
grow-eco-system/
├── apps/
│   ├── aura            # @ "grow"      — the GROW Hub: marketing site + Admin OS         (:3000)
│   ├── engine-web      # @growengine/web    — Grow Engine web (portals, API, dashboards) (:3030)
│   ├── engine-worker   # @growengine/worker — Grow Engine background worker (BullMQ)
│   └── producer        # the-growees-producer — Growees Producer recruitment engine      (:3040)
├── packages/
│   ├── engine-core     # @growengine/core — shared domain logic (AI, forecasting, queues…)
│   ├── engine-db       # @growengine/db   — Drizzle schema + migrations + seed (Postgres)
│   └── branding        # Living Brand Canvas (static): Brand Kit, Voice Translator, Rebrander
├── package.json        # workspace root — orchestrates every module
├── BRAND.md            # canonical brand spec (palette, type, voice)
└── .env                # shared Grow Engine env (web + worker)
```

## Modules

| Module | Path | Port | Role |
| :--- | :--- | :--- | :--- |
| **GROW Hub** | `apps/aura` | `3000` | Marketing-agency site (Services, Business Solutions, Products) + Admin OS (CRM, Finance, Help Desk, Content, Projects, IAM, Branding, White-Label). Embeds the two systems below under **Grow Systems**. |
| **Grow Engine** | `apps/engine-web` + `apps/engine-worker` | `3030` | Multi-tenant Growth Intelligence Platform — verified metrics, forecasting, AI analysis, client portal, public API. Worker runs heavy jobs via Redis/BullMQ. |
| **Growees Producer** | `apps/producer` | `3040` | Deterministic recruitment engine — vacancy blueprints, CV parsing, multi-rater scorecards, offers. |
| **Brand System** | `packages/branding` | — | The Living Brand Canvas served by the Hub at `/branding` and embedded in Admin → Branding. |

The two systems are surfaced inside the Hub admin (`/admin/grow-engine`, `/admin/growees-producer`)
with live health probes; their URLs are configured via `GROW_ENGINE_URL` / `GROWEES_PRODUCER_URL`
in `apps/aura/.env`.

## Prerequisites (local services)

| Service | Used by | Start |
| :--- | :--- | :--- |
| **MariaDB** | Hub (`grow_os_core`, user `grow_admin`) | `brew services start mariadb` |
| **PostgreSQL 16 + pgvector** | Grow Engine (`growengine`) | `brew services start postgresql@16` |
| **Redis** | Grow Engine queues | `brew services start redis` |

## Install & run (one command each, from the repo root)

```bash
npm install            # installs every workspace

npm run db:setup       # push schemas + seed demo data for all three databases
npm run build          # build packages, then all apps (+ worker)
npm start              # run hub :3000, engine :3030, worker, producer :3040 — in parallel

# or for development with hot reload:
npm run dev
```

Per-module commands are also available: `npm run dev:hub`, `build:engine`, `start:producer`, etc.

## Environment

- `apps/aura/.env` — Hub: `DATABASE_URL` (MariaDB), `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `GROW_ENGINE_URL`, `GROWEES_PRODUCER_URL`.
- `.env` (root) — Grow Engine web + worker: `DATABASE_URL` (Postgres), `REDIS_URL`, `AUTH_SECRET`, `CREDENTIAL_ENCRYPTION_KEY`, AI keys. Loaded by `apps/engine-web/next.config.ts`.
- `apps/producer/.env` — Growees Producer: `DATABASE_URL` (SQLite `production.db`).

`.env` files are git-ignored. Each app provides an example where applicable.

## Demo access

| Module | URL | Credentials |
| :--- | :--- | :--- |
| GROW Hub | http://localhost:3000 | site is public |
| Admin OS | http://localhost:3000/admin/login | access code **`GrowDemo2026`** (one-click fill on the page) |
| Grow Engine | http://localhost:3030/login | workspace **`demo-agency`** · `admin@demo.growengine.app` / `DemoAdmin2026!` (pre-filled) · client portal `client@acme-outdoor.com` / `DemoClient2026!` |
| Growees Producer | http://localhost:3040 | no login; seeded with vacancies, candidates, scorecards |

## Security

`apps/producer/SECURITY.md` documents the VAPT review (SSRF + upload hardening) — production-approved.
