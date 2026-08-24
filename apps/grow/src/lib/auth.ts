import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import type { AccessLevel, AccessMap, ModuleKey, UserRole } from './access';
import { can } from './access';

/**
 * Edge-safe session + crypto layer for the unified Grow IAM.
 *
 * Every human is one `AdminUser`; their identity and per-module access are
 * carried inside a signed (HMAC-SHA256) session cookie so middleware can gate
 * routes WITHOUT a database hit (Prisma can't run on the Edge runtime). The
 * DB-touching login lives in `./login` (server-only).
 */

const SESSION_COOKIE = 'grow_session_id';
// 24h: sessions are stateless HMAC cookies with no server-side revocation, so a
// shorter lifetime bounds how long a deactivated account or a revoked
// entitlement can linger. Was 7 days — too long for a console with finance/IAM.
const SESSION_TTL_SECONDS = 60 * 60 * 24;

export interface SessionPayload {
  /** AdminUser id */
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  /** Per-module access levels */
  access: AccessMap;
  /** Engine client scope for CLIENT users, else null */
  clientId: string | null;
  exp: number;
}

/**
 * HMAC signing key for session tokens. MUST be set via AUTH_SECRET in
 * production — a static value would let anyone forge a session.
 */
function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    // Fail closed: a predictable fallback secret would let anyone forge a
    // session cookie. Refuse to sign/verify rather than run insecure.
    throw new Error(
      'AUTH_SECRET must be set to a strong value (>=16 chars) in production. ' +
        'Refusing to fall back to an insecure signing key.'
    );
  }
  return secret || 'grow-dev-insecure-secret-change-me';
}

const encoder = new TextEncoder();

/**
 * SubtleCrypto that works across runtimes (Edge + Node, including older Node
 * without global webcrypto). The node:crypto fallback uses a computed
 * specifier so bundlers never pull it into the Edge bundle.
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

/** Constant-time comparison to avoid leaking secrets via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

// ---- Signed session tokens (HMAC-SHA256 via Web Crypto) ----
async function importHmacKey(secret: string): Promise<CryptoKey> {
  const subtle = await getSubtle();
  return subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

/** Build a signed session token for an authenticated user. */
export async function signSession(payload: Omit<SessionPayload, 'exp'>, ttlSeconds = SESSION_TTL_SECONDS): Promise<string> {
  const full: SessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const data = strToBase64Url(JSON.stringify(full));
  const key = await importHmacKey(getSecret());
  const sigBuf = await (await getSubtle()).sign('HMAC', key, encoder.encode(data));
  return `${data}.${bytesToBase64Url(new Uint8Array(sigBuf))}`;
}

/** Verify a token's signature + expiry and return its payload, or null. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;

  const key = await importHmacKey(getSecret());
  const expectedBuf = await (await getSubtle()).sign('HMAC', key, encoder.encode(data));
  const expected = bytesToBase64Url(new Uint8Array(expectedBuf));
  if (!timingSafeEqual(sig, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlToStr(data)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.uid || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---- Password hashing (PBKDF2 via Web Crypto — edge-safe) ----
async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const subtle = await getSubtle();
  const baseKey = await subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits(
    { name: 'PBKDF2', salt: new Uint8Array(salt), iterations, hash: 'SHA-256' },
    baseKey,
    256
  );
  return new Uint8Array(bits);
}

/** Hash a plaintext password for storage: "pbkdf2$<iters>$<saltB64url>$<hashB64url>". */
export async function hashPassword(plain: string, iterations = 210_000): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(plain, salt, iterations);
  return `pbkdf2$${iterations}$${bytesToBase64Url(salt)}$${bytesToBase64Url(hash)}`;
}

/** Verify a plaintext password against a stored pbkdf2 hash string. */
export async function verifyPasswordHash(plain: string, stored: string | null | undefined): Promise<boolean> {
  if (!plain || !stored) return false;
  const clean = stored.trim().replace(/^["']|["']$/g, '');
  const [scheme, iterStr, saltB64, hashB64] = clean.split('$');
  const iterations = parseInt(iterStr ?? '', 10);
  if (scheme !== 'pbkdf2' || !saltB64 || !hashB64 || !Number.isFinite(iterations) || iterations < 1) return false;
  const actual = await pbkdf2(plain, base64UrlToBytes(saltB64), iterations);
  return timingSafeEqual(bytesToBase64Url(actual), hashB64);
}

// ---- Cookie helpers ----
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ---- Session readers ----
/** Current session payload (server components / actions), or null. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

/** Alias that reads like an identity getter. */
export const getCurrentUser = getSession;

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

/** Edge-safe: decode the session from a middleware request. */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  return verifySession(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function isAuthenticatedMiddleware(request: NextRequest): Promise<boolean> {
  return (await getSessionFromRequest(request)) !== null;
}

// ---- Guards ----
/** Throws "Unauthorized" if there is no valid session. */
export async function assertAuthenticated(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

/** Throws unless the current user has at least `level` on `module`. */
export async function assertAccess(module: ModuleKey, level: AccessLevel = 'view'): Promise<SessionPayload> {
  const session = await assertAuthenticated();
  if (!can(session.role, session.access, module, level)) {
    throw new Error('Forbidden');
  }
  return session;
}
