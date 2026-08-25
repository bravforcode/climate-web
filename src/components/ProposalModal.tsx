import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Globe, 
  Printer, 
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '../utils/crypto';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'th' | 'en'>('th');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownContentTh = `# ข้อเสนอโครงการปรับตัวต่อสภาพภูมิอากาศชุมชน (Climate Adaptation Project Proposal)
**ชื่อโครงการ:** โครงการยกระดับตลาดผดุงกรุงเกษมสู่ตลาดรับมือคลื่นความร้อนและน้ำท่วมขัง (Padung Krung Kasem Climate-Resilient Pilot)
**หน่วยงานเสนอโครงการ:** คณะกรรมการตลาดริมคลองผดุงกรุงเกษม ร่วมกับ ชุมชนเขตป้อมปราบศัตรูพ่าย
**กองทุนเป้าหมาย:** ThaiCI (Thailand Climate Initiative) & กองทุนสิ่งแวดล้อม
**งบประมาณรวมที่เสนอขอ:** 62,500 บาท (ระยะเวลาดำเนินการ: 21 วัน)

---

## 1. บทสรุปผู้บริหาร (Executive Summary)
ตลาดชุมชนผดุงกรุงเกษมเป็นแหล่งหมุนเวียนทางเศรษฐกิจที่มีประชากรได้รับประโยชน์ 1,420 คน โดยมีผู้สูงอายุและแรงงานกลางแจ้งที่เปราะบางต่อความร้อนรุนแรง (ดัชนีความร้อนสะสม 42.6°C) และเผชิญปัญหาน้ำท่วมขังรอการระบาย โครงการนี้ดำเนินการติดตั้ง "จุดพักคอยคลายร้อนชุมชน" และ "สถานีคัดแยกและแปลงขยะอินทรีย์" เพื่อลดความเสี่ยงสุขภาพและผันขยะ 150-250 กก./วัน ออกจากระบบฝังกลบ

## 2. ข้อมูลความเสี่ยงและฐานอ้างอิงทางวิทยาศาสตร์ (Hazard & Baseline Data)
- **ความเสี่ยงน้ำท่วม:** ข้อมูลขอบเขตน้ำท่วมขังจาก GISTDA Open Data (Sentinel-1 SAR) ตรวจพบความน่าจะเป็น 85% ในช่วงฝนตกสะสม
- **ดัชนีความร้อน:** ข้อมูลจาก TMD TMDAPI (กรมอุตุนิยมวิทยา) รายงานดัชนีความร้อนระดับสีส้ม (42.6°C) ต่อเนื่องเกิน 6 ชม./วัน
- **ข้อมูลประชากร:** ผ่านการประมวลผล k-Anonymity (k ≥ 10) ป้องกันการระบุตัวบุคคลกลุ่มเปราะบาง

## 3. ทฤษฎีการเปลี่ยนแปลง (Theory of Change - TOC)
- **Input:** งบประมาณ 62,500 บาท, อุปกรณ์พัดลมไอเย็นอุตสาหกรรม, ถังหมักอินทรีย์, แรงงานอาสาสมัครชุมชน
- **Output:** จุดพักคลายร้อน 1 จุด (รองรับ 120+ คน/วัน), สถานีแปลงขยะอินทรีย์ 1 จุด (180 กก./วัน)
- **Outcome:** อัตราการเจ็บป่วยจากโรคลมแดดในตลาดลดลง 40%, ลดต้นทุนจัดการขยะ 12,000 บาท/เดือน
- **Impact:** ลดการปล่อยก๊าซมีเทน 18.5 tCO2e/ปี และเพิ่มความสามารถในการรับมือภัยพิบัติอย่างยั่งยืน

## 4. แผนงานและงบประมาณ (Budget & Bill of Materials)
1. พัดลมไอเย็นอุตสาหกรรม + ม่านพ่นหมอกประหยัดพลังงาน: 25,000 บาท
2. เครื่องบดย่อยเศษผักและถังหมักปุ๋ยอินทรีย์ชีวภาพ: 27,500 บาท
3. ป้ายแสดงผลเตือนภัยดัชนีความร้อนดิจิทัลและตราชั่ง: 10,000 บาท
**รวมทั้งสิ้น:** 62,500 บาท

## 5. แผนการวัดผลและรายงานผล MRV (Measurement, Reporting, Verification)
- ทุกตั๋วชั่งน้ำหนักขยะจะถูกแปลงเป็น SHA-256 Hash ทันทีหน้างาน
- บันทึกการเงินลงระบบ Append-Only Financial Ledger ป้องกันการแก้ไขย้อนหลัง
- รายงานผลแบบโปร่งใสผ่าน Public Telemetry Dashboard`;

  const markdownContentEn = `# Community Climate Adaptation Project Proposal
**Project Title:** Padung Krung Kasem Resilient Market Pilot (Heat Refuge & Waste Diversion)
**Proponent:** Padung Krung Kasem Market Committee & Pom Prap Sattru Phai Community
**Target Grants:** ThaiCI (Thailand Climate Initiative / IKI / GIZ) & Thailand Environmental Fund
**Requested Budget:** 62,500 THB (Duration: 21 Days)

---

## 1. Executive Summary
The Padung Krung Kasem Community Market supports 1,420 beneficiaries with heavy exposure to extreme heat index (42.6°C) and surface inundation. This project establishes a rapid Climate Refuge Station and an Organic Waste Diversion Unit to protect vulnerable outdoor vendors and divert 150-250 kg/day of organic waste.

## 2. Scientific Baseline & Hazard Data
- **Inundation Risk:** GISTDA Open Data API indicates 85% water accumulation probability during heavy rainfall events.
- **Heat Index:** TMD TMDAPI records extreme caution heat index levels (>42.6°C) for over 6 peak hours daily.
- **Demographics:** Anonymized via k-Anonymity (k >= 10) to preserve vulnerable group privacy.

## 3. Theory of Change (TOC)
- **Inputs:** 62,500 THB grant, solar micro-misting misting units, organic composters, volunteer hours.
- **Outputs:** 1 climate refuge station (serving 120+ visitors/day), 1 organic waste station (180 kg/day).
- **Outcomes:** 40% reduction in heat stress episodes, 12,000 THB/month savings in municipal waste fees.
- **Impact:** 18.5 tCO2e/year avoided methane emissions and permanent community resilience.

## 4. Digital MRV & Cryptographic Governance
- Daily weigh tickets cryptographically hashed with SHA-256 on field capture.
- Append-only financial ledger with trigger-enforced immutable records.
- Open-access aggregate public dashboard for donors and independent auditors.`;

  const activeContent = lang === 'th' ? markdownContentTh : markdownContentEn;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-obsidian-950/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Topbar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-obsidian-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-climate-500/10 border border-climate-500/30 text-climate-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {lang === 'th' ? 'ข้อเสนอโครงการฉบับสมบูรณ์ (Grant Proposal View)' : 'Complete Project Proposal (Grant View)'}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                PROPOSAL ID: PROP-TH-2026-08-01 · STATUS: COMPOSED & VERIFIED
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <div className="flex items-center p-1 rounded-xl bg-obsidian-950 border border-white/10 text-xs font-mono">
              <button
                onClick={() => setLang('th')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  lang === 'th' ? 'bg-climate-500 text-obsidian-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                TH
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  lang === 'en' ? 'bg-climate-500 text-obsidian-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-200 text-xs sm:text-sm font-sans space-y-4 bg-obsidian-950/60">
          <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed selection:bg-climate-500/30">
            {activeContent}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-obsidian-900/80">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>พร้อมยื่นเสนอ ThaiCI / กองทุนสิ่งแวดล้อม</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก Markdown'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-climate-500 hover:bg-climate-400 text-obsidian-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow-emerald"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ส่งออกเอกสาร (Export PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
