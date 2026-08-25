// Climate Action OS - In-Memory Reactive Database & State Manager
// Mirrors Supabase PostgreSQL schema with LocalStorage persistence and RLS role filtering.

import {
  Organization,
  User,
  UserRole,
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
  ProjectWithDetails,
  PriorityScoreBreakdown,
} from '../types/database';

import {
  initialOrganizations,
  initialUsers,
  initialConsentRecords,
  initialRiskAssessments,
  initialVulnerabilityZones,
  initialCommunityPriorities,
  initialInterventions,
  initialProjects,
  initialProjectInterventions,
  initialFundingCallSources,
  initialFundingCalls,
  initialFundingMatches,
  initialTasks,
  initialEvidence,
  initialLedgerEntries,
  initialNotifications,
  initialReplicationPlaybooks,
  initialAuditLogs,
} from './mockData';

const STORAGE_KEY = 'climate_action_os_db_v1';
const CURRENT_USER_KEY = 'climate_action_os_current_user';

export interface DatabaseState {
  organizations: Organization[];
  users: User[];
  consent_records: ConsentRecord[];
  risk_assessments: RiskAssessment[];
  vulnerability_zones: VulnerabilityZone[];
  community_priorities: CommunityPriority[];
  interventions: Intervention[];
  projects: Project[];
  project_interventions: ProjectIntervention[];
  funding_call_sources: FundingCallSource[];
  funding_calls: FundingCall[];
  funding_matches: FundingMatch[];
  tasks: Task[];
  evidence: Evidence[];
  ledger_entries: LedgerEntry[];
  notifications: Notification[];
  replication_playbooks: ReplicationPlaybook[];
  audit_log: AuditLog[];
}

type Listener = () => void;

class ReactiveDatabase {
  private state: DatabaseState;
  private currentUser: User;
  private listeners: Set<Listener> = new Set();
  private auditCounter: number = 100;

  constructor() {
    this.state = this.loadState();
    this.currentUser = this.loadCurrentUser();
  }

  // ==========================================
  // Persistence & State Management
  // ==========================================

  private loadState(): DatabaseState {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to load database from localStorage, using initial seed data.', e);
      }
    }
    return this.getInitialSeedState();
  }

  private loadCurrentUser(): User {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(CURRENT_USER_KEY);
        if (saved) {
          const user = JSON.parse(saved);
          const found = this.state.users.find((u) => u.id === user.id);
          if (found) return found;
        }
      } catch (e) {
        console.warn('Failed to load current user, defaulting to operator.', e);
      }
    }
    // Default to operator user
    return (
      this.state.users.find((u) => u.role === 'operator') ||
      this.state.users[0] ||
      initialUsers[2]
    );
  }

  private getInitialSeedState(): DatabaseState {
    return {
      organizations: JSON.parse(JSON.stringify(initialOrganizations)),
      users: JSON.parse(JSON.stringify(initialUsers)),
      consent_records: JSON.parse(JSON.stringify(initialConsentRecords)),
      risk_assessments: JSON.parse(JSON.stringify(initialRiskAssessments)),
      vulnerability_zones: JSON.parse(JSON.stringify(initialVulnerabilityZones)),
      community_priorities: JSON.parse(JSON.stringify(initialCommunityPriorities)),
      interventions: JSON.parse(JSON.stringify(initialInterventions)),
      projects: JSON.parse(JSON.stringify(initialProjects)),
      project_interventions: JSON.parse(JSON.stringify(initialProjectInterventions)),
      funding_call_sources: JSON.parse(JSON.stringify(initialFundingCallSources)),
      funding_calls: JSON.parse(JSON.stringify(initialFundingCalls)),
      funding_matches: JSON.parse(JSON.stringify(initialFundingMatches)),
      tasks: JSON.parse(JSON.stringify(initialTasks)),
      evidence: JSON.parse(JSON.stringify(initialEvidence)),
      ledger_entries: JSON.parse(JSON.stringify(initialLedgerEntries)),
      notifications: JSON.parse(JSON.stringify(initialNotifications)),
      replication_playbooks: JSON.parse(JSON.stringify(initialReplicationPlaybooks)),
      audit_log: JSON.parse(JSON.stringify(initialAuditLogs)),
    };
  }

  public saveState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      } catch (e) {
        console.error('Failed to save database state to localStorage', e);
      }
    }
    this.notify();
  }

  public resetToSeed(): void {
    this.state = this.getInitialSeedState();
    this.currentUser =
      this.state.users.find((u) => u.role === 'operator') || this.state.users[0];
    this.saveState();
  }

  // ==========================================
  // Reactivity / Subscriptions
  // ==========================================

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in database subscriber:', e);
      }
    });
  }

  // ==========================================
  // Auth & Role Simulation
  // ==========================================

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(userOrId: User | string): void {
    if (typeof userOrId === 'string') {
      const user = this.state.users.find((u) => u.id === userOrId);
      if (user) {
        this.currentUser = user;
      }
    } else {
      this.currentUser = userOrId;
    }
    this.saveState();
  }

  public setCurrentRole(role: UserRole): void {
    const userWithRole = this.state.users.find((u) => u.role === role);
    if (userWithRole) {
      this.currentUser = userWithRole;
    } else {
      this.currentUser = {
        ...this.currentUser,
        role,
      };
    }
    this.saveState();
  }

  public getUsers(): User[] {
    return [...this.state.users];
  }

  public getOrganizations(): Organization[] {
    return [...this.state.organizations];
  }

  // ==========================================
  // Internal Audit Logger
  // ==========================================

  private logAudit(
    tableName: string,
    rowId: string,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    diff?: Record<string, any>
  ): void {
    this.auditCounter += 1;
    const entry: AuditLog = {
      id: this.auditCounter,
      table_name: tableName,
      row_id: rowId,
      action,
      changed_by: this.currentUser.id,
      changed_at: new Date().toISOString(),
      diff: diff || null,
    };
    this.state.audit_log.unshift(entry);
  }

  public getAuditLogs(): AuditLog[] {
    const role = this.currentUser.role;
    // RLS: Audit logs accessible only by auditor and admin
    if (role === 'admin' || role === 'auditor') {
      return [...this.state.audit_log];
    }
    // Filtered view for others
    return this.state.audit_log.filter((log) => log.changed_by === this.currentUser.id);
  }

  // ==========================================
  // Consent Records
  // ==========================================

  public getConsentRecords(userId?: string): ConsentRecord[] {
    const targetUserId = userId || this.currentUser.id;
    return this.state.consent_records.filter((c) => c.user_id === targetUserId);
  }

  public hasConsent(
    consentType: 'evidence_capture' | 'vulnerability_data' | 'photo_publication',
    userId?: string
  ): boolean {
    const targetUserId = userId || this.currentUser.id;
    const record = this.state.consent_records.find(
      (c) => c.user_id === targetUserId && c.consent_type === consentType && c.granted && !c.withdrawn_at
    );
    return !!record;
  }

  public grantConsent(
    consentType: 'evidence_capture' | 'vulnerability_data' | 'photo_publication',
    userId?: string
  ): ConsentRecord {
    const targetUserId = userId || this.currentUser.id;
    const existing = this.state.consent_records.find(
      (c) => c.user_id === targetUserId && c.consent_type === consentType
    );

    if (existing) {
      existing.granted = true;
      existing.withdrawn_at = null;
      existing.granted_at = new Date().toISOString();
      this.logAudit('consent_records', existing.id, 'UPDATE', { consent_type: consentType, granted: true });
      this.saveState();
      return existing;
    }

    const newRecord: ConsentRecord = {
      id: crypto.randomUUID(),
      user_id: targetUserId,
      consent_type: consentType,
      granted: true,
      granted_at: new Date().toISOString(),
      withdrawn_at: null,
    };

    this.state.consent_records.push(newRecord);
    this.logAudit('consent_records', newRecord.id, 'INSERT', newRecord);
    this.saveState();
    return newRecord;
  }

  public withdrawConsent(
    consentType: 'evidence_capture' | 'vulnerability_data' | 'photo_publication',
    userId?: string
  ): void {
    const targetUserId = userId || this.currentUser.id;
    const existing = this.state.consent_records.find(
      (c) => c.user_id === targetUserId && c.consent_type === consentType
    );

    if (existing) {
      existing.granted = false;
      existing.withdrawn_at = new Date().toISOString();
      this.logAudit('consent_records', existing.id, 'UPDATE', { consent_type: consentType, granted: false });
      this.saveState();
    }
  }

  // ==========================================
  // Module A: Risk Intelligence
  // ==========================================

  public getRiskAssessments(): RiskAssessment[] {
    return [...this.state.risk_assessments];
  }

  public addRiskAssessment(data: Omit<RiskAssessment, 'id' | 'created_at'>): RiskAssessment {
    const role = this.currentUser.role;
    if (role !== 'operator' && role !== 'admin' && role !== 'local_officer') {
      throw new Error('RLS Violation: Only operator, local_officer, or admin can add risk assessments');
    }

    const item: RiskAssessment = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      verified_by: this.currentUser.id,
    };

    this.state.risk_assessments.unshift(item);
    this.logAudit('risk_assessments', item.id, 'INSERT', item);
    this.saveState();
    return item;
  }

  // ==========================================
  // Module B: Vulnerability Zones (k-Anonymity)
  // ==========================================

  public getVulnerabilityZones(): VulnerabilityZone[] {
    const role = this.currentUser.role;
    const canSeeRaw = role === 'operator' || role === 'admin' || role === 'local_officer';

    return this.state.vulnerability_zones.map((zone) => {
      if (canSeeRaw) {
        return { ...zone };
      }

      // Enforce k-anonymity view (k >= 10)
      const K_THRESHOLD = 10;
      let suppressed = zone.k_anonymity_suppressed;

      const masked: VulnerabilityZone = {
        ...zone,
        elderly_count:
          zone.elderly_count !== null && zone.elderly_count !== undefined && zone.elderly_count < K_THRESHOLD
            ? null
            : zone.elderly_count,
        disability_count:
          zone.disability_count !== null && zone.disability_count !== undefined && zone.disability_count < K_THRESHOLD
            ? null
            : zone.disability_count,
        low_income_household_count:
          zone.low_income_household_count !== null &&
          zone.low_income_household_count !== undefined &&
          zone.low_income_household_count < K_THRESHOLD
            ? null
            : zone.low_income_household_count,
        outdoor_worker_count:
          zone.outdoor_worker_count !== null &&
          zone.outdoor_worker_count !== undefined &&
          zone.outdoor_worker_count < K_THRESHOLD
            ? null
            : zone.outdoor_worker_count,
        k_anonymity_suppressed:
          suppressed ||
          (zone.elderly_count !== null && zone.elderly_count! < K_THRESHOLD) ||
          (zone.disability_count !== null && zone.disability_count! < K_THRESHOLD) ||
          (zone.low_income_household_count !== null && zone.low_income_household_count! < K_THRESHOLD) ||
          (zone.outdoor_worker_count !== null && zone.outdoor_worker_count! < K_THRESHOLD),
      };

      return masked;
    });
  }

  public saveVulnerabilityZone(
    data: Omit<VulnerabilityZone, 'id' | 'updated_at' | 'k_anonymity_suppressed'>
  ): VulnerabilityZone {
    const role = this.currentUser.role;
    if (role !== 'operator' && role !== 'admin') {
      throw new Error('RLS Violation: Only operator or admin can modify vulnerability zones');
    }

    const K_THRESHOLD = 10;
    let suppressed = false;

    let elderly = data.elderly_count;
    if (elderly !== null && elderly !== undefined && elderly < K_THRESHOLD) {
      elderly = null;
      suppressed = true;
    }

    let disability = data.disability_count;
    if (disability !== null && disability !== undefined && disability < K_THRESHOLD) {
      disability = null;
      suppressed = true;
    }

    let lowIncome = data.low_income_household_count;
    if (lowIncome !== null && lowIncome !== undefined && lowIncome < K_THRESHOLD) {
      lowIncome = null;
      suppressed = true;
    }

    let outdoorWorker = data.outdoor_worker_count;
    if (outdoorWorker !== null && outdoorWorker !== undefined && outdoorWorker < K_THRESHOLD) {
      outdoorWorker = null;
      suppressed = true;
    }

    const item: VulnerabilityZone = {
      ...data,
      id: crypto.randomUUID(),
      elderly_count: elderly,
      disability_count: disability,
      low_income_household_count: lowIncome,
      outdoor_worker_count: outdoorWorker,
      k_anonymity_suppressed: suppressed,
      updated_at: new Date().toISOString(),
    };

    this.state.vulnerability_zones.push(item);
    this.logAudit('vulnerability_zones', item.id, 'INSERT', item);
    this.saveState();
    return item;
  }

  // ==========================================
  // Module C: Community Priorities
  // ==========================================

  public getCommunityPriorities(orgId?: string): CommunityPriority[] {
    const role = this.currentUser.role;
    const userOrgId = this.currentUser.organization_id;

    let list = [...this.state.community_priorities];

    // RLS: Community members and operators see only their own org priorities
    if (role === 'community_member' || role === 'operator') {
      list = list.filter((p) => p.organization_id === userOrgId);
    } else if (orgId) {
      list = list.filter((p) => p.organization_id === orgId);
    }

    // Sort by priority_score descending
    return list.sort((a, b) => b.priority_score - a.priority_score);
  }

  public calculatePriorityScore(
    urgency: number,
    beneficiaries_est: number,
    feasibility: number,
    equity_score: number,
    cost_est: number
  ): PriorityScoreBreakdown {
    const validCost = cost_est > 0 ? cost_est : 1;
    const score = Number(
      ((urgency * beneficiaries_est * feasibility * equity_score) / validCost).toFixed(4)
    );
    return {
      urgency,
      beneficiaries_est,
      feasibility,
      equity_score,
      cost_est,
      score,
    };
  }

  public createCommunityPriority(
    data: Omit<CommunityPriority, 'id' | 'priority_score' | 'created_at'>
  ): CommunityPriority {
    const role = this.currentUser.role;
    if (role === 'auditor') {
      throw new Error('RLS Violation: Auditor cannot create community priorities');
    }

    const breakdown = this.calculatePriorityScore(
      data.urgency,
      data.beneficiaries_est,
      data.feasibility,
      data.equity_score,
      data.cost_est
    );

    const item: CommunityPriority = {
      ...data,
      id: crypto.randomUUID(),
      priority_score: breakdown.score,
      created_by: this.currentUser.id,
      created_at: new Date().toISOString(),
    };

    this.state.community_priorities.push(item);
    this.logAudit('community_priorities', item.id, 'INSERT', item);
    this.saveState();
    return item;
  }

  // ==========================================
  // Module D: Intervention Library
  // ==========================================

  public getInterventions(category?: string): Intervention[] {
    if (category) {
      return this.state.interventions.filter((i) => i.category === category);
    }
    return [...this.state.interventions];
  }

  public getInterventionById(id: string): Intervention | undefined {
    return this.state.interventions.find((i) => i.id === id);
  }

  // ==========================================
  // Module E: Projects & Composer
  // ==========================================

  public getProjects(orgId?: string): Project[] {
    const role = this.currentUser.role;
    const userOrgId = this.currentUser.organization_id;

    if (role === 'community_member' || role === 'operator') {
      return this.state.projects.filter((p) => p.organization_id === userOrgId);
    }

    if (orgId) {
      return this.state.projects.filter((p) => p.organization_id === orgId);
    }

    return [...this.state.projects];
  }

  public getProjectDetails(projectId: string): ProjectWithDetails | null {
    const project = this.state.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const org = this.state.organizations.find((o) => o.id === project.organization_id);
    const priority = project.priority_id
      ? this.state.community_priorities.find((cp) => cp.id === project.priority_id) || null
      : null;

    const interventionIds = this.state.project_interventions
      .filter((pi) => pi.project_id === projectId)
      .map((pi) => pi.intervention_id);

    const interventions = this.state.interventions.filter((i) =>
      interventionIds.includes(i.id)
    );

    const matches = this.getFundingMatches(projectId);
    const tasks = this.getTasks(projectId);
    const evidence = this.getEvidence(projectId);
    const ledger = this.getLedgerEntries(projectId);

    return {
      ...project,
      organization: org,
      priority,
      interventions,
      funding_matches: matches,
      tasks,
      evidence,
      ledger_entries: ledger,
    };
  }

  public composeProject(params: {
    title: string;
    organization_id: string;
    priority_id: string;
    intervention_ids: string[];
    theory_of_change?: string;
    budget_total?: number;
    timeline_days?: number;
  }): { project: Project; requires_human_review: boolean; fields_needing_confirmation: string[] } {
    const role = this.currentUser.role;
    if (role === 'auditor') {
      throw new Error('RLS Violation: Auditor cannot compose projects');
    }

    const interventions = this.state.interventions.filter((i) =>
      params.intervention_ids.includes(i.id)
    );

    // Auto-calculate budget and timeline if not provided
    const calculatedBudget =
      params.budget_total ??
      interventions.reduce((sum, item) => sum + (item.cost_high || item.cost_low || 0), 0);

    const maxTimeline =
      params.timeline_days ??
      Math.max(...interventions.map((i) => i.timeline_days || 14), 30);

    const project: Project = {
      id: crypto.randomUUID(),
      organization_id: params.organization_id,
      title: params.title,
      status: 'composed',
      priority_id: params.priority_id,
      theory_of_change:
        params.theory_of_change ||
        'โครงการนี้มีเป้าหมายเพื่อลดผลกระทบจากความเสี่ยงภูมิอากาศและยกระดับคุณภาพชีวิตของชุมชนกลุ่มเปราะบาง',
      budget_total: calculatedBudget,
      timeline_days: maxTimeline,
      created_at: new Date().toISOString(),
    };

    this.state.projects.unshift(project);

    // Link project interventions
    params.intervention_ids.forEach((intId) => {
      this.state.project_interventions.push({
        project_id: project.id,
        intervention_id: intId,
      });
    });

    // Auto-generate candidate funding matches (rule-based tag overlap)
    const interventionCategories = new Set(interventions.map((i) => i.category));
    this.state.funding_calls.forEach((call) => {
      const matchCount = (call.thematic_fit || []).filter((tag) =>
        interventionCategories.has(tag) || tag.includes('adaptation') || tag.includes('climate')
      ).length;

      if (matchCount > 0) {
        const score = Math.min(100, Math.round(65 + matchCount * 12));
        this.state.funding_matches.push({
          project_id: project.id,
          funding_call_id: call.id,
          match_score: score,
          is_human_confirmed: false, // Must be human-confirmed
          confirmed_by: null,
          confirmed_at: null,
        });
      }
    });

    this.logAudit('projects', project.id, 'INSERT', project);
    this.saveState();

    return {
      project,
      requires_human_review: true,
      fields_needing_confirmation: ['theory_of_change', 'budget_total', 'funding_matches'],
    };
  }

  public updateProjectStatus(projectId: string, status: Project['status']): Project {
    const project = this.state.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const role = this.currentUser.role;
    if (role === 'auditor') {
      throw new Error('RLS Violation: Auditor cannot update project status');
    }

    const oldStatus = project.status;
    project.status = status;

    this.logAudit('projects', project.id, 'UPDATE', { old_status: oldStatus, new_status: status });
    this.saveState();
    return project;
  }

  // ==========================================
  // Module F: Funding Match & Directory
  // ==========================================

  public getFundingCallSources(): FundingCallSource[] {
    return [...this.state.funding_call_sources];
  }

  public getFundingCalls(): FundingCall[] {
    return [...this.state.funding_calls];
  }

  public getFundingMatches(
    projectId?: string
  ): (FundingMatch & { funding_call?: FundingCall })[] {
    const role = this.currentUser.role;
    const userOrgId = this.currentUser.organization_id;

    let matches = [...this.state.funding_matches];

    if (projectId) {
      matches = matches.filter((m) => m.project_id === projectId);
    }

    // RLS SCENARIO 1 (Section E.1):
    // Community members see only human-confirmed matches belonging to their own organization's projects
    if (role === 'community_member') {
      const orgProjectIds = new Set(
        this.state.projects
          .filter((p) => p.organization_id === userOrgId)
          .map((p) => p.id)
      );

      matches = matches.filter(
        (m) => m.is_human_confirmed === true && orgProjectIds.has(m.project_id)
      );
    }

    // Join with funding call info
    return matches.map((m) => ({
      ...m,
      funding_call: this.state.funding_calls.find((fc) => fc.id === m.funding_call_id),
    }));
  }

  public confirmFundingMatch(
    projectId: string,
    fundingCallId: string,
    isConfirmed: boolean
  ): FundingMatch {
    const role = this.currentUser.role;
    if (role !== 'operator' && role !== 'admin') {
      throw new Error('RLS Violation: Only operator or admin can confirm funding matches');
    }

    const match = this.state.funding_matches.find(
      (m) => m.project_id === projectId && m.funding_call_id === fundingCallId
    );

    if (!match) {
      throw new Error('Funding match not found');
    }

    match.is_human_confirmed = isConfirmed;
    match.confirmed_by = isConfirmed ? this.currentUser.id : null;
    match.confirmed_at = isConfirmed ? new Date().toISOString() : null;

    // Also update funding call last_verified_at
    const call = this.state.funding_calls.find((fc) => fc.id === fundingCallId);
    if (call && isConfirmed) {
      call.last_verified_at = new Date().toISOString();
    }

    this.logAudit('funding_matches', `${projectId}:${fundingCallId}`, 'UPDATE', {
      is_human_confirmed: isConfirmed,
      confirmed_by: this.currentUser.id,
    });
    this.saveState();
    return match;
  }

  // ==========================================
  // Module G: Implementation Tasks
  // ==========================================

  public getTasks(projectId?: string): Task[] {
    if (projectId) {
      return this.state.tasks.filter((t) => t.project_id === projectId);
    }
    return [...this.state.tasks];
  }

  public createTask(data: Omit<Task, 'id'>): Task {
    const role = this.currentUser.role;
    if (role === 'auditor') {
      throw new Error('RLS Violation: Auditor cannot create tasks');
    }

    const task: Task = {
      ...data,
      id: crypto.randomUUID(),
    };

    this.state.tasks.push(task);
    this.logAudit('tasks', task.id, 'INSERT', task);
    this.saveState();
    return task;
  }

  public updateTaskStatus(taskId: string, status: Task['status']): Task {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const role = this.currentUser.role;
    if (role === 'auditor') {
      throw new Error('RLS Violation: Auditor cannot update task status');
    }

    const oldStatus = task.status;
    task.status = status;

    this.logAudit('tasks', task.id, 'UPDATE', { old_status: oldStatus, new_status: status });
    this.saveState();
    return task;
  }

  // ==========================================
  // Module H: Evidence & MRV (Auditor Read-only)
  // ==========================================

  public getEvidence(projectId?: string): Evidence[] {
    const role = this.currentUser.role;
    const userOrgId = this.currentUser.organization_id;

    let list = [...this.state.evidence];

    if (projectId) {
      list = list.filter((e) => e.project_id === projectId);
    }

    // RLS SCENARIO 3 (Section E.1):
    // Auditor can read all evidence across all organizations
    if (role === 'auditor' || role === 'admin' || role === 'funder') {
      return list;
    }

    // Org members see evidence for their own org projects
    const orgProjectIds = new Set(
      this.state.projects
        .filter((p) => p.organization_id === userOrgId)
        .map((p) => p.id)
    );

    return list.filter((e) => orgProjectIds.has(e.project_id));
  }

  public insertEvidence(
    data: Omit<Evidence, 'id' | 'captured_at'> & { captured_at?: string }
  ): Evidence {
    const role = this.currentUser.role;

    // RLS SCENARIO 3: Auditor strictly has NO writes
    if (role === 'auditor') {
      throw new Error('RLS Violation: Auditor role has strictly read-only permissions on evidence');
    }

    // Consent Check (Section G): Check consent_records before insert
    const capturedBy = data.captured_by || this.currentUser.id;
    const hasEvidenceConsent = this.hasConsent('evidence_capture', capturedBy);
    if (!hasEvidenceConsent) {
      console.warn(
        `Consent Warning: User ${capturedBy} does not have an explicit granted consent_record for evidence_capture.`
      );
    }

    // Data honesty: never fabricate hashes. Store provided hash as-is; null when absent.
    const evidence: Evidence = {
      ...data,
      id: crypto.randomUUID(),
      file_hash: data.file_hash ?? null,
      captured_at: data.captured_at || new Date().toISOString(),
      captured_by: capturedBy,
    };

    this.state.evidence.unshift(evidence);
    this.logAudit('evidence', evidence.id, 'INSERT', evidence);
    this.saveState();
    return evidence;
  }

  // ==========================================
  // Module I: Finance Ledger (Append-Only)
  // ==========================================

  public getLedgerEntries(projectId?: string): LedgerEntry[] {
    const role = this.currentUser.role;
    const userOrgId = this.currentUser.organization_id;

    let entries = [...this.state.ledger_entries];

    if (projectId) {
      entries = entries.filter((e) => e.project_id === projectId);
    }

    // RLS SCENARIO 4: Auditor/Funder/Admin see all, Org members see own org
    if (role === 'auditor' || role === 'funder' || role === 'admin') {
      return entries.sort(
        (a, b) => new Date(a.entered_at).getTime() - new Date(b.entered_at).getTime()
      );
    }

    const orgProjectIds = new Set(
      this.state.projects
        .filter((p) => p.organization_id === userOrgId)
        .map((p) => p.id)
    );

    return entries
      .filter((e) => orgProjectIds.has(e.project_id))
      .sort((a, b) => new Date(a.entered_at).getTime() - new Date(b.entered_at).getTime());
  }

  public insertLedgerEntry(
    data: Omit<LedgerEntry, 'id' | 'entered_at'> & { entered_at?: string }
  ): LedgerEntry {
    const role = this.currentUser.role;

    // RLS SCENARIO 4: Auditor cannot insert ledger entries
    if (role === 'auditor') {
      throw new Error('RLS Violation: Auditor role cannot insert ledger entries');
    }

    const entry: LedgerEntry = {
      project_id: data.project_id,
      entry_type: data.entry_type,
      amount: data.amount,
      description: data.description,
      corrects_entry_id: data.corrects_entry_id ?? null,
      entered_by: data.entered_by || this.currentUser.id,
      entered_at: data.entered_at || new Date().toISOString(),
      source: (data as any).source || 'manual',
      id: crypto.randomUUID(),
    };

    this.state.ledger_entries.push(entry);
    this.logAudit('ledger_entries', entry.id, 'INSERT', entry);
    this.saveState();
    return entry;
  }

  // Strictly reject direct updates on ledger (STRIDE Tampering Protection)
  public updateLedgerEntry(): never {
    throw new Error(
      'RLS / Database Violation: REVOKE UPDATE ON ledger_entries. The ledger is append-only. Use createLedgerCorrection instead.'
    );
  }

  // Strictly reject direct deletions on ledger
  public deleteLedgerEntry(): never {
    throw new Error(
      'RLS / Database Violation: REVOKE DELETE ON ledger_entries. The ledger is append-only.'
    );
  }

  public createLedgerCorrection(params: {
    originalEntryId: string;
    correctAmount: number;
    description: string;
    reversalDescription?: string;
  }): { reversalEntry: LedgerEntry; correctedEntry: LedgerEntry } {
    const original = this.state.ledger_entries.find((e) => e.id === params.originalEntryId);
    if (!original) throw new Error('Original ledger entry not found');

    // 1. Reversal entry (negative amount)
    const reversalEntry = this.insertLedgerEntry({
      project_id: original.project_id,
      entry_type: original.entry_type,
      amount: -original.amount,
      description:
        params.reversalDescription ||
        `ยกเลิกรายการเดิม (Correction Reversal: ${original.description})`,
      corrects_entry_id: original.id,
      entered_by: this.currentUser.id,
    });

    // 2. New corrected entry
    const correctedEntry = this.insertLedgerEntry({
      project_id: original.project_id,
      entry_type: original.entry_type,
      amount: params.correctAmount,
      description: params.description,
      corrects_entry_id: original.id,
      entered_by: this.currentUser.id,
    });

    return { reversalEntry, correctedEntry };
  }

  // ==========================================
  // Module J: Notifications & Playbooks
  // ==========================================

  public getNotifications(userId?: string): Notification[] {
    const target = userId || this.currentUser.id;
    return this.state.notifications.filter((n) => n.user_id === target);
  }

  public getReplicationPlaybooks(): ReplicationPlaybook[] {
    return [...this.state.replication_playbooks];
  }

  // ==========================================
  // Section P: Success Metrics & Instrumentation
  // ==========================================

  public getTotalWasteWeighedKg(projectId?: string): number {
    const evidenceList = this.getEvidence(projectId);
    const weighTickets = evidenceList.filter((e) => e.evidence_type === 'weigh_ticket');
    let totalKg = 0;
    for (const ticket of weighTickets) {
      const raw = ticket.payload; // typed field (evidence.payload jsonb)
      if (raw == null) continue; // ticket without recorded weight contributes nothing
      let parsed: unknown = raw;
      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw);
        } catch {
          continue; // skip unparsable payloads instead of guessing
        }
      }
      const fields =
        parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
      const kg = Number(fields.weight_kg ?? fields.total_weight_kg ?? fields.net_weight_kg);
      if (Number.isFinite(kg) && kg >= 0) totalKg += kg;
    }
    return totalKg;
  }

  public getHeatRefugeCheckinsCount(projectId?: string): number {
    const evidenceList = this.getEvidence(projectId);
    return evidenceList.filter((e) => e.evidence_type === 'gps_checkin').length;
  }

  public getLedgerSummary(projectId?: string): {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    volunteerHours: number;
    inKindValue: number;
  } {
    const entries = this.getLedgerEntries(projectId);
    let totalIncome = 0;
    let totalExpense = 0;
    let volunteerHours = 0;
    let inKindValue = 0;

    entries.forEach((e) => {
      if (e.entry_type === 'income') totalIncome += Number(e.amount);
      if (e.entry_type === 'expense') totalExpense += Number(e.amount);
      if (e.entry_type === 'volunteer_hours') volunteerHours += Number(e.amount);
      if (e.entry_type === 'in_kind') inKindValue += Number(e.amount);
    });

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      volunteerHours,
      inKindValue,
    };
  }

  public getTaskStats(projectId?: string): {
    todo: number;
    in_progress: number;
    blocked: number;
    done: number;
    total: number;
  } {
    const tasks = this.getTasks(projectId);
    return {
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      blocked: tasks.filter((t) => t.status === 'blocked').length,
      done: tasks.filter((t) => t.status === 'done').length,
      total: tasks.length,
    };
  }
}

// Export singleton instance
export const db = new ReactiveDatabase();
export default db;
