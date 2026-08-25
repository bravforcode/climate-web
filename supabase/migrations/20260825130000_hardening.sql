-- ============================================================================
-- Migration: 20260825130000_hardening.sql
-- Date: 2026-08-25
--
-- Hardening batch (post-audit follow-ups):
--   1. evidence.payload jsonb  -- structured MRV payloads (weigh_ticket weight,
--      sensor readings). Mirrors src/types/database.ts Evidence.payload.
--   2. consent_records UPDATE policy -- PDPA withdrawal path. Original migration
--      only had SELECT (:613-616) and INSERT (:617-619); users could grant but
--      never withdraw. UPDATE restricted to row owner (user_id = auth.uid());
--      trg_audit_consent_records already logs every change.
--   3. SET search_path on SECURITY DEFINER functions -- prevents search-path
--      hijacking (CVE-class issue). Applied via ALTER FUNCTION so function
--      bodies are not duplicated/drifted.
-- ============================================================================

-- 1. Structured evidence payload
alter table evidence add column if not exists payload jsonb;

-- 2. PDPA: owners may update own consent records (withdraw / re-grant)
create policy "consent updatable by owner"
on consent_records for update
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

-- 3. Lock down search_path on SECURITY DEFINER functions
alter function current_user_role() set search_path = public;
alter function current_user_org_id() set search_path = public;
alter function process_audit_log() set search_path = public;
