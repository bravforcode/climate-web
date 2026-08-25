import { describe, expect, test } from 'bun:test';
import {
  PAYMENT_TIERS,
  getPaymentTiers,
  getPaymentTier,
  simulateCheckoutSession,
  processPaymentWebhook,
  generateReceipt,
  generateVerificationHash,
  type CheckoutInput,
  type CheckoutSession,
} from '../src/domain/payment';
import { ImmutableLedger } from '../src/domain/ledger';

describe('Payment & Billing Domain (Climate Action OS)', () => {
  describe('Payment Tier Definitions', () => {
    test('defines Community Sponsor at ฿15,000 / month for local pilot operational support', () => {
      const tier = PAYMENT_TIERS.community_sponsor;
      expect(tier).toBeDefined();
      expect(tier.amountThb).toBe(15000);
      expect(tier.interval).toBe('month');
      expect(tier.descriptionEn).toBe('Local pilot operational support');
      expect(tier.featuresEn.length).toBeGreaterThan(0);
    });

    test('defines Climate Resilience Anchor at ฿50,000 / month for multi-zone monitoring & MRV', () => {
      const tier = PAYMENT_TIERS.climate_resilience_anchor;
      expect(tier).toBeDefined();
      expect(tier.amountThb).toBe(50000);
      expect(tier.interval).toBe('month');
      expect(tier.popular).toBe(true);
      expect(tier.descriptionEn).toBe('Multi-zone monitoring & MRV');
    });

    test('defines Net-Zero Catalyst at ฿200,000 / one-time for full market infrastructure overhaul', () => {
      const tier = PAYMENT_TIERS.net_zero_catalyst;
      expect(tier).toBeDefined();
      expect(tier.amountThb).toBe(200000);
      expect(tier.interval).toBe('one_time');
      expect(tier.descriptionEn).toBe('Full market infrastructure overhaul');
    });

    test('getPaymentTiers returns standard pricing tiers', () => {
      const tiers = getPaymentTiers();
      expect(tiers).toHaveLength(3);
      expect(tiers.map((t) => t.id)).toEqual([
        'community_sponsor',
        'climate_resilience_anchor',
        'net_zero_catalyst',
      ]);
    });

    test('supports custom grant contribution amounts dynamically', () => {
      const defaultCustom = getPaymentTier('custom_grant');
      expect(defaultCustom.id).toBe('custom_grant');

      const customTier = getPaymentTier('custom_grant', 75000);
      expect(customTier.amountThb).toBe(75000);
      expect(customTier.id).toBe('custom_grant');
    });
  });

  describe('simulateCheckoutSession', () => {
    test('creates a valid pending checkout session for Community Sponsor', () => {
      const input: CheckoutInput = {
        tierId: 'community_sponsor',
        funderName: 'Green Foundation Thailand',
        funderEmail: 'funder@greenfoundation.or.th',
        organizationName: 'Green Foundation',
        projectId: 'proj-pilot-market-01',
        paymentMethod: 'credit_card',
      };

      const session = simulateCheckoutSession(input);

      expect(session.sessionId).toMatch(/^cs_test_/);
      expect(session.stripePaymentIntentId).toMatch(/^pi_test_/);
      expect(session.tierId).toBe('community_sponsor');
      expect(session.amountThb).toBe(15000);
      expect(session.billingInterval).toBe('month');
      expect(session.currency).toBe('THB');
      expect(session.status).toBe('pending');
      expect(session.funderName).toBe('Green Foundation Thailand');
      expect(session.funderEmail).toBe('funder@greenfoundation.or.th');
      expect(session.projectId).toBe('proj-pilot-market-01');
      expect(session.metadata.source).toBe('stripe_mock');
      expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    test('creates a valid checkout session for Net-Zero Catalyst one-time grant', () => {
      const input: CheckoutInput = {
        tierId: 'net_zero_catalyst',
        funderName: 'Siam Climate Venture',
        funderEmail: 'csr@siamclimate.co.th',
        organizationName: 'Siam Climate Group',
        paymentMethod: 'promptpay',
      };

      const session = simulateCheckoutSession(input);

      expect(session.amountThb).toBe(200000);
      expect(session.billingInterval).toBe('one_time');
      expect(session.paymentMethod).toBe('promptpay');
      expect(session.projectId).toBe('proj-pilot-market-01'); // default project
    });

    test('supports custom grant contribution amounts in session simulation', () => {
      const input: CheckoutInput = {
        tierId: 'custom_grant',
        customAmountThb: 125000,
        funderName: 'Bangkok Clean Air Initiative',
        funderEmail: 'contact@cleanair-bkk.org',
        paymentMethod: 'bank_transfer',
      };

      const session = simulateCheckoutSession(input);

      expect(session.tierId).toBe('custom_grant');
      expect(session.amountThb).toBe(125000);
      expect(session.billingInterval).toBe('one_time');
    });

    test('validates required fields (name, email, minimum custom amount)', () => {
      expect(() => {
        simulateCheckoutSession({
          tierId: 'community_sponsor',
          funderName: '',
          funderEmail: 'valid@email.com',
          paymentMethod: 'credit_card',
        });
      }).toThrow('funderName is required');

      expect(() => {
        simulateCheckoutSession({
          tierId: 'community_sponsor',
          funderName: 'Valid Name',
          funderEmail: 'invalid-email-string',
          paymentMethod: 'credit_card',
        });
      }).toThrow('valid funderEmail is required');

      expect(() => {
        simulateCheckoutSession({
          tierId: 'custom_grant',
          customAmountThb: 50, // below min 100
          funderName: 'Donor',
          funderEmail: 'donor@example.com',
          paymentMethod: 'credit_card',
        });
      }).toThrow('custom grant contribution must be at least ฿100');

      expect(() => {
        simulateCheckoutSession({
          tierId: 'invalid_tier' as any,
          funderName: 'Donor',
          funderEmail: 'donor@example.com',
          paymentMethod: 'credit_card',
        });
      }).toThrow('invalid tierId');
    });
  });

  describe('processPaymentWebhook & Append-Only Ledger Integration', () => {
    test('processes webhook and generates append-only ledger entry with source stripe_mock', () => {
      const session = simulateCheckoutSession({
        tierId: 'climate_resilience_anchor',
        funderName: 'SCG Sustainable Fund',
        funderEmail: 'esg@scg.com',
        organizationName: 'SCG Foundation',
        projectId: 'proj-pilot-market-01',
        paymentMethod: 'credit_card',
      });

      const result = processPaymentWebhook(session);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('checkout.session.completed');
      expect(result.receiptNumber).toMatch(/^RCP-2026-\d{5}$/);
      expect(result.ledgerEntry).toBeDefined();
      expect(result.ledgerEntry.entry_type).toBe('income');
      expect(result.ledgerEntry.amount).toBe(50000);
      expect(result.ledgerEntry.project_id).toBe('proj-pilot-market-01');
      expect(result.ledgerEntry.source).toBe('stripe_mock');
      expect(result.ledgerEntry.description).toContain('CSR/Funder grant contribution via Stripe');
      expect(result.ledgerEntry.description).toContain('SCG Sustainable Fund');
    });

    test('integrates with ImmutableLedger to record income and recalculate summary', () => {
      const ledger = new ImmutableLedger();

      // Seed with initial expenses
      ledger.addEntry({
        project_id: 'proj-pilot-market-01',
        entry_type: 'expense',
        amount: 35000,
        description: 'Misting station equipment procurement',
      });

      const session1 = simulateCheckoutSession({
        tierId: 'community_sponsor',
        funderName: 'Local Philanthropy Alliance',
        funderEmail: 'info@local-ally.org',
        projectId: 'proj-pilot-market-01',
        paymentMethod: 'promptpay',
      });

      const session2 = simulateCheckoutSession({
        tierId: 'climate_resilience_anchor',
        funderName: 'PTT ESG Climate Accelerator',
        funderEmail: 'esg@ptt.co.th',
        projectId: 'proj-pilot-market-01',
        paymentMethod: 'credit_card',
      });

      const webhook1 = processPaymentWebhook(session1, ledger);
      const webhook2 = processPaymentWebhook(session2, ledger);

      expect(webhook1.success).toBe(true);
      expect(webhook2.success).toBe(true);

      const allEntries = ledger.getAllEntries('proj-pilot-market-01');
      expect(allEntries).toHaveLength(3); // 1 expense + 2 income entries

      const stripeEntries = allEntries.filter((e) => e.source === 'stripe_mock');
      expect(stripeEntries).toHaveLength(2);
      expect(stripeEntries[0].amount).toBe(15000);
      expect(stripeEntries[1].amount).toBe(50000);

      const summary = ledger.calculateSummary('proj-pilot-market-01');
      expect(summary.total_income).toBe(65000); // 15000 + 50000
      expect(summary.total_expense).toBe(35000);
      expect(summary.net_benefit).toBe(30000); // 65000 - 35000
    });

    test('rejects processing failed or expired checkout sessions', () => {
      const baseSession = simulateCheckoutSession({
        tierId: 'community_sponsor',
        funderName: 'Donor',
        funderEmail: 'donor@test.com',
        paymentMethod: 'credit_card',
      });

      const failedSession: CheckoutSession = {
        ...baseSession,
        status: 'failed',
      };

      const expiredSession: CheckoutSession = {
        ...baseSession,
        status: 'expired',
      };

      expect(() => processPaymentWebhook(failedSession)).toThrow('cannot process failed session');
      expect(() => processPaymentWebhook(expiredSession)).toThrow('session has expired');
    });
  });

  describe('Receipt Generation & Cryptographic Verification', () => {
    test('generates verifiable receipt with transaction hash and ledger ID', () => {
      const session = simulateCheckoutSession({
        tierId: 'net_zero_catalyst',
        funderName: 'Bangkok Metropolitan Climate Fund',
        funderEmail: 'fund@bma.go.th',
        organizationName: 'BMA Environment Department',
        projectId: 'proj-pilot-market-01',
        paymentMethod: 'credit_card',
      });

      const webhookResult = processPaymentWebhook(session);
      const receipt = generateReceipt(session, webhookResult);

      expect(receipt.receiptNumber).toBe(webhookResult.receiptNumber);
      expect(receipt.transactionId).toBe(session.stripePaymentIntentId);
      expect(receipt.amountThb).toBe(200000);
      expect(receipt.funderName).toBe('Bangkok Metropolitan Climate Fund');
      expect(receipt.organizationName).toBe('BMA Environment Department');
      expect(receipt.taxInvoiceRequired).toBe(true);
      expect(receipt.ledgerEntryId).toBe(webhookResult.ledgerEntry.id);
      expect(receipt.signatureHash).toMatch(/^0x/);
      expect(receipt.status).toBe('paid');
    });

    test('produces deterministic verification hashes', () => {
      const h1 = generateVerificationHash('test-receipt-payload-12345');
      const h2 = generateVerificationHash('test-receipt-payload-12345');
      const h3 = generateVerificationHash('different-payload');

      expect(h1).toBe(h2);
      expect(h1).not.toBe(h3);
    });
  });
});
