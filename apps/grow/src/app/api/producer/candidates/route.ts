import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseCV } from "@/lib/producer/parsers/cv-parser";
import { scrapePortfolio } from "@/lib/producer/scraper/portfolio-scraper";
import { readUploadedText, UploadError } from "@/lib/producer/security/upload";
import { assertSafePublicUrl, UnsafeUrlError } from "@/lib/producer/security/url-guard";

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }
    const file = formData.get("cv") as File | null;
    const vacancyId = formData.get("vacancyId") as string | null;
    const portfolioUrl = formData.get("portfolioUrl") as string | null;

    if (!vacancyId) {
      return NextResponse.json(
        { error: "vacancyId is required" },
        { status: 400 }
      );
    }

    // Verify vacancy exists
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return NextResponse.json(
        { error: "Vacancy not found" },
        { status: 404 }
      );
    }

    let markdownContent: string;
    try {
      markdownContent = await readUploadedText(file, { allowedExtensions: [".md", ".markdown"] });
    } catch (e) {
      if (e instanceof UploadError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      throw e;
    }

    // Deterministic CV parsing
    const parsed = parseCV(markdownContent);

    // Scrape portfolio if a safe, public URL is provided
    let portfolioMeta = null;
    if (portfolioUrl) {
      try {
        await assertSafePublicUrl(portfolioUrl);
        portfolioMeta = await scrapePortfolio(portfolioUrl);
      } catch (e) {
        if (!(e instanceof UnsafeUrlError)) throw e;
        // Unsafe portfolio URL: skip scraping, keep candidate creation.
        portfolioMeta = null;
      }
    }

    // Create candidate record
    const candidate = await prisma.candidate.create({
      data: {
        vacancyId,
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        yearsExperience: parsed.yearsExperience,
        expectedSalary: parsed.expectedSalary,
        rawCv: markdownContent,
        portfolioUrl: portfolioUrl || null,
        portfolioTitle: portfolioMeta?.title || null,
        portfolioImage: portfolioMeta?.image || null,
        portfolioDesc: portfolioMeta?.description || null,
        status: "pending",
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error("Failed to create candidate:", error);
    return NextResponse.json(
      { error: "Failed to parse CV or create candidate" },
      { status: 500 }
    );
  }
}
