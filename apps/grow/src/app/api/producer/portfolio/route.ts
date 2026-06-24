import { NextRequest, NextResponse } from "next/server";
import { scrapePortfolio } from "@/lib/producer/scraper/portfolio-scraper";
import { assertSafePublicUrl, UnsafeUrlError } from "@/lib/producer/security/url-guard";

/**
 * GET /api/portfolio?url=https://example.com
 * Scrape OG tags from the provided URL. SSRF-guarded.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "url query param is required" },
        { status: 400 }
      );
    }

    // Validate format + destination safety up front; reject internal hosts.
    try {
      await assertSafePublicUrl(url);
    } catch (e) {
      if (e instanceof UnsafeUrlError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      throw e;
    }

    const meta = await scrapePortfolio(url);
    return NextResponse.json(meta);
  } catch (error) {
    console.error("Failed to scrape portfolio:", error);
    return NextResponse.json(
      { error: "Failed to scrape portfolio" },
      { status: 500 }
    );
  }
}
