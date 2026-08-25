import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileText,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Zap,
  Info,
  Clock,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  X,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole } from '../../types';
import {
  PaymentTier,
  PaymentTierId,
  BillingInterval,
  PaymentMethodType,
  CheckoutSession,
  WebhookResult,
  PaymentReceipt,
  PAYMENT_TIERS,
  getPaymentTiers,
  getPaymentTier,
  simulateCheckoutSession,
  processPaymentWebhook,
  generateReceipt,
} from '../../domain/payment';
import { formatCurrency, formatShortHash } from '../../utils/crypto';
import db from '../../services/db';

interface ModulePaymentBillingProps {
  currentRole?: UserRole;
  defaultProjectId?: string;
}

export const ModulePaymentBilling: React.FC<ModulePaymentBillingProps> = ({
  currentRole = 'funder',
  defaultProjectId = 'proj-pilot-market-01',
}) => {
  // Tier selection states
  const [selectedTierId, setSelectedTierId] = useState<PaymentTierId>('climate_resilience_anchor');
  const [billingIntervalFilter, setBillingIntervalFilter] = useState<'all' | 'month' | 'one_time'>('all');
  const [customAmount, setCustomAmount] = useState<number>(25000);

  // Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credit_card');
  const [funderName, setFunderName] = useState<string>('Siam Green Venture Ltd.');
  const [funderEmail, setFunderEmail] = useState<string>('esg-grant@siamgreen.co.th');
  const [organizationName, setOrganizationName] = useState<string>('Siam Green Venture Public Company');
  const [selectedProject, setSelectedProject] = useState<string>(defaultProjectId);

  // Credit Card Form mock states
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('888');
  const [cardName, setCardName] = useState<string>('SUCHART V.');

  // PromptPay Countdown Timer
  const [qrTimeRemaining, setQrTimeRemaining] = useState<number>(899); // 15 mins

  // Processing & Feedback states
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [processingMessage, setProcessingMessage] = useState<string>('Connecting to Stripe Payment Engine...');
  const [activeSession, setActiveSession] = useState<CheckoutSession | null>(null);
  const [activeWebhookResult, setActiveWebhookResult] = useState<WebhookResult | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);
  const [ledgerSyncCount, setLedgerSyncCount] = useState<number>(() => {
    return db.getLedgerEntries().filter((e) => (e as any).source === 'stripe_mock').length;
  });

  // Countdown timer for PromptPay QR
  useEffect(() => {
    let timer: any;
    if (isCheckoutOpen && paymentMethod === 'promptpay' && qrTimeRemaining > 0) {
      timer = setInterval(() => {
        setQrTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCheckoutOpen, paymentMethod, qrTimeRemaining]);

  const currentTier = getPaymentTier(selectedTierId, customAmount);
  const effectiveAmount = selectedTierId === 'custom_grant' ? customAmount : currentTier.amountThb;

  const handleOpenCheckout = (tierId?: PaymentTierId) => {
    if (tierId) {
      setSelectedTierId(tierId);
    }
    setCheckoutStep('form');
    setIsCheckoutOpen(true);
  };

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    setCardName(funderName.toUpperCase() || 'SUCHART V.');
  };

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('processing');
    setProcessingMessage('Initiating Stripe Checkout Session...');

    try {
      // 1. Simulate Stripe Checkout Session creation
      await new Promise((r) => setTimeout(r, 600));
      const session = simulateCheckoutSession({
        tierId: selectedTierId,
        customAmountThb: selectedTierId === 'custom_grant' ? customAmount : undefined,
        funderName,
        funderEmail,
        organizationName,
        projectId: selectedProject,
        paymentMethod,
        billingInterval: currentTier.interval,
      });
      setActiveSession(session);

      // 2. Simulate Payment Authorization & Webhook
      setProcessingMessage('Verifying Funds & Processing Webhook (checkout.session.completed)...');
      await new Promise((r) => setTimeout(r, 800));

      // 3. Process Webhook & Create Ledger Entry
      const webhookResult = processPaymentWebhook(session);
      setActiveWebhookResult(webhookResult);

      // 4. Sync into Database Ledger (Append-only storage)
      setProcessingMessage('Appending verified record into Immutable Financial Ledger...');
      await new Promise((r) => setTimeout(r, 500));

      db.insertLedgerEntry({
        project_id: session.projectId,
        entry_type: 'income',
        amount: session.amountThb,
        description: `CSR/Funder grant contribution via Stripe (${session.tierName} - ${session.funderName})`,
        entered_by: session.funderEmail,
        source: 'stripe_mock',
      });

      setLedgerSyncCount((prev) => prev + 1);

      // 5. Generate Receipt
      const receipt = generateReceipt(session, webhookResult);
      setActiveReceipt(receipt);

      setCheckoutStep('success');

      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'],
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      alert(`Payment simulation error: ${err.message}`);
      setCheckoutStep('form');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const allTiers = Object.values(PAYMENT_TIERS);
  const filteredTiers = allTiers.filter((tier) => {
    if (billingIntervalFilter === 'all') return true;
    return tier.interval === billingIntervalFilter;
  });

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-emerald-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-b from-obsidian-900/90 via-obsidian-950/95 to-obsidian-950">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
              PAYMENT & BILLING · CSR & PHILANTHROPIC TIERS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            ร่วมสมทบทุนและสนับสนุนโครงการเพื่อสภาพภูมิอากาศ
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            ระบบรับเงินสนับสนุนอัตโนมัติ พร้อมออกใบเสร็จลดหย่อนภาษี CSR และบันทึกเข้า Append-Only Ledger ทันที
          </p>
        </div>

        {/* Ledger Sync Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Stripe + Ledger Live ({ledgerSyncCount} Syncs)</span>
          </div>
        </div>
      </div>

      {/* Billing Interval Switcher */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center p-1 rounded-xl bg-obsidian-950 border border-white/10">
          <button
            onClick={() => setBillingIntervalFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              billingIntervalFilter === 'all'
                ? 'bg-emerald-500 text-obsidian-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ทั้งหมด (All Tiers)
          </button>
          <button
            onClick={() => setBillingIntervalFilter('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              billingIntervalFilter === 'month'
                ? 'bg-emerald-500 text-obsidian-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            รายเดือน (Monthly)
          </button>
          <button
            onClick={() => setBillingIntervalFilter('one_time')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              billingIntervalFilter === 'one_time'
                ? 'bg-emerald-500 text-obsidian-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            สนับสนุนครั้งเดียว (One-Time)
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>หักลดหย่อนภาษี CSR ได้ 2 เท่า ตามมาตรการส่งเสริมความยั่งยืน</span>
        </div>
      </div>

      {/* Pricing & Grant Tiers Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {filteredTiers.map((tier) => {
          const isSelected = selectedTierId === tier.id;
          const isPopular = !!tier.popular;
          const displayAmount =
            tier.id === 'custom_grant' ? customAmount : tier.amountThb;

          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                  : 'bg-obsidian-900/60 border-white/10 hover:border-white/20 hover:bg-obsidian-900/80'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-obsidian-950 text-[10px] font-extrabold font-mono uppercase tracking-wider shadow-md">
                  ★ MOST POPULAR
                </div>
              )}

              <div>
                {/* Tier Title & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                    {tier.badgeTh}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {tier.interval === 'month' ? '/ เดือน' : 'ครั้งเดียว'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-2 leading-snug">
                  {tier.nameEn}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  {tier.descriptionTh}
                </p>

                {/* Price Display */}
                <div className="mt-4 pb-3 border-b border-white/10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                      ฿{displayAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {tier.interval === 'month' ? '/mo' : 'one-off'}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 flex-shrink-0" />
                    <span>{tier.impactTh}</span>
                  </div>
                </div>

                {/* Custom Amount Controls */}
                {tier.id === 'custom_grant' && (
                  <div className="mt-3 space-y-2">
                    <label className="text-[10px] font-mono text-slate-300 block">
                      ระบุยอดบริจาคตามต้องการ (บาท):
                    </label>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Math.max(1000, Number(e.target.value) || 1000))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian-950 border border-emerald-500/40 text-xs font-mono text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    <div className="grid grid-cols-3 gap-1">
                      {[10000, 25000, 100000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomAmount(amt);
                          }}
                          className="px-1.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 text-center"
                        >
                          ฿{(amt / 1000).toFixed(0)}k
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature List */}
                <ul className="mt-3.5 space-y-2 text-[11px] text-slate-300">
                  {tier.featuresTh.slice(0, 4).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCheckout(tier.id);
                }}
                className={`mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>ร่วมสนับสนุนทันที</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Real-Time Ledger Synchronization Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-obsidian-950/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase">
              100% Append-Only Ledger Integrity
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ทุกยอดสนับสนุนผ่าน Stripe จะถูกส่งผ่าน Webhook เข้าสู่ฐานข้อมูลการเงินที่แก้ไขไม่ได้ (Immutable Ledger) ทันที
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeReceipt && (
            <button
              onClick={() => setIsReceiptOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ดูใบเสร็จล่าสุด ({activeReceipt.receiptNumber})</span>
            </button>
          )}
          <button
            onClick={() => handleOpenCheckout()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-obsidian-950 text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-md ml-auto md:ml-0"
          >
            <CreditCard className="w-4 h-4" />
            <span>เปิดหน้าชำระเงิน (Stripe Simulator)</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. STRIPE CHECKOUT MODAL / DRAWER */}
      {/* ========================================================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-emerald-500/30 shadow-2xl bg-obsidian-950 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Close Button */}
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                S
              </div>
              <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                STRIPE CHECKOUT SIMULATOR · CLIMATE ACTION OS
              </span>
            </div>

            {/* Checkout Content Based on Step */}
            {checkoutStep === 'form' && (
              <form onSubmit={handleStartPayment} className="mt-5 space-y-5">
                
                {/* Selected Tier Summary Header */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase block">Selected Tier</span>
                    <span className="text-sm font-bold text-white">{currentTier.nameEn}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">{currentTier.descriptionEn}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-emerald-300">
                      ฿{effectiveAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {currentTier.interval === 'month' ? 'per month' : 'one-time'}
                    </span>
                  </div>
                </div>

                {/* Funder & Organization Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ข้อมูลผู้สนับสนุน & องค์กร (Funder Info)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">ชื่อผู้บริจาค / ตัวแทน:</label>
                      <input
                        type="text"
                        value={funderName}
                        onChange={(e) => setFunderName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">อีเมลสำหรับรับใบเสร็จ:</label>
                      <input
                        type="email"
                        value={funderEmail}
                        onChange={(e) => setFunderEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">ชื่อนิติบุคคล / องค์กร CSR (ถ้ามี):</label>
                      <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="เช่น SCG Foundation Ltd."
                        className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">โครงการเป้าหมาย:</label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="proj-pilot-market-01">ตลาดสดนำร่องลดความร้อนและจัดการขยะ (Bangkok)</option>
                        <option value="proj-school-pm25-02">โรงเรียนปลอดฝุ่น PM2.5 (Chiang Mai)</option>
                        <option value="proj-mangrove-coast-03">ฟื้นฟูป่าชายเลนกันคลื่นกัดเซาะ (Samut Prakan)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ช่องทางชำระเงิน (Payment Method)</span>
                    </h4>
                    {paymentMethod === 'credit_card' && (
                      <button
                        type="button"
                        onClick={handleFillTestCard}
                        className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Autofill Test Card</span>
                      </button>
                    )}
                  </div>

                  {/* Payment Method Tabs */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                        paymentMethod === 'credit_card'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-obsidian-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit / Debit Card (Stripe)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                        paymentMethod === 'promptpay'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-obsidian-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Thai PromptPay QR</span>
                    </button>
                  </div>

                  {/* Credit Card Input Form */}
                  {paymentMethod === 'credit_card' && (
                    <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-white/10 space-y-3">
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1">Card Number:</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs font-mono text-white pl-9"
                            required
                          />
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Expiry (MM/YY):</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs font-mono text-white text-center"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">CVC / CVV:</label>
                          <input
                            type="password"
                            value={cardCvc}
                            maxLength={4}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs font-mono text-white text-center"
                            required
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Cardholder Name:</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs font-mono text-white uppercase"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PromptPay QR Mock Display */}
                  {paymentMethod === 'promptpay' && (
                    <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                      {/* Realistic SVG QR Mock */}
                      <div className="w-36 h-36 bg-white p-2 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-lg">
                        <div className="w-full text-center text-[8px] font-bold text-blue-900 font-mono tracking-tighter">
                          PROMPTPAY QR
                        </div>
                        <div className="grid grid-cols-6 gap-1 p-1 w-28 h-28 bg-slate-100 rounded">
                          {Array.from({ length: 36 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-xs ${
                                (i % 2 === 0 || i % 7 === 0 || i < 6 || i > 30) ? 'bg-slate-900' : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-[7px] font-mono text-slate-500">REF: {formatShortHash(selectedProject, 4, 4)}</div>
                      </div>

                      <div className="flex-1 space-y-1.5 text-center sm:text-left">
                        <div className="text-xs font-bold text-white">สแกนด้วย Mobile Banking ทุกธนาคาร</div>
                        <div className="text-[11px] text-slate-400">
                          ยอดชำระ: <span className="font-mono text-emerald-400 font-bold">฿{effectiveAmount.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] font-mono text-amber-400 flex items-center justify-center sm:justify-start gap-1">
                          <Clock className="w-3 h-3" />
                          <span>QR จะหมดอายุใน: {formatTimer(qrTimeRemaining)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 pt-1">
                          ระบบจะจำลองการสแกนและยืนยันยอดอัตโนมัติเมื่อกดปุ่มชำระเงินด้านล่าง
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit / Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-slate-400 block">Total Contribution</span>
                    <span className="text-lg font-black font-mono text-white">
                      ฿{effectiveAmount.toLocaleString()} THB
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-bold font-mono text-xs flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>ยืนยันชำระ ฿{effectiveAmount.toLocaleString()}</span>
                    </button>
                  </div>
                </div>

              </form>
            )}

            {/* Step: Processing */}
            {checkoutStep === 'processing' && (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin mx-auto" />
                <h3 className="text-base font-bold text-white">กำลังประมวลผลการชำระเงิน</h3>
                <p className="text-xs font-mono text-emerald-400 animate-pulse">
                  {processingMessage}
                </p>
                <div className="text-[10px] text-slate-500 max-w-sm mx-auto">
                  กำลังสร้างคำสั่งจ่ายผ่าน Stripe Mock API, รับ Webhook ยืนยัน และผูกรายการเข้ากับ Immutable Ledger...
                </div>
              </div>
            )}

            {/* Step: Success */}
            {checkoutStep === 'success' && activeSession && activeWebhookResult && (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">การชำระเงินสำเร็จสมบูรณ์!</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    ขอบพระคุณสำหรับเงินสนับสนุนโครงการ Climate Action OS
                  </p>
                </div>

                {/* Sync Confirmation Card */}
                <div className="p-4 rounded-2xl bg-obsidian-900 border border-emerald-500/30 text-left space-y-2 max-w-md mx-auto">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                    <span className="text-slate-400">เลขที่ใบเสร็จรับเงิน:</span>
                    <span className="font-mono font-bold text-emerald-400">{activeWebhookResult.receiptNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                    <span className="text-slate-400">Stripe Payment Intent:</span>
                    <span className="font-mono text-slate-300">{formatShortHash(activeSession.stripePaymentIntentId, 10, 6)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                    <span className="text-slate-400">Ledger Entry ID:</span>
                    <span className="font-mono text-cyan-400 font-bold">{activeWebhookResult.ledgerEntry.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Ledger Status:</span>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      APPENDED & IMMUTABLE
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsReceiptOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ดูและพิมพ์ใบเสร็จ (Tax Receipt PDF)</span>
                  </button>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs"
                  >
                    กลับสู่แดชบอร์ด
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. DOWNLOADABLE PDF / OFFICIAL RECEIPT SIMULATOR MODAL */}
      {/* ========================================================= */}
      {isReceiptOpen && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl bg-slate-900 text-slate-900 relative max-h-[95vh] overflow-y-auto">
            
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  OFFICIAL DONATION RECEIPT & TAX INVOICE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono flex items-center gap-1.5 transition-all shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsReceiptOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Paper */}
            <div id="printable-receipt" className="mt-4 p-6 sm:p-8 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200">
              
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <div className="text-lg font-black text-slate-900 tracking-tight">
                    CLIMATE ACTION OS FOUNDATION
                  </div>
                  <div className="text-[11px] text-slate-600">
                    มูลนิธิความพร้อมรับมือวิกฤตสภาพภูมิอากาศเมืองแห่งประเทศไทย
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Tax ID: 0-9940-00284-91-8 · Bangkok, Thailand
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    RECEIPT / TAX INVOICE
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                    {activeReceipt.receiptNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    วันที่: {new Date(activeReceipt.paidAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>

              {/* Funder Info Box */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-800">ผู้บริจาค / ผู้สนับสนุน (Funder / Organization):</div>
                <div className="text-slate-700 mt-0.5 font-medium">
                  {activeReceipt.funderName}
                  {activeReceipt.organizationName && ` (${activeReceipt.organizationName})`}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  อีเมล: {activeReceipt.funderEmail}
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 font-mono text-[10px]">
                      <th className="text-left py-1.5">รายการ (Description)</th>
                      <th className="text-center py-1.5">ประเภท</th>
                      <th className="text-right py-1.5">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5">
                        <div className="font-bold text-slate-800">{activeReceipt.tierName}</div>
                        <div className="text-[10px] text-slate-500">โครงการ: {activeReceipt.projectId}</div>
                      </td>
                      <td className="py-2.5 text-center font-mono text-slate-600">
                        {activeReceipt.billingInterval === 'month' ? 'Monthly' : 'One-Time'}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        ฿{activeReceipt.amountThb.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 text-slate-900 font-bold">
                      <td colSpan={2} className="py-2 text-right">ยอดรวมสุทธิ (Total):</td>
                      <td className="py-2 text-right font-mono text-sm text-emerald-700">
                        ฿{activeReceipt.amountThb.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tax Exemption Notice */}
              <div className="mt-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800">
                ★ <strong>สิทธิประโยชน์ทางภาษี CSR:</strong> เงินบริจาคนี้สามารถนำไปหักเป็นค่าใช้จ่ายเพื่อการกุศลสาธารณะและลดหย่อนภาษีนิติบุคคลได้ตามประมวลรัษฎากร มาตรา 47 ทวิ (โครงการส่งเสริมความยั่งยืนและการปรับตัวต่อสภาพภูมิอากาศ)
              </div>

              {/* Cryptographic Ledger Audit Stamp */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                <div>
                  <span>Ledger ID: {activeReceipt.ledgerEntryId}</span>
                  <span className="mx-1">·</span>
                  <span>Tx: {formatShortHash(activeReceipt.transactionId, 8, 4)}</span>
                </div>
                <div className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VERIFIED HASH: {formatShortHash(activeReceipt.signatureHash, 6, 6)}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ModulePaymentBilling;
