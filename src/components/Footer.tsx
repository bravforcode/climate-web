import React from 'react';
import { 
  ShieldAlert, 
  Radio, 
  ExternalLink, 
  Layers, 
  FileText, 
  Info,
  CheckCircle2
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16 pt-12 pb-16 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Statutory Draft Disclosure Alert Box (CRITICAL COMPLIANCE) */}
        <div className="mb-10 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                ข้อพึงระวังและข้อจำกัดความรับผิดชอบทางกฎหมาย (Statutory & Regulatory Notice)
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ร่าง พ.ร.บ. การเปลี่ยนแปลงสภาพภูมิอากาศ (Climate Change Bill) ณ วันที่ 25 สิงหาคม 2569 ได้รับความเห็นชอบหลักการจากคณะรัฐมนตรีแล้ว และอยู่ในขั้นตอนการตรวจพิจารณาของสำนักงานคณะกรรมการกฤษฎีกา โดยยังไม่มีผลบังคับใช้เป็นกฎหมายอย่างเป็นทางการ ระบบ Climate Action OS ได้รับการออกแบบเชิงสถาปัตยกรรมเพื่อเตรียมความพร้อมล่วงหน้าสำหรับชุมชนและองค์กรปกครองส่วนท้องถิ่นในการรองรับกลไกกองทุนภูมิอากาศเมื่อกฎหมายมีผลใช้บังคับ
              </p>
            </div>
          </div>
        </div>

        {/* Data Source & External Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">

          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-base">
                Climate Action <span className="text-climate-600 font-mono">OS</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              โครงสร้างพื้นฐานดิจิทัลโอเพ่นซอร์สสำหรับการประเมินความเสี่ยง ออกแบบมาตรการปรับตัว และรวบรวมหลักฐาน MRV เพื่อการเข้าถึงกองทุนสภาพภูมิอากาศระดับชาติและสากล
            </p>
            <p className="text-[10px] font-mono text-slate-400">
              Bangkok Climate Action Week (BKKCAW 2026) Pilot
            </p>
          </div>

          {/* Data Sources Attributions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 font-mono uppercase block">
              แหล่งข้อมูลอ้างอิงทางการ
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a
                  href="https://opendata.gistda.or.th"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-climate-600 transition-colors flex items-center gap-1"
                >
                  <span>GISTDA Open Data (Sentinel-1 Flood API)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://data.tmd.go.th/api"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-climate-600 transition-colors flex items-center gap-1"
                >
                  <span>TMD TMDAPI (กรมอุตุนิยมวิทยา)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://international-climate-initiative.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-climate-600 transition-colors flex items-center gap-1"
                >
                  <span>ThaiCI (Thailand Climate Initiative / GIZ)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.onep.go.th"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-climate-600 transition-colors flex items-center gap-1"
                >
                  <span>กองทุนสิ่งแวดล้อม (สผ. / ONEP)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Architecture */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 font-mono uppercase block">
              มาตรฐานสถาปัตยกรรม
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-climate-600" />
                <span>k-Anonymity (k ≥ 10) Privacy Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-climate-600" />
                <span>PostgreSQL Row-Level Security (RLS)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-climate-600" />
                <span>Append-Only Ledger with Trigger Audit</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-climate-600" />
                <span>SHA-256 Offline MRV Verification</span>
              </li>
            </ul>
          </div>

          {/* Governance & Open Access */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 font-mono uppercase block">
              ธรรมาภิบาลข้อมูล
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ระบบนี้ปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ข้อมูลพิกัดและประชากรกลุ่มเปราะบางถูกจำกัดสิทธิ์การเข้าถึงผ่านระบบตารางความยินยอม (Consent Records)
            </p>
            <div className="pt-1 font-mono text-[10px] text-slate-400">
              SECURITY AUDIT: PASSED STRIDE THREAT MODEL
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-mono">
          <div>
            © 2026 Climate Action OS. Open infrastructure for community climate resilience.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Production Build v2.4.0</span>
            <span>·</span>
            <span className="text-climate-600">Node: Local Pilot (Padung Krung Kasem)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
