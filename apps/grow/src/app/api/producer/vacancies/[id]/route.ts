import { NextRequest, NextResponse } from "next/server";
import { guardProducer } from "@/lib/producer/route-auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
      include: {
        competencies: { orderBy: { order: "asc" } },
        candidates: {
          include: {
            scorecards: { include: { scores: true } },
            offer: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vacancy) {
      return NextResponse.json(
        { error: "Vacancy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(vacancy);
  } catch (error) {
    console.error("Failed to fetch vacancy:", error);
    return NextResponse.json(
      { error: "Failed to fetch vacancy" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guardProducer("manage");
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await request.json();

    // Whitelist updatable columns — never spread the raw body into Prisma
    // (mass-assignment / nested-write injection).
    const data: Record<string, unknown> = {};
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.department === "string" || body.department === null) data.department = body.department;
    if (typeof body.location === "string" || body.location === null) data.location = body.location;
    if (typeof body.status === "string") data.status = body.status;
    if (Number.isFinite(body.salaryBudgetMin) || body.salaryBudgetMin === null) data.salaryBudgetMin = body.salaryBudgetMin;
    if (Number.isFinite(body.salaryBudgetMax) || body.salaryBudgetMax === null) data.salaryBudgetMax = body.salaryBudgetMax;
    if (Number.isFinite(body.acceptanceScore)) data.acceptanceScore = body.acceptanceScore;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
    }

    const vacancy = await prisma.vacancy.update({
      where: { id },
      data,
      include: {
        competencies: { orderBy: { order: "asc" } },
        _count: { select: { candidates: true } },
      },
    });

    return NextResponse.json(vacancy);
  } catch (error) {
    console.error("Failed to update vacancy:", error);
    return NextResponse.json(
      { error: "Failed to update vacancy" },
      { status: 500 }
    );
  }
}
