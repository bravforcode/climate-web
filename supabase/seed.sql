-- Climate Action OS - Seed Data
-- Pilot: "Climate Safe Market Pilot (ตลาดสะพานขาว / ตลาดคลองเตย กทม.)"
-- Target: Realistic test data for all 17 tables, 6 user roles, MRV evidence, and append-only ledger correction chain.

-- 1. ORGANIZATIONS
insert into organizations (id, name, org_type, province, district, subdistrict, geom, created_at)
values
  ('00000000-0000-0000-0000-000000000001', 'ตลาดคลองเตย (Khlong Toei Market)', 'market', 'กรุงเทพมหานคร', 'คลองเตย', 'คลองเตย', ST_SetSRID(ST_MakePoint(100.5583, 13.7197), 4326), '2026-08-01 08:00:00+07'),
  ('00000000-0000-0000-0000-000000000002', 'ตลาดสะพานขาว (Saphan Khao Market)', 'market', 'กรุงเทพมหานคร', 'ดุสิต', 'สี่แยกมหานาค', ST_SetSRID(ST_MakePoint(100.5186, 13.7570), 4326), '2026-08-01 08:00:00+07'),
  ('00000000-0000-0000-0000-000000000003', 'สำนักงานเขตคลองเตย กรุงเทพมหานคร (BMA)', 'municipality', 'กรุงเทพมหานคร', 'คลองเตย', 'คลองเตย', ST_SetSRID(ST_MakePoint(100.5841, 13.7082), 4326), '2026-08-01 08:00:00+07'),
  ('00000000-0000-0000-0000-000000000004', 'กองทุนริเริ่มเพื่อสภาพภูมิอากาศแห่งประเทศไทย (ThaiCI)', 'funder', 'กรุงเทพมหานคร', 'พญาไท', 'สามเสนใน', ST_SetSRID(ST_MakePoint(100.5401, 13.7794), 4326), '2026-08-01 08:00:00+07'),
  ('00000000-0000-0000-0000-000000000005', 'สหกรณ์บริการชุมชนริมคลองเตย', 'cooperative', 'กรุงเทพมหานคร', 'คลองเตย', 'คลองเตย', ST_SetSRID(ST_MakePoint(100.5602, 13.7175), 4326), '2026-08-01 08:00:00+07')
on conflict (id) do nothing;

-- 2. USERS (Covering all 6 roles)
insert into users (id, organization_id, role, display_name, line_user_id, created_at)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'community_member', 'สมชาย ค้าเจริญ (แกนนำแม่ค้าตลาดคลองเตย)', 'U11111111111111111111111111111111', '2026-08-15 09:00:00+07'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'community_member', 'วรรณา มุ่งพัฒนา (กลุ่มหาบเร่แผงลอยสะพานขาว)', 'U22222222222222222222222222222222', '2026-08-15 09:00:00+07'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'operator', 'ณัฐพงศ์ วิริยะกิจ (ผู้ประสานงาน Climate Action OS)', 'U33333333333333333333333333333333', '2026-08-15 09:00:00+07'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000003', 'local_officer', 'กัญญา รักษ์สิ่งแวดล้อม (นักวิชาการสุขาภิบาล เขตคลองเตย)', 'U44444444444444444444444444444444', '2026-08-15 09:00:00+07'),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000004', 'funder', 'ดร. นันทิดา ชัยพฤกษ์ (ผู้จัดการกองทุน ThaiCI & ONEP)', 'U55555555555555555555555555555555', '2026-08-15 09:00:00+07'),
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000003', 'admin', 'ผู้ดูแลระบบกลาง (System Administrator)', 'U66666666666666666666666666666666', '2026-08-15 09:00:00+07'),
  ('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000004', 'auditor', 'ดร. พิชญ์ โคทาสาร (ผู้ตรวจสอบอิสระ / 3rd Party Grant Auditor)', 'U77777777777777777777777777777777', '2026-08-15 09:00:00+07')
on conflict (id) do nothing;

-- 3. CONSENT RECORDS
insert into consent_records (id, user_id, consent_type, granted, granted_at, withdrawn_at)
values
  ('c0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'evidence_capture', true, '2026-08-18 08:30:00+07', null),
  ('c0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'vulnerability_data', true, '2026-08-18 08:30:00+07', null),
  ('c0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'photo_publication', true, '2026-08-18 08:30:00+07', null),
  ('c0000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'evidence_capture', true, '2026-08-19 09:00:00+07', null),
  ('c0000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'vulnerability_data', true, '2026-08-19 09:00:00+07', null)
on conflict (id) do nothing;

-- 4. RISK ASSESSMENTS (GISTDA Flood + TMD Urban Heat)
insert into risk_assessments (id, hazard_type, zone, risk_level, confidence, source_type, source_name, fetched_at, valid_until, verified_by, raw_payload, created_at)
values
  (
    'a0000000-0000-0000-0000-000000000001',
    'flood',
    ST_SetSRID(ST_GeomFromText('POLYGON((100.5550 13.7170, 100.5620 13.7170, 100.5620 13.7230, 100.5550 13.7230, 100.5550 13.7170))'), 4326),
    'high',
    'high',
    'api_automated',
    'GISTDA Flood Monitoring API (1-Day Inundation Extent)',
    '2026-08-24 06:00:00+07',
    '2026-08-26 06:00:00+07',
    '33333333-3333-3333-3333-333333333333',
    '{"satellite": "Sentinel-1A SAR", "flood_depth_cm": 25, "inundation_prob": 0.88, "drainage_congestion": true, "affected_area_sqm": 35000}'::jsonb,
    '2026-08-24 06:05:00+07'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'heat',
    ST_SetSRID(ST_GeomFromText('POLYGON((100.5540 13.7160, 100.5630 13.7160, 100.5630 13.7240, 100.5540 13.7240, 100.5540 13.7160))'), 4326),
    'severe',
    'high',
    'manual_curated',
    'TMD TMDAPI & Bangkok Urban Climate Observatory',
    '2026-08-24 11:30:00+07',
    '2026-08-25 18:00:00+07',
    '33333333-3333-3333-3333-333333333333',
    '{"max_temp_c": 41.8, "heat_index_c": 48.2, "wbgt_c": 33.5, "uhi_intensity_c": 4.2, "warning_level": "extreme_danger"}'::jsonb,
    '2026-08-24 11:35:00+07'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'pm25',
    ST_SetSRID(ST_GeomFromText('POLYGON((100.5150 13.7540, 100.5220 13.7540, 100.5220 13.7600, 100.5150 13.7600, 100.5150 13.7540))'), 4326),
    'medium',
    'medium',
    'api_automated',
    'PCD & GISTDA Air Quality Satellite Ingestion',
    '2026-08-24 07:00:00+07',
    '2026-08-25 07:00:00+07',
    '44444444-4444-4444-4444-444444444444',
    '{"pm25_ug_m3": 38.5, "aqi": 105, "sensor_count": 4, "primary_source": "traffic_and_combustion"}'::jsonb,
    '2026-08-24 07:05:00+07'
  )
on conflict (id) do nothing;

-- 5. VULNERABILITY ZONES (Unsuppressed & Suppressed examples for k-anonymity)
insert into vulnerability_zones (id, zone, elderly_count, disability_count, low_income_household_count, outdoor_worker_count, total_population, k_anonymity_suppressed, updated_at)
values
  (
    'b0000000-0000-0000-0000-000000000001',
    ST_SetSRID(ST_GeomFromText('POLYGON((100.5560 13.7180, 100.5610 13.7180, 100.5610 13.7220, 100.5560 13.7220, 100.5560 13.7180))'), 4326),
    145,
    32,
    340,
    520,
    1850,
    false,
    '2026-08-20 10:00:00+07'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    ST_SetSRID(ST_GeomFromText('POLYGON((100.5170 13.7555, 100.5200 13.7555, 100.5200 13.7585, 100.5170 13.7585, 100.5170 13.7555))'), 4326),
    null, -- Suppressed by trigger (<10 elderly)
    null, -- Suppressed by trigger (<10 disabled)
    18,
    25,
    48,
    true,
    '2026-08-20 10:00:00+07'
  )
on conflict (id) do nothing;

-- 6. COMMUNITY PRIORITIES
insert into community_priorities (id, organization_id, problem_statement, urgency, beneficiaries_est, feasibility, equity_score, cost_est, created_by, created_at)
values
  (
    'c1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'วิกฤตความร้อนสะสมในโรงเรือนตลาดคลองเตยส่งผลให้แรงงานและผู้สูงอายุเสี่ยงโรคลมแดด และขยะสดเน่าเสียรวดเร็วก่อมลพิษจากน้ำท่วมขัง',
    5.0,
    2400,
    4.5,
    5.0,
    120000.00,
    '11111111-1111-1111-1111-111111111111',
    '2026-08-20 14:00:00+07'
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'พื้นที่ตลาดสะพานขาวขาดร่มเงาและจุดระบายน้ำเมื่อเกิดฝนตกหนักฉับพลัน ทำให้สินค้าเกษตรเสียหายและผู้ค้ากลางแจ้งหมดสติจากไอร้อน',
    4.5,
    850,
    4.0,
    4.5,
    85000.00,
    '22222222-2222-2222-2222-222222222222',
    '2026-08-21 11:00:00+07'
  )
on conflict (id) do nothing;

-- 7. INTERVENTIONS (5 Pilot Interventions)
insert into interventions (id, name, category, cost_low, cost_high, timeline_days, maintenance_notes, permit_required, evidence_refs)
values
  (
    'd0000000-0000-0000-0000-000000000001',
    'Heat Refuge Station (จุดพักคลายร้อนและปฐมพยาบาลอุณหภูมิสูง)',
    'heat_adaptation',
    25000.00,
    45000.00,
    14,
    'ตรวจระดับน้ำระบบพ่นหมอกทุกวัน ล้างแผ่นกรองอากาศและเปลี่ยนน้ำกรองทุก 2 สัปดาห์',
    false,
    ARRAY['photo','gps_checkin','sensor_reading']
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'Organic Food Waste Composting Station (สถานีคัดแยกและหมักขยะอินทรีย์ลดก๊าซมีเทน)',
    'waste_decarbonization',
    35000.00,
    60000.00,
    21,
    'กลับกองปุ๋ยสัปดาห์ละ 2 ครั้ง เติมกากน้ำตาลและหัวเชื้อจุลินทรีย์ EM ตรวจวัดความชื้น',
    false,
    ARRAY['photo','weigh_ticket','invoice']
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'Permeable Misting Canopy (กันสาดพ่นละอองไอเย็นและระบายอากาศ)',
    'heat_adaptation',
    18000.00,
    32000.00,
    7,
    'ล้างหัวฉีดพ่นหมอกป้องกันตะกรันอุดตันทุกเดือน ตรวจสอบสายส่งแรงดันสูง',
    false,
    ARRAY['photo','invoice','sensor_reading']
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'Solar Cool Roof (หลังคาสะท้อนความร้อนพร้อมโซลาร์เซลล์ขนาดเล็กระบายอากาศ)',
    'energy_adaptation',
    50000.00,
    95000.00,
    30,
    'ล้างฝุ่นแผงโซลาร์เซลล์ทุกเดือน ตรวจเช็คอินเวอร์เตอร์และสายดิน',
    true,
    ARRAY['photo','invoice','sensor_reading']
  ),
  (
    'd0000000-0000-0000-0000-000000000005',
    'Flood Barrier Drain Gate (ประตูกั้นน้ำท่วมพร้อมระบบสูบน้ำและตะแกรงดักขยะท่อระบาย)',
    'flood_resilience',
    40000.00,
    75000.00,
    14,
    'ลอกขยะออกจากตะแกรงดักทุกวันหลังตลาดวาย ทดสอบปั๊มสูบน้ำอัตโนมัติทุกสัปดาห์',
    true,
    ARRAY['photo','invoice','gps_checkin']
  )
on conflict (id) do nothing;

-- 8. PROJECTS
insert into projects (id, organization_id, title, status, priority_id, theory_of_change, budget_total, timeline_days, created_at)
values
  (
    'e0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Climate Safe Khlong Toei Market Pilot (ตลาดคลองเตยปลอดภัย สู้ภัยความร้อนและจัดการขยะอินทรีย์)',
    'implementing',
    'c1000000-0000-0000-0000-000000000001',
    'หากชุมชนติดตั้งจุดพักคลายร้อน (Heat Refuge) และระบบดักแยกหมักขยะอินทรีย์ จะลดอัตราการเจ็บป่วยจากโรคลมแดดของแรงงานเข็นของและแม่ค้า 40% และเปลี่ยนขยะเศษผักผลไม้ 150 กก./วัน ให้เป็นปุ๋ยหมากชีวภาพ ลดการปล่อยก๊าซมีเทนในหลุมฝังกลบ',
    120000.00,
    45,
    '2026-08-21 15:00:00+07'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Saphan Khao Cool & Resilient Corridor (สะพานขาวเย็นใจ ระบายน้ำไว สู้ภัยภูมิอากาศ)',
    'composed',
    'c1000000-0000-0000-0000-000000000002',
    'หากติดตั้งกันสาดพ่นละอองไอเย็นและประตูกั้นน้ำท่วม จะลดอุณหภูมิผิวสัมผัสทางเดินตลาดลง 3-4°C และป้องกันน้ำท่วมขังทำลายผลผลิตเกษตร',
    85000.00,
    30,
    '2026-08-22 10:00:00+07'
  )
on conflict (id) do nothing;

-- 9. PROJECT INTERVENTIONS
insert into project_interventions (project_id, intervention_id)
values
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000005')
on conflict (project_id, intervention_id) do nothing;

-- 10. FUNDING CALL SOURCES
insert into funding_call_sources (id, source_name, ingestion_method, commercial_use_allowed, attribution_required, notes)
values
  (
    'f0000000-0000-0000-0000-000000000001',
    'Thai Climate Initiative (ThaiCI / ONEP / GIZ)',
    'manual_only',
    true,
    true,
    'กองทุนริเริ่มเพื่อสภาพภูมิอากาศแห่งประเทศไทย ภายใต้ความร่วมมือไทย-เยอรมัน (IKI) งบโครงการ adaptation และ mitigation'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'กองทุนสิ่งแวดล้อม กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม',
    'manual_only',
    false,
    true,
    'กองทุนสิ่งแวดล้อมตาม พ.ร.บ.ส่งเสริมและรักษาคุณภาพสิ่งแวดล้อมแห่งชาติ'
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'สำนักสิ่งแวดล้อม กรุงเทพมหานคร (BMA Environment Department)',
    'api_available_unused',
    false,
    true,
    'โครงการสนับสนุนนวัตกรรมสิ่งแวดล้อมชุมชนและการปรับตัวต่อการเปลี่ยนแปลงสภาพภูมิอากาศเมืองหลวง'
  )
on conflict (id) do nothing;

-- 11. FUNDING CALLS (3 Verified Funding Calls)
insert into funding_calls (id, source_id, funder_name, thematic_fit, eligibility_notes, max_amount, co_financing_required, application_deadline, source_url, entered_by, last_verified_at, created_at)
values
  (
    'fc000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'ThaiCI - Urban Adaptation & Heat Management Fund 2026',
    ARRAY['heat_adaptation','urban_resilience','community_climate_action','vulnerable_groups'],
    'สำหรับชุมชนเมือง ตลาดสด หรือสหกรณ์ที่เผชิญวิกฤตคลื่นความร้อนใน กทม. และปริมณฑล มีแผนการวัดผล MRV ชัดเจน',
    500000.00,
    false,
    '2026-11-30',
    'https://thaici.onep.go.th/calls/2026-urban-adaptation',
    '33333333-3333-3333-3333-333333333333',
    '2026-08-20 10:00:00+07',
    '2026-08-20 10:00:00+07'
  ),
  (
    'fc000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000002',
    'Thailand Environmental Fund - Community Waste Decarbonization 2026',
    ARRAY['waste_decarbonization','methane_reduction','organic_waste','circular_economy'],
    'ชุมชนหรือองค์กรไม่แสวงหากำไร ต้องมีส่วนร่วมสมทบ (Co-financing/In-kind) ไม่น้อยกว่า 10% ของมูลค่าโครงการ',
    300000.00,
    true,
    '2026-10-15',
    'https://envfund.onep.go.th/grants/2026-waste-decarb',
    '33333333-3333-3333-3333-333333333333',
    '2026-08-18 14:30:00+07',
    '2026-08-18 14:30:00+07'
  ),
  (
    'fc000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000003',
    'BMA Green Innovation Grant (ทุนนวัตกรรมพื้นที่สีเขียวและลดความร้อนเมือง กทม.)',
    ARRAY['heat_adaptation','urban_cooling','green_infrastructure','flood_resilience'],
    'ตลาดสดที่จดทะเบียนกับ กทม. หรือมีหนังสือรับรองจากสำนักงานเขตในพื้นที่',
    200000.00,
    false,
    '2026-12-31',
    'https://environment.bangkok.go.th/grant-green-market-2026',
    '44444444-4444-4444-4444-444444444444',
    '2026-08-22 09:15:00+07',
    '2026-08-22 09:15:00+07'
  )
on conflict (id) do nothing;

-- 12. FUNDING MATCHES (Human-in-the-loop confirmed)
insert into funding_matches (project_id, funding_call_id, match_score, is_human_confirmed, confirmed_by, confirmed_at)
values
  (
    'e0000000-0000-0000-0000-000000000001',
    'fc000000-0000-0000-0000-000000000001',
    95.5,
    true,
    '33333333-3333-3333-3333-333333333333',
    '2026-08-22 11:00:00+07'
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'fc000000-0000-0000-0000-000000000003',
    88.0,
    true,
    '33333333-3333-3333-3333-333333333333',
    '2026-08-22 11:15:00+07'
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'fc000000-0000-0000-0000-000000000002',
    76.5,
    false,
    null,
    null
  )
on conflict (project_id, funding_call_id) do nothing;

-- 13. TASKS
insert into tasks (id, project_id, title, assignee_id, status, due_date)
values
  (
    't0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'จัดเตรียมพื้นที่และติดตั้งเต็นท์จุดพักคลายร้อนพร้อมพัดลมไอหมอก (Heat Refuge Setup)',
    '11111111-1111-1111-1111-111111111111',
    'done',
    '2026-09-05'
  ),
  (
    't0000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    'ติดตั้งถังหมักปุ๋ยอินทรีย์ 6 ชุดและระบบชั่งน้ำหนักขยะประจำวัน (Composting Station Setup)',
    '33333333-3333-3333-3333-333333333333',
    'in_progress',
    '2026-09-12'
  ),
  (
    't0000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000001',
    'จัดอบรมแม่ค้าและแรงงานเข็นของเรื่องสุขอนามัยและการรับมือโรคลมแดด (Heat Safety Training)',
    '44444444-4444-4444-4444-444444444444',
    'done',
    '2026-09-02'
  ),
  (
    't0000000-0000-0000-0000-000000000004',
    'e0000000-0000-0000-0000-000000000001',
    'ขุดลอกท่อระบายน้ำรอบโซนแผงผักและติดตั้งตะแกรงดักขยะ (Drainage & Waste Screen)',
    '11111111-1111-1111-1111-111111111111',
    'todo',
    '2026-09-20'
  )
on conflict (id) do nothing;

-- 14. EVIDENCE (with real SHA-256 Hashes)
insert into evidence (id, project_id, task_id, evidence_type, file_url, file_hash, captured_at, captured_by, geom, synced_from_offline)
values
  (
    'ev000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    't0000000-0000-0000-0000-000000000001',
    'photo',
    'https://storage.climateactionos.org/evidence/khlongtoei/heat_refuge_completed_01.jpg',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    '2026-08-24 14:30:00+07',
    '11111111-1111-1111-1111-111111111111',
    ST_SetSRID(ST_MakePoint(100.5583, 13.7197), 4326),
    false
  ),
  (
    'ev000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    't0000000-0000-0000-0000-000000000002',
    'weigh_ticket',
    'https://storage.climateactionos.org/evidence/khlongtoei/weigh_slip_day1_142kg.pdf',
    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    '2026-08-24 16:45:00+07',
    '11111111-1111-1111-1111-111111111111',
    ST_SetSRID(ST_MakePoint(100.5585, 13.7199), 4326),
    true
  ),
  (
    'ev000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000001',
    't0000000-0000-0000-0000-000000000003',
    'gps_checkin',
    'https://storage.climateactionos.org/evidence/khlongtoei/training_attendance_checkin.json',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    '2026-08-24 09:15:00+07',
    '44444444-4444-4444-4444-444444444444',
    ST_SetSRID(ST_MakePoint(100.5583, 13.7197), 4326),
    false
  ),
  (
    'ev000000-0000-0000-0000-000000000004',
    'e0000000-0000-0000-0000-000000000001',
    't0000000-0000-0000-0000-000000000001',
    'invoice',
    'https://storage.climateactionos.org/evidence/khlongtoei/inv_misting_fan_sensors.pdf',
    '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    '2026-08-23 11:20:00+07',
    '33333333-3333-3333-3333-333333333333',
    ST_SetSRID(ST_MakePoint(100.5583, 13.7197), 4326),
    false
  )
on conflict (id) do nothing;

-- 15. LEDGER ENTRIES (Append-only with Correction Chain)
insert into ledger_entries (id, project_id, entry_type, amount, description, corrects_entry_id, entered_by, entered_at)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'income',
    50000.00,
    'เงินงวดแรกสนับสนุนโครงการนำร่องจากกองทุนพัฒนาตลาด (Initial Grant Disbursement)',
    null,
    '33333333-3333-3333-3333-333333333333',
    '2026-08-22 09:00:00+07'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    'expense',
    28500.00,
    'ค่าเต็นท์จุดพักคลายร้อน พัดลมไอหมอก และเซ็นเซอร์วัดอุณหภูมิ/ความชื้น',
    null,
    '33333333-3333-3333-3333-333333333333',
    '2026-08-23 14:00:00+07'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000001',
    'expense',
    16200.00,
    'ค่าจัดซื้อถังหมักขยะอินทรีย์ 6 ใบและตาชั่งดิจิทัล (บันทึกตัวเลขคลาดเคลื่อนเป็น 16,200 บ.)',
    null,
    '11111111-1111-1111-1111-111111111111',
    '2026-08-23 15:30:00+07'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'e0000000-0000-0000-0000-000000000001',
    'expense',
    -16200.00,
    'ยกเลิกรายการบันทึกผิดค่าถังหมักขยะ (Correction reversal per invoice audit)',
    '10000000-0000-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    '2026-08-23 16:00:00+07'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'e0000000-0000-0000-0000-000000000001',
    'expense',
    14200.00,
    'ค่าจัดซื้อถังหมักขยะอินทรีย์ 6 ใบและตาชั่งดิจิทัล (ยอดที่ถูกต้องตามใบเสร็จจริง)',
    '10000000-0000-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    '2026-08-23 16:05:00+07'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'e0000000-0000-0000-0000-000000000001',
    'volunteer_hours',
    36.00,
    'ชั่วโมงแรงงานอาสาสมัครแม่ค้าและเยาวชนร่วมประกอบและตั้งสถานีหมักขยะ (36 ชม.)',
    null,
    '11111111-1111-1111-1111-111111111111',
    '2026-08-24 17:00:00+07'
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'e0000000-0000-0000-0000-000000000001',
    'in_kind',
    4500.00,
    'สนับสนุนกากน้ำตาลและหัวเชื้อ EM จุลินทรีย์จากสำนักงานเขตคลองเตย',
    null,
    '44444444-4444-4444-4444-444444444444',
    '2026-08-24 17:30:00+07'
  )
on conflict (id) do nothing;

-- 16. NOTIFICATIONS
insert into notifications (id, user_id, channel, template_key, payload, sent_at, status)
values
  (
    'n0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'line',
    'heat_warning_alert',
    '{"heat_index": "48.2°C", "warning_text": "ดัชนีความร้อนระดับอันตราย แนะนำพักดื่มน้ำใน Heat Refuge Station ทุก 30 นาที"}'::jsonb,
    '2026-08-24 11:35:00+07',
    'sent'
  ),
  (
    'n0000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'line',
    'daily_weigh_in_reminder',
    '{"reminder_text": "แจ้งเตือนชั่งน้ำหนักขยะอินทรีย์รอบเย็นประจำวัน เวลา 17:00 น."}'::jsonb,
    '2026-08-24 16:30:00+07',
    'sent'
  )
on conflict (id) do nothing;

-- 17. REPLICATION PLAYBOOKS
insert into replication_playbooks (id, source_project_id, title, cost_model_summary, bill_of_materials, generated_at)
values
  (
    'p0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'คู่มือขยายผลตลาดปลอดภัยสู้ภัยความร้อนและลดขยะ (Cool & Clean Market Playbook)',
    '{"capital_cost_thb": 42700, "operating_cost_monthly_thb": 2500, "payback_period_months": 8, "co2e_reduction_kg_year": 12400, "heat_illness_reduction_pct": 40}'::jsonb,
    ARRAY[
      'เต็นท์พับคลายร้อนขนาด 3x3 เมตร (โครงเหล็กกันสนิม)',
      'พัดลมไอหมอกแรงดันสูง 2 เครื่อง พร้อมถังพักน้ำ 50 ลิตร',
      'ถังหมักปุ๋ยอินทรีย์แบบเติมอากาศขนาด 200 ลิตร 6 ใบ',
      'ตาชั่งดิจิทัลแบบตั้งพื้นขนาดพิกัด 150 กิโลกรัม 1 เครื่อง',
      'หัวเชื้อจุลินทรีย์ EM และกากน้ำตาล 20 ลิตร',
      'เซ็นเซอร์วัดอุณหภูมิและความชื้นสัมพัทธ์ระบบ IoT 2 ชุด'
    ],
    '2026-08-25 07:00:00+07'
  )
on conflict (id) do nothing;
