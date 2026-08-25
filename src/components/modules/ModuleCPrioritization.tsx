import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Sliders, 
  Sparkles, 
  Layers,
  HelpCircle
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/crypto';

export const ModuleCPrioritization: React.FC = () => {
  const [urgency, setUrgency] = useState<number>(4); // 1-5
  const [beneficiaries, setBeneficiaries] = useState<number>(1420); // count
  const [feasibility, setFeasibility] = useState<number>(4.5); // 1-5
  const [equity, setEquity] = useState<number>(4); // 1-5
  const [cost, setCost] = useState<number>(35000); // THB

  // Formula: (urgency * beneficiaries * feasibility * equity) / max(cost, 1)
  const numerator = urgency * beneficiaries * feasibility * equity;
  const denominator = Math.max(cost, 1);
  const priorityScore = (numerator / denominator) * 100;

  const handleApplyPreset = (preset: {
    u: number;
    b: number;
    f: number;
    e: number;
    c: number;
  }) => {
    setUrgency(preset.u);
    setBeneficiaries(preset.b);
    setFeasibility(preset.f);
    setEquity(preset.e);
    setCost(preset.c);
  };

  const getRankCategory = (score: number) => {
    if (score >= 250) return { label: 'ลำดับความสำคัญเร่งด่วนสูงสุด (Tier 1)', color: 'text-emerald-700 border-emerald-200 bg-emerald-50' };
    if (score >= 120) return { label: 'ลำดับความสำคัญสูง (Tier 2)', color: 'text-cyan-700 border-cyan-200 bg-cyan-50' };
    return { label: 'ลำดับความสำคัญปานกลาง (Tier 3)', color: 'text-amber-700 border-amber-200 bg-amber-50' };
  };

  const rank = getRankCategory(priorityScore);

  return (
    <div id="prioritization" className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between h-full relative overflow-hidden">

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-700 font-bold uppercase tracking-wider">
              MODULE C · PRIORITIZATION MATRIX (P_i)
            </span>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
            DYNAMIC FORMULA
          </span>
        </div>

        {/* Formula Explainer Pill */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">สูตรคำนวณมาตรฐาน:</span>
            <span className="text-emerald-700 font-bold">
              P_i = (Urgency × Beneficiaries × Feasibility × Equity) / Cost
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-500 flex-shrink-0">
            ชุดค่าตัวอย่าง:
          </span>
          <button
            onClick={() => handleApplyPreset({ u: 5, b: 1420, f: 4.8, e: 4.5, c: 30000 })}
            className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            จุดพักคลายร้อน
          </button>
          <button
            onClick={() => handleApplyPreset({ u: 4, b: 950, f: 4.2, e: 4.0, c: 45000 })}
            className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            สถานีคัดแยกขยะ
          </button>
          <button
            onClick={() => handleApplyPreset({ u: 4, b: 1200, f: 3.8, e: 3.9, c: 60000 })}
            className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            แนวระบายน้ำซึม
          </button>
        </div>

        {/* Interactive Sliders Grid */}
        <div className="mt-4 space-y-3">
          
          {/* Urgency */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">ความเร่งด่วนวิกฤต (Urgency: 1 - 5)</span>
              <span className="font-mono text-emerald-700 font-bold">{urgency} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={urgency}
              onChange={(e) => setUrgency(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            />
          </div>

          {/* Beneficiaries */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">ผู้ได้รับประโยชน์ (Beneficiaries)</span>
              <span className="font-mono text-cyan-700 font-bold">{formatNumber(beneficiaries)} คน</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={beneficiaries}
              onChange={(e) => setBeneficiaries(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            />
          </div>

          {/* Feasibility & Equity (2 cols) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">ความเป็นไปได้ (Feasibility)</span>
                <span className="font-mono text-slate-700">{feasibility}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={feasibility}
                onChange={(e) => setFeasibility(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">ความเสมอภาค (Equity)</span>
                <span className="font-mono text-slate-700">{equity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={equity}
                onChange={(e) => setEquity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">ประมาณการงบประมาณ (Cost THB)</span>
              <span className="font-mono text-amber-700 font-bold">{formatCurrency(cost)}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="150000"
              step="5000"
              value={cost}
              onChange={(e) => setCost(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            />
          </div>

        </div>

      </div>

      {/* Calculated Score Result Box */}
      <div className="mt-5 pt-3 border-t border-slate-200">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">คะแนนความคุ้มค่าและความเร่งด่วน</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {priorityScore.toFixed(1)} <span className="text-xs text-slate-500 font-normal">pts</span>
            </span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${rank.color}`}>
            {rank.label}
          </div>
        </div>
      </div>

    </div>
  );
};
