import { describe, expect, test } from 'bun:test';
import { composeProjectProposal } from '../src/domain/composer';
import type { Intervention } from '../src/domain/types';

describe('Project Composer Domain Engine', () => {
  const sampleInterventions: Intervention[] = [
    {
      id: 'inv_misting_01',
      name: 'จุดพ่นละอองน้ำลดความร้อน (High-Pressure Misting Station)',
      category: 'heat_adaptation',
      cost_low: 15000,
      cost_high: 25000,
      timeline_days: 14,
      maintenance_notes: 'ล้างหัวพ่นทุก 2 สัปดาห์ ตรวจสอบปั๊มน้ำ',
      description_en: 'High-pressure misting cooling station for market walkway',
    },
    {
      id: 'inv_waste_01',
      name: 'สถานีคัดแยกและหมักขยะอินทรีย์ (Organic Waste Composting Station)',
      category: 'waste_management',
      cost_low: 10000,
      cost_high: 18000,
      timeline_days: 21,
      maintenance_notes: 'กลับกองปุ๋ยสัปดาห์ละ 1 ครั้ง วัดอุณหภูมิ',
      description_en: 'Market organic waste sorting and rapid composting station',
    },
  ];

  test('generates complete project proposal draft with required human review flags', () => {
    const proposal = composeProjectProposal({
      problem_statement: 'พ่อค้าแม่ค้าและผู้สูงอายุเผชิญความร้อนสูงกว่า 40°C และขยะอินทรีย์เน่าเสีย',
      organization: {
        name: 'ตลาดชุมชนร่มเย็น',
        org_type: 'market',
        province: 'กรุงเทพมหานคร',
        district: 'จตุจักร',
      },
      interventions: sampleInterventions,
      budget_total: 60000,
      timeline_days: 45,
    });

    expect(proposal.project_id).toBeDefined();
    expect(proposal.status).toBe('draft');

    // Section E / Plan Gate Requirement: requires_human_review MUST be true
    expect(proposal.requires_human_review).toBe(true);

    // Section F / API Spec Requirement: fields_needing_confirmation
    expect(proposal.fields_needing_confirmation).toContain('theory_of_change');
    expect(proposal.fields_needing_confirmation).toContain('executive_summary');

    // Theory of change bilingual verification
    expect(proposal.theory_of_change.problem.th).toContain('ตลาดชุมชนร่มเย็น');
    expect(proposal.theory_of_change.problem.en).toContain('ตลาดชุมชนร่มเย็น');
    expect(proposal.theory_of_change.outputs.th.length).toBeGreaterThanOrEqual(2);
    expect(proposal.theory_of_change.outputs.en.length).toBeGreaterThanOrEqual(2);
    expect(proposal.theory_of_change.outcomes.th.length).toBeGreaterThanOrEqual(1);
    expect(proposal.theory_of_change.outcomes.en.length).toBeGreaterThanOrEqual(1);

    // Budget breakdown verification
    expect(proposal.budget_breakdown.length).toBeGreaterThanOrEqual(2);
    expect(proposal.budget_total).toBeGreaterThan(0);

    // Dual language markdown formatting
    expect(proposal.formatted_markdown.th).toContain('# ข้อเสนอโครงการ:');
    expect(proposal.formatted_markdown.th).toContain('ทฤษฎีการเปลี่ยนแปลง');
    expect(proposal.formatted_markdown.en).toContain('# Project Proposal:');
    expect(proposal.formatted_markdown.en).toContain('Theory of Change');
  });

  test('handles minimal inputs with robust defaults', () => {
    const proposal = composeProjectProposal({
      interventions: [],
    });

    expect(proposal.project_id).toBeDefined();
    expect(proposal.requires_human_review).toBe(true);
    expect(proposal.budget_breakdown.length).toBeGreaterThan(0);
    expect(proposal.formatted_markdown.th).toBeDefined();
    expect(proposal.formatted_markdown.en).toBeDefined();
  });

  test('throws descriptive error on null or malformed input', () => {
    expect(() => composeProjectProposal(null as any)).toThrow('Invalid input payload');
  });
});
