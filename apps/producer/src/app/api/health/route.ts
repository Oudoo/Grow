import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [vacancies, candidates] = await Promise.all([
      prisma.vacancy.count(),
      prisma.candidate.count(),
    ]);
    return NextResponse.json({
      status: "ok",
      system: "the-growees-producer",
      mode: process.env.NODE_ENV === "production" ? "production" : "development",
      vacancies,
      candidates,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        system: "the-growees-producer",
        message: error instanceof Error ? error.message : "database unreachable",
      },
      { status: 500 }
    );
  }
}
