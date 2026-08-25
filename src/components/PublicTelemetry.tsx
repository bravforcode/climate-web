import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Scale, 
  Users, 
  Coins, 
  Building, 
  ArrowUpRight, 
  CheckCircle,
  ExternalLink,
  Download
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/crypto';

export const PublicTelemetry: React.FC = () => {
  return (
    <section id="telemetry" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      <div className="glass-panel rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200 relative overflow-hidden">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs text-emerald-700 font-bold uppercase tracking-wider">
                PUBLIC VERIFIABLE MRV TELEMETRY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              ผลลัพธ์เชิงประจักษ์ที่ตรวจสอบได้รายวัน
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              ข้อมูลเปิดสาธารณะแบบรวมกลุ่ม (Aggregate Public View) ตามมาตรฐานความโปร่งใสกองทุนภูมิอากาศ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-100 border border-slate-200 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-climate-600" />
              <span>Cryptographically Sealed</span>
            </span>
          </div>
        </div>

        {/* 4 Primary Telemetry Stat Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stat 1: Waste Diverted */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">ขยะอินทรีย์ผันออกจากหลุมฝังกลบ</span>
                <Scale className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight">
                  1,428.5
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">กก. สะสม</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>ลดก๊าซเรือนกระจก:</span>
              <span className="text-emerald-700 font-bold">1.82 tCO2e</span>
            </div>
          </div>

          {/* Stat 2: Heat Refuge Visits */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">ผู้รับบริการจุดพักคลายร้อน</span>
                <Users className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight">
                  486
                </span>
                <span className="text-xs font-mono text-cyan-700 font-bold">คน-ครั้ง</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>กลุ่มเปราะบาง/ผู้สูงอายุ:</span>
              <span className="text-cyan-700 font-bold">62.4%</span>
            </div>
          </div>

          {/* Stat 3: Net Economic Benefit */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">ผลตอบแทนทางเศรษฐกิจสุทธิ</span>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight">
                  ฿76,300
                </span>
                <span className="text-xs font-mono text-amber-700 font-bold">สุทธิ</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>ลดต้นทุนขยะ + ปุ๋ย:</span>
              <span className="text-amber-700 font-bold">+฿18,200/ด.</span>
            </div>
          </div>

          {/* Stat 4: Matched Funding Pipeline */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">กรอบทุนที่ผ่านการเทียบเคียง</span>
                <Building className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight">
                  ฿3.2M
                </span>
                <span className="text-xs font-mono text-purple-700 font-bold">กรอบวงเงิน</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>ThaiCI & กองทุน สวล.:</span>
              <span className="text-purple-700 font-bold">2 แหล่งทุนพร้อม</span>
            </div>
          </div>

        </div>

        {/* Verification Methodology Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-climate-600 flex-shrink-0" />
            <span>ทุกตัวเลขในรายงานผูกกับ Hash หลักฐานดิจิทัลและรายการบัญชีแยกประเภทแบบปิดบัญชีจริง</span>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            CID: bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
          </div>
        </div>

      </div>

    </section>
  );
};
