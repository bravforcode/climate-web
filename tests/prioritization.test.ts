import { describe, expect, test } from 'bun:test';
import {
  calculatePriorityScore,
  rankPriorities,
} from '../src/domain/prioritization';

describe('Prioritization Domain Engine', () => {
  describe('calculatePriorityScore', () => {
    test('calculates correct score with standard realistic values', () => {
      // (4 * 250 * 4 * 5) / 50000 = 20000 / 50000 = 0.4
      const score = calculatePriorityScore({
        urgency: 4,
        beneficiaries: 250,
        feasibility: 4,
        equity: 5,
        cost: 50000,
      });
      expect(score).toBeCloseTo(0.4, 5);
    });

    test('protects against division by zero when cost is 0', () => {
      // (5 * 100 * 5 * 5) / max(0, 1) = 12500 / 1 = 12500
      const score = calculatePriorityScore({
        urgency: 5,
        beneficiaries: 100,
        feasibility: 5,
        equity: 5,
        cost: 0,
      });
      expect(score).toBe(12500);
    });

    test('protects against negative cost by treating as 0 (denominator = 1)', () => {
      const score = calculatePriorityScore({
        urgency: 3,
        beneficiaries: 50,
        feasibility: 3,
        equity: 3,
        cost: -1000,
      });
      // (3 * 50 * 3 * 3) / 1 = 1350
      expect(score).toBe(1350);
    });

    test('clamps urgency, feasibility, equity to [1, 5] range', () => {
      // urgency: 0 -> 1, feasibility: 10 -> 5, equity: -5 -> 1
      // (1 * 100 * 5 * 1) / 100 = 500 / 100 = 5
      const score = calculatePriorityScore({
        urgency: 0,
        beneficiaries: 100,
        feasibility: 10,
        equity: -5,
        cost: 100,
      });
      expect(score).toBe(5);
    });

    test('handles negative beneficiaries by treating as 0', () => {
      const score = calculatePriorityScore({
        urgency: 5,
        beneficiaries: -50,
        feasibility: 5,
        equity: 5,
        cost: 10000,
      });
      expect(score).toBe(0);
    });

    test('gracefully handles null and undefined input objects', () => {
      expect(calculatePriorityScore(null)).toBe(0);
      expect(calculatePriorityScore(undefined)).toBe(0);
    });

    test('handles partial / missing fields safely', () => {
      const score = calculatePriorityScore({
        urgency: 3,
      } as any);
      // urgency: 3, beneficiaries: 0, feasibility: 1, equity: 1, cost: 0 -> (3 * 0 * 1 * 1) / 1 = 0
      expect(score).toBe(0);
    });
  });

  describe('rankPriorities', () => {
    test('ranks priorities in descending score order with 1-based ranks', () => {
      const items = [
        {
          id: 'p1',
          problem_statement: 'Moderate heat stress in dry market zone',
          urgency: 3,
          beneficiaries: 50,
          feasibility: 4,
          equity: 3,
          cost: 10000, // score: (3*50*4*3)/10000 = 1800/10000 = 0.18
        },
        {
          id: 'p2',
          problem_statement: 'Severe flash flooding in wet market walkway',
          urgency: 5,
          beneficiaries: 300,
          feasibility: 5,
          equity: 5,
          cost: 20000, // score: (5*300*5*5)/20000 = 37500/20000 = 1.875
        },
        {
          id: 'p3',
          problem_statement: 'High PM2.5 exposure around unloading zone',
          urgency: 4,
          beneficiaries: 120,
          feasibility: 4,
          equity: 4,
          cost: 15000, // score: (4*120*4*4)/15000 = 7680/15000 = 0.512
        },
      ];

      const ranked = rankPriorities(items);

      expect(ranked).toHaveLength(3);
      expect(ranked[0].item.id).toBe('p2');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[0].score).toBeCloseTo(1.875, 4);

      expect(ranked[1].item.id).toBe('p3');
      expect(ranked[1].rank).toBe(2);
      expect(ranked[1].score).toBeCloseTo(0.512, 4);

      expect(ranked[2].item.id).toBe('p1');
      expect(ranked[2].rank).toBe(3);
      expect(ranked[2].score).toBeCloseTo(0.18, 4);
    });

    test('handles empty array or null input for rankPriorities', () => {
      expect(rankPriorities([])).toEqual([]);
      expect(rankPriorities(null)).toEqual([]);
      expect(rankPriorities(undefined)).toEqual([]);
    });
  });
});
