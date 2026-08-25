import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle, 
  Radio, 
  Sparkles,
  MapPin,
  MessageSquare,
  Coins
} from 'lucide-react';
import gsap from 'gsap';
import { LineUserProfile } from '../types';

interface HeroProps {
  onExploreClick: () => void;
  onTelemetryClick: () => void;
  onOpenLineLogin?: () => void;
  lineUser?: LineUserProfile | null;
  onSponsorClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onExploreClick, 
  onTelemetryClick, 
  onOpenLineLogin,
  lineUser,
  onSponsorClick,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(badgeRef.current, {
        y: -15,
        opacity: 0,
        duration: 0.6,
      })
      .from(headingRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
      }, '-=0.3')
      .from(subheadRef.current, {
        y: 15,
        opacity: 0,
        duration: 0.7,
      }, '-=0.4')
      .from(ctaRef.current, {
        y: 15,
        opacity: 0,
        duration: 0.6,
      }, '-=0.4')
      .from(statsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
      }, '-=0.3');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden ambient-grid-bg">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[850px] md:h-[850px] rounded-full border border-climate-500/10 pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[550px] md:h-[550px] rounded-full border border-cyan-500/10 pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Readiness Tag */}
        <div 
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian-900/90 border border-climate-500/30 text-climate-300 text-xs font-mono mb-6 shadow-subtle-emerald backdrop-blur-md"
        >
          <Radio className="w-3.5 h-3.5 text-climate-400 animate-pulse" />
          <span>เตรียมพร้อมรองรับกลไกกองทุนภายใต้ ร่าง พ.ร.บ. การเปลี่ยนแปลงสภาพภูมิอากาศ</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400 font-sans">BKKCAW 2026 Pilot</span>
        </div>

        {/* Cinematic H1 Title - STRICTLY Max 2 lines */}
        <h1 
          ref={headingRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-4xl text-balance"
        >
          Climate Action OS — <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-climate-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            ชุมชนพร้อมรับมือก่อนวิกฤต
          </span>
        </h1>

        {/* Sub-headline */}
        <p 
          ref={subheadRef}
          className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl leading-relaxed text-balance"
        >
          เปลี่ยนความเสี่ยงน้ำท่วมและความร้อน ให้เป็นโครงการปรับตัวที่มีงบประมาณ มีคนรับผิดชอบจริง และมีหลักฐานผลลัพธ์ MRV แบบเข้ารหัสบนบล็อกบัญชีที่ตรวจสอบได้
        </p>

        {/* High Contrast CTAs with LINE Login integration */}
        <div 
          ref={ctaRef}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-climate-500 hover:bg-climate-400 text-obsidian-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] shadow-subtle-emerald active:scale-[0.98]"
          >
            <span>สำรวจระบบปฏิบัติการ (Explore OS)</span>
            <ArrowRight className="w-4 h-4 text-obsidian-950 stroke-[2.5]" />
          </button>

          {onOpenLineLogin && (
            <button
              onClick={onOpenLineLogin}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border transform hover:scale-[1.01] active:scale-[0.98] ${
                lineUser 
                  ? 'bg-[#06C755]/15 border-[#06C755]/40 text-[#34d399] hover:bg-[#06C755]/25' 
                  : 'bg-[#06C755] hover:bg-[#05b34c] text-obsidian-950 border-transparent shadow-sm'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${lineUser ? 'fill-[#06C755] text-[#06C755]' : 'fill-obsidian-950 text-obsidian-950'}`} />
              <span>{lineUser ? `LINE: ${lineUser.displayName.split(' ')[0]} (Verified)` : 'เข้าสู่ระบบด้วย LINE'}</span>
            </button>
          )}

          {onSponsorClick ? (
            <button
              onClick={onSponsorClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel-interactive text-amber-300 hover:text-amber-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 border border-amber-500/30"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>ร่วมสมทบทุน (ลดหย่อน 2x)</span>
            </button>
          ) : (
            <button
              onClick={onTelemetryClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel-interactive text-slate-200 hover:text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 border border-white/15"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>รายงานผลสด (Live Telemetry)</span>
            </button>
          )}
        </div>

        {/* Trust Badges & Pilot Location Footprint */}
        <div 
          ref={statsRef}
          className="mt-12 pt-8 border-t border-white/10 w-full grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl"
        >
          <div className="flex flex-col items-center p-3 rounded-xl bg-obsidian-900/60 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-climate-400" />
              <span>พื้นที่ทดสอบนำร่อง</span>
            </div>
            <span className="text-sm font-bold text-white mt-1">ตลาดผดุงกรุงเกษม</span>
            <span className="text-[11px] text-slate-400 font-mono">1,420 ประชากรได้รับประโยชน์</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-obsidian-900/60 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>GISTDA & TMD</span>
            </div>
            <span className="text-sm font-bold text-cyan-300 mt-1">Hybrid Ingestion</span>
            <span className="text-[11px] text-slate-400 font-mono">API สด + Attribution</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-obsidian-900/60 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>k-Anonymity & RLS</span>
            </div>
            <span className="text-sm font-bold text-purple-300 mt-1">Privacy Tier k≥10</span>
            <span className="text-[11px] text-slate-400 font-mono">6 บทบาทคุมสิทธิ์</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-obsidian-900/60 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>ThaiCI & OneP</span>
            </div>
            <span className="text-sm font-bold text-amber-300 mt-1">฿3.2M กองทุนเทียบเคียง</span>
            <span className="text-[11px] text-slate-400 font-mono">Human Verified</span>
          </div>
        </div>

      </div>
    </section>
  );
};
