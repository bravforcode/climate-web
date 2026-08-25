import { describe, expect, test } from 'bun:test';
import { applyKAnonymity } from '../src/domain/anonymity';
import type { VulnerabilityCounts } from '../src/domain/types';

describe('k-Anonymity Privacy Engine', () => {
  const sampleZone: VulnerabilityCounts & { id: string; total_population: number } = {
    id: 'zone_bkk_01',
    total_population: 150,
    elderly_count: 9, // < 10 -> suppressed for public
    disability_count: 10, // == 10 -> kept
    low_income_household_count: 11, // > 10 -> kept
    outdoor_worker_count: 0, // < 10 -> suppressed for public
  };

  describe('Unprivileged Roles (e.g. community_member, funder, auditor)', () => {
    test('suppresses count=9 and count=0 to null, preserves count=10 and count=11 for community_member', () => {
      const result = applyKAnonymity(sampleZone, 'community_member', 10);

      expect(result.id).toBe('zone_bkk_01');
      expect(result.total_population).toBe(150);
      expect(result.elderly_count).toBeNull(); // 9 suppressed
      expect(result.disability_count).toBe(10); // 10 kept
      expect(result.low_income_household_count).toBe(11); // 11 kept
      expect(result.outdoor_worker_count).toBeNull(); // 0 suppressed
      expect(result.k_anonymity_suppressed).toBe(true);
    });

    test('suppresses counts for funder and auditor roles', () => {
      const funderResult = applyKAnonymity(sampleZone, 'funder', 10);
      expect(funderResult.elderly_count).toBeNull();
      expect(funderResult.k_anonymity_suppressed).toBe(true);

      const auditorResult = applyKAnonymity(sampleZone, 'auditor', 10);
      expect(auditorResult.elderly_count).toBeNull();
      expect(auditorResult.k_anonymity_suppressed).toBe(true);
    });

    test('does not suppress when all counts are >= kThreshold (k=10)', () => {
      const safeZone = {
        elderly_count: 10,
        disability_count: 15,
        low_income_household_count: 20,
        outdoor_worker_count: 100,
        total_population: 500,
      };

      const result = applyKAnonymity(safeZone, 'community_member', 10);
      expect(result.elderly_count).toBe(10);
      expect(result.disability_count).toBe(15);
      expect(result.low_income_household_count).toBe(20);
      expect(result.outdoor_worker_count).toBe(100);
      expect(result.k_anonymity_suppressed).toBe(false);
    });

    test('supports custom kThreshold (e.g. k=5)', () => {
      const zone = {
        elderly_count: 4, // < 5 -> suppressed
        disability_count: 5, // >= 5 -> kept
        outdoor_worker_count: 6, // >= 5 -> kept
      };

      const result = applyKAnonymity(zone, 'community_member', 5);
      expect(result.elderly_count).toBeNull();
      expect(result.disability_count).toBe(5);
      expect(result.outdoor_worker_count).toBe(6);
      expect(result.k_anonymity_suppressed).toBe(true);
    });

    test('preserves null and undefined count values without crashing', () => {
      const partialZone = {
        elderly_count: null,
        disability_count: undefined,
        low_income_household_count: 15,
      };

      const result = applyKAnonymity(partialZone, 'community_member', 10);
      expect(result.elderly_count).toBeNull();
      expect(result.disability_count).toBeUndefined();
      expect(result.low_income_household_count).toBe(15);
      expect(result.k_anonymity_suppressed).toBe(false);
    });
  });

  describe('Privileged Roles (operator, admin, local_officer)', () => {
    test('preserves raw counts for operator without suppression', () => {
      const result = applyKAnonymity(sampleZone, 'operator', 10);

      expect(result.elderly_count).toBe(9);
      expect(result.disability_count).toBe(10);
      expect(result.low_income_household_count).toBe(11);
      expect(result.outdoor_worker_count).toBe(0);
      expect(result.k_anonymity_suppressed).toBe(false);
    });

    test('preserves raw counts for admin without suppression', () => {
      const result = applyKAnonymity(sampleZone, 'admin', 10);

      expect(result.elderly_count).toBe(9);
      expect(result.k_anonymity_suppressed).toBe(false);
    });

    test('preserves raw counts for local_officer without suppression', () => {
      const result = applyKAnonymity(sampleZone, 'local_officer', 10);

      expect(result.elderly_count).toBe(9);
      expect(result.k_anonymity_suppressed).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty or null zone payload gracefully', () => {
      const nullResult = applyKAnonymity(null as any, 'community_member');
      expect(nullResult.k_anonymity_suppressed).toBe(false);

      const emptyResult = applyKAnonymity({}, 'community_member');
      expect(emptyResult.k_anonymity_suppressed).toBe(false);
    });
  });
});
