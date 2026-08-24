import { NextRequest, NextResponse } from "next/server";
import { guardProducer } from "@/lib/producer/route-auth";
import { prisma } from "@/lib/db";
import { parseBlueprint } from "@/lib/producer/parsers/blueprint-parser";
import { readUploadedText, UploadError } from "@/lib/producer/security/upload";

export async function GET() {
  try {
    const vacancies = await prisma.vacancy.findMany({
      include: {
        competencies: { orderBy: { order: "asc" } },
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vacancies);
  } catch (error) {
    console.error("Failed to fetch vacancies:", error);
    return NextResponse.json(
      { error: "Failed to fetch vacancies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = await guardProducer("manage");
  if (denied) return denied;

  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }
    const file = formData.get("blueprint") as File | null;

    let markdownContent: string;
    try {
      markdownContent = await readUploadedText(file, { allowedExtensions: [".md", ".markdown"] });
    } catch (e) {
      if (e instanceof UploadError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      throw e;
    }

    // Deterministic parsing — no AI involved
    const parsed = await parseBlueprint(markdownContent);

    // Validate competency weights sum to ~1.0
    const totalWeight = parsed.competencies.reduce(
      (sum, c) => sum + c.weight,
      0
    );
    if (Math.abs(totalWeight - 1.0) > 0.05) {
      return NextResponse.json(
        {
          error: `Competency weights sum to ${(totalWeight * 100).toFixed(0)}%, expected ~100%`,
        },
        { status: 400 }
      );
    }

    // Create vacancy with competencies in a single transaction
    const vacancy = await prisma.vacancy.create({
      data: {
        title: parsed.title,
        department: parsed.department,
        location: parsed.location,
        salaryBudgetMin: parsed.salaryBudgetMin,
        salaryBudgetMax: parsed.salaryBudgetMax,
        acceptanceScore: parsed.acceptanceScore,
        jobPostingHtml: parsed.jobPostingHtml,
        rawBlueprint: markdownContent,
        competencies: {
          create: parsed.competencies.map((comp) => ({
            name: comp.name,
            category: comp.category,
            weight: comp.weight,
            order: comp.order,
          })),
        },
      },
      include: {
        competencies: { orderBy: { order: "asc" } },
        _count: { select: { candidates: true } },
      },
    });

    return NextResponse.json(vacancy, { status: 201 });
  } catch (error) {
    console.error("Failed to create vacancy:", error);
    return NextResponse.json(
      { error: "Failed to parse blueprint or create vacancy" },
      { status: 500 }
    );
  }
}
