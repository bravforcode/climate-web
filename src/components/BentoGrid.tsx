import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Coins, 
  Sparkles, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { UserRole, Intervention } from '../types';
import { MOCK_INTERVENTIONS } from '../data/mockData';
import { WorkspaceStage } from './Navbar';
import { ModuleARiskIntelligence } from './modules/ModuleARiskIntelligence';
import { ModuleBVulnerabilityMap } from './modules/ModuleBVulnerabilityMap';
import { ModuleCPrioritization } from './modules/ModuleCPrioritization';
import { ModuleDInterventions } from './modules/ModuleDInterventions';
import { ModuleEProjectComposer } from './modules/ModuleEProjectComposer';
import { ModuleFFundingMatch } from './modules/ModuleFFundingMatch';
import { ModuleGHTaskEvidence } from './modules/ModuleGHTaskEvidence';
import { ModuleILedger } from './modules/ModuleILedger';

interface BentoGridProps {
  currentRole: UserRole;
  activeWorkspace: WorkspaceStage;
  onSelectWorkspace: (stage: WorkspaceStage) => void;
  isOnline: boolean;
  onOpenProposalModal: () => void;
  onOpenSponsorModal?: () => void;
  onSyncComplete?: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  currentRole,
  activeWorkspace,
  onSelectWorkspace,
  isOnline,
  onOpenProposalModal,
  onOpenSponsorModal,
  onSyncComplete,
}) => {
  const [selectedInterventions, setSelectedInterventions] = useState<Intervention[]>([
    MOCK_INTERVENTIONS[0], // Climate Refuge Station
    MOCK_INTERVENTIONS[1], // Waste Diversion Unit
  ]);

  const handleToggleIntervention = (intervention: Intervention) => {
    setSelectedInterventions((prev) => {
      const exists = prev.some((i) => i.id === intervention.id);
      if (exists) {
        return prev.filter((i) => i.id !== intervention.id);
      }
      return [...prev, intervention];
    });
  };

  const workspaces: { id: WorkspaceStage; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: 'assess',
      title: '1. สำรวจ & วางแผน (Assess & Plan)',
      subtitle: 'ประเมินความเสี่ยงสภาพภูมิอากาศ (A), คุ้มครองข้อมูลเปราะบาง k≥10 (B), และจัดลำดับมาตรการความคุ้มค่า (C-D)',
      icon: Compass,
    },
    {
      id: 'compose',
      title: '2. ร่างโครงการ & ทุน (Compose & Match)',
      subtitle: 'ร่างข้อเสนอโครงการพร้อม Theory of Change (E) และเทียบเคียงกรอบทุนที่ผ่านการตรวจรับรอง (F)',
      icon: Layers,
    },
    {
      id: 'mrv',
      title: '3. ปฏิบัติการ & บัญชี (MRV & Ledger)',
      subtitle: 'บันทึกตั๋วชั่งน้ำหนักขยะและพิกัดพร้อม SHA-256 (G-H) และบันทึกบัญชีแยกประเภทแบบห้ามแก้ไข (I)',
      icon: ShieldCheck,
    },
  ];

  const currentWorkspaceMeta = workspaces.find((w) => w.id === activeWorkspace) || workspaces[0];

  return (
    <section id="risk-module" className="py-8 md:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Workspace Stage Selector Navigation */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono text-climate-600 font-bold uppercase tracking-wider block">
              WORKFLOW WORKSPACES · กระบวนการทำงานแบบบูรณาการ
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
              {currentWorkspaceMeta.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              {currentWorkspaceMeta.subtitle}
            </p>
          </div>

          {/* Quick Stage Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 w-full sm:w-auto overflow-x-auto scrollbar-none">
            {workspaces.map((ws) => {
              const Icon = ws.icon;
              const isActive = activeWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => onSelectWorkspace(ws.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    isActive
                      ? 'bg-white text-climate-700 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{ws.id === 'assess' ? '1. สำรวจ & วางแผน' : ws.id === 'compose' ? '2. ร่างโครงการ & ทุน' : '3. ปฏิบัติการ & บัญชี'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Workspace Viewport (Progressive Disclosure) */}
      <div className="transition-all duration-300">
        
        {/* Workspace 1: Assess & Plan */}
        {activeWorkspace === 'assess' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Module A: Risk Intelligence (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <ModuleARiskIntelligence currentRole={currentRole} isOnline={isOnline} />
              </div>

              {/* Module B: Vulnerability Map (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <ModuleBVulnerabilityMap currentRole={currentRole} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Module C: Prioritization Matrix (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <ModuleCPrioritization />
              </div>

              {/* Module D: Intervention Catalog (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <ModuleDInterventions
                  selectedInterventions={selectedInterventions}
                  onToggleIntervention={handleToggleIntervention}
                />
              </div>
            </div>

            {/* Stage Completion Footer Banner */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-climate-600 flex-shrink-0" />
                <span>เลือกมาตรการแล้ว <strong>{selectedInterventions.length} รายการ</strong> พร้อมสำหรับร่างโครงการ</span>
              </div>
              <button
                onClick={() => onSelectWorkspace('compose')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-climate-50 hover:bg-climate-100 text-climate-700 border border-climate-200 font-semibold flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <span>ไปยังขั้นตอนถัดไป: ร่างโครงการ & เทียบเคียงทุน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Workspace 2: Compose & Match */}
        {activeWorkspace === 'compose' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Module E: Project Composer (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <ModuleEProjectComposer
                  selectedInterventions={selectedInterventions}
                  currentRole={currentRole}
                  onOpenProposalModal={onOpenProposalModal}
                />
              </div>

              {/* Module F: Funding Match (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <ModuleFFundingMatch currentRole={currentRole} />
              </div>
            </div>

            {/* Stage Completion Footer Banner */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <FileText className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span>ร่างข้อเสนอโครงการเสร็จสมบูรณ์ พร้อมส่งให้ผู้แทนกองทุนพิจารณา</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onOpenProposalModal}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  ดูเอกสารข้อเสนอ (PDF/MD)
                </button>
                <button
                  onClick={() => onSelectWorkspace('mrv')}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-climate-50 hover:bg-climate-100 text-climate-700 border border-climate-200 font-semibold flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <span>ไปยังขั้นตอน: ปฏิบัติการ & บันทึกหลักฐาน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace 3: MRV & Ledger */}
        {activeWorkspace === 'mrv' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Module G & H: Task Board & MRV Crypto Evidence (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <ModuleGHTaskEvidence
                  currentRole={currentRole}
                  isOnline={isOnline}
                  onSyncComplete={onSyncComplete}
                />
              </div>

              {/* Module I: Append-Only Financial Ledger (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <ModuleILedger currentRole={currentRole} />
              </div>
            </div>

            {/* CSR Sponsorship Banner */}
            {onOpenSponsorModal && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white text-amber-600 border border-amber-200 flex-shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ต้องการร่วมสมทบทุนขยายผลโครงการ?</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      ภาคเอกชนสามารถร่วมสนับสนุนโครงการปรับตัวสภาพภูมิอากาศชุมชน เพื่อรับสิทธิประโยชน์ลดหย่อนภาษี 2 เท่า พร้อมใบเสร็จดิจิทัล
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenSponsorModal}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>เปิดระบบร่วมสมทบทุน (CSR 2x)</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </section>
  );
};

export default BentoGrid;

