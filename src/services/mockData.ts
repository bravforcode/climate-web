// Climate Action OS - Initial Mock Seed Dataset
// Matching PostgreSQL seed data for "Climate Safe Market Pilot (ตลาดสะพานขาว / ตลาดคลองเตย กทม.)"

import {
  Organization,
  User,
  ConsentRecord,
  RiskAssessment,
  VulnerabilityZone,
  CommunityPriority,
  Intervention,
  Project,
  ProjectIntervention,
  FundingCallSource,
  FundingCall,
  FundingMatch,
  Task,
  Evidence,
  LedgerEntry,
  Notification,
  ReplicationPlaybook,
  AuditLog,
} from '../types/database';

export const initialOrganizations: Organization[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'ตลาดคลองเตย (Khlong Toei Market)',
    org_type: 'market',
    province: 'กรุงเทพมหานคร',
    district: 'คลองเตย',
    subdistrict: 'คลองเตย',
    geom: { type: 'Point', coordinates: [100.5583, 13.7197] },
    created_at: '2026-08-01T08:00:00+07:00',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'ตลาดสะพานขาว (Saphan Khao Market)',
    org_type: 'market',
    province: 'กรุงเทพมหานคร',
    district: 'ดุสิต',
    subdistrict: 'สี่แยกมหานาค',
    geom: { type: 'Point', coordinates: [100.5186, 13.757] },
    created_at: '2026-08-01T08:00:00+07:00',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'สำนักงานเขตคลองเตย กรุงเทพมหานคร (BMA)',
    org_type: 'municipality',
    province: 'กรุงเทพมหานคร',
    district: 'คลองเตย',
    subdistrict: 'คลองเตย',
    geom: { type: 'Point', coordinates: [100.5841, 13.7082] },
    created_at: '2026-08-01T08:00:00+07:00',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'กองทุนริเริ่มเพื่อสภาพภูมิอากาศแห่งประเทศไทย (ThaiCI)',
    org_type: 'funder',
    province: 'กรุงเทพมหานคร',
    district: 'พญาไท',
    subdistrict: 'สามเสนใน',
    geom: { type: 'Point', coordinates: [100.5401, 13.7794] },
    created_at: '2026-08-01T08:00:00+07:00',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'สหกรณ์บริการชุมชนริมคลองเตย',
    org_type: 'cooperative',
    province: 'กรุงเทพมหานคร',
    district: 'คลองเตย',
    subdistrict: 'คลองเตย',
    geom: { type: 'Point', coordinates: [100.5602, 13.7175] },
    created_at: '2026-08-01T08:00:00+07:00',
  },
];

export const initialUsers: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    organization_id: '00000000-0000-0000-0000-000000000001',
    role: 'community_member',
    display_name: 'สมชาย ค้าเจริญ (แกนนำแม่ค้าตลาดคลองเตย)',
    line_user_id: 'U11111111111111111111111111111111',
    created_at: '2026-08-15T09:00:00+07:00',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    organization_id: '00000000-0000-0000-0000-000000000002',
    role: 'community_member',
    display_name: 'วรรณา มุ่งพัฒนา (กลุ่มหาบเร่แผงลอยสะพานขาว)',
    line_user_id: 'U22222222222222222222222222222222',
    created_at: '2026-08-15T09:00:00+07:00',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    organization_id: '00000000-0000-0000-0000-000000000001',
    role: 'operator',
    display_name: 'ณัฐพงศ์ วิริยะกิจ (ผู้ประสานงาน Climate Action OS)',
    line_user_id: 'U33333333333333333333333333333333',
    created_at: '2026-08-15T09:00:00+07:00',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    organization_id: '00000000-0000-0000-0000-000000000003',
    role: 'local_officer',
    display_name: 'กัญญา รักษ์สิ่งแวดล้อม (นักวิชาการสุขาภิบาล เขตคลองเตย)',
    line_user_id: 'U44444444444444444444444444444444',
    created_at: '2026-08-15T09:00:00+07:00',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    organization_id: '00000000-0000-0000-0000-000000000004',
    role: 'funder',
    display_name: 'ดร. นันทิดา ชัยพฤกษ์ (ผู้จัดการกองทุน ThaiCI & ONEP)',
    line_user_id: 'U55555555555555555555555555555555',
    created_at: '2026-08-15T09:00:00+07:00',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    organization_id: '00000000-0000-0000-0000-000000000003',
    role: 'admin',
    display_name: 'ผู้ดูแลระบบกลาง (System Administrator)',
    line_user_id: 'U66666666666666666666666666666666',
    created_at: '2026-08-15T09:00:00+07:00',
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    organization_id: '00000000-0000-0000-0000-000000000004',
    role: 'auditor',
    display_name: 'ดร. พิชญ์ โคทาสาร (ผู้ตรวจสอบอิสระ / 3rd Party Grant Auditor)',
    line_user_id: 'U77777777777777777777777777777777',
    created_at: '2026-08-15T09:00:00+07:00',
  },
];

export const initialConsentRecords: ConsentRecord[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    user_id: '11111111-1111-1111-1111-111111111111',
    consent_type: 'evidence_capture',
    granted: true,
    granted_at: '2026-08-18T08:30:00+07:00',
    withdrawn_at: null,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    user_id: '11111111-1111-1111-1111-111111111111',
    consent_type: 'vulnerability_data',
    granted: true,
    granted_at: '2026-08-18T08:30:00+07:00',
    withdrawn_at: null,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    user_id: '11111111-1111-1111-1111-111111111111',
    consent_type: 'photo_publication',
    granted: true,
    granted_at: '2026-08-18T08:30:00+07:00',
    withdrawn_at: null,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    user_id: '22222222-2222-2222-2222-222222222222',
    consent_type: 'evidence_capture',
    granted: true,
    granted_at: '2026-08-19T09:00:00+07:00',
    withdrawn_at: null,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    user_id: '22222222-2222-2222-2222-222222222222',
    consent_type: 'vulnerability_data',
    granted: true,
    granted_at: '2026-08-19T09:00:00+07:00',
    withdrawn_at: null,
  },
];

export const initialRiskAssessments: RiskAssessment[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    hazard_type: 'flood',
    zone: {
      type: 'Polygon',
      coordinates: [
        [
          [100.555, 13.717],
          [100.562, 13.717],
          [100.562, 13.723],
          [100.555, 13.723],
          [100.555, 13.717],
        ],
      ],
    },
    risk_level: 'high',
    confidence: 'high',
    source_type: 'api_automated',
    source_name: 'GISTDA Flood Monitoring API (1-Day Inundation Extent)',
    fetched_at: '2026-08-24T06:00:00+07:00',
    valid_until: '2026-08-26T06:00:00+07:00',
    verified_by: '33333333-3333-3333-3333-333333333333',
    raw_payload: {
      satellite: 'Sentinel-1A SAR',
      flood_depth_cm: 25,
      inundation_prob: 0.88,
      drainage_congestion: true,
      affected_area_sqm: 35000,
    },
    created_at: '2026-08-24T06:05:00+07:00',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    hazard_type: 'heat',
    zone: {
      type: 'Polygon',
      coordinates: [
        [
          [100.554, 13.716],
          [100.563, 13.716],
          [100.563, 13.724],
          [100.554, 13.724],
          [100.554, 13.716],
        ],
      ],
    },
    risk_level: 'severe',
    confidence: 'high',
    source_type: 'manual_curated',
    source_name: 'TMD TMDAPI & Bangkok Urban Climate Observatory',
    fetched_at: '2026-08-24T11:30:00+07:00',
    valid_until: '2026-08-25T18:00:00+07:00',
    verified_by: '33333333-3333-3333-3333-333333333333',
    raw_payload: {
      max_temp_c: 41.8,
      heat_index_c: 48.2,
      wbgt_c: 33.5,
      uhi_intensity_c: 4.2,
      warning_level: 'extreme_danger',
    },
    created_at: '2026-08-24T11:35:00+07:00',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    hazard_type: 'pm25',
    zone: {
      type: 'Polygon',
      coordinates: [
        [
          [100.515, 13.754],
          [100.522, 13.754],
          [100.522, 13.76],
          [100.515, 13.76],
          [100.515, 13.754],
        ],
      ],
    },
    risk_level: 'medium',
    confidence: 'medium',
    source_type: 'api_automated',
    source_name: 'PCD & GISTDA Air Quality Satellite Ingestion',
    fetched_at: '2026-08-24T07:00:00+07:00',
    valid_until: '2026-08-25T07:00:00+07:00',
    verified_by: '44444444-4444-4444-4444-444444444444',
    raw_payload: {
      pm25_ug_m3: 38.5,
      aqi: 105,
      sensor_count: 4,
      primary_source: 'traffic_and_combustion',
    },
    created_at: '2026-08-24T07:05:00+07:00',
  },
];

export const initialVulnerabilityZones: VulnerabilityZone[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    zone: {
      type: 'Polygon',
      coordinates: [
        [
          [100.556, 13.718],
          [100.561, 13.718],
          [100.561, 13.722],
          [100.556, 13.722],
          [100.556, 13.718],
        ],
      ],
    },
    elderly_count: 145,
    disability_count: 32,
    low_income_household_count: 340,
    outdoor_worker_count: 520,
    total_population: 1850,
    k_anonymity_suppressed: false,
    updated_at: '2026-08-20T10:00:00+07:00',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    zone: {
      type: 'Polygon',
      coordinates: [
        [
          [100.517, 13.7555],
          [100.52, 13.7555],
          [100.52, 13.7585],
          [100.517, 13.7585],
          [100.517, 13.7555],
        ],
      ],
    },
    elderly_count: null, // suppressed (was 6, < 10)
    disability_count: null, // suppressed (was 2, < 10)
    low_income_household_count: 18,
    outdoor_worker_count: 25,
    total_population: 48,
    k_anonymity_suppressed: true,
    updated_at: '2026-08-20T10:00:00+07:00',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    zone: {
      type: 'Polygon',
      coordinates: [
        [
          [100.5595, 13.714],
          [100.5645, 13.714],
          [100.5645, 13.7185],
          [100.5595, 13.7185],
          [100.5595, 13.714],
        ],
      ],
    },
    elderly_count: 210,
    disability_count: 58,
    low_income_household_count: 512,
    outdoor_worker_count: 880,
    total_population: 2640,
    k_anonymity_suppressed: false,
    updated_at: '2026-08-21T09:30:00+07:00',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    zone: {
      type: 'Polygon',
      coordinates: [
        [
          [100.562, 13.7095],
          [100.5665, 13.7095],
          [100.5665, 13.7135],
          [100.562, 13.7135],
          [100.562, 13.7095],
        ],
      ],
    },
    elderly_count: 178,
    disability_count: 41,
    low_income_household_count: 296,
    outdoor_worker_count: 415,
    total_population: 1980,
    k_anonymity_suppressed: false,
    updated_at: '2026-08-22T14:10:00+07:00',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    zone: {
      type: 'Polygon',
      coordinates: [
        [
          [100.5155, 13.7525],
          [100.5205, 13.7525],
          [100.5205, 13.757],
          [100.5155, 13.757],
          [100.5155, 13.7525],
        ],
      ],
    },
    elderly_count: 96,
    disability_count: 27,
    low_income_household_count: 204,
    outdoor_worker_count: 368,
    total_population: 1120,
    k_anonymity_suppressed: false,
    updated_at: '2026-08-23T08:45:00+07:00',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    zone: {
      type: 'Polygon',
      coordinates: [
        [
          [100.5535, 13.7225],
          [100.5555, 13.7225],
          [100.5555, 13.7245],
          [100.5535, 13.7225],
          [100.5535, 13.7225],
        ],
      ],
    },
    elderly_count: null, // suppressed (was 8, < k=10)
    disability_count: 11,
    low_income_household_count: 34,
    outdoor_worker_count: 52,
    total_population: 88,
    k_anonymity_suppressed: true,
    updated_at: '2026-08-23T16:20:00+07:00',
  },
];

export const initialCommunityPriorities: CommunityPriority[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    organization_id: '00000000-0000-0000-0000-000000000001',
    problem_statement:
      'วิกฤตความร้อนสะสมในโรงเรือนตลาดคลองเตยส่งผลให้แรงงานและผู้สูงอายุเสี่ยงโรคลมแดด และขยะสดเน่าเสียรวดเร็วก่อมลพิษจากน้ำท่วมขัง',
    urgency: 5.0,
    beneficiaries_est: 2400,
    feasibility: 4.5,
    equity_score: 5.0,
    cost_est: 120000.0,
    priority_score: (5.0 * 2400 * 4.5 * 5.0) / 120000.0, // 2.25
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: '2026-08-20T14:00:00+07:00',
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    organization_id: '00000000-0000-0000-0000-000000000002',
    problem_statement:
      'พื้นที่ตลาดสะพานขาวขาดร่มเงาและจุดระบายน้ำเมื่อเกิดฝนตกหนักฉับพลัน ทำให้สินค้าเกษตรเสียหายและผู้ค้ากลางแจ้งหมดสติจากไอร้อน',
    urgency: 4.5,
    beneficiaries_est: 850,
    feasibility: 4.0,
    equity_score: 4.5,
    cost_est: 85000.0,
    priority_score: (4.5 * 850 * 4.0 * 4.5) / 85000.0, // 0.81
    created_by: '22222222-2222-2222-2222-222222222222',
    created_at: '2026-08-21T11:00:00+07:00',
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    organization_id: '00000000-0000-0000-0000-000000000001',
    problem_statement:
      'ฝุ่น PM2.5 ช่วงหมอกรุงที่สะสมในโรงเรือนปิดของตลาดคลองเตย ทำให้เด็กและผู้สูงอายุในพื้นที่เป็นโรคทางเดินหายใจเพิ่มขึ้นช่วงมกราคม-เมษายนทุกปี',
    urgency: 4.8,
    beneficiaries_est: 1800,
    feasibility: 4.2,
    equity_score: 4.6,
    cost_est: 95000.0,
    priority_score: (4.8 * 1800 * 4.2 * 4.6) / 95000.0, // ≈1.67
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: '2026-08-22T10:20:00+07:00',
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    organization_id: '00000000-0000-0000-0000-000000000002',
    problem_statement:
      'ลานตากสินค้าเกษตรของตลาดสะพานขาวไม่มีชานยกและร่องระบายน้ำขนาดเล็ก ทำให้น้ำท่วมขังหลังฝนตก 15-30 นาที สินค้าเน่าเสียและพื้นลื่นเสี่ยงอุบัติเหตุผู้ค้าสูงวัย',
    urgency: 4.2,
    beneficiaries_est: 600,
    feasibility: 4.8,
    equity_score: 4.2,
    cost_est: 45000.0,
    priority_score: (4.2 * 600 * 4.8 * 4.2) / 45000.0, // ≈2.26 (rank #1 - quick win)
    created_by: '22222222-2222-2222-2222-222222222222',
    created_at: '2026-08-23T13:40:00+07:00',
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    organization_id: '00000000-0000-0000-0000-000000000005',
    problem_statement:
      'ค่าไฟเครื่องผลิตน้ำแข็งของสหกรณ์ริมคลองเตยสูงถึง 38,000 บาท/เดือน กดดันรายได้สมาชิก และเครื่องปั่นไฟสำรองเดิมปล่อยควันดำช่วงไฟดับจากพายุฤดูร้อน',
    urgency: 3.5,
    beneficiaries_est: 320,
    feasibility: 4.0,
    equity_score: 3.8,
    cost_est: 240000.0,
    priority_score: (3.5 * 320 * 4.0 * 3.8) / 240000.0, // ≈0.71
    created_by: '33333333-3333-3333-3333-333333333333',
    created_at: '2026-08-23T17:05:00+07:00',
  },
  {
    id: 'c1000000-0000-0000-0000-000000000006',
    organization_id: '00000000-0000-0000-0000-000000000003',
    problem_statement:
      'หลังคาซีเมนต์สีเข้มของอาคารร้านค้าในสังกัดเขตคลองเตยสะสมความร้อนจนอุณหภูมิผิวหลังคาแตะ 65°C ช่วงบ่าย เพิ่มภาระเครื่องปรับอากาศและความเสี่ยงลมแดดของผู้ใช้พื้นที่ชั้นบน',
    urgency: 4.0,
    beneficiaries_est: 3100,
    feasibility: 3.8,
    equity_score: 4.0,
    cost_est: 380000.0,
    priority_score: (4.0 * 3100 * 3.8 * 4.0) / 380000.0, // ≈1.24
    created_by: '44444444-4444-4444-4444-444444444444',
    created_at: '2026-08-24T09:55:00+07:00',
  },
];

export const initialInterventions: Intervention[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    name: 'Heat Refuge Station (จุดพักคลายร้อนและปฐมพยาบาลอุณหภูมิสูง)',
    category: 'heat_adaptation',
    cost_low: 25000.0,
    cost_high: 45000.0,
    timeline_days: 14,
    maintenance_notes:
      'ตรวจระดับน้ำระบบพ่นหมอกทุกวัน ล้างแผ่นกรองอากาศและเปลี่ยนน้ำกรองทุก 2 สัปดาห์',
    permit_required: false,
    evidence_refs: ['photo', 'gps_checkin', 'sensor_reading'],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    name: 'Organic Food Waste Composting Station (สถานีคัดแยกและหมักขยะอินทรีย์ลดก๊าซมีเทน)',
    category: 'waste_decarbonization',
    cost_low: 35000.0,
    cost_high: 60000.0,
    timeline_days: 21,
    maintenance_notes:
      'กลับกองปุ๋ยสัปดาห์ละ 2 ครั้ง เติมกากน้ำตาลและหัวเชื้อจุลินทรีย์ EM ตรวจวัดความชื้น',
    permit_required: false,
    evidence_refs: ['photo', 'weigh_ticket', 'invoice'],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    name: 'Permeable Misting Canopy (กันสาดพ่นละอองไอเย็นและระบายอากาศ)',
    category: 'heat_adaptation',
    cost_low: 18000.0,
    cost_high: 32000.0,
    timeline_days: 7,
    maintenance_notes:
      'ล้างหัวฉีดพ่นหมอกป้องกันตะกรันอุดตันทุกเดือน ตรวจสอบสายส่งแรงดันสูง',
    permit_required: false,
    evidence_refs: ['photo', 'invoice', 'sensor_reading'],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    name: 'Solar Cool Roof (หลังคาสะท้อนความร้อนพร้อมโซลาร์เซลล์ขนาดเล็กระบายอากาศ)',
    category: 'energy_adaptation',
    cost_low: 50000.0,
    cost_high: 95000.0,
    timeline_days: 30,
    maintenance_notes: 'ล้างฝุ่นแผงโซลาร์เซลล์ทุกเดือน ตรวจเช็คอินเวอร์เตอร์และสายดิน',
    permit_required: true,
    evidence_refs: ['photo', 'invoice', 'sensor_reading'],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    name: 'Flood Barrier Drain Gate (ประตูกั้นน้ำท่วมพร้อมระบบสูบน้ำและตะแกรงดักขยะท่อระบาย)',
    category: 'flood_resilience',
    cost_low: 40000.0,
    cost_high: 75000.0,
    timeline_days: 14,
    maintenance_notes:
      'ลอกขยะออกจากตะแกรงดักทุกวันหลังตลาดวาย ทดสอบปั๊มสูบน้ำอัตโนมัติทุกสัปดาห์',
    permit_required: true,
    evidence_refs: ['photo', 'invoice', 'gps_checkin'],
  },
];

export const initialProjects: Project[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    organization_id: '00000000-0000-0000-0000-000000000001',
    title:
      'Climate Safe Khlong Toei Market Pilot (ตลาดคลองเตยปลอดภัย สู้ภัยความร้อนและจัดการขยะอินทรีย์)',
    status: 'implementing',
    priority_id: 'c1000000-0000-0000-0000-000000000001',
    theory_of_change:
      'หากชุมชนติดตั้งจุดพักคลายร้อน (Heat Refuge) และระบบดักแยกหมักขยะอินทรีย์ จะลดอัตราการเจ็บป่วยจากโรคลมแดดของแรงงานเข็นของและแม่ค้า 40% และเปลี่ยนขยะเศษผักผลไม้ 150 กก./วัน ให้เป็นปุ๋ยหมักชีวภาพ ลดการปล่อยก๊าซมีเทนในหลุมฝังกลบ',
    budget_total: 120000.0,
    timeline_days: 45,
    created_at: '2026-08-21T15:00:00+07:00',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    organization_id: '00000000-0000-0000-0000-000000000002',
    title: 'Saphan Khao Cool & Resilient Corridor (สะพานขาวเย็นใจ ระบายน้ำไว สู้ภัยภูมิอากาศ)',
    status: 'composed',
    priority_id: 'c1000000-0000-0000-0000-000000000002',
    theory_of_change:
      'หากติดตั้งกันสาดพ่นละอองไอเย็นและประตูกั้นน้ำท่วม จะลดอุณหภูมิผิวสัมผัสทางเดินตลาดลง 3-4°C และป้องกันน้ำท่วมขังทำลายผลผลิตเกษตร',
    budget_total: 85000.0,
    timeline_days: 30,
    created_at: '2026-08-22T10:00:00+07:00',
  },
];

export const initialProjectInterventions: ProjectIntervention[] = [
  {
    project_id: 'e0000000-0000-0000-0000-000000000001',
    intervention_id: 'd0000000-0000-0000-0000-000000000001',
  },
  {
    project_id: 'e0000000-0000-0000-0000-000000000001',
    intervention_id: 'd0000000-0000-0000-0000-000000000002',
  },
  {
    project_id: 'e0000000-0000-0000-0000-000000000001',
    intervention_id: 'd0000000-0000-0000-0000-000000000003',
  },
  {
    project_id: 'e0000000-0000-0000-0000-000000000002',
    intervention_id: 'd0000000-0000-0000-0000-000000000003',
  },
  {
    project_id: 'e0000000-0000-0000-0000-000000000002',
    intervention_id: 'd0000000-0000-0000-0000-000000000005',
  },
];

export const initialFundingCallSources: FundingCallSource[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    source_name: 'Thai Climate Initiative (ThaiCI / ONEP / GIZ)',
    ingestion_method: 'manual_only',
    commercial_use_allowed: true,
    attribution_required: true,
    notes:
      'กองทุนริเริ่มเพื่อสภาพภูมิอากาศแห่งประเทศไทย ภายใต้ความร่วมมือไทย-เยอรมัน (IKI) งบโครงการ adaptation และ mitigation',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    source_name: 'กองทุนสิ่งแวดล้อม กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม',
    ingestion_method: 'manual_only',
    commercial_use_allowed: false,
    attribution_required: true,
    notes: 'กองทุนสิ่งแวดล้อมตาม พ.ร.บ.ส่งเสริมและรักษาคุณภาพสิ่งแวดล้อมแห่งชาติ',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    source_name: 'สำนักสิ่งแวดล้อม กรุงเทพมหานคร (BMA Environment Department)',
    ingestion_method: 'api_available_unused',
    commercial_use_allowed: false,
    attribution_required: true,
    notes:
      'โครงการสนับสนุนนวัตกรรมสิ่งแวดล้อมชุมชนและการปรับตัวต่อการเปลี่ยนแปลงสภาพภูมิอากาศเมืองหลวง',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    source_name: 'Green Climate Fund Readiness Program (ผ่าน ONEP National Designated Authority)',
    ingestion_method: 'manual_only',
    commercial_use_allowed: false,
    attribution_required: true,
    notes:
      'ทุนเตรียมความพร้อม GCF สำหรับแผนปรับตัวระดับชุมชน/อปท. เข้าถึงผ่านหน่วยงานกรมอุทยานฯ (ONEP) ในฐานะ NDA ของไทย - ต้องมี Accredited Entity ร่วม',
  },
];

export const initialFundingCalls: FundingCall[] = [
  {
    id: 'fc000000-0000-0000-0000-000000000001',
    source_id: 'f0000000-0000-0000-0000-000000000001',
    funder_name: 'ThaiCI - Urban Adaptation & Heat Management Fund 2026',
    thematic_fit: [
      'heat_adaptation',
      'urban_resilience',
      'community_climate_action',
      'vulnerable_groups',
    ],
    eligibility_notes:
      'สำหรับชุมชนเมือง ตลาดสด หรือสหกรณ์ที่เผชิญวิกฤตคลื่นความร้อนใน กทม. และปริมณฑล มีแผนการวัดผล MRV ชัดเจน',
    max_amount: 500000.0,
    co_financing_required: false,
    application_deadline: '2026-11-30',
    source_url: 'https://thaici.onep.go.th/calls/2026-urban-adaptation',
    entered_by: '33333333-3333-3333-3333-333333333333',
    last_verified_at: '2026-08-20T10:00:00+07:00',
    created_at: '2026-08-20T10:00:00+07:00',
  },
  {
    id: 'fc000000-0000-0000-0000-000000000002',
    source_id: 'f0000000-0000-0000-0000-000000000002',
    funder_name: 'Thailand Environmental Fund - Community Waste Decarbonization 2026',
    thematic_fit: [
      'waste_decarbonization',
      'methane_reduction',
      'organic_waste',
      'circular_economy',
    ],
    eligibility_notes:
      'ชุมชนหรือองค์กรไม่แสวงหากำไร ต้องมีส่วนร่วมสมทบ (Co-financing/In-kind) ไม่น้อยกว่า 10% ของมูลค่าโครงการ',
    max_amount: 300000.0,
    co_financing_required: true,
    application_deadline: '2026-10-15',
    source_url: 'https://envfund.onep.go.th/grants/2026-waste-decarb',
    entered_by: '33333333-3333-3333-3333-333333333333',
    last_verified_at: '2026-08-18T14:30:00+07:00',
    created_at: '2026-08-18T14:30:00+07:00',
  },
  {
    id: 'fc000000-0000-0000-0000-000000000003',
    source_id: 'f0000000-0000-0000-0000-000000000003',
    funder_name: 'BMA Green Innovation Grant (ทุนนวัตกรรมพื้นที่สีเขียวและลดความร้อนเมือง กทม.)',
    thematic_fit: [
      'heat_adaptation',
      'urban_cooling',
      'green_infrastructure',
      'flood_resilience',
    ],
    eligibility_notes: 'ตลาดสดที่จดทะเบียนกับ กทม. หรือมีหนังสือรับรองจากสำนักงานเขตในพื้นที่',
    max_amount: 200000.0,
    co_financing_required: false,
    application_deadline: '2026-12-31',
    source_url: 'https://environment.bangkok.go.th/grant-green-market-2026',
    entered_by: '44444444-4444-4444-4444-444444444444',
    last_verified_at: '2026-08-22T09:15:00+07:00',
    created_at: '2026-08-22T09:15:00+07:00',
  },
  {
    id: 'fc000000-0000-0000-0000-000000000004',
    source_id: 'f0000000-0000-0000-0000-000000000004',
    funder_name: 'GCF Readiness Grant - Community-Based Adaptation Planning (ทุนเตรียมความพร้อม GCF)',
    thematic_fit: [
      'adaptation_planning',
      'capacity_building',
      'community_engagement',
      'vulnerable_groups',
    ],
    eligibility_notes:
      'อปท. / เครือข่ายชุมชน / สหกรณ์ ที่มีแผนปรับตัวระดับพื้นที่และหน่วยงานระดับชาติ (NDA) รับรองแนวทาง - ดำเนินการร่วมกับ Accredited Entity',
    max_amount: 250000.0,
    co_financing_required: false,
    application_deadline: '2027-01-31',
    source_url: 'https://www.gcfreadiness.onep.go.th/community-adaptation-2027',
    entered_by: '55555555-5555-5555-5555-555555555555',
    last_verified_at: '2026-08-24T11:30:00+07:00',
    created_at: '2026-08-24T11:30:00+07:00',
  },
];

export const initialFundingMatches: FundingMatch[] = [
  {
    project_id: 'e0000000-0000-0000-0000-000000000001',
    funding_call_id: 'fc000000-0000-0000-0000-000000000001',
    match_score: 95.5,
    is_human_confirmed: true,
    confirmed_by: '33333333-3333-3333-3333-333333333333',
    confirmed_at: '2026-08-22T11:00:00+07:00',
  },
  {
    project_id: 'e0000000-0000-0000-0000-000000000001',
    funding_call_id: 'fc000000-0000-0000-0000-000000000003',
    match_score: 88.0,
    is_human_confirmed: true,
    confirmed_by: '33333333-3333-3333-3333-333333333333',
    confirmed_at: '2026-08-22T11:15:00+07:00',
  },
  {
    project_id: 'e0000000-0000-0000-0000-000000000001',
    funding_call_id: 'fc000000-0000-0000-0000-000000000002',
    match_score: 76.5,
    is_human_confirmed: false,
    confirmed_by: null,
    confirmed_at: null,
  },
  {
    project_id: 'e0000000-0000-0000-0000-000000000001',
    funding_call_id: 'fc000000-0000-0000-0000-000000000004',
    match_score: 71.0,
    is_human_confirmed: false,
    confirmed_by: null,
    confirmed_at: null,
  },
];

export const initialTasks: Task[] = [
  {
    id: 't0000000-0000-0000-0000-000000000001',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'จัดเตรียมพื้นที่และติดตั้งเต็นท์จุดพักคลายร้อนพร้อมพัดลมไอหมอก (Heat Refuge Setup)',
    assignee_id: '11111111-1111-1111-1111-111111111111',
    status: 'done',
    due_date: '2026-09-05',
  },
  {
    id: 't0000000-0000-0000-0000-000000000002',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'ติดตั้งถังหมักปุ๋ยอินทรีย์ 6 ชุดและระบบชั่งน้ำหนักขยะประจำวัน (Composting Station Setup)',
    assignee_id: '33333333-3333-3333-3333-333333333333',
    status: 'in_progress',
    due_date: '2026-09-12',
  },
  {
    id: 't0000000-0000-0000-0000-000000000003',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    title:
      'จัดอบรมแม่ค้าและแรงงานเข็นของเรื่องสุขอนามัยและการรับมือโรคลมแดด (Heat Safety Training)',
    assignee_id: '44444444-4444-4444-4444-444444444444',
    status: 'done',
    due_date: '2026-09-02',
  },
  {
    id: 't0000000-0000-0000-0000-000000000004',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'ขุดลอกท่อระบายน้ำรอบโซนแผงผักและติดตั้งตะแกรงดักขยะ (Drainage & Waste Screen)',
    assignee_id: '11111111-1111-1111-1111-111111111111',
    status: 'todo',
    due_date: '2026-09-20',
  },
];

export const initialEvidence: Evidence[] = [
  {
    id: 'ev000000-0000-0000-0000-000000000001',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    task_id: 't0000000-0000-0000-0000-000000000001',
    evidence_type: 'photo',
    file_url: 'https://storage.climateactionos.org/evidence/khlongtoei/heat_refuge_completed_01.jpg',
    file_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    captured_at: '2026-08-24T14:30:00+07:00',
    captured_by: '11111111-1111-1111-1111-111111111111',
    geom: { type: 'Point', coordinates: [100.5583, 13.7197] },
    synced_from_offline: false,
  },
  {
    id: 'ev000000-0000-0000-0000-000000000002',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    task_id: 't0000000-0000-0000-0000-000000000002',
    evidence_type: 'weigh_ticket',
    file_url: 'https://storage.climateactionos.org/evidence/khlongtoei/weigh_slip_day1_142kg.pdf',
    file_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    captured_at: '2026-08-24T16:45:00+07:00',
    captured_by: '11111111-1111-1111-1111-111111111111',
    geom: { type: 'Point', coordinates: [100.5585, 13.7199] },
    synced_from_offline: true,
  },
  {
    id: 'ev000000-0000-0000-0000-000000000003',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    task_id: 't0000000-0000-0000-0000-000000000003',
    evidence_type: 'gps_checkin',
    file_url: 'https://storage.climateactionos.org/evidence/khlongtoei/training_attendance_checkin.json',
    file_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    captured_at: '2026-08-24T09:15:00+07:00',
    captured_by: '44444444-4444-4444-4444-444444444444',
    geom: { type: 'Point', coordinates: [100.5583, 13.7197] },
    synced_from_offline: false,
  },
  {
    id: 'ev000000-0000-0000-0000-000000000004',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    task_id: 't0000000-0000-0000-0000-000000000001',
    evidence_type: 'invoice',
    file_url: 'https://storage.climateactionos.org/evidence/khlongtoei/inv_misting_fan_sensors.pdf',
    file_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    captured_at: '2026-08-23T11:20:00+07:00',
    captured_by: '33333333-3333-3333-3333-333333333333',
    geom: { type: 'Point', coordinates: [100.5583, 13.7197] },
    synced_from_offline: false,
  },
];

export const initialLedgerEntries: LedgerEntry[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    entry_type: 'income',
    amount: 50000.0,
    description: 'เงินงวดแรกสนับสนุนโครงการนำร่องจากกองทุนพัฒนาตลาด (Initial Grant Disbursement)',
    corrects_entry_id: null,
    entered_by: '33333333-3333-3333-3333-333333333333',
    entered_at: '2026-08-22T09:00:00+07:00',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    entry_type: 'expense',
    amount: 28500.0,
    description: 'ค่าเต็นท์จุดพักคลายร้อน พัดลมไอหมอก และเซ็นเซอร์วัดอุณหภูมิ/ความชื้น',
    corrects_entry_id: null,
    entered_by: '33333333-3333-3333-3333-333333333333',
    entered_at: '2026-08-23T14:00:00+07:00',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    entry_type: 'expense',
    amount: 16200.0,
    description:
      'ค่าจัดซื้อถังหมักขยะอินทรีย์ 6 ใบและตาชั่งดิจิทัล (บันทึกตัวเลขคลาดเคลื่อนเป็น 16,200 บ.)',
    corrects_entry_id: null,
    entered_by: '11111111-1111-1111-1111-111111111111',
    entered_at: '2026-08-23T15:30:00+07:00',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    entry_type: 'expense',
    amount: -16200.0,
    description: 'ยกเลิกรายการบันทึกผิดค่าถังหมักขยะ (Correction reversal per invoice audit)',
    corrects_entry_id: '10000000-0000-0000-0000-000000000003',
    entered_by: '33333333-3333-3333-3333-333333333333',
    entered_at: '2026-08-23T16:00:00+07:00',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    entry_type: 'expense',
    amount: 14200.0,
    description: 'ค่าจัดซื้อถังหมักขยะอินทรีย์ 6 ใบและตาชั่งดิจิทัล (ยอดที่ถูกต้องตามใบเสร็จจริง)',
    corrects_entry_id: '10000000-0000-0000-0000-000000000003',
    entered_by: '33333333-3333-3333-3333-333333333333',
    entered_at: '2026-08-23T16:05:00+07:00',
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    entry_type: 'volunteer_hours',
    amount: 36.0,
    description: 'ชั่วโมงแรงงานอาสาสมัครแม่ค้าและเยาวชนร่วมประกอบและตั้งสถานีหมักขยะ (36 ชม.)',
    corrects_entry_id: null,
    entered_by: '11111111-1111-1111-1111-111111111111',
    entered_at: '2026-08-24T17:00:00+07:00',
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    project_id: 'e0000000-0000-0000-0000-000000000001',
    entry_type: 'in_kind',
    amount: 4500.0,
    description: 'สนับสนุนกากน้ำตาลและหัวเชื้อ EM จุลินทรีย์จากสำนักงานเขตคลองเตย',
    corrects_entry_id: null,
    entered_by: '44444444-4444-4444-4444-444444444444',
    entered_at: '2026-08-24T17:30:00+07:00',
  },
];

export const initialNotifications: Notification[] = [
  {
    id: 'n0000000-0000-0000-0000-000000000001',
    user_id: '11111111-1111-1111-1111-111111111111',
    channel: 'line',
    template_key: 'heat_warning_alert',
    payload: {
      heat_index: '48.2°C',
      warning_text: 'ดัชนีความร้อนระดับอันตราย แนะนำพักดื่มน้ำใน Heat Refuge Station ทุก 30 นาที',
    },
    sent_at: '2026-08-24T11:35:00+07:00',
    status: 'sent',
  },
  {
    id: 'n0000000-0000-0000-0000-000000000002',
    user_id: '11111111-1111-1111-1111-111111111111',
    channel: 'line',
    template_key: 'daily_weigh_in_reminder',
    payload: {
      reminder_text: 'แจ้งเตือนชั่งน้ำหนักขยะอินทรีย์รอบเย็นประจำวัน เวลา 17:00 น.',
    },
    sent_at: '2026-08-24T16:30:00+07:00',
    status: 'sent',
  },
];

export const initialReplicationPlaybooks: ReplicationPlaybook[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    source_project_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'คู่มือขยายผลตลาดปลอดภัยสู้ภัยความร้อนและลดขยะ (Cool & Clean Market Playbook)',
    cost_model_summary: {
      capital_cost_thb: 42700,
      operating_cost_monthly_thb: 2500,
      payback_period_months: 8,
      co2e_reduction_kg_year: 12400,
      heat_illness_reduction_pct: 40,
    },
    bill_of_materials: [
      'เต็นท์พับคลายร้อนขนาด 3x3 เมตร (โครงเหล็กกันสนิม)',
      'พัดลมไอหมอกแรงดันสูง 2 เครื่อง พร้อมถังพักน้ำ 50 ลิตร',
      'ถังหมักปุ๋ยอินทรีย์แบบเติมอากาศขนาด 200 ลิตร 6 ใบ',
      'ตาชั่งดิจิทัลแบบตั้งพื้นขนาดพิกัด 150 กิโลกรัม 1 เครื่อง',
      'หัวเชื้อจุลินทรีย์ EM และกากน้ำตาล 20 ลิตร',
      'เซ็นเซอร์วัดอุณหภูมิและความชื้นสัมพัทธ์ระบบ IoT 2 ชุด',
    ],
    generated_at: '2026-08-25T07:00:00+07:00',
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 1,
    table_name: 'projects',
    row_id: 'e0000000-0000-0000-0000-000000000001',
    action: 'INSERT',
    changed_by: '33333333-3333-3333-3333-333333333333',
    changed_at: '2026-08-21T15:00:00+07:00',
    diff: { status: 'draft', title: 'Climate Safe Khlong Toei Market Pilot' },
  },
  {
    id: 2,
    table_name: 'funding_matches',
    row_id: 'e0000000-0000-0000-0000-000000000001',
    action: 'UPDATE',
    changed_by: '33333333-3333-3333-3333-333333333333',
    changed_at: '2026-08-22T11:00:00+07:00',
    diff: { is_human_confirmed: true, confirmed_by: '33333333-3333-3333-3333-333333333333' },
  },
  {
    id: 3,
    table_name: 'ledger_entries',
    row_id: '10000000-0000-0000-0000-000000000004',
    action: 'INSERT',
    changed_by: '33333333-3333-3333-3333-333333333333',
    changed_at: '2026-08-23T16:00:00+07:00',
    diff: {
      action: 'correction',
      corrects_entry_id: '10000000-0000-0000-0000-000000000003',
      amount: -16200.0,
    },
  },
];
