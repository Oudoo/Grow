/**
 * Variance Check — Multi-rater score variance detection.
 *
 * Rule: If Math.abs(ManagerA.score - ManagerB.score) >= 2
 * on ANY competency, that competency requires consensus.
 */

import type { VarianceResult } from "@/types/scorecard";

interface ManagerScore {
  managerName: string;
  scores: { competencyId: string; value: number }[];
}

interface CompetencyInfo {
  id: string;
  name: string;
}

/**
 * Check for scoring variance across multiple managers.
 * Returns variance results for every competency, flagging those requiring consensus.
 *
 * @param managerScores - Array of manager submissions with their scores
 * @param competencies - Array of competency definitions
 * @param threshold - Variance threshold (default: 2)
 */
export function checkVariance(
  managerScores: ManagerScore[],
  competencies: CompetencyInfo[],
  threshold: number = 2
): VarianceResult[] {
  if (managerScores.length < 2) {
    // No variance possible with fewer than 2 managers
    return competencies.map((comp) => ({
      competencyId: comp.id,
      competencyName: comp.name,
      scores: managerScores.map((ms) => ({
        manager: ms.managerName,
        value:
          ms.scores.find((s) => s.competencyId === comp.id)?.value ?? 0,
      })),
      maxVariance: 0,
      requiresConsensus: false,
    }));
  }

  return competencies.map((comp) => {
    // Collect all scores for this competency across managers
    const scoresForComp = managerScores.map((ms) => ({
      manager: ms.managerName,
      value: ms.scores.find((s) => s.competencyId === comp.id)?.value ?? 0,
    }));

    // Calculate max pairwise variance
    let maxVariance = 0;
    for (let i = 0; i < scoresForComp.length; i++) {
      for (let j = i + 1; j < scoresForComp.length; j++) {
        const variance = Math.abs(
          scoresForComp[i].value - scoresForComp[j].value
        );
        maxVariance = Math.max(maxVariance, variance);
      }
    }

    return {
      competencyId: comp.id,
      competencyName: comp.name,
      scores: scoresForComp,
      maxVariance,
      requiresConsensus: maxVariance >= threshold,
    };
  });
}

/**
 * Check if any competency has unresolved variance.
 */
export function hasUnresolvedVariance(results: VarianceResult[]): boolean {
  return results.some((r) => r.requiresConsensus);
}
