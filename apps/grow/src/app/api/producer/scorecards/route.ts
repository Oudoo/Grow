import { NextRequest, NextResponse } from "next/server";
import { guardProducer } from "@/lib/producer/route-auth";
import { prisma } from "@/lib/db";
import { checkVariance } from "@/lib/producer/scoring/variance-check";
import {
  calculateWeightedAverage,
  averageScoresAcrossManagers,
} from "@/lib/producer/scoring/weighted-average";

export async function POST(request: NextRequest) {
  const denied = await guardProducer("manage");
  if (denied) return denied;

  try {
    const body = await request.json();
    const { candidateId, managerName, scores } = body;

    if (!candidateId || !managerName || !scores?.length) {
      return NextResponse.json(
        { error: "candidateId, managerName, and scores are required" },
        { status: 400 }
      );
    }

    // Create scorecard with scores in a transaction
    const scorecard = await prisma.scorecard.create({
      data: {
        candidateId,
        managerName,
        scores: {
          create: scores.map(
            (s: { competencyId: string; value: number; notes: string }) => ({
              competencyId: s.competencyId,
              value: s.value,
              notes: s.notes || null,
            })
          ),
        },
      },
      include: { scores: true },
    });

    // Update candidate status to "scoring"
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "scoring" },
    });

    return NextResponse.json(scorecard, { status: 201 });
  } catch (error) {
    console.error("Failed to submit scorecard:", error);
    return NextResponse.json(
      { error: "Failed to submit scorecard" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scorecards?candidateId=xxx
 * Returns all scorecards for a candidate plus variance analysis.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidateId query param required" },
        { status: 400 }
      );
    }

    // Fetch candidate with scorecards and vacancy competencies
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        vacancy: {
          include: {
            competencies: { orderBy: { order: "asc" } },
          },
        },
        scorecards: {
          include: { scores: true },
          orderBy: { submittedAt: "asc" },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Run variance check if 2+ scorecards exist
    const competencies = candidate.vacancy.competencies;
    const managerScores = candidate.scorecards.map((sc) => ({
      managerName: sc.managerName,
      scores: sc.scores.map((s) => ({
        competencyId: s.competencyId,
        value: s.value,
      })),
    }));

    const varianceResults = checkVariance(
      managerScores,
      competencies.map((c) => ({ id: c.id, name: c.name }))
    );

    // Calculate composite if no variance issues
    const hasVariance = varianceResults.some((v) => v.requiresConsensus);
    let compositeScore: number | null = null;

    if (candidate.scorecards.length > 0 && !hasVariance) {
      const avgScores = averageScoresAcrossManagers(
        candidate.scorecards.map((sc) => ({
          scores: sc.scores.map((s) => ({
            competencyId: s.competencyId,
            value: s.value,
          })),
        }))
      );

      compositeScore = calculateWeightedAverage(
        avgScores,
        competencies.map((c) => ({ id: c.id, weight: c.weight }))
      );
    }

    return NextResponse.json({
      scorecards: candidate.scorecards,
      varianceResults,
      hasVariance,
      compositeScore,
      acceptanceScore: candidate.vacancy.acceptanceScore,
    });
  } catch (error) {
    console.error("Failed to fetch scorecards:", error);
    return NextResponse.json(
      { error: "Failed to fetch scorecards" },
      { status: 500 }
    );
  }
}
