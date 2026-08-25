import type { PriorityScoreInput, CommunityPriorityItem } from './types';

/**
 * Clamps a score value between min (default 1) and max (default 5).
 * Gracefully handles null, undefined, and NaN by falling back to min.
 */
function clampScore(value: number | undefined | null, min = 1, max = 5): number {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return min;
  }
  const num = Number(value);
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

/**
 * Normalizes non-negative numeric inputs (e.g., beneficiaries, cost).
 * Gracefully handles null, undefined, negative numbers, and NaN by falling back to fallback.
 */
function normalizeNonNegative(value: number | undefined | null, fallback = 0): number {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return fallback;
  }
  const num = Number(value);
  return num < 0 ? fallback : num;
}

/**
 * Calculates priority score according to formula:
 * P_i = (urgency * beneficiaries * feasibility * equity) / max(cost, 1)
 *
 * Enforces:
 * - Urgency, feasibility, equity clamped between 1 and 5
 * - Beneficiaries non-negative (>= 0)
 * - Cost non-negative, protected against 0 (denominator >= 1)
 * - Protection against null/undefined/malformed input objects
 */
export function calculatePriorityScore(input: PriorityScoreInput | null | undefined): number {
  if (!input || typeof input !== 'object') {
    return 0;
  }

  const urgency = clampScore(input.urgency, 1, 5);
  const feasibility = clampScore(input.feasibility, 1, 5);
  const equity = clampScore(input.equity, 1, 5);
  const beneficiaries = normalizeNonNegative(input.beneficiaries, 0);
  const rawCost = normalizeNonNegative(input.cost, 0);
  const safeCost = Math.max(rawCost, 1);

  const numerator = urgency * beneficiaries * feasibility * equity;
  const score = numerator / safeCost;

  return Number.isFinite(score) ? score : 0;
}

export interface RankedPriority<T extends PriorityScoreInput = PriorityScoreInput> {
  item: T;
  score: number;
  rank: number;
}

/**
 * Ranks an array of priority items by their calculated priority score in descending order.
 * Assigns 1-indexed ranks (1, 2, 3, ...).
 */
export function rankPriorities<T extends PriorityScoreInput>(
  items: T[] | null | undefined
): RankedPriority<T>[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  const scoredItems = items.map((item) => ({
    item,
    score: calculatePriorityScore(item),
  }));

  // Sort descending by score. In case of tie, preserve stable order.
  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.map((scored, index) => ({
    item: scored.item,
    score: scored.score,
    rank: index + 1,
  }));
}
