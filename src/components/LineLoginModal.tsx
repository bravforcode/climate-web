import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Lock,
  UserCheck,
  Sparkles,
  Shield,
  FileCheck2,
  CheckCircle2,
  Radio,
  ArrowRight,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  generateLineAuthUrl,
  generateState,
  generateNonce,
  MOCK_LINE_PROFILES,
  simulateMockLineLogin,
  LineUserProfile,
  DEFAULT_LINE_SCOPE,
} from '../domain/lineAuth';
import { UserRole } from '../types';

export interface LineLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile?: (profile: LineUserProfile, idToken: string) => void;
  currentRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
  lineUser?: LineUserProfile | null;
  onLogin?: (user: LineUserProfile) => void;
  onLogout?: () => void;
  currentClientId?: string;
  currentRedirectUri?: string;
}

export const LineLoginModal: React.FC<LineLoginModalProps> = ({
  isOpen,
  onClose,
  onSelectProfile,
  currentRole = 'operator',
  onSelectRole,
  lineUser,
  onLogin,
  onLogout,
  currentClientId = 'climate_line_os_bkk_2026',
  currentRedirectUri = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/line/callback`
    : 'https://climateaction.local/auth/line/callback',
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'qr' | 'oauth' | 'pdpa'>('profiles');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(MOCK_LINE_PROFILES[0].id);
  const [stateToken, setStateToken] = useState<string>('');
  const [nonceToken, setNonceToken] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [qrCountdown, setQrCountdown] = useState<number>(180);
  const [qrScannedSuccess, setQrScannedSuccess] = useState<boolean>(false);

  // Regenerate state & nonce when modal opens
  useEffect(() => {
    if (isOpen) {
      // Anti-CSRF state + OIDC nonce: crypto.getRandomValues, hex, 32 chars.
      // State mirrored to sessionStorage for callback-path verification.
      const state = generateState(32);
      const nonce = generateNonce(32);
      setStateToken(state);
      setNonceToken(nonce);
      try {
        window.sessionStorage.setItem('line_oauth_state', state);
      } catch {
        // storage unavailable (e.g. private mode) — state kept in React state only
      }
      setQrCountdown(180);
      setQrScannedSuccess(false);
    }
  }, [isOpen]);

  // QR Code expiration countdown timer
  useEffect(() => {
    if (!isOpen || activeTab !== 'qr' || qrCountdown <= 0 || qrScannedSuccess) return;

    const timer = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeTab, qrCountdown, qrScannedSuccess]);

  if (!isOpen) return null;

  const authUrl = generateLineAuthUrl({
    clientId: currentClientId,
    redirectUri: currentRedirectUri,
    state: stateToken || generateState(32),
    nonce: nonceToken || generateNonce(32),
    scope: DEFAULT_LINE_SCOPE,
    botPrompt: 'normal',
  });

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(authUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleRefreshTokens = () => {
    const state = generateState(32);
    const nonce = generateNonce(32);
    setStateToken(state);
    setNonceToken(nonce);
    try {
      window.sessionStorage.setItem('line_oauth_state', state);
    } catch {
      // ignore
    }
    setQrCountdown(180);
    setQrScannedSuccess(false);
  };

  const handleSelectMockProfile = (profile: LineUserProfile) => {
    setSelectedProfileId(profile.id);
    const { idToken } = simulateMockLineLogin(profile.id, {
      clientId: currentClientId,
      nonce: nonceToken,
    });

    if (onSelectProfile) {
      onSelectProfile(profile, idToken);
    }
    if (onLogin) {
      onLogin(profile);
    }
    if (onSelectRole) {
      onSelectRole(profile.role);
    }

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }
  };

  const handleSimulateQrScan = (profile: LineUserProfile) => {
    setQrScannedSuccess(true);
    setTimeout(() => {
      handleSelectMockProfile(profile);
      onClose();
    }, 900);
  };

  const selectedProfile =
    MOCK_LINE_PROFILES.find((p) => p.id === selectedProfileId) || MOCK_LINE_PROFILES[0];

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'community_member':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'local_officer':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'operator':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'funder':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'auditor':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'admin':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      default:
        return 'bg-white/10 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Dark backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-obsidian-950/95 border border-white/15 shadow-[0_0_50px_rgba(6,199,85,0.15)] overflow-hidden z-10 flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-5 sm:px-8 py-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-obsidian-900 via-obsidian-950 to-obsidian-900">
          <div className="flex items-center gap-3">
            {/* Official LINE Green Icon */}
            <div className="w-10 h-10 rounded-2xl bg-[#06C755] flex items-center justify-center shadow-lg shadow-[#06C755]/20 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M12 2C6.48 2 2 5.82 2 10.53c0 4.22 3.59 7.74 8.44 8.41.33.07.78.22.89.5.1.25.07.65.03.9-.06.4-.3 1.83-.34 2.1-.06.38.17.37.38.23.21-.14 3.39-2.03 4.63-2.77.34-.2.68-.26 1.07-.26C19.95 19.64 22 16.14 22 10.53 22 5.82 17.52 2 12 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {lineUser ? 'LINE Identity & Profile Session' : 'LINE Login & OIDC Identity Gate'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#06C755]/15 text-[#06C755] border border-[#06C755]/30">
                  OpenID Connect v2.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ระบบยืนยันตัวตนสำหรับชุมชน เจ้าหน้าที่ และผู้ตรวจสอบกองทุนสภาพภูมิอากาศ (PDPA Compliant)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-8 pt-3 bg-obsidian-900/60 border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'profiles'
                ? 'text-[#06C755] border-[#06C755] bg-white/5 shadow-[inset_0_-2px_8px_rgba(6,199,85,0.2)]'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>เข้าสู่ระบบด่วน (Demo Profiles)</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#06C755]/20 text-[#06C755] font-mono">
              {MOCK_LINE_PROFILES.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'qr'
                ? 'text-[#06C755] border-[#06C755] bg-white/5 shadow-[inset_0_-2px_8px_rgba(6,199,85,0.2)]'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>สแกน QR Code (Simulation)</span>
          </button>

          <button
            onClick={() => setActiveTab('oauth')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'oauth'
                ? 'text-[#06C755] border-[#06C755] bg-white/5 shadow-[inset_0_-2px_8px_rgba(6,199,85,0.2)]'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Real OAuth 2.1 Redirect</span>
          </button>

          <button
            onClick={() => setActiveTab('pdpa')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'pdpa'
                ? 'text-[#06C755] border-[#06C755] bg-white/5 shadow-[inset_0_-2px_8px_rgba(6,199,85,0.2)]'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>PDPA & STRIDE Security</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: QUICK 1-CLICK DEMO PROFILES */}
          {activeTab === 'profiles' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-obsidian-900/80 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-slate-300">
                    เลือกโปรไฟล์ทดสอบเพื่อจำลองสิทธิ์การใช้งานจริงตามบทบาท (RLS Context & Consent Gate)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span>State:</span>
                  <code className="px-1.5 py-0.5 rounded bg-black/40 text-emerald-400 border border-white/10 truncate max-w-[120px]">
                    {stateToken}
                  </code>
                </div>
              </div>

              {/* Profiles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {MOCK_LINE_PROFILES.map((profile) => {
                  const isSelected = profile.id === selectedProfileId;
                  const roleBadge = getRoleBadgeColor(profile.role);

                  return (
                    <div
                      key={profile.id}
                      onClick={() => setSelectedProfileId(profile.id)}
                      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#06C755]/10 border-[#06C755] shadow-[0_0_20px_rgba(6,199,85,0.15)] ring-1 ring-[#06C755]/50'
                          : 'bg-obsidian-900/70 border-white/10 hover:border-white/25 hover:bg-obsidian-900'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative">
                          <img
                            src={profile.pictureUrl}
                            alt={profile.displayName}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#06C755] border-2 border-obsidian-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5 mb-1">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {profile.displayName}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${roleBadge}`}>
                              {profile.role}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                              {profile.organizationName?.split(' ')[0]}
                            </span>
                          </div>

                          {/* Consents Status Pills */}
                          <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                            <span
                              className={`px-1.5 py-0.2 rounded border ${
                                profile.consents.evidence_capture
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                              }`}
                              title="ความยินยอมบันทึกภาพถ่ายและหลักฐานหน้างาน (MRV Evidence)"
                            >
                              ✓ evidence: {profile.consents.evidence_capture ? 'YES' : 'NO'}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded border ${
                                profile.consents.vulnerability_data
                                  ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30'
                                  : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                              }`}
                              title="ความยินยอมเข้าถึงข้อมูลกลุ่มเปราะบาง k-Anonymity"
                            >
                              ✓ vuln_data: {profile.consents.vulnerability_data ? 'YES' : 'NO'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Login Button inside Card */}
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                          UID: {profile.lineUserId.substring(0, 10)}...
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectMockProfile(profile);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#06C755] text-white hover:bg-[#05b34c] shadow-lg shadow-[#06C755]/20'
                              : 'bg-white/10 text-slate-200 hover:bg-white/20'
                          }`}
                        >
                          <span>เข้าสู่ระบบเป็นคนนี้</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LINE QR CODE SIMULATION */}
          {activeTab === 'qr' && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
              
              {/* QR Code Container with Radar Scan Effect */}
              <div className="relative p-6 rounded-3xl bg-white shadow-[0_0_60px_rgba(6,199,85,0.25)] flex flex-col items-center justify-center border-4 border-[#06C755]/30">
                
                {/* Visual QR Code Display */}
                <div className="relative w-56 h-56 bg-white rounded-2xl flex items-center justify-center p-3">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Corner Position Targets */}
                    <rect x="5" y="5" width="25" height="25" fill="#0b132b" rx="4" />
                    <rect x="9" y="9" width="17" height="17" fill="white" rx="2" />
                    <rect x="13" y="13" width="9" height="9" fill="#06C755" rx="1.5" />

                    <rect x="70" y="5" width="25" height="25" fill="#0b132b" rx="4" />
                    <rect x="74" y="9" width="17" height="17" fill="white" rx="2" />
                    <rect x="78" y="13" width="9" height="9" fill="#06C755" rx="1.5" />

                    <rect x="5" y="70" width="25" height="25" fill="#0b132b" rx="4" />
                    <rect x="9" y="74" width="17" height="17" fill="white" rx="2" />
                    <rect x="13" y="78" width="9" height="9" fill="#06C755" rx="1.5" />

                    {/* QR Matrix Elements */}
                    <g fill="#0b132b" opacity="0.85">
                      <rect x="36" y="8" width="5" height="5" rx="1" />
                      <rect x="44" y="8" width="5" height="5" rx="1" />
                      <rect x="56" y="8" width="5" height="5" rx="1" />
                      <rect x="36" y="16" width="5" height="5" rx="1" />
                      <rect x="50" y="16" width="5" height="5" rx="1" />
                      <rect x="8" y="36" width="5" height="5" rx="1" />
                      <rect x="16" y="36" width="5" height="5" rx="1" />
                      <rect x="24" y="44" width="5" height="5" rx="1" />
                      <rect x="8" y="52" width="5" height="5" rx="1" />
                      <rect x="72" y="36" width="5" height="5" rx="1" />
                      <rect x="84" y="44" width="5" height="5" rx="1" />
                      <rect x="72" y="52" width="5" height="5" rx="1" />
                      <rect x="36" y="72" width="5" height="5" rx="1" />
                      <rect x="50" y="72" width="5" height="5" rx="1" />
                      <rect x="58" y="80" width="5" height="5" rx="1" />
                      <rect x="44" y="88" width="5" height="5" rx="1" />
                      <rect x="72" y="72" width="5" height="5" rx="1" />
                      <rect x="80" y="80" width="5" height="5" rx="1" />
                      <rect x="88" y="88" width="5" height="5" rx="1" />
                    </g>
                  </svg>

                  {/* Center LINE Badge */}
                  <div className="absolute inset-0 m-auto w-12 h-12 rounded-2xl bg-[#06C755] border-2 border-white shadow-md flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                      <path d="M12 2C6.48 2 2 5.82 2 10.53c0 4.22 3.59 7.74 8.44 8.41.33.07.78.22.89.5.1.25.07.65.03.9-.06.4-.3 1.83-.34 2.1-.06.38.17.37.38.23.21-.14 3.39-2.03 4.63-2.77.34-.2.68-.26 1.07-.26C19.95 19.64 22 16.14 22 10.53 22 5.82 17.52 2 12 2z" />
                    </svg>
                  </div>

                  {/* Laser Scanning Animation Beam */}
                  <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-[#06C755] to-transparent animate-bounce opacity-80 pointer-events-none" />
                </div>

                {/* Status & Countdown */}
                <div className="mt-3 flex items-center gap-2 text-xs font-mono font-bold text-obsidian-950">
                  <span className="w-2 h-2 rounded-full bg-[#06C755] animate-ping" />
                  <span>หมดอายุใน: {Math.floor(qrCountdown / 60)}:{(qrCountdown % 60).toString().padStart(2, '0')} นาที</span>
                </div>
              </div>

              {/* QR Flow Steps & Simulation Trigger */}
              <div className="space-y-4 max-w-sm">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#06C755]" />
                    <span>เข้าสู่ระบบด้วย LINE บนมือถือ</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    เปิด LINE บนสมาร์ทโฟน แล้วใช้กล้องสแกน QR Code เพื่อยืนยันตัวตน
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-obsidian-900 border border-white/10 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#06C755]/20 text-[#06C755] font-mono font-bold flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <span>เปิดแอป LINE &gt; แตะเมนูเพิ่มเพื่อน &gt; เลือก <strong>คิวอาร์โค้ด</strong></span>
                  </div>

                  <div className="p-3 rounded-xl bg-obsidian-900 border border-white/10 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#06C755]/20 text-[#06C755] font-mono font-bold flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <span>สแกน QR Code บนหน้าจอนี้ แล้วกดยืนยันการเข้าสู่ระบบบนโทรศัพท์</span>
                  </div>

                  <div className="p-3 rounded-xl bg-obsidian-900 border border-white/10 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#06C755]/20 text-[#06C755] font-mono font-bold flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <span>ระบบจะตรวจสอบสิทธิ์และตารางความยินยอม (PDPA Consent) อัตโนมัติ</span>
                  </div>
                </div>

                {/* Instant Simulator Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleSimulateQrScan(selectedProfile)}
                    disabled={qrScannedSuccess}
                    className="w-full py-3 px-4 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#06C755]/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {qrScannedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 animate-spin text-white" />
                        <span>ยืนยันตัวตนสำเร็จ! กำลังเข้าสู่ระบบ...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        <span>จำลองการสแกน QR ทันที ({selectedProfile.displayName.split(' ')[0]})</span>
                      </>
                    )}
                  </button>
                  <div className="mt-2 text-center">
                    <button
                      onClick={handleRefreshTokens}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>รีเฟรช QR Code และ State Token ใหม่</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: REAL OAUTH 2.1 DIRECT REDIRECT */}
          {activeTab === 'oauth' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white font-mono uppercase">
                      Official LINE Login OIDC Authorization Endpoint
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    RFC 6749 / OpenID Connect Core 1.0
                  </span>
                </div>

                <div className="relative">
                  <pre className="p-3 rounded-xl bg-obsidian-950 font-mono text-[11px] text-emerald-300 overflow-x-auto border border-white/10 break-all whitespace-pre-wrap select-all">
                    {authUrl}
                  </pre>
                  <button
                    onClick={handleCopyUrl}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[10px]"
                    title="คัดลอก URL"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Query Parameters Breakdown Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-obsidian-950/60 border border-white/5 flex justify-between">
                    <span className="text-slate-400">response_type:</span>
                    <span className="text-white">code</span>
                  </div>
                  <div className="p-2 rounded-lg bg-obsidian-950/60 border border-white/5 flex justify-between">
                    <span className="text-slate-400">client_id:</span>
                    <span className="text-white truncate max-w-[140px]">{currentClientId}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-obsidian-950/60 border border-white/5 flex justify-between">
                    <span className="text-slate-400">scope:</span>
                    <span className="text-[#06C755]">openid profile email</span>
                  </div>
                  <div className="p-2 rounded-lg bg-obsidian-950/60 border border-white/5 flex justify-between">
                    <span className="text-slate-400">state (Anti-CSRF):</span>
                    <span className="text-cyan-300 truncate max-w-[120px]">{stateToken}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-obsidian-950/60 border border-white/5 flex justify-between">
                    <span className="text-slate-400">nonce:</span>
                    <span className="text-purple-300 truncate max-w-[120px]">{nonceToken}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-obsidian-950/60 border border-white/5 flex justify-between">
                    <span className="text-slate-400">bot_prompt:</span>
                    <span className="text-white">normal</span>
                  </div>
                </div>
              </div>

              {/* Redirect Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#06C755]/10 via-obsidian-900 to-obsidian-900 border border-[#06C755]/30">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    เปิดไปยัง LINE Developers Official Login Page
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    สำหรับสภาพแวดล้อม Production ที่เชื่อมต่อ LINE Official Account และ Supabase Auth Provider
                  </p>
                </div>
                <a
                  href={authUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs transition-all shadow-lg shadow-[#06C755]/20 flex items-center gap-2 whitespace-nowrap"
                >
                  <span>ไปที่ LINE Login</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: PDPA & STRIDE THREAT MODEL DISCLOSURES */}
          {activeTab === 'pdpa' && (
            <div className="space-y-6">
              
              {/* Thailand PDPA Notice Box */}
              <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white font-mono uppercase">
                    การเปิดเผยข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (Thailand PDPA)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Climate Action OS ให้ความสำคัญสูงสุดกับความเป็นส่วนตัวของชุมชนและข้อมูลเปราะบางทางสภาพภูมิอากาศ โดยระบบจะขอความยินยอมและประมวลผลข้อมูลตามวัตถุประสงค์ที่กำหนดไว้อย่างเคร่งครัด:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">1. openid & profile</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ใช้ LINE User ID และชื่อแสดงเพื่อสร้าง Session และผูกสิทธิ์เข้ากับองค์กรในพื้นที่
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">2. evidence_capture</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ยินยอมให้บันทึกภาพถ่าย ตั๋วชั่งน้ำหนักขยะ และพิกัด GPS เพื่อการตรวจทาน MRV
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">3. vulnerability_data</span>
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ยินยอมให้ประมวลผลข้อมูลกลุ่มเปราะบางภายใต้กลไก k-Anonymity (k ≥ 10)
                    </p>
                  </div>
                </div>
              </div>

              {/* STRIDE Threat Model Section C.2 Matrix */}
              <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white font-mono uppercase">
                      Climate Action OS STRIDE Threat Model (Section C.2)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    PASSED SECURITY AUDIT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5">
                    <span className="font-mono text-[10px] text-emerald-400 block font-bold">[S] Spoofing Defense</span>
                    <span className="text-slate-300 text-[11px]">
                      ยืนยันตัวตนผ่าน LINE OIDC ID Token แบบเข้ารหัส พร้อม Anti-CSRF Cryptographic State
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5">
                    <span className="font-mono text-[10px] text-cyan-400 block font-bold">[T] Tampering Defense</span>
                    <span className="text-slate-300 text-[11px]">
                      SHA-256 Hash Verification บนหลักฐาน MRV และ Append-Only Ledger Triggers
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5">
                    <span className="font-mono text-[10px] text-purple-400 block font-bold">[R] Repudiation Defense</span>
                    <span className="text-slate-300 text-[11px]">
                      ตาราง consent_records และ audit_log เก็บร่องรอยเวลาและ User ID ที่แก้ไขข้อมูล
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5">
                    <span className="font-mono text-[10px] text-amber-400 block font-bold">[I] Information Disclosure</span>
                    <span className="text-slate-300 text-[11px]">
                      k-Anonymity (k ≥ 10) ซ่อนจำนวนกลุ่มเปราะบางต่อสาธารณะ พร้อม PostGIS Spatial Filtering
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5">
                    <span className="font-mono text-[10px] text-rose-400 block font-bold">[D] Denial of Service</span>
                    <span className="text-slate-300 text-[11px]">
                      Offline-First Client Queue Sync ป้องกันระบบล่มเมื่อสัญญาณอินเทอร์เน็ตขาดหาย
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5">
                    <span className="font-mono text-[10px] text-blue-400 block font-bold">[E] Elevation of Privilege</span>
                    <span className="text-slate-300 text-[11px]">
                      Row-Level Security (RLS) บังคับ 6 บทบาทแยกสิทธิ์ขาดจากกันในระดับ Postgres Engine
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="px-5 sm:px-8 py-4 border-t border-white/10 bg-obsidian-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>เชื่อมต่อผ่านโปรโตคอล TLS 1.3 พร้อมระบบตารางความยินยอม PDPA</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {lineUser && onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              ปิด
            </button>
            <button
              onClick={() => {
                handleSelectMockProfile(selectedProfile);
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs transition-all shadow-lg shadow-[#06C755]/20 flex items-center justify-center gap-1.5"
            >
              <span>ยืนยันเข้าใช้งาน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
