import React from 'react';
import { Shield, Eye, Lock, Database, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { UserRole, LineUserProfile } from '../types';
import { ROLE_CONFIGS } from '../data/mockData';

interface RoleContextBarProps {
  currentRole: UserRole;
  onQuickSwitch: (role: UserRole) => void;
  lineUser?: LineUserProfile | null;
  onOpenLineLogin?: () => void;
}

export const RoleContextBar: React.FC<RoleContextBarProps> = ({ 
  currentRole, 
  onQuickSwitch, 
  lineUser,
  onOpenLineLogin,
}) => {
  const config = ROLE_CONFIGS[currentRole];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div className="rounded-2xl p-4 sm:p-5 glass-panel border border-white/10 relative overflow-hidden bg-gradient-to-r from-obsidian-900/90 via-obsidian-850/80 to-obsidian-900/90">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-climate-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Active Role Info & LINE profile status */}
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl border flex-shrink-0 ${config.badgeColor}`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400 uppercase">
                  ACTIVE ROLE CONTEXT:
                </span>
                <span className="text-sm font-bold text-white tracking-wide">
                  {config.titleTh}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-slate-300">
                  {config.titleEn}
                </span>

                {lineUser ? (
                  <button
                    onClick={onOpenLineLogin}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#06C755]/15 text-[#34d399] border border-[#06C755]/30 hover:bg-[#06C755]/25 transition-colors"
                    title="LINE Identity Linked"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06C755] animate-pulse" />
                    <span>LINE: {lineUser.displayName}</span>
                  </button>
                ) : (
                  onOpenLineLogin && (
                    <button
                      onClick={onOpenLineLogin}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 text-[#06C755]" />
                      <span>Connect LINE</span>
                    </button>
                  )
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {config.descriptionTh}
              </p>
            </div>
          </div>

          {/* Role Quick Switch Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">
              สลับมุมมอง:
            </span>
            {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((roleKey) => {
              const r = ROLE_CONFIGS[roleKey];
              const isCurrent = currentRole === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => onQuickSwitch(roleKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-climate-500/20 text-climate-300 border border-climate-500/40 font-semibold shadow-glow-emerald'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {r.titleTh.split(' ')[0]}
                </button>
              );
            })}
          </div>

        </div>

        {/* Row Level Security Constraints Pill Grid */}
        <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          
          <div className="flex items-start gap-2 p-2 rounded-xl bg-obsidian-950/60 border border-white/5">
            <Eye className="w-3.5 h-3.5 text-climate-400 mt-0.5 flex-shrink-0" />
            <div className="text-[11px]">
              <span className="font-mono text-slate-400 block text-[10px]">RLS / FUNDING MATCH</span>
              <span className="text-slate-200">{config.rlsConstraints.fundingMatch}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-xl bg-obsidian-950/60 border border-white/5">
            <Lock className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="text-[11px]">
              <span className="font-mono text-slate-400 block text-[10px]">RLS / VULNERABILITY (k≥10)</span>
              <span className="text-slate-200">{config.rlsConstraints.vulnerability}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-xl bg-obsidian-950/60 border border-white/5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-[11px]">
              <span className="font-mono text-slate-400 block text-[10px]">RLS / MRV & EVIDENCE</span>
              <span className="text-slate-200">{config.rlsConstraints.evidence}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-xl bg-obsidian-950/60 border border-white/5">
            <Database className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-[11px]">
              <span className="font-mono text-slate-400 block text-[10px]">RLS / APPEND-ONLY LEDGER</span>
              <span className="text-slate-200">{config.rlsConstraints.ledger}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
