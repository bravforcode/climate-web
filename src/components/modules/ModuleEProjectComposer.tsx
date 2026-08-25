import React, { useState } from 'react';
import { 
  FileEdit, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  CheckSquare, 
  Square,
  Layers,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Intervention, ProjectProposal, UserRole } from '../../types';
import { formatCurrency } from '../../utils/crypto';

interface ModuleEProps {
  selectedInterventions: Intervention[];
  currentRole: UserRole;
  onOpenProposalModal: () => void;
}

export const ModuleEProjectComposer: React.FC<ModuleEProps> = ({
  selectedInterventions,
  currentRole,
  onOpenProposalModal,
}) => {
  const [projectTitle, setProjectTitle] = useState('โครงการตลาดชุมชนผดุงกรุงเกษมพร้อมรับมือคลื่นความร้อนและน้ำท่วมขัง');
  const [isComposed, setIsComposed] = useState(false);
  const [confirmations, setConfirmations] = useState({
    theoryOfChange: true,
    budgetJustification: true,
    communityConsent: false,
    riskMitigation: false,
  });

  const totalEstimatedBudget = selectedInterventions.reduce((sum, item) => sum + (item.costLow + item.costHigh) / 2, 0) || 62500;
  const totalDays = Math.max(...selectedInterventions.map(i => i.timelineDays), 21);

  const toggleCheck = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allConfirmed = Object.values(confirmations).every(Boolean);

  const handleCompose = () => {
    setIsComposed(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
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
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
              MODULE E · PROJECT COMPOSER & TOC
            </span>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            AUTO-DRAFT ENGINE
          </span>
        </div>

        {/* Project Name Field */}
        <div className="mt-4">
          <label className="text-[11px] font-mono text-slate-400 block mb-1">
            ชื่อโครงการที่สร้าง (Project Title):
          </label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-obsidian-950/80 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Dynamic Scope & Budget from Selected Interventions */}
        <div className="mt-3.5 p-3 rounded-xl bg-obsidian-900/80 border border-white/5 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">มาตรการที่ผูกในโครงการ:</span>
            <span className="font-bold text-white font-mono">
              {selectedInterventions.length || 2} รายการ
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">งบประมาณรวมที่ประเมิน:</span>
            <span className="font-bold text-amber-300 font-mono">
              {formatCurrency(totalEstimatedBudget)}
            </span>
          </div>
        </div>

        {/* Theory of Change Summary */}
        <div className="mt-3.5 p-3 rounded-xl bg-obsidian-950/60 border border-white/5">
          <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
            THEORY OF CHANGE (ทฤษฎีการเปลี่ยนแปลง):
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            หากชุมชนติดตั้งจุดพักคลายร้อนและระบบผันขยะอินทรีย์ จะลดอัตราการเจ็บป่วยจากความร้อนสะสมของกลุ่มเปราะบางลง 40% และลดต้นทุนค่าจัดการขยะของตลาดได้ 12,000 บาท/เดือน โดยมีหลักฐานตั๋วชั่งน้ำหนักยืนยันทุกวัน
          </p>
        </div>

        {/* Human Confirmation Checklist (Crucial requirement from plan) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-300 font-bold uppercase">
              HUMAN-IN-THE-LOOP CHECKLIST:
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {Object.values(confirmations).filter(Boolean).length}/4 ยืนยัน
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => toggleCheck('theoryOfChange')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-obsidian-900/50 hover:bg-obsidian-900 border border-white/5 text-left transition-all"
            >
              {confirmations.theoryOfChange ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={confirmations.theoryOfChange ? 'text-slate-200' : 'text-slate-400'}>
                ตรวจสอบสมมติฐาน Theory of Change และดัชนีชี้วัด
              </span>
            </button>

            <button
              onClick={() => toggleCheck('budgetJustification')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-obsidian-900/50 hover:bg-obsidian-900 border border-white/5 text-left transition-all"
            >
              {confirmations.budgetJustification ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={confirmations.budgetJustification ? 'text-slate-200' : 'text-slate-400'}>
                แจกแจงรายการต้นทุน (BOM) และใบเสนอราคา
              </span>
            </button>

            <button
              onClick={() => toggleCheck('communityConsent')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-obsidian-900/50 hover:bg-obsidian-900 border border-white/5 text-left transition-all"
            >
              {confirmations.communityConsent ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={confirmations.communityConsent ? 'text-slate-200' : 'text-slate-400'}>
                บันทึกความยินยอมประชาคมตลาด (Consent Record)
              </span>
            </button>

            <button
              onClick={() => toggleCheck('riskMitigation')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-obsidian-900/50 hover:bg-obsidian-900 border border-white/5 text-left transition-all"
            >
              {confirmations.riskMitigation ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={confirmations.riskMitigation ? 'text-slate-200' : 'text-slate-400'}>
                กำหนดผู้รับผิดชอบการบำรุงรักษาหน้างานต่อเนื่อง
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleCompose}
          className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-cyan"
        >
          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isComposed ? 'อัปเดตร่างข้อเสนอแล้ว' : 'สร้างร่างข้อเสนอ (Compose)'}</span>
        </button>

        <button
          onClick={onOpenProposalModal}
          className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>เปิดดูฉบับเต็ม</span>
        </button>
      </div>

    </div>
  );
};
