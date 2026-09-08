## LAST_AGENT
Claude Code (Opus 5)

## BRANCH
main — by explicit owner instruction, overriding the "never commit to main" rule
in .agent/AGENTS.md. Deploys go out from main by ARCHIVE (git deploys are broken).

## UPDATED
2026-09-08T14:35:00+03:00

## GOAL
Hand this system over to a new Claude account cleanly. The full handover lives at
the repo root in HANDOVER.md — read that, not this file. This file is only the
state marker the AgentOS ruleset asks for.

## CURRENT_STATE
Live at https://growcdx.com, deployment 65, database healthy over 127.0.0.1.
Shipped recently: unified IAM directory across every tool; email notifications
(queued outbox); due dates + priority; My Work; activity timelines;
admin-editable statuses/priorities; team chat with threads, reactions, uploads,
editing, DMs and a floating dock on every console page; a consolidated project
calendar and an Engine client calendar on a shared lib/calendar.ts; Seif and
Basem migrated onto growcdx.com logins by in-place rename.
Local development WORKS: `npm run dev --prefix apps/grow` uses .env.local →
grow_local; /api/health/db returns ok. (Earlier notes claiming otherwise were
wrong; the local schema was simply stale and migrate-hub.mjs fixed it.)

## BLOCKER
1. Five in-process Engine workers fail a `queue_jobs` query ~7×/second —
   3.4M runtime log lines. Cause unconfirmed; most likely the table is missing
   because migrate-engine.mjs swallows migrator errors. See HANDOVER.md §3.2.
2. SMTP for internal@growcdx.com went into the WRONG .grow.env. The app reads
   /home/u454713534/domains/growcdx.com/.grow.env (proven: /api/health →
   envSource "domain", all four mail flags false). See HANDOVER.md §3.1.

## NEXT_STEP
- Confirm and fix the queue_jobs loop (add a count to /api/health/db first).
- Move the SMTP + CRON_SECRET block into the domain-level .grow.env, restart,
  then run the dispatcher — it will send ~22 queued notification emails at once.
- Set up an off-host uptime monitor on /api/health/db (NOT /api/health).

## FILES
- HANDOVER.md (root) — the real handover, 15 sections
- DEPLOYMENT.md — operational runbook
- server.js — boot: chdir, .grow.env, DB host probe, bootstrap steps
- apps/grow/src/instrumentation.ts — starts the failing workers
- apps/grow/scripts/{migrate-hub,migrate-engine,seed-staff}.mjs
- .claude/launch.json — grow-hub-dev (local DB) vs grow-hub (production env)
