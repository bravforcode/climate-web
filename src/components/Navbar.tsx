import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Wifi, 
  WifiOff, 
  ChevronDown, 
  UserCheck, 
  Layers, 
  FileText, 
  Radio, 
  Server,
  Coins,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { UserRole, LineUserProfile } from '../types';
import { ROLE_CONFIGS } from '../data/mockData';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  offlineQueueCount: number;
  onOpenProposalModal: () => void;
  lineUser?: LineUserProfile | null;
  onOpenLineLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  isOnline,
  onToggleOnline,
  offlineQueueCount,
  onOpenProposalModal,
  lineUser,
  onOpenLineLoginModal,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);
  const [healthModalOpen, setHealthModalOpen] = React.useState(false);
  const currentConfig = ROLE_CONFIGS[currentRole];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="glass-pill rounded-2xl px-4 py-3 sm:px-6 flex items-center justify-between shadow-2xl border border-white/10">
        
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-climate-950/80 border border-climate-500/30 text-climate-400 shadow-glow-emerald">
            <Radio className="w-5 h-5 animate-pulse text-climate-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-climate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-climate-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base sm:text-lg">
                Climate Action <span className="text-climate-400 font-mono">OS</span>
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300">
                v2.4-pilot
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              ระบบปฏิบัติการสภาพภูมิอากาศชุมชน · ตลาดผดุงกรุงเกษม
            </p>
          </div>
        </div>

        {/* Quick Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
          <a href="#risk-module" className="hover:text-climate-400 transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-climate-400" />
            <span>โมดูลปฏิบัติการ</span>
          </a>
          <a href="#prioritization" className="hover:text-climate-400 transition-colors flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>สูตรจัดลำดับ (P_i)</span>
          </a>
          <a href="#payment-billing-module" className="hover:text-climate-400 transition-colors flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>ร่วมสมทบทุน (ลดหย่อนภาษี 2x)</span>
          </a>
          <a href="#telemetry" className="hover:text-climate-400 transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>MRV สด & บัญชี</span>
          </a>
        </nav>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Online/Offline Simulator Toggle */}
          <button
            onClick={onToggleOnline}
            title={isOnline ? 'สถานะ: เชื่อมต่อเซิร์ฟเวอร์หลัก (คลิกเพื่อจำลองโหมด Offline หน้างาน)' : 'สถานะ: จำลองออฟไลน์หน้างาน (คลิกเพื่อ Sync ข้อมูลกลับ)'}
            className={`relative px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              isOnline 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40' 
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">OFFLINE</span>
                {offlineQueueCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-obsidian-950 rounded-full font-bold text-[10px]">
                    {offlineQueueCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* System Health Dropdown / Modal trigger */}
          <button
            onClick={() => setHealthModalOpen(!healthModalOpen)}
            className="p-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="ตรวจสอบสถานะ Data Source API & System Health"
          >
            <Server className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Proposal Preview Action */}
          <button
            onClick={onOpenProposalModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-climate-500/10 hover:bg-climate-500/20 border border-climate-500/30 text-climate-300 text-xs font-medium transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ข้อเสนอโครงการ</span>
          </button>

          {/* LINE Login / Profile Trigger Button */}
          {onOpenLineLoginModal && (
            <button
              onClick={onOpenLineLoginModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex-shrink-0 ${
                lineUser 
                  ? 'bg-[#06C755]/20 border border-[#06C755]/50 text-[#34d399] shadow-glow-emerald hover:bg-[#06C755]/30' 
                  : 'bg-[#06C755] hover:bg-[#05b34c] text-obsidian-950 font-bold shadow-md shadow-[#06C755]/25'
              }`}
              title={lineUser ? `เข้าสู่ระบบในชื่อ LINE: ${lineUser.displayName}` : 'เข้าสู่ระบบด้วย LINE (LINE Login)'}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${lineUser ? 'fill-[#06C755] text-[#06C755]' : 'fill-obsidian-950 text-obsidian-950'}`} />
              <span className="max-w-[80px] sm:max-w-[100px] truncate">
                {lineUser ? lineUser.displayName.split(' ')[0] : 'LINE Login'}
              </span>
              {lineUser && (
                <span className="w-2 h-2 rounded-full bg-[#06C755] animate-pulse ml-0.5" />
              )}
            </button>
          )}

          {/* Role Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${currentConfig.badgeColor}`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="font-semibold max-w-[90px] sm:max-w-[120px] truncate">
                {currentConfig.titleTh.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl glass-panel p-2 shadow-2xl z-50 border border-white/15 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>สลับบทบาทผู้ใช้ (RLS Context)</span>
                  {lineUser && (
                    <span className="text-[10px] text-[#34d399] font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                      LINE LINKED
                    </span>
                  )}
                </div>
                <div className="py-1 space-y-1">
                  {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((roleKey) => {
                    const r = ROLE_CONFIGS[roleKey];
                    const isSelected = currentRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => {
                          onSelectRole(roleKey);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex flex-col gap-0.5 ${
                          isSelected
                            ? 'bg-climate-500/20 text-climate-300 border border-climate-500/30'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{r.titleTh}</span>
                          <span className="text-[10px] font-mono opacity-70 uppercase">
                            {r.privilegeLevel}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {r.descriptionTh}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* System Health Diagnostics Popup */}
      {healthModalOpen && (
        <div className="absolute right-4 mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl border border-cyan-500/20 z-50">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white font-mono">SYSTEM HEALTH & DATA INGESTION</span>
            </div>
            <button 
              onClick={() => setHealthModalOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="mt-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-obsidian-900 border border-white/5">
              <div>
                <p className="font-medium text-slate-200">GISTDA Flood API (Disaster)</p>
                <p className="text-[10px] text-slate-400 font-mono">Sync: 06:00 Daily Cron · 200 OK</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-obsidian-900 border border-white/5">
              <div>
                <p className="font-medium text-slate-200">TMD TMDAPI (กรมอุตุนิยมวิทยา)</p>
                <p className="text-[10px] text-slate-400 font-mono">Attribution Required · License Checked</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CONNECTED
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-obsidian-900 border border-white/5">
              <div>
                <p className="font-medium text-slate-200">Supabase PostGIS & RLS Engine</p>
                <p className="text-[10px] text-slate-400 font-mono">Spatial Indexing · Append-only Triggers</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                HEALTHY
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-obsidian-900 border border-white/5">
              <div>
                <p className="font-medium text-slate-200">k-Anonymity Privacy Engine</p>
                <p className="text-[10px] text-slate-400 font-mono">Threshold k ≥ 10 Suppression Active</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ENFORCED
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
