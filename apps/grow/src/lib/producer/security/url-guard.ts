/**
 * SSRF guard — validates that a user-supplied URL points at a public host
 * before the server fetches it (portfolio scraping). Blocks loopback,
 * private, link-local, and cloud-metadata destinations, and resolves the
 * hostname so a public name that maps to an internal IP is rejected too
 * (best-effort DNS-rebinding mitigation).
 */

import { lookup } from "node:dns/promises";
import net from "node:net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
]);

function isPrivateIPv4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return (
    a === 0 ||                               // "this" network
    a === 10 ||                              // 10.0.0.0/8 private
    a === 127 ||                             // loopback
    (a === 169 && b === 254) ||              // link-local + cloud metadata (169.254.169.254)
    (a === 172 && b >= 16 && b <= 31) ||     // 172.16.0.0/12 private
    (a === 192 && b === 168) ||              // 192.168.0.0/16 private
    (a === 100 && b >= 64 && b <= 127) ||    // carrier-grade NAT
    a >= 224                                 // multicast / reserved
  );
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    v === "::1" ||                 // loopback
    v === "::" ||                  // unspecified
    v.startsWith("fc") ||          // unique local fc00::/7
    v.startsWith("fd") ||
    v.startsWith("fe80") ||        // link-local
    v.startsWith("::ffff:")        // IPv4-mapped — re-check the v4 part
  );
}

function ipIsPrivate(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) {
    if (ip.toLowerCase().startsWith("::ffff:")) {
      const v4 = ip.slice(ip.lastIndexOf(":") + 1);
      if (net.isIPv4(v4)) return isPrivateIPv4(v4);
    }
    return isPrivateIPv6(ip);
  }
  return true; // unknown format → treat as unsafe
}

export class UnsafeUrlError extends Error {}

/**
 * Throws UnsafeUrlError if the URL is not a safe, public http(s) destination.
 * Returns the normalized URL string on success.
 */
export async function assertSafePublicUrl(raw: string): Promise<string> {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new UnsafeUrlError("Invalid URL format");
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new UnsafeUrlError("Only http and https URLs are allowed");
  }
  if (u.username || u.password) {
    throw new UnsafeUrlError("Credentials in URL are not allowed");
  }

  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new UnsafeUrlError("Host is not permitted");
  }

  // Literal IPs: validate directly.
  if (net.isIP(host)) {
    if (ipIsPrivate(host)) throw new UnsafeUrlError("Destination IP is not permitted");
    return u.toString();
  }

  // Hostname: resolve every address and reject if any is internal.
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true });
  } catch {
    throw new UnsafeUrlError("Host could not be resolved");
  }
  if (!addrs.length || addrs.some((a) => ipIsPrivate(a.address))) {
    throw new UnsafeUrlError("Destination resolves to a non-public address");
  }

  return u.toString();
}
