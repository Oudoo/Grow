import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateWeightedAverage,
  averageScoresAcrossManagers,
} from "@/lib/producer/scoring/weighted-average";

/**
 * POST /api/scorecards/finalize
 * Finalize scoring: apply consensus values, calculate composite, auto-set status.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, consensusScores } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidateId is required" },
        { status: 400 }
      );
    }

    // Fetch candidate + scorecards + vacancy competencies
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        vacancy: {
          include: { competencies: { orderBy: { order: "asc" } } },
        },
        scorecards: { include: { scores: true } },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const competencies = candidate.vacancy.competencies;

    // If consensus scores provided, use them for the flagged competencies
    let finalScores;
    if (
      consensusScores &&
      Array.isArray(consensusScores) &&
      consensusScores.length > 0
    ) {
      // Build a map of consensus overrides
      const consensusMap = new Map(
        consensusScores.map(
          (cs: { competencyId: string; value: number }) => [
            cs.competencyId,
            cs.value,
          ]
        )
      );

      // Average the manager scores
      const avgScores = averageScoresAcrossManagers(
        candidate.scorecards.map((sc) => ({
          scores: sc.scores.map((s) => ({
            competencyId: s.competencyId,
            value: s.value,
          })),
        }))
      );

      // Override with consensus where applicable
      finalScores = avgScores.map((s) => ({
        competencyId: s.competencyId,
        value: consensusMap.get(s.competencyId) ?? s.value,
      }));
    } else {
      // No consensus needed; use averaged scores
      finalScores = averageScoresAcrossManagers(
        candidate.scorecards.map((sc) => ({
          scores: sc.scores.map((s) => ({
            competencyId: s.competencyId,
            value: s.value,
          })),
        }))
      );
    }

    // Calculate weighted composite
    const compositeScore = calculateWeightedAverage(
      finalScores,
      competencies.map((c) => ({ id: c.id, weight: c.weight }))
    );

    // Auto-determine status
    const newStatus =
      compositeScore >= candidate.vacancy.acceptanceScore
        ? "passed"
        : "rejected";

    // Update candidate
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        compositeScore,
        status: newStatus,
      },
    });

    return NextResponse.json({
      candidate: updatedCandidate,
      compositeScore,
      status: newStatus,
      acceptanceScore: candidate.vacancy.acceptanceScore,
    });
  } catch (error) {
    console.error("Failed to finalize scoring:", error);
    return NextResponse.json(
      { error: "Failed to finalize scoring" },
      { status: 500 }
    );
  }
}
