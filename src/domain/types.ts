export type UserRole =
  | 'community_member'
  | 'operator'
  | 'local_officer'
  | 'funder'
  | 'admin'
  | 'auditor';

export type OrgType =
  | 'community'
  | 'municipality'
  | 'school'
  | 'temple'
  | 'market'
  | 'cooperative'
  | 'ngo'
  | 'funder';

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

export type ProjectStatus =
  | 'draft'
  | 'composed'
  | 'submitted_for_funding'
  | 'approved'
  | 'implementing'
  | 'completed'
  | 'archived';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export type ConsentType =
  | 'evidence_capture'
  | 'vulnerability_data'
  | 'photo_publication';

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string;
  withdrawn_at?: string | null;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: any;
}

export interface RiskAssessmentRecord {
  id?: string;
  hazard_type: HazardType;
  zone: GeoJSONGeometry | string;
  risk_level: RiskLevel;
  confidence: ConfidenceLevel;
  source_type: SourceType;
  source_name: string;
  fetched_at: string;
  valid_until?: string | null;
  verified_by?: string | null;
  raw_payload?: any;
  created_at?: string;
}

export interface VulnerabilityCounts {
  elderly_count?: number | null;
  disability_count?: number | null;
  low_income_household_count?: number | null;
  outdoor_worker_count?: number | null;
  total_population?: number;
  [key: string]: any;
}

export interface VulnerabilityZoneRecord extends VulnerabilityCounts {
  id?: string;
  zone?: GeoJSONGeometry | string;
  k_anonymity_suppressed: boolean;
  updated_at?: string;
}

export interface PriorityScoreInput {
  urgency: number;
  beneficiaries: number;
  feasibility: number;
  equity: number;
  cost: number;
}

export interface CommunityPriorityItem extends PriorityScoreInput {
  id?: string;
  organization_id?: string;
  problem_statement: string;
  priority_score?: number;
  created_by?: string;
  created_at?: string;
}

export interface Intervention {
  id: string;
  name: string;
  category: string;
  cost_low?: number;
  cost_high?: number;
  timeline_days?: number;
  maintenance_notes?: string;
  permit_required?: boolean;
  evidence_refs?: string[];
  description_th?: string;
  description_en?: string;
}

export interface FundingCallSource {
  id?: string;
  source_name: string;
  ingestion_method: 'manual_only' | 'api_available_unused' | 'api_integrated';
  commercial_use_allowed: boolean;
  attribution_required: boolean;
  notes?: string;
}

export interface FundingCall {
  id: string;
  source_id?: string;
  funder_name: string;
  thematic_fit: string[];
  eligibility_notes?: string;
  max_amount: number;
  co_financing_required?: boolean;
  application_deadline?: string;
  source_url?: string;
  entered_by?: string;
  last_verified_at?: string;
  created_at?: string;
}

export interface FundingMatchResult {
  project_id: string;
  funding_call_id: string;
  match_score: number;
  is_human_confirmed: boolean;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
  match_reasons?: string[];
  funding_call?: FundingCall;
}

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

export interface LedgerSummary {
  total_income: number;
  total_expense: number;
  in_kind_value: number;
  volunteer_hours: number;
  reserve: number;
  net_benefit: number;
  entries_count: number;
  effective_entries_count: number;
  corrections_count: number;
}
