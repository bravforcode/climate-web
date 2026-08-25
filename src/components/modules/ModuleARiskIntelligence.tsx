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
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between h-full relative overflow-hidden group">

      <div>
        {/* Module Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="font-mono text-xs text-cyan-700 font-bold uppercase tracking-wider">
              MODULE A · RISK INTELLIGENCE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateSync}
              disabled={!isOnline || isRefreshing}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              title="ดึงข้อมูลความเสี่ยงรอบล่าสุดจาก API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-600' : ''}`} />
            </button>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-50 text-cyan-700 border border-cyan-200">
              GISTDA LIVE
            </span>
          </div>
        </div>

        {/* Hazard Selector Tabs */}
        <div className="flex items-center gap-1.5 mt-4 p-1 rounded-xl bg-slate-50 border border-slate-200">
          <button
            onClick={() => setSelectedHazard('flood')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              selectedHazard === 'flood'
                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-600" />
            <span>น้ำท่วมขัง</span>
          </button>

          <button
            onClick={() => setSelectedHazard('heat')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              selectedHazard === 'heat'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>คลื่นความร้อน</span>
          </button>

          <button
            onClick={() => setSelectedHazard('pm25')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              selectedHazard === 'pm25'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-amber-600" />
            <span>ฝุ่น PM2.5</span>
          </button>
        </div>

        {/* Main Telemetry Readout */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-500 block">
                {activeRisk.locationName}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                {activeRisk.titleTh}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border uppercase ${getRiskBadgeColor(activeRisk.riskLevel)}`}>
              {activeRisk.riskLevel} RISK
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight">
              {activeRisk.metricValue}
            </span>
            <span className="text-xs font-mono text-slate-600">
              {activeRisk.metricUnit}
            </span>
          </div>

          {/* Details & Confidence */}
          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">SOURCE LANE:</span>
              <span className="text-slate-600 text-[11px]">
                {activeRisk.sourceType === 'api_automated' ? 'Auto REST API' : 'Curated Manual'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CONFIDENCE:</span>
              <span className="text-climate-600 text-[11px] uppercase">
                {activeRisk.confidence} CONFIDENCE
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Attribution & Legal Notice Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <Info className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">แหล่งข้อมูลทางการ: </span>
            <span>{activeRisk.sourceName}</span>
            {activeRisk.commercialUseRestricted && (
              <span className="block text-[10px] text-amber-700 mt-0.5">
                *เงื่อนไขลิขสิทธิ์ พ.ร.บ.ลิขสิทธิ์ 2537: ต้องระบุที่มาเสมอ ห้ามใช้เชิงพาณิชย์โดยไม่ขออนุญาต
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
