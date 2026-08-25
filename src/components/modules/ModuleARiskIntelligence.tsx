import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CloudRain, 
  Flame, 
  Wind, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw,
  ShieldAlert,
  Info
} from 'lucide-react';
import { RiskAssessment, UserRole } from '../../types';
import { MOCK_RISKS } from '../../data/mockData';

interface ModuleAProps {
  currentRole: UserRole;
  isOnline: boolean;
}

export const ModuleARiskIntelligence: React.FC<ModuleAProps> = ({ currentRole, isOnline }) => {
  const [selectedHazard, setSelectedHazard] = useState<'flood' | 'heat' | 'pm25'>('flood');
  const [risks, setRisks] = useState<RiskAssessment[]>(MOCK_RISKS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeRisk = risks.find((r) => r.hazardType === selectedHazard) || risks[0];

  const handleSimulateSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'severe':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group">
      
      {/* Background Accent Radar Effect */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-cyan-500/5 rounded-full border border-cyan-500/10 pointer-events-none" />

      <div>
        {/* Module Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
              MODULE A · RISK INTELLIGENCE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateSync}
              disabled={!isOnline || isRefreshing}
              className="p-1.5 rounded-lg bg-obsidian-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 transition-all"
              title="ดึงข้อมูลความเสี่ยงรอบล่าสุดจาก API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              GISTDA LIVE
            </span>
          </div>
        </div>

        {/* Hazard Selector Tabs */}
        <div className="flex items-center gap-1.5 mt-4 p-1 rounded-xl bg-obsidian-950/80 border border-white/5">
          <button
            onClick={() => setSelectedHazard('flood')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              selectedHazard === 'flood'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>น้ำท่วมขัง</span>
          </button>

          <button
            onClick={() => setSelectedHazard('heat')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              selectedHazard === 'heat'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>คลื่นความร้อน</span>
          </button>

          <button
            onClick={() => setSelectedHazard('pm25')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              selectedHazard === 'pm25'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-amber-400" />
            <span>ฝุ่น PM2.5</span>
          </button>
        </div>

        {/* Main Telemetry Readout */}
        <div className="mt-5 p-4 rounded-2xl bg-obsidian-900/80 border border-white/10 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">
                {activeRisk.locationName}
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {activeRisk.titleTh}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border uppercase ${getRiskBadgeColor(activeRisk.riskLevel)}`}>
              {activeRisk.riskLevel} RISK
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {activeRisk.metricValue}
            </span>
            <span className="text-xs font-mono text-slate-300">
              {activeRisk.metricUnit}
            </span>
          </div>

          {/* Details & Confidence */}
          <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">SOURCE LANE:</span>
              <span className="text-slate-300 text-[11px]">
                {activeRisk.sourceType === 'api_automated' ? 'Auto REST API' : 'Curated Manual'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CONFIDENCE:</span>
              <span className="text-climate-400 text-[11px] uppercase">
                {activeRisk.confidence} CONFIDENCE
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Attribution & Legal Notice Footer */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-obsidian-950/70 border border-white/5">
          <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">แหล่งข้อมูลทางการ: </span>
            <span>{activeRisk.sourceName}</span>
            {activeRisk.commercialUseRestricted && (
              <span className="block text-[10px] text-amber-400/90 mt-0.5">
                *เงื่อนไขลิขสิทธิ์ พ.ร.บ.ลิขสิทธิ์ 2537: ต้องระบุที่มาเสมอ ห้ามใช้เชิงพาณิชย์โดยไม่ขออนุญาต
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
