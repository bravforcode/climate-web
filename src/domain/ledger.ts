import type { LedgerEntry, LedgerEntryType, LedgerSummary } from './types';

const VALID_ENTRY_TYPES: ReadonlySet<LedgerEntryType> = new Set<LedgerEntryType>([
  'income',
  'expense',
  'in_kind',
  'volunteer_hours',
  'reserve',
]);

/**
 * Append-only immutable finance ledger.
 *
 * Enforces:
 * 1. Append-only storage — no UPDATE or DELETE operations permitted.
 * 2. Corrections are recorded as new entries referencing the original via corrects_entry_id.
 * 3. getEffectiveEntries() resolves correction chains to determine current ground truth.
 * 4. calculateSummary() aggregates financial performance (income, expenses, in-kind, net benefit).
 */
export class ImmutableLedger {
  private readonly entries: LedgerEntry[] = [];
  private readonly entryMap = new Map<string, LedgerEntry>();

  /**
   * Initializes the ledger, optionally with a pre-existing list of entries.
   */
  constructor(initialEntries?: LedgerEntry[]) {
    if (initialEntries && Array.isArray(initialEntries)) {
      for (const entry of initialEntries) {
        this.appendInternal(entry);
      }
    }
  }

  private appendInternal(entry: LedgerEntry): LedgerEntry {
    const frozen = Object.freeze({ ...entry });
    this.entries.push(frozen);
    this.entryMap.set(frozen.id, frozen);
    return frozen;
  }

  /**
   * Appends a new financial or resource entry to the ledger.
   */
  addEntry(
    input: Omit<LedgerEntry, 'id' | 'entered_at'> & {
      id?: string;
      entered_at?: string | Date;
    }
  ): LedgerEntry {
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid ledger entry payload');
    }

    if (!input.project_id || typeof input.project_id !== 'string') {
      throw new Error('Ledger entry requires a valid project_id');
    }

    if (!VALID_ENTRY_TYPES.has(input.entry_type)) {
      throw new Error(`Invalid entry_type: ${input.entry_type}`);
    }

    const amount = Number(input.amount);
    if (Number.isNaN(amount) || amount < 0) {
      throw new Error('Ledger entry amount must be a non-negative number');
    }

    const id =
      input.id ||
      `led_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const entered_at = input.entered_at
      ? (typeof input.entered_at === 'string' ? input.entered_at : input.entered_at.toISOString())
      : new Date().toISOString();

    const entry: LedgerEntry = {
      id,
      project_id: input.project_id,
      entry_type: input.entry_type,
      amount,
      description: input.description || '',
      corrects_entry_id: input.corrects_entry_id || null,
      entered_by: input.entered_by || null,
      entered_at,
      source: input.source || (input as any).source || undefined,
    };

    return this.appendInternal(entry);
  }

  /**
   * Records a correction pointing to a previous entry without modifying the historical entry.
   */
  addCorrection(
    originalEntryId: string,
    correctedData: Omit<LedgerEntry, 'id' | 'entered_at' | 'corrects_entry_id'> & {
      id?: string;
      entered_at?: string | Date;
    }
  ): LedgerEntry {
    if (!this.entryMap.has(originalEntryId)) {
      throw new Error(`Cannot correct non-existent entry: ${originalEntryId}`);
    }

    const original = this.entryMap.get(originalEntryId)!;

    return this.addEntry({
      project_id: correctedData.project_id || original.project_id,
      entry_type: correctedData.entry_type || original.entry_type,
      amount: correctedData.amount !== undefined ? correctedData.amount : original.amount,
      description: correctedData.description || `Correction for ${originalEntryId}`,
      corrects_entry_id: originalEntryId,
      entered_by: correctedData.entered_by || original.entered_by,
      id: correctedData.id,
      entered_at: correctedData.entered_at,
    });
  }

  /**
   * Returns all raw immutable entries in chronological insertion order.
   */
  getAllEntries(projectId?: string): LedgerEntry[] {
    const list = projectId
      ? this.entries.filter((e) => e.project_id === projectId)
      : [...this.entries];
    return list.map((e) => ({ ...e }));
  }

  /**
   * Resolves the effective active entries by following correction chains.
   * If entry A is corrected by B, and B is corrected by C:
   * Only C remains in the effective set.
   */
  getEffectiveEntries(projectId?: string): LedgerEntry[] {
    const list = projectId
      ? this.entries.filter((e) => e.project_id === projectId)
      : this.entries;

    // Track which entry IDs have been superseded by a correction
    const superseded = new Set<string>();
    for (const entry of list) {
      if (entry.corrects_entry_id) {
        superseded.add(entry.corrects_entry_id);
      }
    }

    // Effective entries are those that have not been superseded
    return list
      .filter((entry) => !superseded.has(entry.id))
      .map((e) => ({ ...e }));
  }

  /**
   * Computes the financial summary and net benefit for a project or all projects.
   */
  calculateSummary(projectId?: string): LedgerSummary {
    const effective = this.getEffectiveEntries(projectId);
    const all = this.getAllEntries(projectId);

    let total_income = 0;
    let total_expense = 0;
    let in_kind_value = 0;
    let volunteer_hours = 0;
    let reserve = 0;
    let corrections_count = 0;

    for (const entry of all) {
      if (entry.corrects_entry_id) {
        corrections_count++;
      }
    }

    for (const entry of effective) {
      switch (entry.entry_type) {
        case 'income':
          total_income += entry.amount;
          break;
        case 'expense':
          total_expense += entry.amount;
          break;
        case 'in_kind':
          in_kind_value += entry.amount;
          break;
        case 'volunteer_hours':
          volunteer_hours += entry.amount;
          break;
        case 'reserve':
          reserve += entry.amount;
          break;
      }
    }

    const net_benefit = total_income + in_kind_value - total_expense;

    return {
      total_income,
      total_expense,
      in_kind_value,
      volunteer_hours,
      reserve,
      net_benefit,
      entries_count: all.length,
      effective_entries_count: effective.length,
      corrections_count,
    };
  }
}
