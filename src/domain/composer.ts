import type { Intervention, OrgType } from './types';

export interface ComposeProjectInput {
  project_id?: string;
  priority_id?: string;
  problem_statement?: string;
  priority?: {
    id?: string;
    problem_statement: string;
    urgency?: number;
    beneficiaries_est?: number;
    feasibility?: number;
    equity_score?: number;
    cost_est?: number;
  };
  organization?: {
    id?: string;
    name: string;
    org_type: OrgType | string;
    province?: string;
    district?: string;
    subdistrict?: string;
  };
  interventions: Intervention[];
  budget_total?: number;
  timeline_days?: number;
  custom_title?: { th?: string; en?: string } | string;
}

export interface TheoryOfChangeSection {
  th: string;
  en: string;
}

export interface TheoryOfChangeList {
  th: string[];
  en: string[];
}

export interface TheoryOfChange {
  problem: TheoryOfChangeSection;
  intervention: TheoryOfChangeSection;
  outputs: TheoryOfChangeList;
  outcomes: TheoryOfChangeList;
  impact: TheoryOfChangeSection;
}

export interface BudgetItem {
  item_th: string;
  item_en: string;
  category: string;
  cost: number;
  justification_th: string;
  justification_en: string;
}

export interface ProjectProposalDraft {
  project_id: string;
  priority_id?: string;
  title: {
    th: string;
    en: string;
  };
  status: 'draft' | 'composed';
  organization?: {
    name: string;
    org_type: string;
    location: string;
  };
  executive_summary: {
    th: string;
    en: string;
  };
  theory_of_change: TheoryOfChange;
  budget_breakdown: BudgetItem[];
  budget_total: number;
  timeline_days: number;
  interventions: Intervention[];
  requires_human_review: true;
  fields_needing_confirmation: string[];
  formatted_markdown: {
    th: string;
    en: string;
  };
  composed_at: string;
}

/**
 * Builds Theory of Change structured components from problem statement and chosen interventions.
 */
function buildTheoryOfChange(
  problemStatement: string,
  interventions: Intervention[],
  orgName: string
): TheoryOfChange {
  const interventionNamesTh = interventions.map((i) => i.name).join(', ');
  const interventionNamesEn = interventions.map((i) => i.description_en || i.name).join(', ');

  const outputsTh = interventions.map(
    (i) => `ติดตั้งและเปิดใช้งาน ${i.name} (หมวดหมู่: ${i.category})`
  );
  const outputsEn = interventions.map(
    (i) => `Deploy and operationalize ${i.name} (Category: ${i.category})`
  );

  const outcomesTh = [
    `ลดความเสี่ยงและความเสียหายจากสภาพภูมิอากาศสุดขั้วในพื้นที่ ${orgName}`,
    `เพิ่มความพร้อมและการฟื้นตัวของผู้ค้าและกลุ่มเปราะบาง`,
    `สร้างบันทึกผลลัพธ์และหลักฐาน (MRV) ที่โปร่งใสและตรวจสอบได้`,
  ];

  const outcomesEn = [
    `Reduce vulnerability and damages from extreme climate events in ${orgName}`,
    `Enhance resilience and adaptive capacity for vendors and vulnerable groups`,
    `Establish verified, transparent Measurement, Reporting, and Verification (MRV) records`,
  ];

  return {
    problem: {
      th: `พื้นที่ ${orgName} เผชิญความเสี่ยงภูมิอากาศ: ${problemStatement}`,
      en: `${orgName} faces acute climate hazards: ${problemStatement}`,
    },
    intervention: {
      th: `ดำเนินมาตรการปรับตัวที่มีหลักฐานรองรับ ได้แก่: ${interventionNamesTh}`,
      en: `Implement evidence-backed climate adaptation interventions: ${interventionNamesEn}`,
    },
    outputs: {
      th: outputsTh.length > 0 ? outputsTh : ['ติดตั้งระบบและมาตรการปรับตัวตามแผนงาน'],
      en: outputsEn.length > 0 ? outputsEn : ['Deploy scheduled adaptation measures'],
    },
    outcomes: {
      th: outcomesTh,
      en: outcomesEn,
    },
    impact: {
      th: `ชุมชนมีความมั่นคงทางเศรษฐกิจและสังคม พร้อมรับมือวิกฤตสภาพภูมิอากาศอย่างยั่งยืน`,
      en: `Community achieves socio-economic resilience and sustainable long-term climate readiness`,
    },
  };
}

/**
 * Calculates budget breakdown based on selected interventions and requested total.
 */
function buildBudgetBreakdown(
  interventions: Intervention[],
  targetBudget?: number
): { breakdown: BudgetItem[]; total: number } {
  const items: BudgetItem[] = [];
  let calculatedTotal = 0;

  if (interventions.length === 0) {
    const defaultCost = targetBudget || 50000;
    items.push({
      item_th: 'งบประมาณดำเนินกิจกรรมปรับตัวและเก็บข้อมูลหน้างาน',
      item_en: 'Operational budget for adaptation activities & field monitoring',
      category: 'operations',
      cost: defaultCost,
      justification_th: 'สำหรับจัดซื้ออุปกรณ์พื้นฐานและการติดตามผลรายสัปดาห์',
      justification_en: 'For baseline equipment procurement and weekly field MRV tracking',
    });
    return { breakdown: items, total: defaultCost };
  }

  for (const inv of interventions) {
    const cost = inv.cost_high || inv.cost_low || 25000;
    calculatedTotal += cost;
    items.push({
      item_th: `มาตรการ: ${inv.name}`,
      item_en: `Intervention: ${inv.name}`,
      category: inv.category || 'adaptation',
      cost: cost,
      justification_th: inv.maintenance_notes || 'ค่าจัดซื้อ ติดตั้ง และบำรุงรักษาในระยะทดสอบ',
      justification_en: inv.description_en || 'Procurement, installation, and pilot maintenance',
    });
  }

  const finalTotal = targetBudget !== undefined && targetBudget > 0 ? targetBudget : calculatedTotal;

  // Add field instrumentation/MRV reserve if budget allows
  items.push({
    item_th: 'ระบบบันทึกหลักฐานและติดตามผล (MRV & Ledger Instrumentation)',
    item_en: 'MRV Evidence logging and audit ledger management',
    category: 'instrumentation',
    cost: Math.round(finalTotal * 0.1),
    justification_th: 'สำหรับจัดทำบันทึกชั่งน้ำหนัก ภาพถ่ายหลักฐาน และบัญชีชุมชน',
    justification_en: 'For weigh tickets, photo audit hash logging, and open community ledger',
  });

  const sumTotal = items.reduce((acc, curr) => acc + curr.cost, 0);

  return { breakdown: items, total: sumTotal };
}

/**
 * Generates formatted Markdown proposal in Thai.
 */
function formatMarkdownTh(proposal: {
  title: string;
  orgName: string;
  location: string;
  executiveSummary: string;
  toc: TheoryOfChange;
  budgetBreakdown: BudgetItem[];
  budgetTotal: number;
  timelineDays: number;
}): string {
  const budgetTable = proposal.budgetBreakdown
    .map((b) => `| ${b.item_th} | ${b.category} | ${b.cost.toLocaleString('th-TH')} บาท | ${b.justification_th} |`)
    .join('\n');

  const outputsList = proposal.toc.outputs.th.map((o) => `- ${o}`).join('\n');
  const outcomesList = proposal.toc.outcomes.th.map((o) => `- ${o}`).join('\n');

  return `# ข้อเสนอโครงการ: ${proposal.title}
**หน่วยงาน/ชุมชน:** ${proposal.orgName} (${proposal.location})
**ระยะเวลาดำเนินงาน:** ${proposal.timelineDays} วัน
**งบประมาณรวม:** ${proposal.budgetTotal.toLocaleString('th-TH')} บาท
**สถานะการตรวจสอบ:** ⚠️ รอการยืนยันจากผู้รับผิดชอบโครงการ (Requires Human Review)

---

## 1. บทสรุปผู้บริหาร (Executive Summary)
${proposal.executiveSummary}

## 2. ทฤษฎีการเปลี่ยนแปลง (Theory of Change)
- **ปัญหาหลัก:** ${proposal.toc.problem.th}
- **มาตรการแก้ไข:** ${proposal.toc.intervention.th}
- **ผลผลิต (Outputs):**
${outputsList}
- **ผลลัพธ์ (Outcomes):**
${outcomesList}
- **ผลกระทบระยะยาว (Impact):** ${proposal.toc.impact.th}

## 3. แผนงบประมาณและรายละเอียดค่าใช้จ่าย
| รายการ | หมวดหมู่ | งบประมาณ | คำชี้แจง |
|---|---|---|---|
${budgetTable}

## 4. แผนการติดตามผลและบันทึกหลักฐาน (MRV)
- การบันทึกข้อมูลหน้างานผ่านระบบ Offline-First Evidence Queue พร้อมระบบตรวจทาน SHA-256 Hash
- บัญชีเปิดเผยแบบบันทึกต่อเนื่อง (Append-only Ledger) รองรับการตรวจสอบย้อนหลัง
`;
}

/**
 * Generates formatted Markdown proposal in English.
 */
function formatMarkdownEn(proposal: {
  title: string;
  orgName: string;
  location: string;
  executiveSummary: string;
  toc: TheoryOfChange;
  budgetBreakdown: BudgetItem[];
  budgetTotal: number;
  timelineDays: number;
}): string {
  const budgetTable = proposal.budgetBreakdown
    .map((b) => `| ${b.item_en} | ${b.category} | THB ${b.cost.toLocaleString('en-US')} | ${b.justification_en} |`)
    .join('\n');

  const outputsList = proposal.toc.outputs.en.map((o) => `- ${o}`).join('\n');
  const outcomesList = proposal.toc.outcomes.en.map((o) => `- ${o}`).join('\n');

  return `# Project Proposal: ${proposal.title}
**Organization / Community:** ${proposal.orgName} (${proposal.location})
**Timeline:** ${proposal.timelineDays} days
**Total Budget:** THB ${proposal.budgetTotal.toLocaleString('en-US')}
**Review Status:** ⚠️ Requires Human Review & Operator Confirmation

---

## 1. Executive Summary
${proposal.executiveSummary}

## 2. Theory of Change
- **Problem Statement:** ${proposal.toc.problem.en}
- **Interventions:** ${proposal.toc.intervention.en}
- **Outputs:**
${outputsList}
- **Outcomes:**
${outcomesList}
- **Impact:** ${proposal.toc.impact.en}

## 3. Budget Breakdown & Justification
| Item | Category | Cost (THB) | Justification |
|---|---|---|---|
${budgetTable}

## 4. Monitoring, Reporting & Verification (MRV)
- Offline-first evidence capture with cryptographic SHA-256 integrity verification.
- Transparent append-only financial and resource ledger with full correction traceability.
`;
}

/**
 * Composes a full climate action project proposal draft.
 * Always sets requires_human_review = true and tags fields needing human confirmation.
 */
export function composeProjectProposal(input: ComposeProjectInput): ProjectProposalDraft {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input payload for project proposal composition');
  }

  const projectId = input.project_id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const priorityId = input.priority_id || input.priority?.id;

  const orgName = input.organization?.name || 'ชุมชนนำร่อง (Pilot Community)';
  const orgType = input.organization?.org_type || 'market';
  const location = [
    input.organization?.subdistrict,
    input.organization?.district,
    input.organization?.province || 'กรุงเทพมหานคร',
  ]
    .filter(Boolean)
    .join(', ') || 'กรุงเทพมหานคร';

  const problemStatement =
    input.problem_statement ||
    input.priority?.problem_statement ||
    'ความเสี่ยงจากคลื่นความร้อนและน้ำท่วมขังในพื้นที่ค้าขาย';

  const interventions = Array.isArray(input.interventions) ? input.interventions : [];

  const { breakdown, total: budgetTotal } = buildBudgetBreakdown(interventions, input.budget_total);
  const timelineDays = input.timeline_days || 45;

  const titleTh =
    typeof input.custom_title === 'object' && input.custom_title?.th
      ? input.custom_title.th
      : typeof input.custom_title === 'string'
        ? input.custom_title
        : `โครงการเพิ่มขีดความสามารถการรับมือสภาพภูมิอากาศ: ${orgName}`;

  const titleEn =
    typeof input.custom_title === 'object' && input.custom_title?.en
      ? input.custom_title.en
      : `Climate Resilience & Adaptation Action Plan: ${orgName}`;

  const executiveSummaryTh = `โครงการนี้มีเป้าหมายเพื่อเสริมสร้างศักยภาพการปรับตัวต่อสภาพภูมิอากาศสำหรับ ${orgName} โดยมุ่งเน้นการแก้ไขปัญหา "${problemStatement}" ผ่านมาตรการเชิงปฏิบัติการที่วัดผลได้จริง ภายในกรอบระยะเวลา ${timelineDays} วัน ใช้งบประมาณทั้งสิ้น ${budgetTotal.toLocaleString('th-TH')} บาท พร้อมระบบตรวจสอบหลักฐาน MRV และบัญชีชุมชนที่โปร่งใส`;

  const executiveSummaryEn = `This project strengthens localized climate adaptation resilience for ${orgName}, addressing "${problemStatement}" through actionable, verified interventions over ${timelineDays} days with a total budget of THB ${budgetTotal.toLocaleString('en-US')}, supported by robust MRV and open ledger auditing.`;

  const toc = buildTheoryOfChange(problemStatement, interventions, orgName);

  const formattedTh = formatMarkdownTh({
    title: titleTh,
    orgName,
    location,
    executiveSummary: executiveSummaryTh,
    toc,
    budgetBreakdown: breakdown,
    budgetTotal,
    timelineDays,
  });

  const formattedEn = formatMarkdownEn({
    title: titleEn,
    orgName,
    location,
    executiveSummary: executiveSummaryEn,
    toc,
    budgetBreakdown: breakdown,
    budgetTotal,
    timelineDays,
  });

  return {
    project_id: projectId,
    priority_id: priorityId,
    title: {
      th: titleTh,
      en: titleEn,
    },
    status: 'draft',
    organization: {
      name: orgName,
      org_type: orgType,
      location,
    },
    executive_summary: {
      th: executiveSummaryTh,
      en: executiveSummaryEn,
    },
    theory_of_change: toc,
    budget_breakdown: breakdown,
    budget_total: budgetTotal,
    timeline_days: timelineDays,
    interventions,
    requires_human_review: true,
    fields_needing_confirmation: ['theory_of_change', 'executive_summary'],
    formatted_markdown: {
      th: formattedTh,
      en: formattedEn,
    },
    composed_at: new Date().toISOString(),
  };
}
