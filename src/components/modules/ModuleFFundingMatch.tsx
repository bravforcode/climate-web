import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  AlertTriangle,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { FundingCall, UserRole } from '../../types';
import { MOCK_FUNDING_CALLS } from '../../data/mockData';
import { formatCurrency } from '../../utils/crypto';

interface ModuleFProps {
  currentRole: UserRole;
}

export const ModuleFFundingMatch: React.FC<ModuleFProps> = ({ currentRole }) => {
  const [fundingCalls, setFundingCalls] = useState<FundingCall[]>(MOCK_FUNDING_CALLS);

  // RLS rule: Community members only see confirmed matches!
  const isCommunityRole = currentRole === 'community_member';
  const visibleCalls = isCommunityRole
    ? fundingCalls.filter((c) => c.isHumanConfirmed)
    : fundingCalls;

  const handleToggleVerify = (callId: string) => {
    setFundingCalls((prev) =>
      prev.map((item) => {
        if (item.id === callId) {
          const nextState = !item.isHumanConfirmed;
          return {
            ...item,
            isHumanConfirmed: nextState,
            confirmedBy: nextState ? 'คุณ (Active Operator)' : undefined,
            confirmedAt: nextState ? new Date().toISOString() : undefined,
          };
        }
        return item;
      })
    );
  };

  const isOperatorOrAdmin = ['operator', 'admin', 'funder'].includes(currentRole);

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider">
              MODULE F · FUNDING MATCH DIRECTORY
            </span>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
            HUMAN-VERIFIED ONLY
          </span>
        </div>

        {/* Info Banner for Community vs Operator RLS View */}
        <div className="mt-3 p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5 flex items-center justify-between text-[11px]">
          <span className="text-slate-300">
            {isCommunityRole ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                RLS กรอง: แสดงเฉพาะ 2 แหล่งทุนที่ผ่านการตรวจรับรองแล้ว
              </span>
            ) : (
              <span className="text-cyan-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Operator View: แสดง 3 แหล่งทุน (รวมรายการที่ยังรอยืนยัน)
              </span>
            )}
          </span>
          <span className="font-mono text-slate-400 text-[10px]">
            {visibleCalls.length} รายการ
          </span>
        </div>

        {/* Funding Calls List */}
        <div className="mt-3.5 space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {visibleCalls.map((call) => (
            <div
              key={call.id}
              className={`p-4 rounded-2xl border transition-all ${
                call.isHumanConfirmed
                  ? 'bg-obsidian-900/70 border-white/10 hover:border-purple-500/30'
                  : 'bg-amber-950/20 border-amber-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      Match {call.matchScore}%
                    </span>
                    <span className="text-xs font-bold text-white">
                      {call.funderNameTh}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5">
                    {call.eligibilityNotesTh}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">วงเงินสูงสุด</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {formatCurrency(call.maxAmountThb)}
                  </span>
                </div>
              </div>

              {/* Thematic Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {call.thematicFit.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/5"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Verification Stamp & Operator Controls */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400 font-mono text-[10px]">
                    ปิดรับ: {call.applicationDeadline}
                  </span>
                </div>

                {/* Verification Badge / Button */}
                {isOperatorOrAdmin ? (
                  <button
                    onClick={() => handleToggleVerify(call.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                      call.isHumanConfirmed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    }`}
                  >
                    {call.isHumanConfirmed ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ยืนยันแล้วโดย {call.confirmedBy?.split(' ')[0]}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>คลิกเพื่อยืนยัน (Confirm Match)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ยืนยันแล้ว
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Footer Rule Callout */}
      <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Curated Directory (ไม่ใช้ Automated Scraper ป้องกัน Mismatch)</span>
        <span className="font-mono text-purple-400">PostgreSQL RLS Enforced</span>
      </div>

    </div>
  );
};
