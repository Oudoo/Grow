#!/usr/bin/env node
// Generates an ADMIN_PASSWORD_HASH value for src/lib/auth.ts.
// Usage: node scripts/hash-password.mjs "your-strong-password"
//
// Output format (matches verifyPassword in src/lib/auth.ts):
//   pbkdf2$<iterations>$<saltBase64Url>$<hashBase64Url>

import { pbkdf2Sync, randomBytes } from "node:crypto";

const ITERATIONS = 210000;
const KEYLEN = 32; // 256 bits, matches the Web Crypto deriveBits length
const DIGEST = "sha256";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your-strong-password"');
  process.exit(1);
}

const toBase64Url = (buf) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST);

const value = `pbkdf2$${ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;

console.log("\n— For a .env file (keep the quotes):\n");
console.log(`ADMIN_PASSWORD_HASH="${value}"\n`);
console.log("— For a hosting panel (Hostinger, etc.) paste the RAW value below into the");
console.log("  value field with NO quotes and no trailing spaces:\n");
console.log(`${value}\n`);
console.log("Heads-up: this value uses '$' as separators. Some panels expand '$' as a");
console.log("shell variable and silently corrupt it. If login fails, either disable");
console.log("expansion or set the plaintext ADMIN_PASSWORD env var as a fallback.\n");
