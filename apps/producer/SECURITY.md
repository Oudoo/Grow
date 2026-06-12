# Growees Producer — Security Review & VAPT

**Date:** 2026-06-12 · **Scope:** API routes, file uploads, server-side fetch, data layer · **Verdict:** Production-approved.

## Methodology
Manual source review of every API route + the parser/scraper libraries, followed by live black-box exploitation against the running production build (`:3040`).

## Findings & Remediation

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | **High** | **SSRF** — `/api/portfolio` and `/api/candidates` fetched any user-supplied URL server-side, validating only URL *format*. Internal services (`127.0.0.1:6379`, DB, `169.254.169.254` cloud metadata, `::1`) were reachable. | **Fixed** |
| 2 | **Medium** | **Unbounded file upload (DoS)** — `/api/vacancies` and `/api/candidates` read `file.text()` with no size cap; a multi-GB upload exhausts memory. | **Fixed** |
| 3 | **Low** | Malformed/no-body POSTs returned 500 instead of 400 (info-leak / noisy errors). | **Fixed** |
| 4 | **Low / latent** | `jobPostingHtml` is generated from markdown without sanitization and stored. **Not currently rendered as HTML** anywhere (no `dangerouslySetInnerHTML`), so not exploitable today — flagged so any future render uses a sanitizer. | Documented |

## Controls added
- `src/lib/security/url-guard.ts` — `assertSafePublicUrl()`: enforces http/https only, rejects credentials-in-URL, blocks loopback/private/link-local/CGNAT/multicast IPv4, loopback/ULA/link-local IPv6 and IPv4-mapped forms, blocks `localhost`/`*.local`/`*.internal`/metadata hostnames, and **resolves DNS** to reject public names that map to internal IPs (DNS-rebinding mitigation). Scraper also uses `redirect: "manual"`, an HTML content-type check, and a 2 MB body cap.
- `src/lib/security/upload.ts` — `readUploadedText()`: 1 MB cap (checked against both the reported size and the actual bytes), extension allowlist (`.md`/`.markdown`), structured `UploadError` → correct HTTP status.
- Both upload routes now guard `request.formData()` parsing → `400` on malformed bodies.

## Verified safe (no action needed)
- **SQL injection:** none possible — all queries go through Prisma (parametrized); zero `$queryRaw`/`$executeRaw` in the codebase.
- **Data integrity:** competency weights validated to ~100%; vacancy existence checked before candidate creation; scoring writes run in Prisma transactions.

## Live test evidence
```
SSRF  http://127.0.0.1:6379            → 400 blocked
SSRF  http://169.254.169.254/...        → 400 blocked
SSRF  http://[::1]:5432                 → 400 blocked
SSRF  file:///etc/passwd                → 400 blocked
OK    https://example.com               → 200 (scraped)
Upload 1.5 MB .md                       → 413 rejected
Upload .txt                             → 400 rejected
Upload no body                          → 400 rejected
```

## Production hardening notes (deployment)
- Put the app behind the reverse proxy with a request-body limit (defense in depth alongside the app-level cap).
- The app has no auth layer of its own — it is an **internal** tool surfaced only inside the Grow admin (`/admin/growees-producer`). Keep `:3040` bound to localhost / private network; do not expose it publicly without adding authentication.
