# Incident — growcdx.com outage, 2026-07-22 → 2026-08-01

**Impact:** the public site served a blank page, then 503, for roughly ten days.
**Resolved by:** restoring site files from the 2026-07-19 backup.

## What happened

Hostinger's malware scanner deleted **seven `index.php` files** from inside the
deployed application, including `public_html/index.php` — the PHP stub that routes
incoming requests to the Node.js process.

```
2026-07-22 05:20  public_html/index.php                                        ← broke routing
2026-07-22 09:14  public_html/.builds/last-source/scripts/page/index.php
2026-07-22 09:14  public_html/.builds/logs/019f3347-…/middleware/index.php
2026-07-22 09:14  public_html/server/edge/chunks/scripts/index.php
2026-07-22 09:14  public_html/build/chunks/assets/index.php
2026-07-25 03:10  public_html/.builds/config/diagnostics/index.php
2026-07-25 03:10  public_html/server/app/suites/page/media/index.php
```

With the routing stub gone, nothing downstream could help: builds succeeded, the
Node app restarted cleanly, and every request still failed — because requests never
reached Node at all. The runtime log stayed empty ("no logs generated yet"), which
was the tell: the app was not crashing, it was never being invoked.

## Why the files were there

Next.js emits **zero** `.php` files. Neither does Hostinger's builder write PHP into
its own build-log directories. Seven copies of the same filename across seven
unrelated directories is a directory-walking dropper — the signature of mass webshell
deployment.

The scanner removed five on Jul 22. **Two more appeared by Jul 25.** Reinfection after
cleanup means the entry vector was still open. Treat as a confirmed compromise.

## Contributing factors (ours)

1. **The build output is deployed into `public_html`** — a public, PHP-executing
   directory. The scanner has write access to the running application, and any dropped
   `.php` file there executes. This is the root architectural fault.
2. **`apps/grow/.next` was removed from git** on 2026-07-09 (to clear a 243 MB blob
   blocking a push). Not the cause of this outage, but it masked it — the site looked
   broken for a reason we spent hours chasing.
3. **The boot wrapper ran four blocking DB operations before starting Next.js**, so any
   slow or unreachable database took the whole site down — including pages that need no
   database. Fixed in `6d644f8`.
4. **No uptime monitoring.** The outage was discovered by a person, days late.

## Fixed

| Fix | Commit |
|---|---|
| Boot order inverted — server starts first, DB bootstrap runs in background, time-boxed and non-fatal | `6d644f8` |
| CLIs resolved from `node_modules/.bin`, never `npx` (which falls back to a registry fetch and hangs boot) | `6d644f8` |
| `GET /api/health` — dependency-free liveness probe | `6d644f8` |
| Pre-push guard: blocks pushing a missing or stale build | `c1114af` |
| Build re-committed minus `.next/cache` and 91 MB of source maps | `911b6ee` |

Verified against a black-holed database: server ready in 198 ms, all pages 200 while
Prisma hung.

## Still open

- [ ] **Rotate credentials** — `AUTH_SECRET`, DB password (`u454713534_grow_os`), the
      exposed Hostinger API token, and the staff password. Restoring files does not
      close the way in.
- [ ] **Patch dependencies** — 25 advisories on the deployed app (1 critical, 24 high).
      A plausible entry vector.
- [ ] **Get the build output out of `public_html`** so the scanner cannot mutate the
      running app and stray `.php` cannot execute.
- [ ] **Uptime monitor** on `https://growcdx.com/api/health`, 1-minute interval.
- [ ] **Ask Hostinger support for the quarantined copy of `public_html/index.php`** —
      that settles whether it was genuinely infected or a false positive, which decides
      whether we need a scanner exclusion or purely an infection fix.
- [ ] Confirm whether `sportive-hub.com` (added 2026-07-21, two days before the first
      infection) shares this hosting account's filesystem.

## Recovery runbook

If the site is down and builds look fine:

1. `curl -sI https://growcdx.com/` — if `x-powered-by: PHP` appears on `/_next/*`
   assets, or everything 503s, suspect the routing stub.
2. hPanel → Security → Malware Scanner → check for recent removals under `public_html`.
3. hPanel → Files → Backups → restore **Files** from before the removal. This is the
   fix; rebuilding and restarting are not.
4. Redeploy current `main` afterwards to get back to latest code.
