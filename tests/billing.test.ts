import { describe, expect, test } from 'bun:test';
import { MOCK_SPONSORSHIP_TIERS, MOCK_PAYMENT_TRANSACTIONS } from '../src/data/mockData';
import { computeSHA256, formatShortHash, formatCurrency } from '../src/utils/crypto';

describe('Payment, Sponsorship & Tax Deduction Engine', () => {
  test('calculates 200% tax deduction for corporate and community sponsorship tiers', () => {
    const corporateTier = MOCK_SPONSORSHIP_TIERS.find((t) => t.id === 'tier-esg-corporate');
    expect(corporateTier).toBeDefined();
    expect(corporateTier?.priceThb).toBe(50000);
    expect(corporateTier?.taxDeductionPercent).toBe(200);

    const deductionAmount = (corporateTier!.priceThb * corporateTier!.taxDeductionPercent) / 100;
    expect(deductionAmount).toBe(100000);
  });

  test('formats Thai Baht currency properly', () => {
    const formatted = formatCurrency(50000);
    expect(formatted).toContain('50,000');
  });

  test('computes cryptographic SHA-256 receipt hash and formats short hash', async () => {
    const rawPayload = 'sponsorship_tier-esg-corporate_50000_GreenTech_2026';
    const hash = await computeSHA256(rawPayload);
    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(10);

    const short = formatShortHash(hash, 8, 6);
    expect(short).toContain('...');
    expect(short.startsWith(hash.slice(0, 8))).toBe(true);
    expect(short.endsWith(hash.slice(-6))).toBe(true);
  });

  test('verifies mock payment transactions have valid hashes and tax deductions', () => {
    for (const tx of MOCK_PAYMENT_TRANSACTIONS) {
      expect(tx.id).toBeDefined();
      expect(tx.amountThb).toBeGreaterThan(0);
      expect(tx.taxDeductionValueThb).toBe(tx.amountThb * 2);
      expect(tx.receiptHash).toHaveLength(64);
      expect(tx.status).toBe('completed');
    }
  });
});
