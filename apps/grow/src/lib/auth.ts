import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SESSION_COOKIE = 'grow_session_id';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 1 week

/**
 * HMAC signing key for session tokens.
 * MUST be set via the AUTH_SECRET environment variable in production.
 * A static/known value would let anyone forge an admin session, so we never
 * ship a usable hardcoded secret.
 */
function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;

  if (process.env.NODE_ENV === 'production') {
    console.warn(
      'SECURITY WARNING: AUTH_SECRET is missing or too short (<16 chars). ' +
        'Set a strong, random AUTH_SECRET in the environment to secure admin sessions.'
    );
  }
  // Dev-only fallback so local development works without setup.
  return secret || 'grow-dev-insecure-secret-change-me';
}

const encoder = new TextEncoder();

/**
 * Resolve a SubtleCrypto implementation that works across runtimes:
 *  - Edge runtime (Next.js middleware) and Node 20+ expose global Web Crypto.
 *  - Older Node (e.g. 18 without --experimental-global-webcrypto, as on some
 *    shared hosts) does NOT, so we lazily fall back to node:crypto's webcrypto.
 * The fallback uses a computed specifier so bundlers never statically pull
 * node:crypto into the Edge bundle — that branch never runs on Edge.
 */
let cachedSubtle: SubtleCrypto | null = null;
async function getSubtle(): Promise<SubtleCrypto> {
  if (cachedSubtle) return cachedSubtle;
  const g = globalThis as unknown as { crypto?: Crypto };
  if (g.crypto?.subtle) {
    cachedSubtle = g.crypto.subtle;
    return cachedSubtle;
  }
  const spec = 'node:' + 'crypto';
  const nodeCrypto = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ spec)) as typeof import('node:crypto');
  cachedSubtle = nodeCrypto.webcrypto.subtle as unknown as SubtleCrypto;
  return cachedSubtle;
}

// ---- base64url helpers (edge + node safe) ----
function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(input: string): Uint8Array {
  let s = input.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function strToBase64Url(s: string): string {
  return bytesToBase64Url(encoder.encode(s));
}

function base64UrlToStr(s: string): string {
  return new TextDecoder().decode(base64UrlToBytes(s));
}

/** Constant-time string comparison to avoid leaking length/secret via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

// ---- Signed session tokens (HMAC-SHA256 via Web Crypto) ----
async function importHmacKey(secret: string): Promise<CryptoKey> {
  const subtle = await getSubtle();
  return subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signSession(expSeconds: number): Promise<string> {
  const data = strToBase64Url(JSON.stringify({ exp: expSeconds }));
  const key = await importHmacKey(getSecret());
  const sigBuf = await (await getSubtle()).sign('HMAC', key, encoder.encode(data));
  return `${data}.${bytesToBase64Url(new Uint8Array(sigBuf))}`;
}

async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, sig] = parts;

  const key = await importHmacKey(getSecret());
  const expectedBuf = await (await getSubtle()).sign('HMAC', key, encoder.encode(data));
  const expected = bytesToBase64Url(new Uint8Array(expectedBuf));
  if (!timingSafeEqual(sig, expected)) return false;

  try {
    const payload = JSON.parse(base64UrlToStr(data)) as { exp?: number };
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

// ---- Password verification (PBKDF2 via Web Crypto — edge-safe, no node:crypto) ----
async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const subtle = await getSubtle();
  const baseKey = await subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await subtle.deriveBits(
    // Copy into a fresh ArrayBuffer-backed view to satisfy the strict BufferSource type.
    { name: 'PBKDF2', salt: new Uint8Array(salt), iterations, hash: 'SHA-256' },
    baseKey,
    256
  );
  return new Uint8Array(bits);
}

async function verifyPassword(password: string): Promise<boolean> {
  if (!password) return false;

  // Preferred: a PBKDF2 hash, format "pbkdf2$<iterations>$<saltB64url>$<hashB64url>".
  // Tolerate common hosting-panel entry mistakes: surrounding quotes and stray
  // whitespace/newlines that would otherwise silently break verification.
  const rawHash = process.env.ADMIN_PASSWORD_HASH;
  const hash = rawHash?.trim().replace(/^["']|["']$/g, '');
  if (hash) {
    const [scheme, iterStr, saltB64, hashB64] = hash.split('$');
    const iterations = parseInt(iterStr ?? '', 10);
    if (
      scheme === 'pbkdf2' &&
      saltB64 &&
      hashB64 &&
      Number.isFinite(iterations) &&
      iterations >= 1
    ) {
      const actual = await pbkdf2(password, base64UrlToBytes(saltB64), iterations);
      return timingSafeEqual(bytesToBase64Url(actual), hashB64);
    }
    // The hash is present but malformed — often because an env-var panel expanded
    // the "$" separators or kept surrounding quotes. Don't hard-fail; fall through
    // to the plaintext ADMIN_PASSWORD fallback so a configured backup still works.
    console.warn(
      'SECURITY WARNING: ADMIN_PASSWORD_HASH is set but malformed (check for ' +
        'shell-expanded "$" or stray quotes). Falling back to ADMIN_PASSWORD.'
    );
  }

  // Fallback: a plaintext password supplied only via the environment.
  const plain = process.env.ADMIN_PASSWORD?.trim();
  if (plain) return timingSafeEqual(password, plain);

  console.warn(
    'SECURITY WARNING: Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is usable. Admin login is disabled.'
  );
  return false;
}

export async function login(password: string): Promise<boolean> {
  if (!(await verifyPassword(password))) return false;

  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await signSession(exp);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return true;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function isAuthenticatedMiddleware(request: NextRequest): Promise<boolean> {
  return verifySession(request.cookies.get(SESSION_COOKIE)?.value);
}

/** Throws "Unauthorized" if the caller is not an authenticated admin. */
export async function assertAuthenticated(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error('Unauthorized');
  }
}
