---
title: Digital Footprint Audit — sportive-hub.com
type: report
tags: [audit, website, seo, lead-capture]
source: GROW — direct inspection of the live site, bundle and DNS
---

# Digital Footprint Audit — sportive-hub.com

**Observed:** 2026-08-29 · **Method:** fetch of the live site, inspection of the
compiled JS bundle (the site is client-rendered, so content is not in the HTML),
and DNS lookups · **Platform:** Vite/React single-page app on Hostinger,
deployed 2026-08-26.

> Verified directly, not client-reported.

## Positioning and offering (verified from the site)

**Sportive Hub — Elite Performance Center.** "RECOVER FASTER."
*"The premier hub for sports recovery, physiotherapy, and modern medical care
designed for peak performance."*

Seven services are published:

| Service | Positioning on site |
| :-- | :-- |
| Physical therapy | Diagnosis and treatment of musculo-skeletal injuries |
| IV therapy | Hydration and nutrient delivery to accelerate recovery, boost immunity |
| EMS training | Electrical muscle stimulation for efficient workouts and rehab |
| Nutrition | Personalised dietary plans |
| Mental health | Support for well-being and stress management |
| Orthopedics | Bone and joint conditions |
| Neurology | Nerve-related assessment and recovery |

**Two locations:**

- **Beverly Sheikh Zayed** — Beverly Hills Compound, Sheikh Zayed City, Egypt
- **Almaza Bay North Coast** — Almaza Bay Resort, Mersa Matruh

## Findings

### 1. The published contact email cannot receive mail — CRITICAL

The site publishes **`info@sportivehub.com`** — note **no hyphen**, while the
website itself is `sportive-hub.com` **with** a hyphen.

`sportivehub.com` has **no MX records at all**, so it cannot accept email.
`sportive-hub.com` does (Hostinger's `mx1`/`mx2`).

**Every email sent to the address on the website bounces.** Unlike 180 Dental
this is not total lead loss — the phone and WhatsApp both work — but every
inquiry that prefers email is lost silently, and the sender gets a bounce that
reads as "this business is not real".

Fix: either publish `info@sportive-hub.com` (the domain that has mail), or add
MX records to `sportivehub.com`. Decide deliberately, because of #2.

### 2. Two separate web properties exist — NEEDS A DECISION

`sportivehub.com` resolves to a **different server** (13.223.25.84, AWS-hosted)
and returns 200 — it is a live site, not a parked domain. `sportive-hub.com` is
the Hostinger-hosted React app audited here.

Two live properties for one brand splits SEO authority, confuses direct traffic,
and is how the email mismatch in #1 happened. Someone needs to decide which is
canonical and redirect the other.

### 3. Content is invisible to anything that does not run JavaScript — HIGH

The served HTML is an empty shell (`<div id="root"></div>`); all content renders
client-side. Meta and Open Graph tags are set well — proper OG image with
dimensions, Twitter card, theme colour, full favicon set — so **link previews in
WhatsApp and social will look correct**.

But the seven services, both locations and all body copy exist only after JS
executes. Crawlers and preview scrapers that do not execute JS see a page with
no content. For a business whose customers search *"physiotherapy Sheikh Zayed"*
or *"sports recovery North Coast"*, that is a meaningful organic search
handicap.

Fix options, cheapest first: prerender the routes at build time (Vite supports
static generation), or move to SSR. Given the site is small and mostly static
content, prerendering is likely a day of work.

### 4. Facebook link has no vanity URL — LOW

The Facebook link points at a bare `facebook.com/profile.php` rather than a
named page. Suggests a personal profile or an unfinished business page. Instagram
(`@sportivehub_`) and WhatsApp (`wa.me/201035555380`) are both correctly wired.

## What is done well

Worth stating plainly, because it is the opposite of the 180 Dental picture:

- **Phone `+20 103 5555 380` is real**, and WhatsApp click-to-chat is wired.
- **Instagram is linked** — the site connects to the social channel.
- **Maps are generated from real coordinates** per location, not a demo embed.
- **Social preview metadata is complete** — someone thought about how a shared
  link looks.
- No stock/template placeholder content anywhere.

## Cross-client observation

**Sportive Hub's Sheikh Zayed location is in the Beverly Hills Compound — the
same compound as 180 Dental.**

Two GROW clients, both premium health and aesthetics, serving the same affluent
Sheikh Zayed catchment from the same address. That is worth deliberate thought:
shared local geo-targeting, and a plausible cross-referral relationship
(post-procedure recovery, aesthetics-and-performance bundles). Neither client has
been asked about this yet — see the intake document.

## Recommended order of work

| # | Action | Effort | Why |
| :-- | :-- | :-- | :-- |
| 1 | Fix the email address or add MX to the other domain | Minutes | Inbound email currently bounces |
| 2 | Decide the canonical domain, redirect the other | Hours | Split authority and the cause of #1 |
| 3 | Prerender the SPA routes | ~1 day | Organic search currently sees an empty page |
| 4 | Proper Facebook business page, or drop the link | Minutes | A bare profile.php reads as unfinished |
