export type UserRole = 
  | 'community_member' 
  | 'operator' 
  | 'local_officer' 
  | 'funder' 
  | 'admin' 
  | 'auditor';

export interface RoleConfig {
  id: UserRole;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  badgeColor: string;
  privilegeLevel: 'read-only' | 'verified-view' | 'field-operator' | 'compliance-audit' | 'funder-review' | 'system-admin';
  rlsConstraints: {
    fundingMatch: string;
    vulnerability: string;
    evidence: string;
    ledger: string;
  };
}

export interface RiskAssessment {
  id: string;
  hazardType: 'flood' | 'heat' | 'pm25' | 'drought';
  titleTh: string;
  titleEn: string;
  locationName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  confidence: 'low' | 'medium' | 'high';
  sourceType: 'api_automated' | 'manual_curated';
  sourceName: string;
  attributionRequired: boolean;
  commercialUseRestricted: boolean;
  fetchedAt: string;
  validUntil: string;
  metricValue: string;
  metricUnit: string;
  deltaPercent?: number;
  rawPayload: Record<string, unknown>;
}

export interface VulnerabilityZone {
  id: string;
  zoneName: string;
  district: string;
  province: string;
  totalPopulation: number;
  elderlyCount: number | null; // null if suppressed by k-anonymity
  elderlyRaw: number;
  disabilityCount: number | null;
  disabilityRaw: number;
  lowIncomeHouseholdCount: number | null;
  lowIncomeRaw: number;
  outdoorWorkerCount: number | null;
  outdoorWorkerRaw: number;
  kAnonymitySuppressed: boolean;
  updatedAt: string;
}

export interface CommunityPriority {
  id: string;
  problemStatement: string;
  urgency: number; // 1 - 5
  beneficiariesEst: number; // count
  feasibility: number; // 1 - 5
  equityScore: number; // 1 - 5
  costEst: number; // THB
  priorityScore: number; // (urgency * beneficiariesEst * feasibility * equityScore) / costEst
  createdByRole: UserRole;
  createdAt: string;
}

export interface Intervention {
  id: string;
  nameTh: string;
  nameEn: string;
  category: 'heat' | 'waste_methane' | 'flood_drainage' | 'micro_climate' | 'early_warning';
  categoryLabelTh: string;
  costLow: number;
  costHigh: number;
  timelineDays: number;
  maintenanceNotes: string;
  permitRequired: boolean;
  evidenceRefs: string[];
  expectedImpactTh: string;
  expectedImpactEn: string;
}

export interface FundingCall {
  id: string;
  funderNameTh: string;
  funderNameEn: string;
  thematicFit: string[];
  eligibilityNotesTh: string;
  maxAmountThb: number;
  coFinancingRequired: boolean;
  applicationDeadline: string;
  sourceUrl: string;
  sourceType: 'ThaiCI' | 'กองทุนสิ่งแวดล้อม' | 'BMA_Local' | 'International_Climate';
  isHumanConfirmed: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
  matchScore: number;
}

export interface ProjectProposal {
  id: string;
  titleTh: string;
  titleEn: string;
  status: 'draft' | 'composed' | 'submitted_for_funding' | 'approved' | 'implementing' | 'completed';
  priorityId: string;
  selectedInterventions: Intervention[];
  budgetTotal: number;
  timelineDays: number;
  executiveSummaryTh: string;
  executiveSummaryEn: string;
  theoryOfChangeTh: string;
  theoryOfChangeEn: string;
  humanConfirmedList: {
    theoryOfChange: boolean;
    budgetJustification: boolean;
    communityConsent: boolean;
    riskMitigation: boolean;
  };
  createdAt: string;
}

export interface EvidenceRecord {
  id: string;
  projectId: string;
  taskTitle: string;
  evidenceType: 'weigh_ticket' | 'gps_checkin' | 'photo' | 'sensor_reading' | 'invoice';
  evidenceLabelTh: string;
  fileUrl?: string;
  fileHash: string; // SHA-256
  capturedAt: string;
  capturedBy: string;
  syncedFromOffline: boolean;
  status: 'local_pending' | 'server_confirmed';
  metricPayload: {
    value: number;
    unit: string;
    note?: string;
  };
}

export interface LedgerEntry {
  id: string;
  projectId: string;
  entryType: 'income' | 'expense' | 'in_kind' | 'volunteer_hours' | 'reserve';
  entryTypeLabelTh: string;
  amount: number; // in THB or Hours
  descriptionTh: string;
  correctsEntryId?: string; // append-only correction pointer
  enteredBy: string;
  enteredAt: string;
  verifiedHash: string;
}

export interface LineUserProfile {
  id: string;
  userId?: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
  role: UserRole;
  isVerified?: boolean;
  linkedRole?: UserRole;
  nationalIdMasked?: string;
  communityBranch?: string;
  organizationId?: string;
  organizationName?: string;
  lineOaConnected?: boolean;
  verifiedAt?: string;
  consents: {
    evidence_capture: boolean;
    vulnerability_data: boolean;
    photo_publication: boolean;
  };
}

export interface SponsorshipTier {
  id: string;
  nameTh: string;
  nameEn: string;
  priceThb: number;
  billingCycle: 'monthly' | 'one_time' | 'annual';
  badgeLabel: string;
  descriptionTh: string;
  featuresTh: string[];
  taxDeductionPercent: number;
  coFinancingMatchRatio: string;
  recommended?: boolean;
}

export interface PaymentTransaction {
  id: string;
  tierId: string;
  tierNameTh: string;
  amountThb: number;
  sponsorName: string;
  sponsorType: 'individual' | 'corporate' | 'institution';
  paymentMethod: 'promptpay_qr' | 'fund_transfer' | 'climate_token';
  taxIdMasked?: string;
  taxDeductionValueThb: number;
  receiptHash: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'pending';
}

