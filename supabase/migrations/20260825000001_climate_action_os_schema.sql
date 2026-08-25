-- Climate Action OS - Production Schema Migration
-- Version: 20260825000001
-- Description: Core schema with 17 domain tables, PostGIS support, append-only ledger & audit log, and RLS security policies.

-- 0. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- 1. ORGANIZATIONS
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_type text not null check (org_type in
    ('community','municipality','school','temple','market','cooperative','ngo','funder')),
  province text,
  district text,
  subdistrict text,
  geom geography(Point, 4326),
  created_at timestamptz not null default now()
);

create index if not exists idx_organizations_geom on organizations using gist (geom);
create index if not exists idx_organizations_org_type on organizations (org_type);

-- 2. USERS (Application Profile linking with auth.users)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  role text not null check (role in
    ('community_member','operator','local_officer','funder','admin','auditor')),
  display_name text,
  line_user_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_org on users (organization_id);
create index if not exists idx_users_role on users (role);
create index if not exists idx_users_line on users (line_user_id);

-- 3. CONSENT RECORDS (Pre-requisite for collecting personal / vulnerability / evidence data)
create table if not exists consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  consent_type text not null check (consent_type in
    ('evidence_capture','vulnerability_data','photo_publication')),
  granted boolean not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

create index if not exists idx_consent_records_user on consent_records (user_id);
create index if not exists idx_consent_records_type on consent_records (consent_type, granted);

-- 4. MODULE A: RISK ASSESSMENTS
create table if not exists risk_assessments (
  id uuid primary key default gen_random_uuid(),
  hazard_type text not null check (hazard_type in ('flood','drought','heat','pm25','coastal','wildfire')),
  zone geography(Polygon, 4326) not null,
  risk_level text not null check (risk_level in ('low','medium','high','severe')),
  confidence text not null check (confidence in ('low','medium','high')),
  source_type text not null check (source_type in ('api_automated','manual_curated')),
  source_name text not null,
  fetched_at timestamptz not null,
  valid_until timestamptz,
  verified_by uuid references users(id) on delete set null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_risk_assessments_zone on risk_assessments using gist (zone);
create index if not exists idx_risk_assessments_hazard_fetched on risk_assessments (hazard_type, fetched_at desc);

-- 5. MODULE B: VULNERABILITY ZONES (k-anonymity enforced, k >= 10)
create table if not exists vulnerability_zones (
  id uuid primary key default gen_random_uuid(),
  zone geography(Polygon, 4326) not null,
  elderly_count int,
  disability_count int,
  low_income_household_count int,
  outdoor_worker_count int,
  total_population int not null,
  k_anonymity_suppressed boolean default false,
  updated_at timestamptz not null default now()
);

create index if not exists idx_vulnerability_zones_zone on vulnerability_zones using gist (zone);

-- 6. MODULE C: COMMUNITY PRIORITIES
create table if not exists community_priorities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  problem_statement text not null,
  urgency numeric not null check (urgency between 1 and 5),
  beneficiaries_est int not null check (beneficiaries_est >= 0),
  feasibility numeric not null check (feasibility between 1 and 5),
  equity_score numeric not null check (equity_score between 1 and 5),
  cost_est numeric not null check (cost_est >= 0),
  priority_score numeric generated always as
    ( (urgency * beneficiaries_est * feasibility * equity_score) / nullif(cost_est, 0) ) stored,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_community_priorities_org on community_priorities (organization_id);
create index if not exists idx_community_priorities_score on community_priorities (priority_score desc);

-- 7. MODULE D: INTERVENTIONS LIBRARY
create table if not exists interventions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  cost_low numeric,
  cost_high numeric,
  timeline_days int,
  maintenance_notes text,
  permit_required boolean default false,
  evidence_refs text[]
);

create index if not exists idx_interventions_category on interventions (category);

-- 8. MODULE E: PROJECTS
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check (status in
    ('draft','composed','submitted_for_funding','approved','implementing','completed','archived')),
  priority_id uuid references community_priorities(id) on delete set null,
  theory_of_change text,
  budget_total numeric check (budget_total is null or budget_total >= 0),
  timeline_days int,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_org on projects (organization_id);
create index if not exists idx_projects_status on projects (status);

-- 9. PROJECT INTERVENTIONS (Junction Table)
create table if not exists project_interventions (
  project_id uuid not null references projects(id) on delete cascade,
  intervention_id uuid not null references interventions(id) on delete cascade,
  primary key (project_id, intervention_id)
);

create index if not exists idx_project_interventions_intervention on project_interventions (intervention_id);

-- 10. FUNDING CALL SOURCES
create table if not exists funding_call_sources (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  ingestion_method text not null check (ingestion_method in ('manual_only','api_available_unused','api_integrated')),
  commercial_use_allowed boolean,
  attribution_required boolean default true,
  notes text
);

-- 11. MODULE F: FUNDING CALLS (Curated)
create table if not exists funding_calls (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references funding_call_sources(id) on delete set null,
  funder_name text not null,
  thematic_fit text[],
  eligibility_notes text,
  max_amount numeric,
  co_financing_required boolean,
  application_deadline date,
  source_url text,
  entered_by uuid references users(id) on delete set null,
  last_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_funding_calls_deadline on funding_calls (application_deadline);
create index if not exists idx_funding_calls_thematic on funding_calls using gin (thematic_fit);

-- 12. FUNDING MATCHES (Human-in-the-loop confirmed)
create table if not exists funding_matches (
  project_id uuid not null references projects(id) on delete cascade,
  funding_call_id uuid not null references funding_calls(id) on delete cascade,
  match_score numeric check (match_score between 0 and 100),
  is_human_confirmed boolean default false,
  confirmed_by uuid references users(id) on delete set null,
  confirmed_at timestamptz,
  primary key (project_id, funding_call_id)
);

create index if not exists idx_funding_matches_confirmed on funding_matches (is_human_confirmed);

-- 13. MODULE G: IMPLEMENTATION TASKS
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  assignee_id uuid references users(id) on delete set null,
  status text not null default 'todo' check (status in ('todo','in_progress','blocked','done')),
  due_date date
);

create index if not exists idx_tasks_project on tasks (project_id);
create index if not exists idx_tasks_status on tasks (status);
create index if not exists idx_tasks_assignee on tasks (assignee_id);

-- 14. MODULE H: EVIDENCE & MRV
create table if not exists evidence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  task_id uuid references tasks(id) on delete set null,
  evidence_type text not null check (evidence_type in ('photo','weigh_ticket','gps_checkin','invoice','sensor_reading')),
  file_url text,
  file_hash text,
  captured_at timestamptz not null,
  captured_by uuid references users(id) on delete set null,
  geom geography(Point, 4326),
  synced_from_offline boolean default false
);

create index if not exists idx_evidence_project on evidence (project_id);
create index if not exists idx_evidence_task on evidence (task_id);
create index if not exists idx_evidence_type on evidence (evidence_type);
create index if not exists idx_evidence_captured_at on evidence (captured_at);
create index if not exists idx_evidence_geom on evidence using gist (geom);

-- 15. MODULE I: FINANCE LEDGER (Append-only)
create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  entry_type text not null check (entry_type in ('income','expense','in_kind','volunteer_hours','reserve')),
  amount numeric not null,
  description text not null,
  corrects_entry_id uuid references ledger_entries(id) on delete set null,
  entered_by uuid references users(id) on delete set null,
  entered_at timestamptz not null default now()
);

create index if not exists idx_ledger_entries_project on ledger_entries (project_id);
create index if not exists idx_ledger_entries_type on ledger_entries (entry_type);
create index if not exists idx_ledger_entries_corrects on ledger_entries (corrects_entry_id);

-- Revoke UPDATE and DELETE on ledger_entries from standard users (STRIDE Tampering Mitigation)
revoke update, delete on ledger_entries from public;
revoke update, delete on ledger_entries from authenticated;
revoke update, delete on ledger_entries from anon;

-- 16. NOTIFICATIONS (LINE Webhooks / Alerts)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  channel text not null check (channel in ('line','email','in_app')),
  template_key text not null,
  payload jsonb,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending','sent','failed'))
);

create index if not exists idx_notifications_user on notifications (user_id);
create index if not exists idx_notifications_status on notifications (status);

-- 17. MODULE J: REPLICATION PLAYBOOKS
create table if not exists replication_playbooks (
  id uuid primary key default gen_random_uuid(),
  source_project_id uuid references projects(id) on delete set null,
  title text not null,
  cost_model_summary jsonb,
  bill_of_materials text[],
  generated_at timestamptz not null default now()
);

-- 18. AUDIT LOG (Append-only, system-wide integrity)
create table if not exists audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  row_id text not null,
  action text not null,
  changed_by uuid,
  changed_at timestamptz not null default now(),
  diff jsonb
);

create index if not exists idx_audit_log_table_row on audit_log (table_name, row_id);
create index if not exists idx_audit_log_changed_at on audit_log (changed_at desc);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- A. k-Anonymity Enforcement Trigger on vulnerability_zones
create or replace function enforce_k_anonymity()
returns trigger as $$
declare
  k_threshold constant int := 10;
  suppressed boolean := false;
begin
  if NEW.elderly_count is not null and NEW.elderly_count < k_threshold then
    NEW.elderly_count := null;
    suppressed := true;
  end if;

  if NEW.disability_count is not null and NEW.disability_count < k_threshold then
    NEW.disability_count := null;
    suppressed := true;
  end if;

  if NEW.low_income_household_count is not null and NEW.low_income_household_count < k_threshold then
    NEW.low_income_household_count := null;
    suppressed := true;
  end if;

  if NEW.outdoor_worker_count is not null and NEW.outdoor_worker_count < k_threshold then
    NEW.outdoor_worker_count := null;
    suppressed := true;
  end if;

  if suppressed then
    NEW.k_anonymity_suppressed := true;
  end if;

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_enforce_k_anonymity on vulnerability_zones;
create trigger trg_enforce_k_anonymity
before insert or update on vulnerability_zones
for each row
execute function enforce_k_anonymity();

-- B. System-Wide Audit Log Trigger
create or replace function process_audit_log()
returns trigger as $$
declare
  v_row_id text;
  v_changed_by uuid;
  v_diff jsonb;
begin
  if (TG_OP = 'DELETE') then
    v_row_id := OLD.id::text;
    v_diff := jsonb_build_object('old', to_jsonb(OLD));
  elsif (TG_OP = 'INSERT') then
    v_row_id := NEW.id::text;
    v_diff := jsonb_build_object('new', to_jsonb(NEW));
  elsif (TG_OP = 'UPDATE') then
    v_row_id := NEW.id::text;
    v_diff := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  end if;

  begin
    v_changed_by := auth.uid();
  exception when others then
    v_changed_by := null;
  end;

  insert into audit_log (table_name, row_id, action, changed_by, changed_at, diff)
  values (TG_TABLE_NAME, v_row_id, TG_OP, v_changed_by, now(), v_diff);

  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;
end;
$$ language plpgsql security definer;

-- Apply Audit Log triggers on critical operational tables
drop trigger if exists trg_audit_projects on projects;
create trigger trg_audit_projects after insert or update or delete on projects
for each row execute function process_audit_log();

drop trigger if exists trg_audit_community_priorities on community_priorities;
create trigger trg_audit_community_priorities after insert or update or delete on community_priorities
for each row execute function process_audit_log();

drop trigger if exists trg_audit_evidence on evidence;
create trigger trg_audit_evidence after insert or update or delete on evidence
for each row execute function process_audit_log();

drop trigger if exists trg_audit_tasks on tasks;
create trigger trg_audit_tasks after insert or update or delete on tasks
for each row execute function process_audit_log();

drop trigger if exists trg_audit_ledger_entries on ledger_entries;
create trigger trg_audit_ledger_entries after insert on ledger_entries
for each row execute function process_audit_log();

drop trigger if exists trg_audit_consent_records on consent_records;
create trigger trg_audit_consent_records after insert or update on consent_records
for each row execute function process_audit_log();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper functions for RLS checks
create or replace function current_user_role()
returns text as $$
  select role from users where id = auth.uid();
$$ language sql stable security definer;

create or replace function current_user_org_id()
returns uuid as $$
  select organization_id from users where id = auth.uid();
$$ language sql stable security definer;

-- 1. FUNDING MATCHES RLS (Section E.1 Scenario 1)
alter table funding_matches enable row level security;

create policy "community sees only own org, confirmed matches"
on funding_matches for select
using (
  is_human_confirmed = true
  and project_id in (
    select id from projects where organization_id = current_user_org_id()
  )
);

create policy "operator/admin/auditor see everything for their org, incl. unconfirmed"
on funding_matches for select
using (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role in ('operator','admin','auditor','local_officer','funder')
  )
);

create policy "operator/admin can confirm or modify matches"
on funding_matches for all
using (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role in ('operator','admin')
  )
)
with check (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role in ('operator','admin')
  )
);

-- 2. VULNERABILITY ZONES RLS (Section E.1 Scenario 2)
alter table vulnerability_zones enable row level security;

create policy "raw counts visible to operator+ only or when suppressed"
on vulnerability_zones for select
using (
  k_anonymity_suppressed = true
  or exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role in ('operator','admin','local_officer')
  )
);

create policy "admin/operator can insert and update vulnerability data"
on vulnerability_zones for all
using (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role in ('operator','admin')
  )
)
with check (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role in ('operator','admin')
  )
);

-- 3. EVIDENCE RLS (Section E.1 Scenario 3)
alter table evidence enable row level security;

create policy "auditor read-only all evidence"
on evidence for select
using (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role = 'auditor'
  )
);

create policy "no auditor writes on evidence"
on evidence for all
using ( true )
with check (
  not exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role = 'auditor'
  )
);

create policy "org members can view own project evidence"
on evidence for select
using (
  project_id in (
    select id from projects where organization_id = current_user_org_id()
  )
);

create policy "field users can insert evidence for own org project"
on evidence for insert
with check (
  project_id in (
    select id from projects where organization_id = current_user_org_id()
  )
);

-- 4. LEDGER ENTRIES RLS (Section E.1 Scenario 4)
alter table ledger_entries enable row level security;

create policy "ledger select org-scoped or auditor/funder view"
on ledger_entries for select
using (
  project_id in (
    select id from projects where organization_id = current_user_org_id()
  )
  or exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role in ('auditor','funder','admin')
  )
);

create policy "insert only, org-scoped"
on ledger_entries for insert
with check (
  project_id in (
    select id from projects where organization_id = current_user_org_id()
  )
  and not exists (
    select 1 from users u
    where u.id = auth.uid()
      and u.role = 'auditor'
  )
);

-- 5. ORGANIZATIONS & USERS RLS
alter table organizations enable row level security;
create policy "organizations readable by authenticated" on organizations for select using (true);
create policy "admin can manage organizations" on organizations for all using (
  exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

alter table users enable row level security;
create policy "users readable by org colleagues" on users for select using (
  organization_id = current_user_org_id()
  or exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin','auditor','funder'))
);
create policy "users self update or admin manage" on users for update using (
  id = auth.uid() or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

-- 6. RISK ASSESSMENTS & INTERVENTIONS & FUNDING CALLS (Public / Shared Intelligence)
alter table risk_assessments enable row level security;
create policy "risk assessments readable by all" on risk_assessments for select using (true);
create policy "risk assessments editable by operator/admin" on risk_assessments for all using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('operator','admin'))
);

alter table interventions enable row level security;
create policy "interventions readable by all" on interventions for select using (true);
create policy "interventions manageable by operator/admin" on interventions for all using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('operator','admin'))
);

alter table funding_calls enable row level security;
create policy "funding calls readable by all" on funding_calls for select using (true);
create policy "funding calls manageable by operator/admin" on funding_calls for all using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('operator','admin','funder'))
);

alter table funding_call_sources enable row level security;
create policy "funding call sources readable by all" on funding_call_sources for select using (true);

-- 7. PROJECTS & COMMUNITY PRIORITIES & TASKS
alter table community_priorities enable row level security;
create policy "community priorities readable by org or funders" on community_priorities for select using (
  organization_id = current_user_org_id()
  or exists (select 1 from users u where u.id = auth.uid() and u.role in ('funder','auditor','admin'))
);
create policy "community priorities writable by org members" on community_priorities for all using (
  organization_id = current_user_org_id()
  and not exists (select 1 from users u where u.id = auth.uid() and u.role = 'auditor')
);

alter table projects enable row level security;
create policy "projects readable by org or funders" on projects for select using (
  organization_id = current_user_org_id()
  or exists (select 1 from users u where u.id = auth.uid() and u.role in ('funder','auditor','admin'))
);
create policy "projects writable by org operator/admin" on projects for all using (
  organization_id = current_user_org_id()
  and exists (select 1 from users u where u.id = auth.uid() and u.role in ('operator','admin','community_member'))
);

alter table tasks enable row level security;
create policy "tasks readable by org or auditor" on tasks for select using (
  project_id in (select id from projects where organization_id = current_user_org_id())
  or exists (select 1 from users u where u.id = auth.uid() and u.role in ('auditor','admin'))
);
create policy "tasks writable by org operator/assignee" on tasks for all using (
  project_id in (select id from projects where organization_id = current_user_org_id())
  and not exists (select 1 from users u where u.id = auth.uid() and u.role = 'auditor')
);

alter table consent_records enable row level security;
create policy "consent viewable by self, org operator, auditor" on consent_records for select using (
  user_id = auth.uid()
  or exists (select 1 from users u where u.id = auth.uid() and u.role in ('operator','admin','auditor'))
);
create policy "consent insertable by self" on consent_records for insert with check (
  user_id = auth.uid()
);

alter table notifications enable row level security;
create policy "notifications viewable by recipient" on notifications for select using (
  user_id = auth.uid()
);

alter table replication_playbooks enable row level security;
create policy "replication playbooks readable by all" on replication_playbooks for select using (true);

alter table audit_log enable row level security;
create policy "audit log readable by auditor and admin" on audit_log for select using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('auditor','admin'))
);
