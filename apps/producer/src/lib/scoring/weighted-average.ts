/**
 * Weighted Average Calculator — Deterministic composite score computation.
 *
 * compositeScore = Σ (score_i × weight_i)
 * where Σ weights should = 1.0 (100%)
 *
 * If weights don't sum to 1.0, we normalize them.
 */

interface ScoreEntry {
  competencyId: string;
  value: number; // 1–5
}

interface CompetencyWeight {
  id: string;
  weight: number; // 0.0–1.0
}

/**
 * Calculate the weighted average score across all competencies.
 * Returns a value between 1.0 and 5.0.
 */
export function calculateWeightedAverage(
  scores: ScoreEntry[],
  competencies: CompetencyWeight[]
): number {
  if (scores.length === 0 || competencies.length === 0) return 0;

  // Build a lookup map for O(1) access
  const weightMap = new Map(competencies.map((c) => [c.id, c.weight]));

  // Calculate total weight for normalization
  const totalWeight = scores.reduce((sum, score) => {
    return sum + (weightMap.get(score.competencyId) ?? 0);
  }, 0);

  if (totalWeight === 0) return 0;

  // Calculate weighted sum
  const weightedSum = scores.reduce((sum, score) => {
    const weight = weightMap.get(score.competencyId) ?? 0;
    return sum + score.value * weight;
  }, 0);

  // Normalize to handle cases where weights don't sum to 1.0
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Calculate the average scores across multiple scorecards.
 * For each competency, averages the scores from all managers.
 * Returns an array of averaged score entries.
 */
export function averageScoresAcrossManagers(
  scorecards: { scores: ScoreEntry[] }[]
): ScoreEntry[] {
  if (scorecards.length === 0) return [];

  // Group scores by competencyId
  const scoresByCompetency = new Map<string, number[]>();

  for (const card of scorecards) {
    for (const score of card.scores) {
      const existing = scoresByCompetency.get(score.competencyId) ?? [];
      existing.push(score.value);
      scoresByCompetency.set(score.competencyId, existing);
    }
  }

  // Calculate average for each competency
  return Array.from(scoresByCompetency.entries()).map(([competencyId, values]) => ({
    competencyId,
    value:
      Math.round(
        (values.reduce((a, b) => a + b, 0) / values.length) * 100
      ) / 100,
  }));
}
