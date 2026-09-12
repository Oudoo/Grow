# HANDOVER — GROW Eco System

**Written 2026-09-08. Repo `Oudoo/Grow`, branch `main`, 86 commits, live at https://growcdx.com.**

This is the document to read before touching anything. It is written for a fresh
agent or developer with no memory of how this system got here — and it is
deliberately opinionated about *why* things are the way they are, because most of
the surprising decisions in this repo were paid for with a production outage.

> **If you read only one section, read [§3 Three things are unfinished right
> now](#3-three-things-are-unfinished-right-now) and [§11
> Landmines](#11-landmines--things-that-have-already-broken-production).**

---

## Table of contents

1. [What this system is](#1-what-this-system-is)
2. [Who uses it](#2-who-uses-it)
3. [Three things are unfinished right now](#3-three-things-are-unfinished-right-now)
4. [Repository map](#4-repository-map)
5. [Running it locally — this works, and it gives you a real login](#5-running-it-locally--this-works-and-it-gives-you-a-real-login)
6. [Production topology](#6-production-topology)
7. [Deploying — the only procedure that works](#7-deploying--the-only-procedure-that-works)
8. [The data layer: two ORMs, one MariaDB](#8-the-data-layer-two-orms-one-mariadb)
9. [Identity and access](#9-identity-and-access)
10. [Feature inventory, with file pointers](#10-feature-inventory-with-file-pointers)
11. [Landmines — things that have already broken production](#11-landmines--things-that-have-already-broken-production)
12. [Live issues and open decisions](#12-live-issues-and-open-decisions)
13. [How to work here](#13-how-to-work-here)
14. [What the new account must set up](#14-what-the-new-account-must-set-up)
15. [Quick reference](#15-quick-reference)

---

## 1. What this system is

One monorepo, one deployed Node process, several products under one brand
("Institutional Tech" — see [BRAND.md](BRAND.md), which is canonical for palette,
type and voice).

| Product | Path | What it is |
| --- | --- | --- |
| **GROW Hub** | `apps/grow` | The public marketing site **and** the Admin OS (CRM, Finance, Help Desk, Content, Projects, IAM, Configuration, Chat, Branding, Playbook, White-Label). This is the deployed app. |
| **Grow Engine** | `apps/engine-web`, `apps/engine-worker`, `packages/engine-core`, `packages/engine-db` | Multi-tenant growth-intelligence platform: client dossiers, verified metrics, forecasting, AOM documents, meetings, scorecards, a client portal. **Its console is served *inside* the Hub at `/engine`** — `apps/engine-web` is not separately deployed. |
| **Growees Producer** | `apps/producer` | Deterministic recruitment engine (vacancies, CV parsing, multi-rater scorecards, offers). Surfaced in the Hub at `/producer`; the standalone app is not deployed. |
| **Brand system** | `packages/branding` | The Living Brand Canvas, served by the Hub at `/branding`. |

**The critical structural fact:** production runs **one** Next.js app —
`apps/grow` — and the Engine and Producer are mounted inside it as route groups
(`/engine/**`, `/producer/**`) plus API routes. The other `apps/*` exist in the
repo and are excluded from the deploy archive. If you are debugging something
under `/engine`, the code lives in `apps/grow/src/app/engine/`, and the *schema*
lives in `packages/engine-db`.

---

## 2. Who uses it

Staff accounts, all seeded on every boot by `apps/grow/scripts/seed-staff.mjs`
(idempotent — it creates what's missing and re-asserts role/active, and only ever
sets a password at creation time, so a later password change is never clobbered).

| Person | Login | Role | Access |
| --- | --- | --- | --- |
| Mahmoud Hassan (owner) | `mahmoud.hassan@growcdx.com` | SUPER_ADMIN | everything |
| Hana | `hana.mohamed@growcdx.com` | SUPER_ADMIN | everything, incl. task delete |
| Dr. Ahmed Alaa | `ahmed.alaa@growcdx.com` | SUPER_ADMIN | everything |
| Dr. Shennawy | `shennawy@growcdx.com` | SUPER_ADMIN | everything |
| Danya | `danya.mohamed@growcdx.com` | SUPER_ADMIN | everything |
| Basem — **Marketing Manager** | `basem@growcdx.com` | ADMIN | `EXEC_ACCESS`: every business module incl. finance, **no `iam`**. Plus task delete. |
| Seif Mohammed — **Multimedia Specialist** | `seif.mohammed@growcdx.com` | ADMIN | `FULL_ACCESS`: every module **including `iam` and `settings`** |

Two of those access maps are wider than the job titles suggest. **Both were
reviewed and deliberately kept** (2026-08-31) — do not "correct" them downward
without asking. The comments in `seed-staff.mjs` say so at each entry.

Basem and Seif were migrated off personal Gmail logins on 2026-09-02 via the
`renamedFrom` mechanism (see §9).

**Clients** (converted, with dossiers in `apps/grow/content/clients/`):
180 Dental, Sportive Hub, Nour Clinics (Nour Clinic Elite). 180 Dental and
Sportive Hub share a compound. Three more sit in the Playbook, not yet converted:
Heka Cosmetics, Heka Pharmacy, Base Training Club.

---

## 3. Two things are unfinished right now (one was three)

### 3.1 System email is one block away — and we now know it is in NEITHER file

`/api/health` still reports:

```
"smtpHost":false,"smtpUser":false,"smtpPass":false,"cronSecret":false,"envSource":"domain"
```

An earlier version of this section said the SMTP block "went into
`~/.grow.env`, which the app never reads". **That was wrong.** Read on the host
on 2026-09-12 (through a temporary cron job — see §7.5): `~/.grow.env` does not
exist (`/api/health` → `envSecondary: null` after the deploy that reads it), and `/home/u454713534/domains/growcdx.com/.grow.env` contains
exactly `DATABASE_URL NODE_ENV AUTH_SECRET ADMIN_EMAIL ADMIN_PASSWORD
STAFF_PASSWORD`. A search of the account (`~`, the domain folder,
`public_html/`, `nodejs/`) found exactly one `.grow.env` on the whole account:
the domain-level file, **265 bytes, last modified 2026-07-05**. Whatever was
edited, it never reached this host. If a file is ever created inside
`public_html/` or `nodejs/` (the folders File Manager opens into), it will not
be read either: those are *siblings* of the running app, not ancestors.

Since 2026-09-12 `server.js` reads **both** copies: the domain-level file is
authoritative, the account-home file fills only keys the first one lacks, and
`/api/health` names those keys (`envSecondary`, `envSecondaryKeys`). So a line
in either file now takes effect — but the block still has to be written.

**The fix, unchanged:** append this to
`/home/u454713534/domains/growcdx.com/.grow.env` (File Manager: enable *Show
hidden files*; the file is one level ABOVE `public_html`), then restart the
Node app:

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=internal@growcdx.com
SMTP_PASS=<the internal@ mailbox password>
MAIL_FROM=GROW <internal@growcdx.com>
APP_URL=https://growcdx.com
CRON_SECRET=<the value in the existing cron job's command>
```

`CRON_SECRET` is not a free choice: the dispatcher cron (uid `gInR3iY0TW`, every
15 min) carries the value literally in its command. Read it from hPanel →
Advanced → Cron Jobs and paste the same string. It is deliberately **not** in this
repo.

Then verify with `/api/health` (all four flags `true`), and prove delivery by
calling the dispatcher with that secret:

```bash
curl -sS -H "x-cron-secret: <secret>" https://growcdx.com/api/notifications/dispatch
```

**The backlog is gone.** The 22 notifications queued since 2026-08-31 were
retired on 2026-09-12 — `emailedAt` set, `emailError` says why and how to
reverse it — so the first live dispatch sends only new mail, not ten-day-old
mentions. They are still visible in-app. `/api/health/db` → `outbox` shows what
is queued at any time.

DNS needs nothing: Hostinger Email is fully wired (MX `mx1`/`mx2.hostinger.com`,
SPF, three DKIM CNAMEs, autodiscover). DMARC is `p=none` — monitoring only.

### 3.2 RESOLVED 2026-09-12 — the worker error loop, and what it actually was

Five in-process workers had failed the same `queue_jobs` poll ~7 times a second
since 2026-09-02 (5.16 M runtime-log lines; `nodejs/stderr.log` reached
**6.7 GB**). The cause was neither of the two candidates listed here before:

- `queue_jobs` existed, but with 12 columns — engine migration **0001** (which
  adds `available_at`, `locked_at`, `locked_by`, `payload`, `max_attempts`) had
  never run, and `__drizzle_migrations` was **empty** with 90 engine tables present.
- Because statement 244 of 262 in migration **0000** — `CREATE INDEX` on
  `cost_tracking(tenant_id, feature)` with `feature` a TEXT column — cannot run
  on MariaDB (`ER_TOO_LONG_KEY`). drizzle-orm's migrator records a migration
  only after *all* its statements succeed, DDL auto-commits, so 243 statements
  were applied-but-unrecorded and every boot re-ran statement 1, hit "already
  exists", and stopped. The old `migrate-engine.mjs` swallowed that. Proven by
  running the migrator against the local database: same statement, same error.

What changed (commit `9d3251c`): `cost_tracking.feature` is `varchar(191)`
(migration 0002; 0000 amended to narrow it before the index, which was legal
because no database had ever recorded 0000); `scripts/migrate-engine.mjs` is
now a **resumable, statement-by-statement runner** that treats "already
exists" as an outcome, records with drizzle's own hash/created_at rule, prints
the failing statement to stdout and exits 1 on anything else (header comment
has the full story); the poll loop backs off (idle 1.5 s → 15 s with
wake-on-enqueue, failures up to 60 s, reported once a minute with the
database's own error first); workers start only once `isQueueSchemaReady()`
proves the columns exist.

Production was migrated from a laptop before the deploy: 0000 → 20 statements
applied / 243 in place, 0001 → 6, 0002 → 1. **The loop stopped the instant the
columns existed** — not one log line since.

**What to watch now:** `/api/health/db` must show `queueJobs` as a number (not
"table-or-columns-missing") and `engineMigrations` ≥ 3. A boot log line
`[migrate-engine] FAILED …` names the exact statement.

### 3.3 Nothing pages anyone when the site goes down

`/api/health` is deliberately dependency-free, so it stayed green through a total
database outage. **Any monitor must point at `/api/health/db`**, which returns
**503** when the database is unreachable.

There is a cron on the box that curls it and prints a line on failure, but nobody
reads cron output. The remaining task is 2 minutes of clicking, off-host, and it
is the part that matters — an external monitor keeps working when the server does
not:

1. Free account at uptimerobot.com (or Better Stack / Healthchecks.io)
2. Add monitor → HTTP(s) → `https://growcdx.com/api/health/db`
3. Interval 5 minutes
4. Alert contact: email, plus WhatsApp/SMS if you want to be woken

`scripts/monitor-health.mjs` knows how to alert over Twilio WhatsApp but **cannot
be scheduled on this host: there is no `node` binary available to cron.** Verified
absent from `/usr/bin`, `/usr/local/bin`, `~/nodevenv`, `~/.nvm`,
`/opt/alt/alt-nodejs*`. Cron has `curl` and nothing else useful.

---

## 4. Repository map

```
grow-eco-system/
├── server.js                  # ← Passenger's entry point. Read this first.
├── package.json               # workspace root; `npm run build` is what the host runs
├── BRAND.md                   # canonical brand spec
├── DEPLOYMENT.md              # operational runbook (deploy, email, DB, monitoring)
├── HANDOVER.md                # this file
├── docs/INCIDENT-2026-08-01-outage.md
├── apps/
│   ├── grow/                  # THE DEPLOYED APP
│   │   ├── AGENTS.md          # "this is NOT the Next.js you know" — read node_modules/next/dist/docs
│   │   ├── CLAUDE.md          # points at .agent/AGENTS.md (see §13 for what actually applies)
│   │   ├── .agent/            # AgentOS governance ruleset + HANDOFF.md
│   │   ├── prisma/schema.prisma   # 26 hub models
│   │   ├── drizzle-engine/    # generated Drizzle migrations for the 63 engine tables
│   │   ├── content/clients/   # version-controlled client dossiers (markdown)
│   │   ├── scripts/           # boot-time migrations and seeds (see §7.3)
│   │   └── src/
│   │       ├── app/admin/**   # the Admin OS
│   │       ├── app/engine/**  # the Engine console + client portal
│   │       ├── app/producer/**
│   │       ├── app/api/**     # health, dispatch, engine v1, producer, webhooks
│   │       └── lib/**         # the interesting code lives here
│   ├── engine-web/            # NOT deployed (excluded from the archive)
│   ├── engine-worker/         # started in-process by the hub, see §3.2
│   └── producer/              # NOT deployed
└── packages/
    ├── engine-core/           # queues.ts, AI, forecasting
    ├── engine-db/             # Drizzle schema: 63 mysqlTable definitions
    └── branding/
```

`apps/grow/src/lib/` is where to look first for anything cross-cutting:

| File | Why it exists |
| --- | --- |
| `access.ts` | `MODULES`, `can()`, `accessLevel()`. SUPER_ADMIN returns `manage` unconditionally. |
| `auth.ts` | Session JWT, PBKDF2 hashing, `assertAccess()`. |
| `db.ts` | A plain `PrismaClient` — with a long comment explaining why there is **no** reconnect layer (§11.1). |
| `directory.ts` | The single source of "who exists" for every picker and mention. React-`cache`d; returns `[]` on DB error rather than throwing. |
| `mentions.ts` | @mention parsing against real accounts (15 tests). |
| `notify.ts` | In-app notification rows + the email outbox. |
| `mail.ts` | SMTP transport. Re-reads env on every call **on purpose**. |
| `reminders.ts` | Due-date sweep. |
| `calendar.ts` | Shared calendar arithmetic, Egyptian week (Sun start, Fri/Sat weekend), 17 tests. |
| `settings.ts` / `config-types.ts` | Admin-editable statuses/priorities, with in-use protection. |
| `chat-unread.ts` | One grouped unread query, shared by the chat page and the dock. |
| `engine/json.ts` | **Always** use this to read Drizzle `json()` columns (§11.3). |
| `dm-slug.ts` | sha256-derived DM slugs (§11.5). |

---

## 5. Running it locally — this works, and it gives you a real login

Earlier notes in this project claimed local development was impossible. **That was
wrong**, and it was verified working on 2026-09-08. Use it: a real login beats
every workaround.

```bash
npm install
npm run dev --prefix apps/grow      # or: preview_start with the "grow-hub-dev" config
```

**Why `dev` and not `start`:** `next dev` loads `apps/grow/.env.local` first, and
that file points `DATABASE_URL` at the **local** `grow_local` MariaDB. `npm start`
runs `apps/grow/scripts/start.mjs`, which begins with `import "dotenv/config"` —
that loads `.env` (the **production** DATABASE_URL) before Next can read
`.env.local`, and dotenv never overrides an existing value. So `npm start`
locally authenticates against production credentials from your laptop, fails, and
every console page 500s. `.claude/launch.json` has both configs, with this written
on each.

Proof that dev mode is healthy — `GET http://localhost:3000/api/health/db`:

```json
{"ok":true,"host":"127.0.0.1","adminUsers":7,"notifications":0,"activities":0,
 "settings":0,"channels":0,"chatMessages":0,"ms":207}
```

**If console pages 500 on a missing table**, the local schema is behind. The hub's
DDL is hand-written (§8.2), so bring it up to date with:

```bash
cd apps/grow
DATABASE_URL="mysql://<local user>:<pass>@127.0.0.1:3306/grow_local" node scripts/migrate-hub.mjs
```

(Read the exact URL from `apps/grow/.env.local` — it is gitignored and never
ships.) That was run on 2026-09-08 and applied **36 changes**, creating every
table added since launch: `Channel`, `ChannelMember`, `ChatMessage`,
`MessageReaction`, `ChatAttachment`, `Notification`, `Activity`, `SystemSetting`
and their indexes. One harmless failure is expected and can be ignored:
`Activity_taskId_fkey FAILED: errno 150` — a pre-existing local column-type
mismatch on a dev database.

The local DB has the 7 staff accounts plus `test.viewer@growcdx.com` (MEMBER),
1 project and 1 task. It has **no** channels, settings or notifications until you
run the seeds, which `next dev` does not run (only `server.js` does):

```bash
cd apps/grow
DATABASE_URL="<grow_local url>" node scripts/seed-config.mjs          # task statuses, priorities, client channels
DATABASE_URL="<grow_local url>" node scripts/seed-staff.mjs           # needs STAFF_PASSWORD in the environment
DATABASE_URL="<grow_local url>" node scripts/seed-client-knowledge.mjs
DATABASE_URL="<grow_local url>" node scripts/link-task-owners.mjs
```

Local login passwords are the `ADMIN_PASSWORD` / `STAFF_PASSWORD` values in
`apps/grow/.env.local`. **Never commit them.**

Tests must run from `apps/grow` — one suite reads `src/app` by relative path:

```bash
cd apps/grow && npx vitest run        # 9 files, 103 tests, ~1s
```

Also useful: `npm run typecheck`. `npm run lint` has ~771 pre-existing errors,
almost all from `src/generated/prisma` — **lint is not a clean gate in this
repo**; lint only the files you touched (`npx eslint <paths>`).

---

## 6. Production topology

- **Host:** Hostinger shared hosting, account `u454713534`, domain `growcdx.com`.
  Node 20, app type `other`, entry file `server.js`, build script `build`.
- **Web server:** Phusion Passenger. It starts `server.js`, which starts Next.
- **Database:** one MariaDB 11.8 instance, `u454713534_grow_os`, user
  `u454713534_grow_admin`. Both the Prisma hub schema and the 63 Drizzle engine
  tables live in it.
- **Deploy layout:** Hostinger versions each deploy —
  `domains/growcdx.com/hbuilds/versions/<uuid>/nodejs/apps/grow`. This means
  `scripts/publish-to-passenger.mjs` is redundant for this deploy path (it
  no-ops with `[publish] not a Hostinger domain layout … skipping.`).
- **Config:** `.grow.env` at `/home/u454713534/domains/growcdx.com/.grow.env`,
  outside the deploy directory so redeploys preserve it. Loaded by `server.js`
  with `override: true` — it beats anything the host injects.
- **The hPanel "Node.js → Environment variables" panel is BUILD settings and does
  not reach the running process.** Proven 2026-09-02: `CRON_SECRET` set there,
  saved (which restarts the process), plus an explicit restart, and the dispatcher
  still rejected that exact secret. Panel returned to empty. This is *why*
  `override: true` exists. Don't go back there.
- **No file access via API.** `hosting_listWebsiteFilesAndDirectoriesV1` and
  `hosting_getWebsiteFileContentV1` fail for this account with
  `api/public/v1/accounts//domains/...` — an empty account-id segment. So an agent
  **cannot** read or write `.grow.env`; the user must.
- **Runtime logs are readable** via `hosting_getNode_jsRuntimeLogsV1` (this is how
  §3.2 was found). Requires `username: "u454713534"`.

`server.js`, in order:

1. `process.chdir(APP_DIR)` — **required**. Prisma resolves its query engine
   relative to `cwd`, and the deploy is a monorepo, so without this it looks in
   `<root>/src/generated/prisma` and throws `PrismaClientInitializationError`.
2. Load `.grow.env` with `override: true`; set `GROW_ENV_SOURCE` for
   `/api/health`.
3. AUTH_SECRET self-heal.
4. **Database host probe** — connects to `localhost`, then `127.0.0.1`, then the
   remote host, and uses the first that answers `SELECT 1`. On this host
   `localhost` fails and **`127.0.0.1` works**. This runs **strictly before**
   `app.prepare()`, because `lib/db.ts` constructs `PrismaClient` at module scope
   and reads `DATABASE_URL` then.
5. Bootstrap steps (each failure-tolerant, all outcomes to **stdout** — see
   §11.4): `hub schema` → `schema sync (prisma db push)` → `engine schema` →
   `staff IAM accounts` → `link task owners` → `client knowledge bases` →
   `system configuration`.
6. Listen.

---

## 7. Deploying — the only procedure that works

### 7.1 Git deploys are broken; deploy by ARCHIVE

```bash
# 1. commit to main (see §13 on why main)
# 2. build locally as a check
npm run build

# 3. package from git HEAD, excluding what must not ship
rm -rf /tmp/grow-pkg /tmp/grow-deployN.zip && mkdir -p /tmp/grow-pkg
git archive HEAD | tar -x -C /tmp/grow-pkg
rm -rf /tmp/grow-pkg/Fonts /tmp/grow-pkg/docs \
       "/tmp/grow-pkg/apps/grow/User Assets" \
       /tmp/grow-pkg/apps/engine-web /tmp/grow-pkg/apps/producer
(cd /tmp/grow-pkg && zip -rq /tmp/grow-deployN.zip . -x '*.DS_Store')
```

Then `hosting_deployJsApplication` with `domain: growcdx.com` and that archive
path. ~8.6 MB, ~3 minutes to build on the host. **A `Connection closed` error from
that tool does not mean the deploy failed** — it has completed anyway; check
`hosting_listJsDeployments` before retrying. Deployment count is at **65**.

**Never commit `.next` or `src/generated`.** Both are gitignored, and committing
`.next` was the *cause* of a stale-deploy incident, not the cure. The host runs
`npm run build` itself, which symlinks `.next` → `apps/grow/.next` (a symlink,
deliberately, because copying ~200 MB onto a quota-limited host is worse).

### 7.2 Verify every deploy

```bash
curl -fsS https://growcdx.com/api/health/db     # ok:true, host:127.0.0.1, table counts
curl -fsS https://growcdx.com/api/health        # config flags incl. envSource
for p in /admin/login /admin/projects /admin/chat /engine/clients; do
  curl -s -o /dev/null -w "$p %{http_code}\n" "https://growcdx.com$p"; done
# expect: /admin/login 200, everything else 307 (auth guard intact)
```

`/api/health/db` is the load-bearing check: it reports the database host actually
in use plus a count per table, so a missing table shows up as an error there
rather than as a mystery 500 a week later. Add a count for any table you add.

### 7.3 Boot scripts (all idempotent, all run every boot)

| Script | What it does |
| --- | --- |
| `migrate-hub.mjs` | **All hub DDL, hand-written** over mysql2, because `prisma db push` does not work on this host (§8.2). Add every new table/index/FK here. |
| `migrate-engine.mjs` | Applies `drizzle-engine/` **statement by statement**, resumable; "already exists" is an outcome, anything else prints the statement and exits 1 (§3.2). Run it from a laptop against prod with `DATABASE_URL=…` when a boot fails it. |
| `seed-staff.mjs` | Staff IAM accounts, access maps, and login **renames** (§9). |
| `link-task-owners.mjs` | Backfills task owners onto IAM accounts. |
| `seed-client-knowledge.mjs` | Loads `content/clients/**` dossiers into the Engine. |
| `seed-config.mjs` | 5 task statuses, 3 priorities, 3 client channels. |
| `monitor-health.mjs` | Twilio WhatsApp alerting. **Cannot run here — no `node` for cron.** |
| `demo-seed.mjs`, `seed-producer.mjs`, `hash-password.mjs` | Local/dev utilities. |

### 7.4 Reading production logs

```
hosting_getNode_jsRuntimeLogsV1  { domain: growcdx.com, username: u454713534, period: 1w, limit: 200 }
```

Beware: the log reached 5.16 M lines before §3.2 was fixed, and at that size a
`period` request returns HTTP 500. `from_line: <large number>` (with no
`period`) works and returns the newest entries plus `total_lines` — poll with
`total_lines + 1` to see only what is new. The file behind the 6.7 GB was
`nodejs/stderr.log` (`console.error`); `console.log` was 1 MB.
`hosting_clearNode_jsRuntimeLogsV1` exists if the space has to be reclaimed.

### 7.5 Running a shell command on the host (there is no SSH)

A cron job runs arbitrary shell as the account user, and its output can be read
back: `hosting_createAccountCronJobV1` (`* * * * *`), wait ~90 s,
`hosting_getCronJobOutputV1`, `hosting_deleteAccountCronJobV1`. This is how the
`.grow.env` key names in §3.1 and the 6.7 GB log were found. Rules learned:
command ≤ 255 chars; the output is the **last command's stdout only** (wrap
several in `( … ) 2>&1 | paste -sd ' ' -`); `$vars`, `%` and `~` are mangled
before the shell sees them and `\n` loses its backslash — use absolute paths,
`$(…)` works; no `node` in cron. Read-only by default; never blind-overwrite
`.grow.env`.

---

## 8. The data layer: two ORMs, one MariaDB

### 8.1 Which ORM owns what

- **Prisma** owns the hub: 26 models in `apps/grow/prisma/schema.prisma` —
  `AdminUser`, `ClientAccess`, `TenantConfig`, `Project`, `Task`, `SubTask`,
  `Comment`, `Attachment`, `Activity`, `Notification`, `Channel`,
  `ChannelMember`, `ChatMessage`, `MessageReaction`, `ChatAttachment`,
  `SystemSetting`, `Invoice`, `Ticket`, `Submission`, `Suite`, `Product`, plus the
  producer's `Vacancy`/`Competency`/`Candidate`/`Scorecard`/`Score`/`Offer`.
  Generated client at `src/generated/prisma` (gitignored).
- **Drizzle** owns the Engine: 63 `mysqlTable`s across
  `packages/engine-db/src/schema/*.ts`.

### 8.2 `prisma db push` does not work here

The schema engine binary is unusable on this host. That is why **`migrate-hub.mjs`
contains hand-written DDL** and why the boot sequence still *tries* `db push`
(harmless, best-effort) after `migrate-hub` has already done the real work. If you
add a model to `schema.prisma`, you must also add its `CREATE TABLE` / index / FK
to `migrate-hub.mjs`, or it will exist locally and not in production.

Also: `prisma format` realigns fields, so string-matching edits written before a
format run will silently no-op. **Assert your edits landed.**

### 8.3 MariaDB returns `json()` columns as STRINGS

`JSON` on MariaDB is an alias for LONGTEXT. Drizzle has `mapToDriverValue` but no
`mapFromDriverValue`, so a `json()` column reads back as a **string**, and
`rows.map(...)` throws `.map is not a function`. This 500'd every Engine client
page once. Proven against production: `milestone_targets` comes back as `"[]"`,
`typeof "string"`.

**Always** read Drizzle JSON through `apps/grow/src/lib/engine/json.ts`
(`jsonArray` / `jsonObject` / `jsonNumberMap`). Never `as {...}[]`. 15 unsafe
casts across 7 pages were removed for this; don't add a sixteenth.

### 8.4 Connections

The app connects over **loopback `127.0.0.1`** after the boot probe. Remote-access
grants exist for `2.57.91.212` and `2a02:4780:3f:1234::39` as a fallback only; the
`%` wildcard was removed. Your laptop is not granted, which is why local work uses
`grow_local` (§5).

---

## 9. Identity and access

One `AdminUser` table for everyone — staff and clients (the "unified IAM"
decision). Roles: `SUPER_ADMIN`, `ADMIN`, `MEMBER`, `VIEWER`, `CLIENT`. Per-module
access is a JSON map of `none | view | manage`:

```ts
export function accessLevel(role, map, module): AccessLevel {
  if (role === "SUPER_ADMIN") return "manage";   // unconditional
  return map?.[module] ?? "none";
}
```

Modules (`src/lib/access.ts`): `analytics`, `crm`, `finance`, `support`,
`products`, `projects`, `iam`, `settings`, `chat`, `branding`, `playbook`,
`engine`, `producer`.

**Enforcement is at the mutation layer, not the UI.** Server actions dispatch by
global action id, so hiding a button is not a security boundary — every action
calls `assertAccess(module, level)`.

### 9.1 Renaming a login is a rename, never a recreate

Everything — tasks, chat messages, reactions, memberships, notifications,
activity — is keyed on the `AdminUser` **id**. Recreating an account at a new
address orphans all of it and leaves two logins for one person.

`seed-staff.mjs` handles this with `renamedFrom` + `renameAccount()`: it updates
`email` in place, so the id survives and `passwordHash` is untouched (the person
signs in at the new address with their existing password). It lives in the seed —
not a separate script — because the seed asserts these accounts on every boot, so
a rename running *after* it would find the account already recreated and leave a
duplicate. It runs as its own phase, before any address is looked up, and is
independent of `STAFF_PASSWORD` (a rename needs no password). If **both**
addresses resolve to accounts it refuses and logs both ids — merging two
histories is a human decision.

### 9.2 Anything keyed on the email string will break silently

Two such things existed when Basem was renamed, and both had to move with him:

- `TASK_DELETE_ALLOWED` in `src/app/admin/projects/actions.ts` matches on email.
  The rename alone would have revoked his task-delete permission — the only
  permission narrower than `manage`. The old address is deliberately **not** left
  in the list: an allow-list entry that is nobody's account grants deletion to
  whoever is given that address next.
- The Engine's user mirror in `src/lib/engine/session.ts` keys on the hub id but
  had `email` missing from its `onDuplicateKeyUpdate` set, so it would have shown
  the old address forever.

**Before considering any rename done, grep the old address across
`.ts/.tsx/.mjs/.md`.**

---

## 10. Feature inventory, with file pointers

**Admin OS** (`src/app/admin/`): `/admin` CRM · `analytics` · `finance` ·
`support` · `products` · `projects` (+ `[id]`, `my-work`) · `iam` · `clients` ·
`configuration` · `chat` · `branding` · `playbook` · `whitelabel` ·
`notifications` · `login`.

**Project Management** — the most developed module:
- Due dates + priority; due dates stored at **12:00 UTC** so a calendar day is
  timezone-stable.
- **My Work** dashboard (`projects/my-work`).
- Activity timeline on every task (`lib/activity.ts`, `activity-format.ts`).
- **Consolidated calendar** (`projects/ProjectCalendar.tsx`): project/status/owner
  filters (status defaults to open work; owner has an explicit "Unassigned"),
  a month summary counted from tasks not grid cells, priority as chip fill and
  status as a dot, overdue as a red ring + `!` — **lateness and importance are
  independent facts and must read independently**; plus a day-detail panel.
- Task deletion restricted to three accounts (§9.2).
- `createCalendarTaskAction` is separate from `createTaskAction` because the
  calendar already knows the date and must be told the project.

**Team Chat** (`src/app/admin/chat/`): channels, private channels, DMs, threads
(one level), a fixed reaction set, file uploads, editing, @mentions that notify.
Delivery is **polling** (6 s focused / 60 s hidden) because Passenger offers no
WebSocket path. Plus a **floating dock** (`ChatDock.tsx`) on every console page
except the chat page itself: it hosts the same `ChatRoom` (so features can't
drift), polls only unread counts while closed (30 s / 120 s), and stops polling
entirely for an account without chat access.

**Configuration** (`src/app/admin/configuration/`): admin-editable task statuses
and priorities with colours and an `isComplete` flag — `isComplete` is a *flag*,
not the literal id `"DONE"`, so a new terminal status works without code. In-use
protection prevents removing a status that tasks still hold.

**Notifications** (`lib/notify.ts`, `mail.ts`, `reminders.ts`): in-app rows
written synchronously; email as a queued outbox drained by
`/api/notifications/dispatch` (cron) and opportunistically in the background after
an action. `MAX_EMAIL_ATTEMPTS = 3`.

**Engine console** (`src/app/engine/(console)/`): `dashboard`, `clients` (+`[id]`
with Creative & CAT and its own schedule calendar), `aom` (+`doc/[id]`),
`leads`, `meetings`, `scorecards`, `tasks`, `tickets`, `billing`, `costs`,
`features`, `integrations`, `process-intelligence`, `settings`, `system`. Client
portal at `/engine/client/[slug]`. It has its own **light** theme scope
(`.engine-scope` in `globals.css`) while the hub palette is theme-aware — relevant
if you extend the chat dock there.

**APIs:** `/api/health`, `/api/health/db`, `/api/health/mail`,
`/api/notifications/dispatch`, `/api/chat/attachment/[id]`,
`/api/engine/v1/{clients,metrics,recommendations}`, `/api/producer/**`,
`/api/webhooks/whatsapp`.

**AI features are inert:** `ANTHROPIC_API_KEY` is unset. QBR, AI reports,
competitor analysis and AOM semantic search all no-op until it is set in
`.grow.env`.

---

## 11. Landmines — things that have already broken production

Each of these cost real downtime. The rule at the end of each is the point.

### 11.1 A Prisma reconnect layer caused a TOTAL outage

A per-query reconnect wrapper treated `P2024` (connection-pool exhaustion) as a
dead socket and called `$disconnect()` — destroying the pool that other requests
were queued on. Result: every page 504'd, staff logins timed out. Reverted in
`7300d44`.

> **Rule:** do not add runtime connection recovery to `lib/db.ts`. The comment
> there explains why. The boot probe (§6) is one-shot and boot-time on purpose.
> Do not trade a two-minute manual restart for a total outage, and never ship
> resilience work on reasoning alone without load-testing it.

### 11.2 Rewriting `localhost` → a remote host broke every login

`server.js` once unconditionally rewrote the DB host to `srv1808.hstgr.io` to work
around a stale `user@localhost` password. That made the database depend on an
external route *and* a per-IP grant. When the route broke: Prisma `P1001`,
pre-auth, every login showing "Cannot reach the accounts database", and a restart
did not help. Fixed by the probe (§6).

> **Rule:** loopback is not an optimisation, it is a dependency you're choosing
> not to have. Prove the host, don't assume it.

### 11.3 MariaDB JSON columns — see §8.3

> **Rule:** `lib/engine/json.ts`, never a cast.

### 11.4 A migration failure invisible in the logs

`prisma db push` failed on this host and its failure went to `nodejs/stderr.log`,
which had grown too large to open (`ERR_STRING_TOO_LONG`). Three consecutive
deploys logged "schema sync…" and silently moved on **while the schema never
applied** — `/api/health/db` reported `notifications: "table-missing"`.

> **Rule:** a bootstrap step's outcome goes to **stdout**, and every new table
> gets a count in `/api/health/db`. §3.2 is this same bug wearing a different hat.

### 11.5 A truncated-base64 DM slug collided

DM slugs were built from a truncated base64 of the participant key, which
collapsed for any two pairs sharing a first participant — two different pairs both
produced `dm-mtexmtexmtetywfhys00`, and creating a DM threw React error #441.
Fixed with sha256 in `lib/dm-slug.ts` (6 tests), and the action now returns errors
instead of throwing.

> **Rule:** Next sanitises thrown server errors in production into "An error
> occurred in the Server Components render" — so **return** error objects from
> server actions; a thrown one is undebuggable from outside.

### 11.6 A closure passed from a server component to a client component

A plain arrow function created in a server component **cannot be serialised** to a
client component. It fails at runtime and the build does not catch it. Use
`action.bind(null, id)`.

> **Rule:** guarded by `src/lib/server-action-props.test.ts`, which scans every
> `.tsx` under `src/app`. Keep that test passing — and run tests from
> `apps/grow`, or that suite fails on a relative path.

### 11.7 `formAction()` discarded every error return

A helper cast a server action to `(...args) => Promise<void>`, throwing away the
result — 49 forms and 79 error returns were invisible to users. Replaced by
`components/engine/action-form.tsx` (`ActionForm`).

> **Rule:** if a mutation can fail, the UI must be able to say so.

### 11.8 Two CSS bugs only a browser caught

An arbitrary Tailwind selector (`[div:hover>div>&]`) that never matched made a
calendar's `+` button permanently invisible; and weekend shading lost the cascade
because a second `bg-` class followed `bg-card`.

> **Rule:** review UI in a browser at desktop **and** 375 px, in both themes.
> Reasoning does not catch cascade bugs. Every calendar/dock change in this repo
> was reviewed that way and every time it found something.

---

## 12. Live issues and open decisions

**Ranked, highest value first.**

1. **§3.1 finish SMTP** — one block in the domain-level `.grow.env`, one restart.
   (§3.2, the worker error loop, was resolved on 2026-09-12.)
2. **§3.3 off-host uptime monitor** — 2 minutes, needs your account.
3. **Reclaim `nodejs/stderr.log`** if it is still 6.7 GB — §7.4 / §7.5.
4. **Rotate the shared passwords.** `STAFF_PASSWORD` and the demo/admin passwords
   are shared and have been in use for months. Values are in the gitignored
   `.env`/`.env.local` and in `.grow.env`.
5. **`ANTHROPIC_API_KEY` unset** — every AI feature is inert (§10).
6. **180.clinic placeholder content** — real phone, email, map, team and hours
   still needed from the client; the Contact page is template demo content.
7. **Sportive Hub email** — publish `info@sportive-hub.com` or add MX to
   `sportivehub.com`; needs that site's source repo, which is not here.
8. **Playbook conversions pending** — Heka Cosmetics, Heka Pharmacy, Base
   Training Club.
9. **Open architectural decision: producer tenancy.** `Vacancy` and `Candidate`
   have no `clientId`, so the recruitment engine is effectively single-tenant.
   Decide before onboarding a second recruiting client.
10. **`.agent/HANDOFF.md` was 3 months stale** (it described an "Aura"/"Fuel"
    reskin from a previous brand). It now points here.

---

## 13. How to work here

### Branching and commits — read this carefully

`apps/grow/CLAUDE.md` and `.agent/AGENTS.md` mandate feature branches and forbid
committing to `main`. **The owner explicitly overrode that for this project**:
work is committed directly to `main` and deployed from there. Every one of the
last ~30 commits is on `main`. Do not start branching because a file told you to —
confirm with the owner if you think it should change.

Commit style, as practised here (look at `git log` before writing one): a
conventional-commit subject, then a body that explains **why**, names the
alternative that was rejected, and states what was verified. Long bodies are
normal and wanted — they are the archaeology that made this document possible.

### Code style

Match the surrounding code. The distinguishing feature of this codebase is that
**comments explain decisions, not mechanics** — every non-obvious choice carries
the reason and often the incident that caused it. Preserve that. When you
deliberately keep something that looks wrong (like the two wide access maps),
say so in a comment with a date, so the next agent doesn't "fix" it.

### Verification expected before you say something works

1. `npx tsc --noEmit -p tsconfig.json` (from `apps/grow`)
2. `npx vitest run` (from `apps/grow`) — 103 tests
3. `npm run build` from the repo root
4. `npx eslint <files you touched>` — not the whole repo (§5)
5. For UI: a browser, desktop + 375 px, both themes
6. After deploy: `/api/health/db`, `/api/health`, and the 200/307 sweep (§7.2)

### A pattern you may not need any more

Because local login was believed impossible, UI review used a throwaway
`src/app/preview-*` route **generated from the real component by a script** that
swapped only its data source for fixtures, then deleted before committing. Now
that §5 works, prefer the real app with a real login. Keep the trick in mind for
reviewing a state that is hard to reach with real data.

---

## 14. What the new account must set up

### 14.1 Credentials and files that are NOT in git

| What | Where it lives now | Notes |
| --- | --- | --- |
| Production DB URL, `AUTH_SECRET`, `ADMIN_PASSWORD`, `STAFF_PASSWORD` | `/home/u454713534/domains/growcdx.com/.grow.env` on the host | The only runtime config path. Never blind-overwrite: it may also hold `ANTHROPIC_API_KEY` / `TWILIO_*` that are not recoverable from the repo. |
| Local dev DB URL + passwords | `apps/grow/.env` and `apps/grow/.env.local` (gitignored) | Copy these to the new machine, or recreate from `.env.example` (which lists every key). |
| `CRON_SECRET` | the cron job's command in hPanel | Two copies by design; rotating means changing both (§3.1). |
| Engine secrets (Supabase/Upstash/Twilio) | repo-root `.env` (gitignored) | Historical; the engine now runs on the same MariaDB. |

### 14.2 MCP servers

- **Hostinger (the GROW account)** — needed for deploys, cron, restarts, env,
  runtime logs, DNS. **Two Hostinger accounts are connected simultaneously and
  both must stay connected**; the owner works in both. `growcdx.com` belongs to
  the GROW one.
  - Account-scoped tools **require `username: "u454713534"`** or they fail with
    the empty-account-id route error. That applies to env vars, cron, restart and
    runtime logs. `hosting_deployJsApplication`, `hosting_listJsDeployments` and
    the DNS tools work with `domain` alone.
  - **Broken for this account:** file endpoints beyond `public_html`
    (`hosting_listWebsiteFilesAndDirectoriesV1` lists the document root; `..`
    is rejected). For anything else on the box, §7.5.
  - **Keep the token out of `~/.claude.json`:** `scripts/mcp/setup-hostinger.sh
    grow` stores it in the macOS Keychain (hidden prompt, or `--import
    hostinger-grow` to move the one already in `~/.claude.json`) and registers
    `hostinger-grow-{hosting,dns,domains,reach,vps,ecommerce}` through
    `scripts/mcp/hostinger-mcp.sh`, which reads the token back at launch. Run it
    once per account label (`grow`, and e.g. `cdx hosting dns` for the other).
    Tokens are account-wide and unscoped — treat one like the hPanel password.
- **GitHub** — two accounts exist: `OudoCDX` (company) and `Oudoo` (personal,
  which **owns `Oudoo/Grow`**). Pushing with the wrong active account gives a 403.
- Zoho / Apollo / Figma / Gamma servers are connected but unrelated to this repo.
  `plugin:apollo:apollo` currently needs authorising before its tools work.

### 14.3 Seed the new account's memory

If the new account keeps project memory, these are the facts worth writing on day
one (all are explained above): archive deploys only; `.grow.env` is the sole
runtime config and the hPanel panel is build-only; `prisma db push` is broken so
hub DDL lives in `migrate-hub.mjs`; MariaDB returns `json()` as strings; no
runtime reconnect layer in `lib/db.ts`; local dev works via `next dev` +
`grow_local`; account-scoped Hostinger tools need `username`; commits go straight
to `main` by owner's instruction.

---

## 15. Quick reference

```bash
# local dev with a real login
npm run dev --prefix apps/grow                      # http://localhost:3000

# checks
cd apps/grow && npx tsc --noEmit -p tsconfig.json && npx vitest run
npm run build                                       # from the repo root

# local schema catch-up (hub, then engine)
cd apps/grow && DATABASE_URL="<grow_local url>" node scripts/migrate-hub.mjs
cd apps/grow && DATABASE_URL="<grow_local url>" node scripts/migrate-engine.mjs

# new engine migration: edit packages/engine-db/src/schema, then
cd packages/engine-db && npx drizzle-kit generate --dialect mysql --schema ./src/schema/index.ts --out ./drizzle --name <tag>
rm -rf apps/grow/drizzle-engine && cp -r packages/engine-db/drizzle apps/grow/drizzle-engine

# production health
curl -fsS https://growcdx.com/api/health
curl -fsS https://growcdx.com/api/health/db
```

| Thing | Value |
| --- | --- |
| Live URL | https://growcdx.com |
| Repo | `github.com/Oudoo/Grow`, branch `main` |
| Hostinger account | `u454713534` |
| Production DB | `u454713534_grow_os` (MariaDB 11.8), user `u454713534_grow_admin`, over `127.0.0.1` |
| Local DB | `grow_local` on `127.0.0.1:3306` |
| Runtime config | `/home/u454713534/domains/growcdx.com/.grow.env` |
| Deployments so far | 66 |
| Tests | 10 files, 112 tests, run from `apps/grow` |
| Hub models / engine tables | 26 Prisma / 63 Drizzle (3 engine migrations recorded) |
| System sender | `internal@growcdx.com` |
| Dispatcher cron | uid `gInR3iY0TW`, `*/15 * * * *` |
| Working week | Sunday start, Friday–Saturday weekend |
