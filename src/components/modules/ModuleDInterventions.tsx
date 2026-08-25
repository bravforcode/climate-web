import React, { useState } from 'react';
import { 
  BookOpen, 
  Check, 
  Clock, 
  Coins, 
  FileCheck, 
  Plus, 
  Search,
  Shield
} from 'lucide-react';
import { Intervention } from '../../types';
import { MOCK_INTERVENTIONS } from '../../data/mockData';
import { formatCurrency } from '../../utils/crypto';

interface ModuleDProps {
  selectedInterventions: Intervention[];
  onToggleIntervention: (intervention: Intervention) => void;
}

export const ModuleDInterventions: React.FC<ModuleDProps> = ({
  selectedInterventions,
  onToggleIntervention,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'ทั้งหมด (5)' },
    { id: 'heat', label: 'คลายร้อน' },
    { id: 'waste_methane', label: 'ลดก๊าซ/ขยะ' },
    { id: 'flood_drainage', label: 'ระบายน้ำ' },
    { id: 'micro_climate', label: 'ม่านหมอก' },
    { id: 'early_warning', label: 'เตือนภัย' },
  ];

  const filteredInterventions = MOCK_INTERVENTIONS.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      item.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.expectedImpactTh.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between h-full relative overflow-hidden">

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="font-mono text-xs text-teal-700 font-bold uppercase tracking-wider">
              MODULE D · INTERVENTION CATALOG
            </span>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-50 text-teal-700 border border-teal-200">
            5 PILOT MEASURES
          </span>
        </div>

        {/* Search Bar & Categories Bar */}
        <div className="mt-3.5 space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหามาตรการปรับตัว (เช่น คลายร้อน, ขยะ, ระบายน้ำ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  activeCategory === cat.id
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interventions List */}
        <div className="mt-3.5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredInterventions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              ไม่พบมาตรการที่ตรงกับการค้นหา
            </div>
          ) : (
            filteredInterventions.map((item) => {
              const isSelected = selectedInterventions.some((s) => s.id === item.id);
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onToggleIntervention(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleIntervention(item);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    isSelected
                      ? 'bg-teal-50 border-teal-200 shadow-card'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {item.nameTh}
                        </h4>
                        {item.permitRequired && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                            ต้องขออนุญาต อปท.
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.expectedImpactTh}
                      </p>
                    </div>

                    {/* Toggle Button */}
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-teal-500 text-white border-teal-500 font-bold'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Specs pill row */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-600" />
                      <span>{formatCurrency(item.costLow)} - {formatCurrency(item.costHigh)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-600" />
                      <span>ระยะเวลา {item.timelineDays} วัน</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Footer Selected Summary */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-600">
          เลือกแล้ว <span className="font-mono text-teal-700 font-bold">{selectedInterventions.length}</span> รายการ
        </span>
        <span className="text-xs text-slate-500">
          ส่งต่อไปยัง Module E (Composer)
        </span>
      </div>

    </div>
  );
};
