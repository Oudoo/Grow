# Grow — Hub (Marketing Site + Admin OS)

The center of the **Grow Eco System** (see `../README.md` and `../BRAND.md`).

- **Public site** — marketing-agency-first positioning with Business Solutions upsell. Bilingual EN/AR (`src/components/LanguageContext.tsx` holds all copy).
- **Admin OS** (`/admin`) — CRM, Analytics, Finance Hub, Help Desk, Content Management, Project Management, IAM, White-Label, plus the **Grow Systems** consoles embedding Grow Engine (:3030) and Growees Producer (:3040).

## Stack
Next.js 16 (App Router) · Tailwind 4 · Prisma 5 · MariaDB · framer-motion

## Develop / run

```bash
npm install
npx prisma db push        # sync schema to the DB in .env
npx prisma db seed        # solution catalog + launch project
node scripts/demo-seed.mjs  # demo CRM/finance/tickets/tenant data
npm run dev               # development
npm run build && npm start  # production (port 3000)
```

Admin access code: configured via `ADMIN_PASSWORD_HASH` in `.env`
(generate with `node scripts/hash-password.mjs "your-code"`).
