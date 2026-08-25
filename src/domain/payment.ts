import type { LedgerEntry, LedgerEntryType } from './types';
import { ImmutableLedger } from './ledger';

export type PaymentTierId =
  | 'community_sponsor'
  | 'climate_resilience_anchor'
  | 'net_zero_catalyst'
  | 'custom_grant';

export type BillingInterval = 'month' | 'one_time';

export type PaymentMethodType = 'credit_card' | 'promptpay' | 'bank_transfer';

export interface PaymentTier {
  id: PaymentTierId;
  nameTh: string;
  nameEn: string;
  amountThb: number;
  interval: BillingInterval;
  descriptionTh: string;
  descriptionEn: string;
  featuresTh: string[];
  featuresEn: string[];
  impactTh: string;
  impactEn: string;
  popular?: boolean;
  badgeTh?: string;
  badgeEn?: string;
}

export const PAYMENT_TIERS: Record<PaymentTierId, PaymentTier> = {
  community_sponsor: {
    id: 'community_sponsor',
    nameTh: 'ผู้สนับสนุนชุมชน (Community Sponsor)',
    nameEn: 'Community Sponsor',
    amountThb: 15000,
    interval: 'month',
    descriptionTh: 'สนับสนุนการดำเนินงานระดับชุมชนนำร่อง',
    descriptionEn: 'Local pilot operational support',
    featuresTh: [
      'สนับสนุนอุปกรณ์จุดพักคลายร้อนและระบบพ่นหมอก 1 จุด',
      'รายงานข้อมูลสภาพอากาศและมลพิษ PM2.5 ประจำสัปดาห์',
      'บันทึกชื่อผู้สนับสนุนในบัญชีสาธารณะที่โปร่งใส',
      'สิทธิ์เข้าถึงแดชบอร์ดติดตามสถานะแบบเรียลไทม์',
    ],
    featuresEn: [
      'Operational funding for 1 community cooling station',
      'Weekly microclimate & PM2.5 telemetry digest',
      'Verifiable funder accreditation in public ledger',
      'Real-time pilot operational dashboard access',
    ],
    impactTh: 'ครอบคลุมประชากรกลุ่มเปราะบาง ~450 คน / เดือน',
    impactEn: 'Covers ~450 vulnerable residents / month',
    badgeTh: 'ชุมชนเริ่มต้น',
    badgeEn: 'Starter',
  },
  climate_resilience_anchor: {
    id: 'climate_resilience_anchor',
    nameTh: 'ผู้ขับเคลื่อนความพร้อมรับมือ (Climate Resilience Anchor)',
    nameEn: 'Climate Resilience Anchor',
    amountThb: 50000,
    interval: 'month',
    descriptionTh: 'สนับสนุนการเฝ้าระวังหลายพื้นที่และระบบตรวจสอบ MRV',
    descriptionEn: 'Multi-zone monitoring & MRV',
    featuresTh: [
      'โครงข่ายเซนเซอร์ IoT และระบบเตือนภัยล่วงหน้า 3 เขต',
      'การจัดทำรายงาน MRV รับรองผลลดคาร์บอนและขยะอินทรีย์',
      'ระบบบริหารจัดการหลักฐานเข้ารหัส SHA-256',
      'ที่ปรึกษาเฉพาะทางด้านความเสี่ยงสภาพภูมิอากาศประจำโซน',
      'โลโก้องค์กรบนป้ายสถานีและรายงานสรุปผู้บริหาร',
    ],
    featuresEn: [
      'IoT sensor grid & early warning across 3 urban zones',
      'Certified MRV reporting for carbon & organic waste',
      'Cryptographic SHA-256 evidence chain verification',
      'Dedicated climate resilience technical advisor',
      'Corporate CSR co-branding on telemetry portals',
    ],
    impactTh: 'คุ้มครองประชากรเปราะบาง ~2,800 คน และลดขยะ 4.5 ตัน/เดือน',
    impactEn: 'Protects ~2,800 residents & diverts 4.5 tonnes waste/month',
    popular: true,
    badgeTh: 'แนะนำสำหรับองค์กร CSR',
    badgeEn: 'Most Popular',
  },
  net_zero_catalyst: {
    id: 'net_zero_catalyst',
    nameTh: 'ผู้เร่งการลดคาร์บอนสุทธิเป็นศูนย์ (Net-Zero Catalyst)',
    nameEn: 'Net-Zero Catalyst',
    amountThb: 200000,
    interval: 'one_time',
    descriptionTh: 'สนับสนุนโครงสร้างพื้นฐานตลาดและระบบนิเวศครบวงจร',
    descriptionEn: 'Full market infrastructure overhaul',
    featuresTh: [
      'ปรับปรุงโครงสร้างพื้นฐานลดความร้อนและจัดการขยะทั้งตลาด 100%',
      'ติดตั้งระบบพลังงานแสงอาทิตย์และระบายอากาศหมุนเวียนอัจฉริยะ',
      'Playbook การขยายผลสำหรับเทศบาลและตลาดแห่งอื่น',
      'รายงานผลกระทบเชิงลึก (Comprehensive Impact & ESG Audit)',
      'เกียรติบัตรรับรองการขับเคลื่อน Net-Zero จากเครือข่ายความร่วมมือ',
    ],
    featuresEn: [
      '100% complete market green infrastructure retrofit',
      'Solar-assisted passive cooling & smart airflow grids',
      'Municipal replication playbook & open-source BOM',
      'Comprehensive ESG audit & verified avoided emissions',
      'Executive leadership keynote & certified recognition',
    ],
    impactTh: 'พลิกโฉมตลาดทั้งระบบ ลดก๊าซเรือนกระจก >30 tCO2e/ปี',
    impactEn: 'Full ecosystem transformation, avoiding >30 tCO2e/year',
    badgeTh: 'การสนับสนุนระดับยุทธศาสตร์',
    badgeEn: 'Enterprise Grant',
  },
  custom_grant: {
    id: 'custom_grant',
    nameTh: 'ทุนสนับสนุนตามความประสงค์ (Custom Grant Contribution)',
    nameEn: 'Custom Grant Contribution',
    amountThb: 10000,
    interval: 'one_time',
    descriptionTh: 'กำหนดวงเงินบริจาคหรือสนับสนุนโครงการตามเป้าหมายของท่าน',
    descriptionEn: 'Tailored philanthropic grant matching your CSR scope',
    featuresTh: [
      'เลือกระบุยอดเงินสมทบได้ตามความประสงค์ (ขั้นต่ำ ฿1,000)',
      'เลือกจัดสรรเข้าโครงการนำร่องเฉพาะจุดได้ตามความสนใจ',
      'บันทึกยอดเงินเข้า Append-Only Ledger พร้อมหลักฐานตรวจสอบได้',
      'รับใบเสร็จรับเงินอิเล็กทรอนิกส์เพื่อการลดหย่อนภาษี/รายงาน CSR',
    ],
    featuresEn: [
      'Flexible contribution amount (minimum ฿1,000)',
      'Target specific pilot projects or community districts',
      'Verifiable entry in the immutable public ledger',
      'Instant electronic tax receipt for corporate CSR reporting',
    ],
    impactTh: 'จัดสรรตรงสู่การดำเนินงานภาคสนาม 100%',
    impactEn: '100% directly allocated to community field operations',
    badgeTh: 'ยืดหยุ่นตามความประสงค์',
    badgeEn: 'Flexible',
  },
};

export interface CheckoutInput {
  tierId: PaymentTierId;
  customAmountThb?: number;
  funderName: string;
  funderEmail: string;
  organizationName?: string;
  projectId?: string;
  paymentMethod: PaymentMethodType;
  billingInterval?: BillingInterval;
  currency?: 'THB' | 'USD';
  metadata?: Record<string, any>;
}

export interface CheckoutSession {
  sessionId: string;
  tierId: PaymentTierId;
  tierName: string;
  amountThb: number;
  billingInterval: BillingInterval;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  funderName: string;
  funderEmail: string;
  organizationName?: string;
  projectId: string;
  paymentMethod: PaymentMethodType;
  stripePaymentIntentId: string;
  createdAt: string;
  expiresAt: string;
  metadata: Record<string, any>;
}

export interface PaymentLedgerEntry extends LedgerEntry {
  source: 'stripe_mock';
  stripe_payment_intent_id?: string;
  receipt_number?: string;
  tier_id?: PaymentTierId;
  funder_name?: string;
}

export interface WebhookResult {
  success: boolean;
  eventId: string;
  eventType: 'checkout.session.completed' | 'payment_intent.succeeded' | 'payment_intent.payment_failed';
  sessionId: string;
  ledgerEntry: PaymentLedgerEntry;
  receiptNumber: string;
  processedAt: string;
  message: string;
}

export interface PaymentReceipt {
  receiptNumber: string;
  transactionId: string;
  funderName: string;
  funderEmail: string;
  organizationName?: string;
  tierId: PaymentTierId;
  tierName: string;
  amountThb: number;
  billingInterval: BillingInterval;
  paymentMethod: PaymentMethodType;
  paidAt: string;
  projectId: string;
  ledgerEntryId: string;
  signatureHash: string;
  taxInvoiceRequired: boolean;
  status: 'paid' | 'pending' | 'refunded';
}

/**
 * Returns the list of standard payment and grant contribution tiers.
 */
export function getPaymentTiers(): PaymentTier[] {
  return [
    PAYMENT_TIERS.community_sponsor,
    PAYMENT_TIERS.climate_resilience_anchor,
    PAYMENT_TIERS.net_zero_catalyst,
  ];
}

/**
 * Resolves a payment tier by id, supporting custom grant amounts.
 */
export function getPaymentTier(tierId: PaymentTierId, customAmount?: number): PaymentTier {
  const base = PAYMENT_TIERS[tierId] || PAYMENT_TIERS.custom_grant;
  if (tierId === 'custom_grant' && customAmount !== undefined) {
    const validAmount = Math.max(1000, Number(customAmount) || 1000);
    return {
      ...base,
      amountThb: validAmount,
    };
  }
  return { ...base };
}

/**
 * Validates checkout input and simulates the creation of a Stripe Checkout Session.
 */
export function simulateCheckoutSession(input: CheckoutInput): CheckoutSession {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid checkout input: payload is required');
  }

  if (!input.funderName || input.funderName.trim().length === 0) {
    throw new Error('Validation error: funderName is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.funderEmail || !emailRegex.test(input.funderEmail.trim())) {
    throw new Error('Validation error: a valid funderEmail is required');
  }

  if (!input.tierId || !PAYMENT_TIERS[input.tierId]) {
    throw new Error(`Validation error: invalid tierId "${input.tierId}"`);
  }

  let finalAmount = PAYMENT_TIERS[input.tierId].amountThb;
  let interval = input.billingInterval || PAYMENT_TIERS[input.tierId].interval;

  if (input.tierId === 'custom_grant') {
    const customAmount = Number(input.customAmountThb);
    if (!customAmount || Number.isNaN(customAmount) || customAmount < 100) {
      throw new Error('Validation error: custom grant contribution must be at least ฿100');
    }
    finalAmount = customAmount;
  }

  const projectId = input.projectId || 'proj-pilot-market-01';
  const tierConfig = PAYMENT_TIERS[input.tierId];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes expiry

  const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  const session: CheckoutSession = {
    sessionId,
    tierId: input.tierId,
    tierName: tierConfig.nameEn,
    amountThb: finalAmount,
    billingInterval: interval,
    currency: input.currency || 'THB',
    status: 'pending',
    funderName: input.funderName.trim(),
    funderEmail: input.funderEmail.trim(),
    organizationName: input.organizationName?.trim() || undefined,
    projectId,
    paymentMethod: input.paymentMethod || 'credit_card',
    stripePaymentIntentId: paymentIntentId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    metadata: {
      source: 'stripe_mock',
      app: 'Climate Action OS',
      platform: 'web',
      ...input.metadata,
    },
  };

  return Object.freeze(session);
}

/**
 * Generates a mock receipt number in standard accounting format.
 */
function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `RCP-${year}-${randomDigits}`;
}

/**
 * Simple pseudo-SHA256 generator for receipts/ledger mock hashes.
 */
export function generateVerificationHash(inputString: string): string {
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const tail = Math.abs((hash * 31) & 0xffffffff).toString(16).padStart(8, '0');
  return `0x${hex}${tail}${hex}${tail}`;
}

/**
 * Processes incoming payment webhooks (e.g. checkout.session.completed)
 * and generates the required append-only entry for ledger_entries.
 *
 * Requirements:
 * - entry_type: 'income'
 * - description: 'CSR/Funder grant contribution via Stripe'
 * - source: 'stripe_mock'
 */
export function processPaymentWebhook(
  session: CheckoutSession,
  targetLedger?: ImmutableLedger
): WebhookResult {
  if (!session || typeof session !== 'object') {
    throw new Error('Webhook error: invalid session payload');
  }

  if (session.status === 'failed') {
    throw new Error('Webhook error: cannot process failed session');
  }

  if (session.status === 'expired') {
    throw new Error('Webhook error: session has expired');
  }

  const receiptNumber = generateReceiptNumber();
  const processedAt = new Date().toISOString();
  const eventId = `evt_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const description = `CSR/Funder grant contribution via Stripe (${session.tierName} - ${session.funderName}${
    session.organizationName ? ` / ${session.organizationName}` : ''
  })`;

  const ledgerPayload = {
    project_id: session.projectId || 'proj-pilot-market-01',
    entry_type: 'income' as LedgerEntryType,
    amount: session.amountThb,
    description,
    corrects_entry_id: null,
    entered_by: session.funderEmail,
    source: 'stripe_mock' as const,
  };

  let createdEntry: PaymentLedgerEntry;

  if (targetLedger) {
    const rawEntry = targetLedger.addEntry(ledgerPayload);
    createdEntry = {
      ...rawEntry,
      source: 'stripe_mock',
      stripe_payment_intent_id: session.stripePaymentIntentId,
      receipt_number: receiptNumber,
      tier_id: session.tierId,
      funder_name: session.funderName,
    };
  } else {
    createdEntry = {
      id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      entered_at: processedAt,
      ...ledgerPayload,
      stripe_payment_intent_id: session.stripePaymentIntentId,
      receipt_number: receiptNumber,
      tier_id: session.tierId,
      funder_name: session.funderName,
    };
  }

  return {
    success: true,
    eventId,
    eventType: 'checkout.session.completed',
    sessionId: session.sessionId,
    ledgerEntry: createdEntry,
    receiptNumber,
    processedAt,
    message: `Payment of ฿${session.amountThb.toLocaleString()} processed successfully. Ledger entry created.`,
  };
}

/**
 * Creates a verifiable, downloadable receipt object for funders and CSR tax deduction.
 */
export function generateReceipt(
  session: CheckoutSession,
  webhookResult: WebhookResult
): PaymentReceipt {
  const signaturePayload = `${webhookResult.receiptNumber}:${session.stripePaymentIntentId}:${webhookResult.ledgerEntry.id}:${session.amountThb}`;
  const signatureHash = generateVerificationHash(signaturePayload);

  return {
    receiptNumber: webhookResult.receiptNumber,
    transactionId: session.stripePaymentIntentId,
    funderName: session.funderName,
    funderEmail: session.funderEmail,
    organizationName: session.organizationName,
    tierId: session.tierId,
    tierName: session.tierName,
    amountThb: session.amountThb,
    billingInterval: session.billingInterval,
    paymentMethod: session.paymentMethod,
    paidAt: webhookResult.processedAt,
    projectId: session.projectId,
    ledgerEntryId: webhookResult.ledgerEntry.id,
    signatureHash,
    taxInvoiceRequired: !!session.organizationName,
    status: 'paid',
  };
}
