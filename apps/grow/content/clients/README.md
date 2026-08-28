# Client knowledge bases

One directory per client. Every file here is imported into the engine's
`knowledge_documents` table by `scripts/seed-client-knowledge.mjs`, and shows up
under **Engine → Clients → <client> → Knowledge**.

Why the source of truth is markdown in git rather than rows in a database:

- Client intelligence is the agency's actual product. It should be reviewable in
  a pull request, diffable over time, and recoverable if a database is lost.
- The seeder is idempotent, so re-running it after an edit updates the stored
  copy. Edit the markdown, re-run, done.
- Notes written *in the app* (the "Add note to memory" form) live only in the
  database — that is fine for day-to-day observations. This directory is for the
  durable, structured dossier.

## File format

```markdown
---
title: Master Intelligence & Strategic Framework
type: research          # report | email | note | qbr | sow | digest | research | other
tags: [strategy, onboarding]
source: client-interview # where the content came from — be specific
---

Markdown body.
```

`type` must be one of the values in `knowledgeDocTypeEnum`
(`packages/engine-db/src/schema/aom.ts`); anything else is stored as `other`.

## Directory name = client slug

The directory name is the client's slug, which is how the seeder finds or
creates the client record. `180-dental` → the client whose slug is `180-dental`.
Client display names and industries are declared in the seeder's CLIENTS map.

## Evidence discipline

Separate what a client *told us* from what we *verified ourselves*, and say
which is which in the document. A strategy built on an unchecked assumption is
worse than no strategy — it is a confident one that happens to be wrong. Audit
documents should state the method and the date observed, because a live website
changes underneath you.
