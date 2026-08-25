-- ============================================================================
-- Migration: 20260825120000_fix_rls_org_scope.sql
-- Date: 2026-08-25
--
-- SECURITY FIX: cross-org data leak in multi-tenant RLS (staff SELECT policies)
--
-- Original migration 20260825000001_climate_action_os_schema.sql enabled RLS
-- but its staff-facing SELECT policy on funding_matches checked ROLE MEMBERSHIP
-- ONLY, with no organization predicate. Any authenticated user holding a staff
-- role ('operator','admin','auditor','local_officer','funder') could read every
-- organization's funding matches -- including human-unconfirmed rows -- across
-- tenant boundaries.
--
-- FIX APPLIED HERE (funding_matches):
--   Re-create the staff SELECT policy keeping the role gate AND adding an org
--   predicate:
--     - 'admin' / 'auditor' / 'funder' stay GLOBAL oversight readers.
--       DECISION: product intent treats these as platform-level roles (audit
--       trail, funding oversight) that legitimately span organizations; this
--       mirrors the existing global access they hold on ledger_entries,
--       projects, community_priorities, and tasks in the original migration.
--     - 'operator' / 'local_officer' become ORG-SCOPED: they can only see
--       matches whose project belongs to their own organization
--       (current_user_org_id(), security definer helper defined at
--       sql:399-402 of the original migration).
--
-- AUDITED, VERIFIED, INTENTIONALLY UNCHANGED:
--   * tasks."tasks readable by org or auditor" (original sql:603-606):
--     Already correctly scoped -- org members see own-org tasks via
--     project_id IN (...organization_id = current_user_org_id()), while
--     auditor/admin are global. Matches target end-state; no change needed.
--   * vulnerability_zones."raw counts visible to operator+ only or when
--     suppressed" (original sql:446-455): Role-gated only, BUT the table has
--     no organization_id and no project_id column at all (verified at original
--     sql:74-84) -- it is a global shared dataset by design, so no tenant
--     boundary currently exists to enforce. Org-scoping this table requires a
--     dedicated schema migration (add org anchor column + backfill + adjust
--     insert path) and is deliberately deferred rather than half-applied here.
--   * funding_matches."operator/admin can confirm or modify matches"
--     (original sql:426-441): WRITE path, role-gated. Cross-org writes are a
--     separate product decision; flagged for review, out of scope here.
--
-- IDEMPOTENCE & ORDERING:
--   Every CREATE POLICY is preceded by DROP POLICY IF EXISTS, so replaying
--   fresh or re-applying converges safely. This migration runs strictly AFTER
--   20260825000001_* : referenced objects (tables funding_matches/projects/
--   users, helper fn current_user_org_id()) already exist. No forward
--   references.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. funding_matches: staff SELECT -- close cross-org read leak
-- ----------------------------------------------------------------------------
drop policy if exists
  "operator/admin/auditor see everything for their org, incl. unconfirmed"
  on funding_matches;

create policy "staff see own-org matches; admin/auditor/funder see all"
on funding_matches for select
using (
  exists (
    select 1 from users u
    where u.id = auth.uid()
      and (
        -- Global oversight roles: cross-org reads allowed by explicit product
        -- decision (platform-level audit + funding oversight).
        u.role in ('admin', 'auditor', 'funder')

        -- Org-scoped staff: restricted to matches whose project belongs to
        -- their own organization.
        or (
          u.role in ('operator', 'local_officer')
          and exists (
            select 1 from projects p
            where p.id = project_id
              and p.organization_id = current_user_org_id()
          )
        )
      )
  )
);
