#!/usr/bin/env node
/**
 * Import per-client knowledge bases from content/clients/<slug>/*.md into the
 * engine's `knowledge_documents` table, creating the client records they belong
 * to if they do not exist yet.
 *
 * The markdown in content/clients is the SOURCE OF TRUTH. This seeder pushes it
 * into the database so it appears in the engine console; edit the markdown and
 * re-run to update. Notes authored inside the app live only in the database and
 * are never touched here — matching is by (client, title), so a hand-written
 * note with a different title is safe.
 *
 * Uses mysql2 directly rather than Drizzle for the same reason as
 * migrate-hub.mjs: it must run from a plain boot script without depending on a
 * built package or a working Prisma/Drizzle CLI.
 *
 * Idempotent. Re-running with unchanged files performs no writes.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** The single GROW tenant, matching lib/engine/session.ts. */
const TENANT_SLUG = "grow";
const TENANT_NAME = "GROW";

/**
 * Client records, keyed by the directory name in content/clients.
 * Facts here are verified from each client's live site — see their audit docs.
 */
const CLIENTS = {
  "180-dental": {
    name: "180 Dental & Cosmetics",
    industry: "Healthcare — Dental & Cosmetics",
    websiteUrl: "https://180.clinic",
    status: "active",
  },
  "sportive-hub": {
    name: "Sportive Hub",
    industry: "Healthcare — Sports Recovery & Performance",
    websiteUrl: "https://sportive-hub.com",
    status: "active",
  },
  "nour-clinic-elite": {
    name: "Nour Clinic Elite",
    // Surgical practice per the induction playbook's capture fields; the exact
    // specialty is not stated there, so it is not asserted here either.
    industry: "Healthcare — Surgical Practice",
    websiteUrl: null,
    // "onboarding", not "active": the executive induction has not been run and
    // no client data has been captured yet.
    status: "onboarding",
  },
};

/** Valid values of knowledgeDocTypeEnum (packages/engine-db/src/schema/aom.ts). */
const DOC_TYPES = new Set([
  "report", "email", "note", "qbr", "expectation_baseline",
  "sow", "digest", "research", "other",
]);

function contentRoot() {
  // cwd is apps/grow when run from the boot sequence.
  return path.join(process.cwd(), "content", "clients");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[client-kb] DATABASE_URL not set — skipping.");
    return;
  }

  const root = contentRoot();
  if (!fs.existsSync(root)) {
    console.log(`[client-kb] no content directory at ${root} — skipping.`);
    return;
  }

  let mysql, matter;
  try {
    mysql = require("mysql2/promise");
    matter = require("gray-matter");
  } catch (e) {
    console.log("[client-kb] mysql2/gray-matter not resolvable — skipping:", e.message);
    return;
  }

  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
  try {
    // The engine's Drizzle tables may not exist on a fresh database.
    const [[{ n }]] = await conn.query(
      "SELECT COUNT(*) n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() " +
        "AND TABLE_NAME IN ('tenants','clients','knowledge_documents')",
    );
    if (Number(n) < 3) {
      console.log("[client-kb] engine tables not present yet — skipping.");
      return;
    }

    // ── Tenant ──────────────────────────────────────────────────────────
    // lib/engine/session.ts creates this lazily on first console visit; create
    // it here too so seeding does not depend on someone having opened the app.
    let [rows] = await conn.execute("SELECT id FROM tenants WHERE slug = ?", [TENANT_SLUG]);
    let tenantId = rows[0]?.id;
    if (!tenantId) {
      tenantId = crypto.randomUUID();
      await conn.execute(
        "INSERT INTO tenants (id, name, slug, status, settings, branding, timezone, currency) " +
          "VALUES (?, ?, ?, 'active', '{}', '{}', 'Africa/Cairo', 'EGP')",
        [tenantId, TENANT_NAME, TENANT_SLUG],
      );
      console.log(`[client-kb] created tenant ${TENANT_NAME}`);
    }

    let createdClients = 0, createdDocs = 0, updatedDocs = 0, unchanged = 0;

    for (const slug of fs.readdirSync(root)) {
      const dir = path.join(root, slug);
      if (!fs.statSync(dir).isDirectory()) continue;

      const meta = CLIENTS[slug];
      if (!meta) {
        console.log(`[client-kb] ${slug}: no entry in the CLIENTS map — skipped.`);
        continue;
      }

      // ── Client ────────────────────────────────────────────────────────
      let [c] = await conn.execute(
        "SELECT id FROM clients WHERE tenant_id = ? AND slug = ?",
        [tenantId, slug],
      );
      let clientId = c[0]?.id;
      if (!clientId) {
        clientId = crypto.randomUUID();
        await conn.execute(
          "INSERT INTO clients (id, tenant_id, name, slug, industry, website_url, status, " +
            "milestone_targets, settings) VALUES (?, ?, ?, ?, ?, ?, ?, '[]', '{}')",
          [clientId, tenantId, meta.name, slug, meta.industry, meta.websiteUrl, meta.status],
        );
        createdClients++;
        console.log(`[client-kb] created client ${meta.name}`);
      }

      // ── Documents ─────────────────────────────────────────────────────
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
      for (const file of files) {
        const parsed = matter(fs.readFileSync(path.join(dir, file), "utf8"));
        const title = String(parsed.data.title ?? file.replace(/\.md$/, "")).trim();
        const body = parsed.content.trim();
        if (!title || !body) {
          console.log(`[client-kb] ${slug}/${file}: missing title or body — skipped.`);
          continue;
        }
        const rawType = String(parsed.data.type ?? "note");
        const type = DOC_TYPES.has(rawType) ? rawType : "other";
        const tags = JSON.stringify(
          Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
        );

        // Match on (client, title) so re-running updates in place rather than
        // stacking duplicates every deploy.
        const [existing] = await conn.execute(
          "SELECT id, content_markdown FROM knowledge_documents WHERE client_id = ? AND title = ?",
          [clientId, title],
        );

        if (!existing[0]) {
          await conn.execute(
            "INSERT INTO knowledge_documents (id, tenant_id, client_id, type, title, " +
              "content_markdown, tags) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [crypto.randomUUID(), tenantId, clientId, type, title, body, tags],
          );
          createdDocs++;
        } else if (existing[0].content_markdown !== body) {
          await conn.execute(
            "UPDATE knowledge_documents SET content_markdown = ?, type = ?, tags = ?, " +
              "updated_at = NOW() WHERE id = ?",
            [body, type, tags, existing[0].id],
          );
          updatedDocs++;
        } else {
          unchanged++;
        }
      }
    }

    const changed = createdClients + createdDocs + updatedDocs;
    console.log(
      changed === 0
        ? `[client-kb] up to date (${unchanged} document(s) unchanged).`
        : `[client-kb] ${createdClients} client(s), ${createdDocs} new and ` +
          `${updatedDocs} updated document(s); ${unchanged} unchanged.`,
    );
  } finally {
    await conn.end();
  }
}

main().catch((e) => console.log("[client-kb] skipped:", e.message));
