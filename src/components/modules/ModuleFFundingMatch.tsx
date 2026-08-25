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
  Calendar,
  Search
} from 'lucide-react';
import { FundingCall, UserRole } from '../../types';
import { MOCK_FUNDING_CALLS } from '../../data/mockData';
import { formatCurrency } from '../../utils/crypto';

interface ModuleFProps {
  currentRole: UserRole;
}

export const ModuleFFundingMatch: React.FC<ModuleFProps> = ({ currentRole }) => {
  const [fundingCalls, setFundingCalls] = useState<FundingCall[]>(MOCK_FUNDING_CALLS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // RLS rule: Community members only see confirmed matches!
  const isCommunityRole = currentRole === 'community_member';
  const roleFilteredCalls = isCommunityRole
    ? fundingCalls.filter((c) => c.isHumanConfirmed)
    : fundingCalls;

  const visibleCalls = roleFilteredCalls.filter((call) => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return call.funderNameTh.toLowerCase().includes(q) ||
      call.funderNameEn.toLowerCase().includes(q) ||
      call.thematicFit.some((t) => t.toLowerCase().includes(q)) ||
      call.eligibilityNotesTh.toLowerCase().includes(q);
  });

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
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between h-full relative overflow-hidden">

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="font-mono text-xs text-purple-600 font-bold uppercase tracking-wider">
              MODULE F · FUNDING MATCH DIRECTORY
            </span>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200">
            HUMAN-VERIFIED ONLY
          </span>
        </div>

        {/* Search Bar & RLS Info Banner */}
        <div className="mt-3.5 space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาแหล่งทุน (เช่น สสส., BMA, กองทุนสิ่งแวดล้อม)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-climate-500 focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              {isCommunityRole ? (
                <span className="text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>RLS กรอง: แสดงเฉพาะ 2 แหล่งทุนที่ผ่านการตรวจรับรองแล้ว</span>
                </span>
              ) : (
                <span className="text-cyan-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Operator View: แสดง 3 แหล่งทุน (รวมรายการที่ยังรอยืนยัน)</span>
                </span>
              )}
            </span>
            <span className="font-mono text-slate-500 text-xs">
              {visibleCalls.length} รายการ
            </span>
          </div>
        </div>

        {/* Funding Calls List */}
        <div className="mt-3.5 space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {visibleCalls.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              ไม่พบแหล่งทุนที่ตรงกับการค้นหา
            </div>
          ) : (
            visibleCalls.map((call) => (
              <div
                key={call.id}
                className={`p-4 rounded-2xl border transition-all ${
                  call.isHumanConfirmed
                    ? 'bg-slate-50 border-slate-200 hover:border-purple-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Match {call.matchScore}%
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {call.funderNameTh}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {call.eligibilityNotesTh}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-slate-500 block uppercase">วงเงินสูงสุด</span>
                    <span className="text-sm font-bold font-mono text-emerald-600">
                      {formatCurrency(call.maxAmountThb)}
                    </span>
                  </div>
                </div>

                {/* Thematic Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {call.thematicFit.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Verification Stamp & Operator Controls */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500 font-mono text-xs">
                      ปิดรับ: {call.applicationDeadline}
                    </span>
                  </div>

                  {/* Verification Badge / Button */}
                  {isOperatorOrAdmin ? (
                    <button
                      onClick={() => handleToggleVerify(call.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                        call.isHumanConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-300 animate-pulse'
                      }`}
                    >
                      {call.isHumanConfirmed ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ยืนยันแล้วโดย {call.confirmedBy?.split(' ')[0]}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>คลิกเพื่อยืนยัน (Confirm Match)</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-mono text-xs flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>ยืนยันแล้ว</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Footer Rule Callout */}
      <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Curated Directory (ไม่ใช้ Automated Scraper ป้องกัน Mismatch)</span>
        <span className="font-mono text-purple-600 text-[11px]">PostgreSQL RLS Enforced</span>
      </div>

    </div>
  );
};
