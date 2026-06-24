import { NextRequest, NextResponse } from "next/server";
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
  try {
    const { id } = await params;
    const body = await request.json();

    const vacancy = await prisma.vacancy.update({
      where: { id },
      data: body,
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
