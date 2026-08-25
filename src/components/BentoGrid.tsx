import React, { useState } from 'react';
import { UserRole, Intervention } from '../types';
import { MOCK_INTERVENTIONS } from '../data/mockData';
import { ModuleARiskIntelligence } from './modules/ModuleARiskIntelligence';
import { ModuleBVulnerabilityMap } from './modules/ModuleBVulnerabilityMap';
import { ModuleCPrioritization } from './modules/ModuleCPrioritization';
import { ModuleDInterventions } from './modules/ModuleDInterventions';
import { ModuleEProjectComposer } from './modules/ModuleEProjectComposer';
import { ModuleFFundingMatch } from './modules/ModuleFFundingMatch';
import { ModuleGHTaskEvidence } from './modules/ModuleGHTaskEvidence';
import { ModuleILedger } from './modules/ModuleILedger';
import { ModulePaymentBilling } from './modules/ModulePaymentBilling';

interface BentoGridProps {
  currentRole: UserRole;
  isOnline: boolean;
  onOpenProposalModal: () => void;
  onSyncComplete?: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  currentRole,
  isOnline,
  onOpenProposalModal,
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

  return (
    <section id="risk-module" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          โมดูลปฏิบัติการเปลี่ยนความเสี่ยงเป็นผลลัพธ์
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300">
          สถาปัตยกรรมแบบบูรณาการตั้งแต่การประเมินภัยพิบัติ (A) คุ้มครองข้อมูลเปราะบาง (B) จัดลำดับความคุ้มค่า (C) ร่างโครงการพร้อมตรวจสอบ (E) เทียบเคียงแหล่งทุน (F) ไปจนถึงเก็บหลักฐาน MRV และปิดบัญชีโปร่งใส (G-I) พร้อมกลไกการร่วมสมทบทุนลดหย่อนภาษี 2 เท่า (J)
        </p>
      </div>

      {/* Gapless Bento Grid with grid-auto-flow: dense */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 auto-rows-fr">
        
        {/* Module A: Risk Intelligence (6 cols) */}
        <div className="lg:col-span-6 min-h-[460px]">
          <ModuleARiskIntelligence currentRole={currentRole} isOnline={isOnline} />
        </div>

        {/* Module B: Vulnerability Map (6 cols) */}
        <div className="lg:col-span-6 min-h-[460px]">
          <ModuleBVulnerabilityMap currentRole={currentRole} />
        </div>

        {/* Module C: Prioritization Matrix (6 cols) */}
        <div className="lg:col-span-6 min-h-[490px]">
          <ModuleCPrioritization />
        </div>

        {/* Module D: Intervention Catalog (6 cols) */}
        <div className="lg:col-span-6 min-h-[490px]">
          <ModuleDInterventions
            selectedInterventions={selectedInterventions}
            onToggleIntervention={handleToggleIntervention}
          />
        </div>

        {/* Module E: Project Composer (6 cols) */}
        <div className="lg:col-span-6 min-h-[520px]">
          <ModuleEProjectComposer
            selectedInterventions={selectedInterventions}
            currentRole={currentRole}
            onOpenProposalModal={onOpenProposalModal}
          />
        </div>

        {/* Module F: Funding Match (6 cols) */}
        <div className="lg:col-span-6 min-h-[520px]">
          <ModuleFFundingMatch currentRole={currentRole} />
        </div>

        {/* Module G & H: Task Board & MRV Crypto Evidence (6 cols) */}
        <div className="lg:col-span-6 min-h-[540px]">
          <ModuleGHTaskEvidence
            currentRole={currentRole}
            isOnline={isOnline}
            onSyncComplete={onSyncComplete}
          />
        </div>

        {/* Module I: Append-Only Financial Ledger (6 cols) */}
        <div className="lg:col-span-6 min-h-[540px]">
          <ModuleILedger currentRole={currentRole} />
        </div>

        {/* Module J: Pricing & Climate Fund Sponsorship (12 cols) */}
        <div className="lg:col-span-12 min-h-[560px]">
          <ModulePaymentBilling currentRole={currentRole} />
        </div>

      </div>

    </section>
  );
};
