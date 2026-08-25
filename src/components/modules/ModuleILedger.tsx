import React, { useState } from 'react';
import { 
  Database, 
  PlusCircle, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LedgerEntry, UserRole } from '../../types';
import { MOCK_LEDGER_ENTRIES } from '../../data/mockData';
import { formatCurrency, formatShortHash, computeSHA256 } from '../../utils/crypto';

interface ModuleIProps {
  currentRole: UserRole;
}

export const ModuleILedger: React.FC<ModuleIProps> = ({ currentRole }) => {
  const [entries, setEntries] = useState<LedgerEntry[]>(MOCK_LEDGER_ENTRIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedTargetEntry, setSelectedTargetEntry] = useState<LedgerEntry | null>(null);

  // Form states
  const [entryType, setEntryType] = useState<'income' | 'expense' | 'in_kind'>('expense');
  const [amount, setAmount] = useState<string>('4500');
  const [description, setDescription] = useState<string>('ค่าบำรุงรักษาหัวพ่นหมอกและเปลี่ยนไส้กรองน้ำ');

  // Calculate Net benefit & summary
  const totalIncome = entries
    .filter((e) => e.entryType === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries
    .filter((e) => e.entryType === 'expense')
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const totalInKind = entries
    .filter((e) => e.entryType === 'in_kind')
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const isPrivileged = ['operator', 'admin'].includes(currentRole);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    const finalAmount = entryType === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);
    const hash = await computeSHA256(`ledger_${Date.now()}_${finalAmount}_${description}`);

    const newEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      projectId: 'proj-pilot-market-01',
      entryType: entryType,
      entryTypeLabelTh: entryType === 'income' ? 'รายได้ / ทุนอุดหนุน' : entryType === 'expense' ? 'ค่าใช้จ่ายดำเนินงาน' : 'มูลค่าสมทบ (In-kind)',
      amount: finalAmount,
      descriptionTh: description,
      enteredBy: currentRole === 'operator' ? 'Field Operator (คุณ)' : 'Admin (คุณ)',
      enteredAt: new Date().toISOString(),
      verifiedHash: hash,
    };

    setEntries([...entries, newEntry]);
    setShowAddModal(false);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch {
      // ignore
    }
  };

  const handleCreateCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetEntry) return;

    const numAmount = parseFloat(amount) || 0;
    const finalAmount = entryType === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);
    const hash = await computeSHA256(`correction_${selectedTargetEntry.id}_${Date.now()}_${finalAmount}`);

    const correctionEntry: LedgerEntry = {
      id: `led-corr-${Date.now()}`,
      projectId: 'proj-pilot-market-01',
      entryType: entryType,
      entryTypeLabelTh: `[รายการแก้ไขอ้างอิง ${selectedTargetEntry.id}]`,
      amount: finalAmount,
      descriptionTh: `[ปรับปรุงรายการ ${selectedTargetEntry.id}]: ${description}`,
      correctsEntryId: selectedTargetEntry.id,
      enteredBy: 'Field Operator (คุณ)',
      enteredAt: new Date().toISOString(),
      verifiedHash: hash,
    };

    setEntries([...entries, correctionEntry]);
    setShowCorrectionModal(false);
    setSelectedTargetEntry(null);
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
    } catch {
      // ignore
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
              MODULE I · APPEND-ONLY FINANCIAL LEDGER
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isPrivileged && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มรายการ</span>
              </button>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30">
              REVOKE UPDATE/DELETE
            </span>
          </div>
        </div>

        {/* Tally Stats Bar */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-obsidian-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 block">เงินทุนรับสะสม</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {formatCurrency(totalIncome)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-obsidian-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 block">ค่าใช้จ่ายจริง</span>
            <span className="text-sm font-bold font-mono text-rose-400">
              {formatCurrency(totalExpense)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-obsidian-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 block">ยอดคงเหลือสุทธิ</span>
            <span className="text-sm font-bold font-mono text-amber-300">
              {formatCurrency(netBalance)}
            </span>
          </div>
        </div>

        {/* Ledger Entries Table */}
        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {entries.map((entry) => {
            const isCorrection = !!entry.correctsEntryId;
            const isNegative = entry.amount < 0;
            return (
              <div
                key={entry.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isCorrection
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-obsidian-900/60 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500">{entry.id}</span>
                      <span className="text-xs font-bold text-white">{entry.entryTypeLabelTh}</span>
                      {isCorrection && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          CORRECTION
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {entry.descriptionTh}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span>โดย: {entry.enteredBy}</span>
                      <span>·</span>
                      <span>Hash: {formatShortHash(entry.verifiedHash)}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-mono font-bold block ${
                      isNegative ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {isNegative ? '-' : '+'}{formatCurrency(Math.abs(entry.amount))}
                    </span>

                    {/* Correction trigger button for operator */}
                    {isPrivileged && !isCorrection && (
                      <button
                        onClick={() => {
                          setSelectedTargetEntry(entry);
                          setShowCorrectionModal(true);
                        }}
                        className="mt-1 text-[10px] font-mono text-cyan-400 hover:underline"
                      >
                        + สร้างรายการแก้
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Security Guarantee Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Append-only Architecture: บันทึกทับไม่ได้ มีแต่เพิ่มแถวใหม่</span>
        <span className="font-mono text-amber-400">Postgres Trigger Logged</span>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-amber-500/30 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-white font-mono uppercase pb-2 border-b border-white/10">
              เพิ่มรายการบัญชีใหม่ (Append-Only)
            </h3>
            
            <form onSubmit={handleCreateEntry} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">ประเภทรายการ:</label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white"
                >
                  <option value="expense">ค่าใช้จ่ายดำเนินงาน (Expense)</option>
                  <option value="income">เงินทุน / รายได้ (Income)</option>
                  <option value="in_kind">มูลค่าสมทบแรงงาน/สถานที่ (In-kind)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">จำนวนเงิน (บาท):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs font-mono text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">รายละเอียดรายการ:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-bold text-xs"
                >
                  บันทึกลงบัญชี
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Correction Entry Modal */}
      {showCorrectionModal && selectedTargetEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-cyan-500/30 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                สร้างรายการแก้ไข (Correction Entry)
              </h3>
            </div>

            <p className="text-xs text-slate-300 mt-2">
              ตามหลักการ Append-Only ข้อมูลเดิม <span className="font-mono font-bold text-cyan-300">({selectedTargetEntry.id})</span> จะไม่ถูกลบหรือแก้ไข แต่ระบบจะสร้างรายการชดเชยใหม่ที่เชื่อมโยงกลับไปยังรายการเดิม
            </p>

            <form onSubmit={handleCreateCorrection} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">จำนวนเงินปรับปรุง (บาท):</label>
                <input
                  type="number"
                  defaultValue={Math.abs(selectedTargetEntry.amount)}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs font-mono text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">เหตุผลในการแก้ไข:</label>
                <input
                  type="text"
                  placeholder="เช่น ปรับปรุงยอดตามใบเสร็จรับเงินที่ถูกต้อง"
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs"
                >
                  ยืนยันรายการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
