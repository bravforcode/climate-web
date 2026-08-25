import { describe, expect, test } from 'bun:test';
import {
  matchFundingCalls,
  confirmFundingMatch,
  calculateThematicOverlap,
  calculateBudgetFit,
} from '../src/domain/fundingMatch';
import type { FundingCall, ProjectForMatching } from '../src/domain';

describe('Funding Match Engine & Human-in-the-Loop Verification', () => {
  const sampleProject: ProjectForMatching = {
    id: 'proj_pilot_bkk_01',
    title: 'Climate Safe Market Pilot — Chatuchak',
    budget_total: 45000,
    thematic_areas: ['heat_adaptation', 'urban_cooling'],
    hazard_types: ['heat'],
    confirmed_call_ids: ['call_thaici_01'], // call_thaici_01 is confirmed by operator
  };

  const sampleCalls: FundingCall[] = [
    {
      id: 'call_thaici_01',
      funder_name: 'ThaiCI Small Adaptation Grant',
      thematic_fit: ['heat_adaptation', 'urban_resilience', 'cooling'],
      max_amount: 100000,
      co_financing_required: false,
      application_deadline: '2026-12-31',
    },
    {
      id: 'call_env_fund_02',
      funder_name: 'National Environmental Fund — Flood Focus',
      thematic_fit: ['flood_resilience', 'watershed_management'],
      max_amount: 500000,
      co_financing_required: true,
      application_deadline: '2026-11-30',
    },
    {
      id: 'call_bma_innovation_03',
      funder_name: 'BMA Green Innovation Sandbox',
      thematic_fit: ['urban_cooling', 'heat_adaptation', 'community_action'],
      max_amount: 50000,
      co_financing_required: false,
      application_deadline: '2026-10-15',
    },
  ];

  describe('Thematic & Budget Fit Calculations', () => {
    test('calculates thematic overlap correctly', () => {
      const { score, matchedThemes } = calculateThematicOverlap(
        ['heat_adaptation', 'urban_cooling'],
        ['heat_adaptation', 'cooling', 'energy']
      );

      expect(matchedThemes.length).toBeGreaterThanOrEqual(1);
      expect(score).toBeGreaterThan(0);
    });

    test('calculates budget fit within grant limits', () => {
      const fit1 = calculateBudgetFit(45000, 100000);
      expect(fit1.score).toBe(1.0);

      const fit2 = calculateBudgetFit(120000, 100000, true);
      expect(fit2.score).toBeLessThan(1.0);
    });
  });

  describe('Role-based Visibility & Human Confirmation (Section D.4 / Risk #3)', () => {
    test('community_member role ONLY sees human-confirmed matches', () => {
      const matches = matchFundingCalls(sampleProject, sampleCalls, {
        userRole: 'community_member',
      });

      // Only call_thaici_01 was confirmed
      expect(matches).toHaveLength(1);
      expect(matches[0].funding_call_id).toBe('call_thaici_01');
      expect(matches[0].is_human_confirmed).toBe(true);
    });

    test('operator role sees all candidate matches regardless of confirmation state', () => {
      const matches = matchFundingCalls(sampleProject, sampleCalls, {
        userRole: 'operator',
      });

      // Operator should see matches scored by relevance
      expect(matches.length).toBeGreaterThanOrEqual(2);

      const confirmedMatch = matches.find((m) => m.funding_call_id === 'call_thaici_01');
      const unconfirmedMatch = matches.find((m) => m.funding_call_id === 'call_bma_innovation_03');

      expect(confirmedMatch?.is_human_confirmed).toBe(true);
      expect(unconfirmedMatch?.is_human_confirmed).toBe(false);
    });

    test('confirmFundingMatch stamps confirmation with operator id and timestamp', () => {
      const initialMatches = matchFundingCalls(sampleProject, sampleCalls, {
        userRole: 'operator',
      });

      const unconfirmed = initialMatches.find(
        (m) => m.funding_call_id === 'call_bma_innovation_03'
      )!;
      expect(unconfirmed.is_human_confirmed).toBe(false);

      const confirmed = confirmFundingMatch(unconfirmed, 'user_operator_99');

      expect(confirmed.is_human_confirmed).toBe(true);
      expect(confirmed.confirmed_by).toBe('user_operator_99');
      expect(confirmed.confirmed_at).toBeDefined();
    });
  });

  describe('Edge cases and empty inputs', () => {
    test('handles empty calls array or null project safely', () => {
      expect(matchFundingCalls(sampleProject, [])).toEqual([]);
      expect(matchFundingCalls(null as any, sampleCalls)).toEqual([]);
    });
  });
});
