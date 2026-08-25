// Climate Action OS - Database & Domain TypeScript Type Definitions
// Generated from Postgres schema 20260825000001

export type OrgType =
  | 'community'
  | 'municipality'
  | 'school'
  | 'temple'
  | 'market'
  | 'cooperative'
  | 'ngo'
  | 'funder';

export type UserRole =
  | 'community_member'
  | 'operator'
  | 'local_officer'
  | 'funder'
  | 'admin'
  | 'auditor';

export type ConsentType =
  | 'evidence_capture'
  | 'vulnerability_data'
  | 'photo_publication';

export type HazardType =
  | 'flood'
  | 'drought'
  | 'heat'
  | 'pm25'
  | 'coastal'
  | 'wildfire';

export type RiskLevel = 'low' | 'medium' | 'high' | 'severe';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type SourceType = 'api_automated' | 'manual_curated';

export type ProjectStatus =
  | 'draft'
  | 'composed'
  | 'submitted_for_funding'
  | 'approved'
  | 'implementing'
  | 'completed'
  | 'archived';

export type IngestionMethod =
  | 'manual_only'
  | 'api_available_unused'
  | 'api_integrated';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export type EvidenceType =
  | 'photo'
  | 'weigh_ticket'
  | 'gps_checkin'
  | 'invoice'
  | 'sensor_reading';

export type LedgerEntryType =
  | 'income'
  | 'expense'
  | 'in_kind'
  | 'volunteer_hours'
  | 'reserve';

export type NotificationChannel = 'line' | 'email' | 'in_app';

export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // array of linear rings
}

export type GeoShape = GeoPoint | GeoPolygon | string;

// 1. Organizations
export interface Organization {
  id: string;
  name: string;
  org_type: OrgType;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  geom?: GeoShape | null;
  created_at: string;
}

// 2. Users
export interface User {
  id: string;
  organization_id?: string | null;
  role: UserRole;
  display_name?: string | null;
  line_user_id?: string | null;
  created_at: string;
}

// 3. Consent Records
export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string;
  withdrawn_at?: string | null;
}

// 4. Risk Assessments (Module A)
export interface RiskAssessment {
  id: string;
  hazard_type: HazardType;
  zone: GeoPolygon | string;
  risk_level: RiskLevel;
  confidence: ConfidenceLevel;
  source_type: SourceType;
  source_name: string;
  fetched_at: string;
  valid_until?: string | null;
  verified_by?: string | null;
  raw_payload?: Record<string, any> | null;
  created_at: string;
}

// 5. Vulnerability Zones (Module B)
export interface VulnerabilityZone {
  id: string;
  zone: GeoPolygon | string;
  elderly_count?: number | null;
  disability_count?: number | null;
  low_income_household_count?: number | null;
  outdoor_worker_count?: number | null;
  total_population: number;
  k_anonymity_suppressed: boolean;
  updated_at: string;
}

// 6. Community Priorities (Module C)
export interface CommunityPriority {
  id: string;
  organization_id: string;
  problem_statement: string;
  urgency: number; // 1 - 5
  beneficiaries_est: number;
  feasibility: number; // 1 - 5
  equity_score: number; // 1 - 5
  cost_est: number;
  priority_score: number; // Computed: (urgency * beneficiaries_est * feasibility * equity_score) / cost_est
  created_by?: string | null;
  created_at: string;
}

// 7. Interventions (Module D)
export interface Intervention {
  id: string;
  name: string;
  category: string;
  cost_low?: number | null;
  cost_high?: number | null;
  timeline_days?: number | null;
  maintenance_notes?: string | null;
  permit_required: boolean;
  evidence_refs?: string[] | null;
}

// 8. Projects (Module E)
export interface Project {
  id: string;
  organization_id: string;
  title: string;
  status: ProjectStatus;
  priority_id?: string | null;
  theory_of_change?: string | null;
  budget_total?: number | null;
  timeline_days?: number | null;
  created_at: string;
}

// 9. Project Interventions (Junction)
export interface ProjectIntervention {
  project_id: string;
  intervention_id: string;
}

// 10. Funding Call Sources
export interface FundingCallSource {
  id: string;
  source_name: string;
  ingestion_method: IngestionMethod;
  commercial_use_allowed?: boolean | null;
  attribution_required: boolean;
  notes?: string | null;
}

// 11. Funding Calls (Module F)
export interface FundingCall {
  id: string;
  source_id?: string | null;
  funder_name: string;
  thematic_fit?: string[] | null;
  eligibility_notes?: string | null;
  max_amount?: number | null;
  co_financing_required?: boolean | null;
  application_deadline?: string | null; // YYYY-MM-DD
  source_url?: string | null;
  entered_by?: string | null;
  last_verified_at?: string | null;
  created_at: string;
}

// 12. Funding Matches
export interface FundingMatch {
  project_id: string;
  funding_call_id: string;
  match_score?: number | null; // 0 - 100
  is_human_confirmed: boolean;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
}

// 13. Tasks (Module G)
export interface Task {
  id: string;
  project_id: string;
  title: string;
  assignee_id?: string | null;
  status: TaskStatus;
  due_date?: string | null; // YYYY-MM-DD
}

// 14. Evidence (Module H)
export interface Evidence {
  id: string;
  project_id: string;
  task_id?: string | null;
  evidence_type: EvidenceType;
  file_url?: string | null;
  file_hash?: string | null;
  /** Structured MRV payload (mirrors evidence.payload jsonb). e.g. weigh_ticket: { weight_kg } */
  payload?: Record<string, unknown> | null;
  captured_at: string;
  captured_by?: string | null;
  geom?: GeoShape | null;
  synced_from_offline: boolean;
}

// 15. Ledger Entries (Module I - Append Only)
export interface LedgerEntry {
  id: string;
  project_id: string;
  entry_type: LedgerEntryType;
  amount: number;
  description: string;
  corrects_entry_id?: string | null;
  entered_by?: string | null;
  entered_at: string;
  source?: string;
  [key: string]: any;
}

// 16. Notifications
export interface Notification {
  id: string;
  user_id: string;
  channel: NotificationChannel;
  template_key: string;
  payload?: Record<string, any> | null;
  sent_at?: string | null;
  status: NotificationStatus;
}

// 17. Replication Playbooks (Module J)
export interface ReplicationPlaybook {
  id: string;
  source_project_id?: string | null;
  title: string;
  cost_model_summary?: Record<string, any> | null;
  bill_of_materials?: string[] | null;
  generated_at: string;
}

// 18. Audit Log
export interface AuditLog {
  id: number;
  table_name: string;
  row_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | string;
  changed_by?: string | null;
  changed_at: string;
  diff?: Record<string, any> | null;
}

// Joined types for UI rendering
export interface ProjectWithDetails extends Project {
  organization?: Organization;
  priority?: CommunityPriority | null;
  interventions?: Intervention[];
  funding_matches?: (FundingMatch & { funding_call?: FundingCall })[];
  tasks?: Task[];
  evidence?: Evidence[];
  ledger_entries?: LedgerEntry[];
}

export interface PriorityScoreBreakdown {
  urgency: number;
  beneficiaries_est: number;
  feasibility: number;
  equity_score: number;
  cost_est: number;
  score: number;
}

// Supabase DB Interface Definition
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Organization>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<User>;
      };
      consent_records: {
        Row: ConsentRecord;
        Insert: Omit<ConsentRecord, 'id' | 'granted_at'> & { id?: string; granted_at?: string };
        Update: Partial<ConsentRecord>;
      };
      risk_assessments: {
        Row: RiskAssessment;
        Insert: Omit<RiskAssessment, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<RiskAssessment>;
      };
      vulnerability_zones: {
        Row: VulnerabilityZone;
        Insert: Omit<VulnerabilityZone, 'id' | 'updated_at'> & { id?: string; updated_at?: string };
        Update: Partial<VulnerabilityZone>;
      };
      community_priorities: {
        Row: CommunityPriority;
        Insert: Omit<CommunityPriority, 'id' | 'priority_score' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<CommunityPriority>;
      };
      interventions: {
        Row: Intervention;
        Insert: Omit<Intervention, 'id'> & { id?: string };
        Update: Partial<Intervention>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Project>;
      };
      project_interventions: {
        Row: ProjectIntervention;
        Insert: ProjectIntervention;
        Update: Partial<ProjectIntervention>;
      };
      funding_call_sources: {
        Row: FundingCallSource;
        Insert: Omit<FundingCallSource, 'id'> & { id?: string };
        Update: Partial<FundingCallSource>;
      };
      funding_calls: {
        Row: FundingCall;
        Insert: Omit<FundingCall, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<FundingCall>;
      };
      funding_matches: {
        Row: FundingMatch;
        Insert: FundingMatch;
        Update: Partial<FundingMatch>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id'> & { id?: string };
        Update: Partial<Task>;
      };
      evidence: {
        Row: Evidence;
        Insert: Omit<Evidence, 'id'> & { id?: string };
        Update: Partial<Evidence>;
      };
      ledger_entries: {
        Row: LedgerEntry;
        Insert: Omit<LedgerEntry, 'id' | 'entered_at'> & { id?: string; entered_at?: string };
        Update: never; // Revoked updates in schema!
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id'> & { id?: string };
        Update: Partial<Notification>;
      };
      replication_playbooks: {
        Row: ReplicationPlaybook;
        Insert: Omit<ReplicationPlaybook, 'id' | 'generated_at'> & { id?: string; generated_at?: string };
        Update: Partial<ReplicationPlaybook>;
      };
      audit_log: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'changed_at'> & { id?: number; changed_at?: string };
        Update: never; // Append-only
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_user_org_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      org_type: OrgType;
      user_role: UserRole;
      consent_type: ConsentType;
      hazard_type: HazardType;
      risk_level: RiskLevel;
      confidence_level: ConfidenceLevel;
      source_type: SourceType;
      project_status: ProjectStatus;
      ingestion_method: IngestionMethod;
      task_status: TaskStatus;
      evidence_type: EvidenceType;
      ledger_entry_type: LedgerEntryType;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
    };
  };
}
