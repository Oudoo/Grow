/**
 * Portfolio Scraper — Fetches Open Graph metadata from a URL using Cheerio.
 *
 * Extracts: <title>, og:image, og:description, og:title
 * Lightweight alternative to Puppeteer (~200KB vs ~300MB).
 */

import * as cheerio from "cheerio";
import type { PortfolioMeta } from "@/types/producer/candidate";
import { assertSafePublicUrl } from "@/lib/producer/security/url-guard";

// Cap the response body we read so a malicious/huge page can't exhaust memory.
const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Fetch and parse OG metadata from a given URL.
 * SSRF-guarded: the destination must be a public http(s) host.
 */
export async function scrapePortfolio(url: string): Promise<PortfolioMeta> {
  try {
    // Reject internal/loopback/metadata destinations before any request.
    const safeUrl = await assertSafePublicUrl(url);

    const response = await fetch(safeUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GroweeBot/1.0; +https://growees.com)",
        Accept: "text/html",
      },
      redirect: "manual", // don't auto-follow redirects into internal hosts
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return { title: null, image: null, description: null, url };
    }

    // Only parse HTML, and only up to the byte cap.
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return { title: null, image: null, description: null, url };
    }
    const raw = await response.text();
    const html = raw.length > MAX_HTML_BYTES ? raw.slice(0, MAX_HTML_BYTES) : raw;
    const $ = cheerio.load(html);

    // Extract OG tags with fallbacks
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      null;

    const image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      null;

    return {
      title: title?.trim() || null,
      image: image?.trim() || null,
      description: description?.trim() || null,
      url,
    };
  } catch (error) {
    console.error(`Portfolio scrape failed for ${url}:`, error);
    return { title: null, image: null, description: null, url };
  }
}
