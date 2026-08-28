---
title: Digital Footprint Audit — 180.clinic
type: report
tags: [audit, website, lead-capture, trust, urgent]
source: GROW — direct inspection of the live site
---

# Digital Footprint Audit — 180.clinic

**Observed:** 2026-08-29 · **Method:** direct fetch and inspection of the
rendered homepage HTML at `https://180.clinic` · **Platform:** WordPress
(Elementor + a purchased dental theme), hosted on the same Hostinger account as
growcdx.com.

> Everything below was verified directly, not reported by the client. A live
> site changes — re-run this audit before acting on it if significant time has
> passed.

## Summary

The **copy layer was customised** — positioning ("180 Degree Confidence
Redefined"), location (Sheikh Zayed, Beverly Hills Compound) and the service
list are all genuinely 180's. The **trust and contact layer was never
configured** and still ships the theme vendor's demo content.

This matters directly for the problem the client reports. The framework
attributes high-ticket drop-off to missing price anchoring — that is real, but
it is downstream of something simpler: **a prospective patient who lands on
180.clinic cannot contact the clinic, cannot verify who works there, and is
shown a map of London.** No amount of DM automation recovers a lead that
bounces at this stage.

## Findings

### 1. The phone number is a placeholder — CRITICAL

The homepage displays *"Need Dental Services? Call: **+1 123 456 789**"*. This
is the theme's dummy number in US format, for a clinic in Egypt. It is also
**plain text, not a `tel:` link** — the page contains no `tel:` href anywhere,
so a mobile visitor cannot tap to call. Most dental searches are mobile.

**Every phone lead from the website is currently lost.**

### 2. The contact email belongs to the theme vendor — CRITICAL

The page shows **`contact@dentiacare.co`**. `dentiacare.co` is the theme
vendor's demo domain, not 180's. There is no `mailto:` link either. Any visitor
who copies that address is emailing a third party.

### 3. The map shows the London Eye — CRITICAL

The embedded Google Map is the theme default:
`maps.google.com/maps?q=London Eye, London, United Kingdom`. The clinic is in
the Beverly Hills Compound, Sheikh Zayed. A patient trying to find the clinic
is directed to a landmark in another country — while the copy elsewhere on the
page correctly names the Sheikh Zayed location.

### 4. The dental team is the theme's stock team — HIGH

The "Meet Our Dental Team" section lists **Dr. Sarah Bennett (Lead Dentist),
Dr. Maya Lin, Dr. Michael Reyes, Dr. James Carter**. These are the theme's
placeholder names.

**Dr. Salsabil does not appear on her own clinic's website.** For a practice
whose entire premium positioning rests on clinical expertise — and whose lead
doctor is personally answering every DM — this is the single largest wasted
asset on the site.

### 5. Testimonials are stock — HIGH

Six testimonials attributed to "Michael S.", "Robert L.", "Jake M.", "Alex P.",
"Carlos R.", "Edward B.", all labelled "Customer". Generic Western names with no
photos or procedures on an Egyptian clinic's site read as fabricated to exactly
the discerning, high-ticket audience 180 is targeting. Fake-looking social proof
is worse than none: it undermines the real credentials around it.

### 6. The statistics are unconfigured and self-contradictory — MEDIUM

The counter block reads **5000+ Happy Patients · 2000+ Teeth Whitened · 500+
Dental Implants · 1+ Years of Exeperience**.

The last one is both an unset default and a spelling error ("Exeperience"), and
it contradicts the other three — 5,000 patients in one year is not credible. A
visitor who notices this discounts every other number on the page.

### 7. No social links anywhere — HIGH

The homepage contains **no Instagram, Facebook, TikTok or WhatsApp links at
all**. Instagram DMs are, per the strategic framework, the clinic's primary
inbound channel and the reason Dr. Salsabil is trapped in admin work. The
website and the actual lead channel are completely disconnected: the site sends
nobody to Instagram, and Instagram traffic that arrives finds no working contact
route.

### 8. Booking has no visible integration — MEDIUM

The "Book Appointment" CTA leads to a Contact Form 7 form posting back to the
site itself. No booking system, calendar, or CRM integration is visible in the
markup. Submissions presumably land in WordPress and/or an email address —
which needs confirming, given finding #2.

## Recommended order of work

The first three are not marketing improvements; they are **a broken front door**,
and they are cheap to fix.

| # | Action | Effort | Why first |
| :-- | :-- | :-- | :-- |
| 1 | Real phone number, as a `tel:` link | Minutes | Every phone lead is currently lost |
| 2 | Real email on 180's domain, as `mailto:` | Minutes | Inquiries may reach a third party |
| 3 | Correct the map to the Sheikh Zayed clinic | Minutes | Patients cannot find the premises |
| 4 | Replace the team section with the real clinicians, Dr. Salsabil first | Hours | Converts the strongest asset into the strongest trust signal |
| 5 | Replace or remove stock testimonials | Hours | Fake-looking proof actively damages credibility |
| 6 | Fix or remove the counter block | Minutes | Self-contradictory numbers discredit the page |
| 7 | Add Instagram/WhatsApp links | Minutes | Connects the site to the channel that actually generates leads |
| 8 | Confirm where booking submissions land, then route to CRM | Hours | Prerequisite for Pipeline A |

## Relationship to the strategic framework

*Master Intelligence & Strategic Framework* proposes Pipeline A (DM automation
with price anchoring) and Pipeline B (B2B chair-fill portal). Both remain the
right architecture. But items 1–3 above **block lead capture entirely** and cost
almost nothing to fix, so they should land before any automation build. Item 8
is a hard prerequisite for Pipeline A — DM routing into a CRM needs a known
destination for web-form leads too, or the two channels will diverge.
