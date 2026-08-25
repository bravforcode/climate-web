import { describe, expect, test } from 'bun:test';
import { ImmutableLedger } from '../src/domain/ledger';

describe('Immutable Finance & MRV Ledger', () => {
  describe('Append-only entry recording', () => {
    test('adds valid income, expense, and in-kind entries', () => {
      const ledger = new ImmutableLedger();

      const e1 = ledger.addEntry({
        project_id: 'proj_market_01',
        entry_type: 'income',
        amount: 25000,
        description: 'Grant installment from ThaiCI',
      });

      const e2 = ledger.addEntry({
        project_id: 'proj_market_01',
        entry_type: 'expense',
        amount: 8000,
        description: 'Misting station hardware procurement',
      });

      const e3 = ledger.addEntry({
        project_id: 'proj_market_01',
        entry_type: 'in_kind',
        amount: 3000,
        description: 'Donated bamboo shading materials by community',
      });

      const e4 = ledger.addEntry({
        project_id: 'proj_market_01',
        entry_type: 'volunteer_hours',
        amount: 40,
        description: 'Volunteer labor for setup (40 hours)',
      });

      expect(e1.id).toBeDefined();
      expect(e1.amount).toBe(25000);
      expect(ledger.getAllEntries()).toHaveLength(4);
    });

    test('rejects negative amounts or invalid entry types', () => {
      const ledger = new ImmutableLedger();

      expect(() => {
        ledger.addEntry({
          project_id: 'proj_01',
          entry_type: 'income',
          amount: -500,
          description: 'Invalid negative entry',
        });
      }).toThrow('non-negative number');

      expect(() => {
        ledger.addEntry({
          project_id: 'proj_01',
          entry_type: 'invalid_type' as any,
          amount: 100,
          description: 'Bad type',
        });
      }).toThrow('Invalid entry_type');

      expect(() => {
        ledger.addEntry({
          project_id: '',
          entry_type: 'income',
          amount: 100,
          description: 'No project id',
        });
      }).toThrow('valid project_id');
    });

    test('protects entries against external mutation', () => {
      const ledger = new ImmutableLedger();
      const entry = ledger.addEntry({
        project_id: 'proj_01',
        entry_type: 'expense',
        amount: 5000,
        description: 'Original amount',
      });

      // Attempt mutating returned entry
      try {
        (entry as any).amount = 999999;
      } catch {
        // May throw in strict mode due to Object.freeze
      }

      // Ledger's internal record remains untouched
      const stored = ledger.getAllEntries()[0];
      expect(stored.amount).toBe(5000);
    });
  });

  describe('Correction Mechanism & Correction Chains', () => {
    test('records correction linking to original entry without mutating original', () => {
      const ledger = new ImmutableLedger();

      const original = ledger.addEntry({
        project_id: 'proj_01',
        entry_type: 'expense',
        amount: 12000, // mistakenly entered as 12000 instead of 10000
        description: 'Solar exhaust fan installation',
      });

      const correction = ledger.addCorrection(original.id, {
        project_id: 'proj_01',
        entry_type: 'expense',
        amount: 10000, // corrected amount
        description: 'Correction: adjusted solar fan receipt to actual 10,000 THB',
      });

      expect(correction.corrects_entry_id).toBe(original.id);
      expect(correction.amount).toBe(10000);

      // Raw history maintains both entries (append-only)
      const all = ledger.getAllEntries();
      expect(all).toHaveLength(2);
      expect(all[0].amount).toBe(12000);
      expect(all[1].amount).toBe(10000);

      // Effective entries reflects ONLY the corrected entry
      const effective = ledger.getEffectiveEntries();
      expect(effective).toHaveLength(1);
      expect(effective[0].id).toBe(correction.id);
      expect(effective[0].amount).toBe(10000);
    });

    test('resolves multi-step correction chains (A -> B -> C)', () => {
      const ledger = new ImmutableLedger();

      const e1 = ledger.addEntry({
        project_id: 'proj_01',
        entry_type: 'income',
        amount: 1000,
        description: 'Initial donation',
      });

      const e2 = ledger.addCorrection(e1.id, {
        project_id: 'proj_01',
        amount: 1200,
        description: 'Correction 1: added late contribution',
      });

      const e3 = ledger.addCorrection(e2.id, {
        project_id: 'proj_01',
        amount: 1500,
        description: 'Correction 2: final bank reconciliation',
      });

      const effective = ledger.getEffectiveEntries();
      expect(effective).toHaveLength(1);
      expect(effective[0].id).toBe(e3.id);
      expect(effective[0].amount).toBe(1500);

      expect(ledger.getAllEntries()).toHaveLength(3);
    });

    test('throws error when correcting non-existent entry ID', () => {
      const ledger = new ImmutableLedger();

      expect(() => {
        ledger.addCorrection('non_existent_id', {
          project_id: 'proj_01',
          entry_type: 'expense',
          amount: 500,
          description: 'Bad correction',
        });
      }).toThrow('Cannot correct non-existent entry');
    });
  });

  describe('calculateSummary and Net Benefit', () => {
    test('computes totals and net benefit accurately from effective entries', () => {
      const ledger = new ImmutableLedger();

      // Project 1
      ledger.addEntry({
        project_id: 'p1',
        entry_type: 'income',
        amount: 50000,
        description: 'Grant',
      });

      const wrongExpense = ledger.addEntry({
        project_id: 'p1',
        entry_type: 'expense',
        amount: 30000,
        description: 'Setup costs (mistyped)',
      });

      // Correct expense to 20,000
      ledger.addCorrection(wrongExpense.id, {
        project_id: 'p1',
        amount: 20000,
        description: 'Corrected setup costs',
      });

      ledger.addEntry({
        project_id: 'p1',
        entry_type: 'in_kind',
        amount: 5000,
        description: 'Volunteer materials',
      });

      ledger.addEntry({
        project_id: 'p1',
        entry_type: 'volunteer_hours',
        amount: 60,
        description: 'Community labor',
      });

      ledger.addEntry({
        project_id: 'p1',
        entry_type: 'reserve',
        amount: 3000,
        description: 'Contingency emergency reserve',
      });

      // Project 2 (separate project)
      ledger.addEntry({
        project_id: 'p2',
        entry_type: 'income',
        amount: 100000,
        description: 'P2 Fund',
      });

      const summaryP1 = ledger.calculateSummary('p1');

      expect(summaryP1.total_income).toBe(50000);
      expect(summaryP1.total_expense).toBe(20000); // Uses corrected 20,000, not 30,000
      expect(summaryP1.in_kind_value).toBe(5000);
      expect(summaryP1.volunteer_hours).toBe(60);
      expect(summaryP1.reserve).toBe(3000);
      // Net benefit: total_income + in_kind_value - total_expense = 50000 + 5000 - 20000 = 35000
      expect(summaryP1.net_benefit).toBe(35000);
      expect(summaryP1.entries_count).toBe(6);
      expect(summaryP1.effective_entries_count).toBe(5);
      expect(summaryP1.corrections_count).toBe(1);
    });
  });
});
