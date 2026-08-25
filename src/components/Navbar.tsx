import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Wifi, 
  WifiOff, 
  ChevronDown, 
  Layers, 
  FileText, 
  Radio, 
  Server,
  Coins,
  MessageSquare,
  Shield,
  Lock,
  Database,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { UserRole, LineUserProfile } from '../types';
import { ROLE_CONFIGS } from '../data/mockData';

export type WorkspaceStage = 'assess' | 'compose' | 'mrv';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeWorkspace: WorkspaceStage;
  onSelectWorkspace: (stage: WorkspaceStage) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  offlineQueueCount: number;
  onOpenProposalModal: () => void;
  onOpenSponsorModal?: () => void;
  lineUser?: LineUserProfile | null;
  onOpenLineLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeWorkspace,
  onSelectWorkspace,
  isOnline,
  onToggleOnline,
  offlineQueueCount,
  onOpenProposalModal,
  onOpenSponsorModal,
  lineUser,
  onOpenLineLoginModal,
}) => {
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentConfig = ROLE_CONFIGS[currentRole];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setProfilePopoverOpen(false);
      }
    };
    if (profilePopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profilePopoverOpen]);

  const stages: { id: WorkspaceStage; labelTh: string; labelEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'assess', labelTh: '1. สำรวจ & วางแผน', labelEn: 'Assess', icon: Compass },
    { id: 'compose', labelTh: '2. ร่างโครงการ & ทุน', labelEn: 'Compose', icon: Layers },
    { id: 'mrv', labelTh: '3. ปฏิบัติการ & บัญชี', labelEn: 'MRV & Ledger', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="glass-pill rounded-2xl px-4 py-3 sm:px-6 flex items-center justify-between shadow-card border border-slate-200">

        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-climate-50 border border-climate-200 text-climate-600">
            <Radio className="w-5 h-5 animate-pulse text-climate-600" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-climate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-climate-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-base sm:text-lg">
                Climate Action <span className="text-climate-600 font-mono">OS</span>
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-500">
                v2.4-pilot
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              ระบบปฏิบัติการสภาพภูมิอากาศชุมชน · ตลาดผดุงกรุงเกษม
            </p>
          </div>
        </div>

        {/* 3-Stage Workspace Switcher (Progressive Disclosure) */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeWorkspace === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => onSelectWorkspace(stage.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-1 ${
                  isActive
                    ? 'bg-white text-climate-700 border border-climate-200 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/70 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-climate-600' : 'text-slate-400'}`} />
                <span>{stage.labelTh}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Online/Offline Simulator Toggle */}
          <button
            onClick={onToggleOnline}
            title={isOnline ? 'สถานะ: เชื่อมต่อเซิร์ฟเวอร์หลัก (คลิกเพื่อจำลองโหมด Offline หน้างาน)' : 'สถานะ: จำลองออฟไลน์หน้างาน (คลิกเพื่อ Sync ข้อมูลกลับ)'}
            className={`relative px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-1 ${
              isOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 animate-pulse'
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
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full font-bold text-[10px]">
                    {offlineQueueCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* System Health Dropdown / Modal trigger */}
          {/* CSR Sponsorship Trigger */}
          {onOpenSponsorModal && (
            <button
              onClick={onOpenSponsorModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold transition-all min-h-[36px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-1"
              title="ร่วมสมทบทุนโครงการปรับตัวสภาพภูมิอากาศชุมชน (ลดหย่อนภาษี 2 เท่า)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">สมทบทุน 2x</span>
            </button>
          )}

          {/* Proposal Preview Action */}
          <button
            onClick={onOpenProposalModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium transition-all min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-1"
          >
            <FileText className="w-3.5 h-3.5 text-climate-600" />
            <span>ข้อเสนอโครงการ</span>
          </button>

          {/* Unified Profile & Role Popover Trigger */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-1 ${
                profilePopoverOpen
                  ? 'bg-slate-100 border-climate-300 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  currentRole === 'community_member' ? 'bg-emerald-400' :
                  currentRole === 'operator' ? 'bg-cyan-400' :
                  currentRole === 'local_officer' ? 'bg-blue-400' :
                  currentRole === 'funder' ? 'bg-purple-400' :
                  currentRole === 'admin' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
                <span className="font-semibold">{currentConfig.titleTh.split(' ')[0]}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profilePopoverOpen ? 'rotate-180 text-climate-400' : ''}`} />
            </button>

            {/* Unified Role Context & Identity Popover */}
            {profilePopoverOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-card-lg p-4 text-left z-50 animate-in fade-in duration-150">

                {/* Popover Header with Current Identity */}
                <div className="pb-3 border-b border-slate-100 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${currentConfig.badgeColor}`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">ACTIVE ROLE</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{currentConfig.titleTh}</h4>
                      <p className="text-[11px] text-slate-500">{currentConfig.titleEn}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfilePopoverOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* LINE Account Link Status */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#06C755]" />
                    <div className="text-xs">
                      <span className="text-slate-500 block text-[10px] font-mono">LINE IDENTITY</span>
                      <span className="text-slate-900 font-medium">
                        {lineUser ? lineUser.displayName : 'ยังไม่ได้เชื่อมต่อ'}
                      </span>
                    </div>
                  </div>
                  {onOpenLineLoginModal && (
                    <button
                      onClick={() => {
                        setProfilePopoverOpen(false);
                        onOpenLineLoginModal();
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#06C755]/10 text-[#06a94a] hover:bg-[#06C755]/15 border border-[#06C755]/25 transition-colors"
                    >
                      {lineUser ? 'สลับบัญชี' : 'เชื่อมต่อ LINE'}
                    </button>
                  )}
                </div>

                {/* Quick Role Switcher Grid */}
                <div className="mt-3.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
                    สลับบทบาทการใช้งาน (Switch Role):
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((rKey) => {
                      const r = ROLE_CONFIGS[rKey];
                      const isCur = currentRole === rKey;
                      return (
                        <button
                          key={rKey}
                          onClick={() => {
                            onSelectRole(rKey);
                            setProfilePopoverOpen(false);
                          }}
                          className={`p-2 rounded-xl text-xs text-left transition-all border ${
                            isCur
                              ? 'bg-climate-50 border-climate-200 text-climate-700 font-bold'
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <span className="block truncate">{r.titleTh.split(' ')[0]}</span>
                          <span className="text-[10px] font-mono text-slate-400 block truncate">{r.titleEn.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active RLS Rules Summary */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">สิทธิ์การเข้าถึงข้อมูล (RLS Policies):</span>
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-600 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Lock className="w-3 h-3 text-cyan-600 flex-shrink-0" />
                      <span>{currentConfig.rlsConstraints.vulnerability}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Database className="w-3 h-3 text-amber-600 flex-shrink-0" />
                      <span>{currentConfig.rlsConstraints.ledger}</span>
                    </div>
                  </div>
                </div>

                {/* System Diagnostics Trigger */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => {
                      setProfilePopoverOpen(false);
                      setHealthModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-700 transition-colors"
                  >
                    <Server className="w-3.5 h-3.5 text-cyan-600" />
                    <span>ตรวจสอบสถานะ API & Server</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* System Health Diagnostic Modal */}
      {healthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 shadow-card-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">System Ingestion & Health</h3>
              </div>
              <button
                onClick={() => setHealthModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">GISTDA Inundation Radar</span>
                  <span className="text-slate-500 text-[11px]">Sentinel-1 SAR API Stream</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ONLINE (200 OK)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">TMD Heat Index Feed</span>
                  <span className="text-slate-500 text-[11px]">Station #48455 (BMA Station)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ONLINE (200 OK)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Immutable MRV Ledger</span>
                  <span className="text-slate-500 text-[11px]">In-Memory Reactive DB</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  VERIFIED
                </span>
              </div>
            </div>

            <button
              onClick={() => setHealthModalOpen(false)}
              className="mt-5 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-1"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
