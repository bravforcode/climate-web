import type {
  FundingCall,
  FundingMatchResult,
  HazardType,
  Intervention,
  ProjectStatus,
  UserRole,
} from './types';

export interface ProjectForMatching {
  id: string;
  organization_id?: string;
  title: string | { th: string; en: string };
  budget_total: number;
  thematic_areas?: string[];
  hazard_types?: HazardType[];
  interventions?: Intervention[];
  status?: ProjectStatus;
  confirmed_call_ids?: string[] | Set<string>;
}

export interface MatchOptions {
  userRole?: UserRole | string;
  minScoreThreshold?: number;
  includeExpired?: boolean;
}

/**
 * Normalizes a theme token for semantic comparison.
 */
function normalizeTheme(theme: string): string {
  return theme.toLowerCase().replace(/[-_\s]+/g, '');
}

/**
 * Calculates the thematic overlap score between project themes and funding call themes (0.0 to 1.0).
 */
export function calculateThematicOverlap(
  projectThemes: string[],
  callThemes: string[]
): { score: number; matchedThemes: string[] } {
  if (!projectThemes.length || !callThemes.length) {
    return { score: 0, matchedThemes: [] };
  }

  const normalizedCallThemes = callThemes.map(normalizeTheme);
  const matchedThemes: string[] = [];

  for (const pTheme of projectThemes) {
    const normP = normalizeTheme(pTheme);
    const hasMatch = normalizedCallThemes.some(
      (cNorm) => cNorm.includes(normP) || normP.includes(cNorm)
    );
    if (hasMatch) {
      matchedThemes.push(pTheme);
    }
  }

  // Jaccard-style overlap with weighting towards project coverage
  const overlapRatio = matchedThemes.length / Math.max(projectThemes.length, 1);
  return { score: Math.min(1.0, overlapRatio), matchedThemes };
}

/**
 * Calculates budget fit score (0.0 to 1.0).
 */
export function calculateBudgetFit(
  projectBudget: number,
  callMaxAmount: number,
  coFinancingRequired = false
): { score: number; reason: string } {
  if (projectBudget <= 0 || callMaxAmount <= 0) {
    return { score: 0.5, reason: 'Unspecified budget' };
  }

  if (projectBudget <= callMaxAmount) {
    // Perfect fit within grant envelope
    const ratio = projectBudget / callMaxAmount;
    if (ratio >= 0.2) {
      return { score: 1.0, reason: 'Budget comfortably within grant ceiling' };
    }
    return { score: 0.85, reason: 'Budget is small relative to grant ceiling' };
  }

  // Budget exceeds ceiling: if co-financing allowed, might still qualify with lower score
  const excessRatio = (projectBudget - callMaxAmount) / callMaxAmount;
  if (excessRatio <= 0.25) {
    return {
      score: 0.6,
      reason: coFinancingRequired
        ? 'Project budget slightly exceeds ceiling but co-financing is viable'
        : 'Project budget slightly exceeds maximum grant limit',
    };
  }

  return {
    score: Math.max(0.1, 0.5 - excessRatio * 0.4),
    reason: 'Project budget significantly exceeds maximum grant limit',
  };
}

/**
 * Collects all relevant thematic keywords from a project.
 */
function extractProjectThemes(project: ProjectForMatching): string[] {
  const themes = new Set<string>();

  if (project.thematic_areas) {
    for (const t of project.thematic_areas) themes.add(t);
  }

  if (project.hazard_types) {
    for (const h of project.hazard_types) {
      themes.add(h);
      if (h === 'flood') {
        themes.add('flood_resilience');
        themes.add('water_management');
      }
      if (h === 'heat') {
        themes.add('heat_adaptation');
        themes.add('urban_cooling');
      }
      if (h === 'pm25') {
        themes.add('air_quality');
      }
    }
  }

  if (project.interventions) {
    for (const inv of project.interventions) {
      if (inv.category) themes.add(inv.category);
      if (inv.name) themes.add(inv.name);
    }
  }

  return Array.from(themes);
}

/**
 * Matches funding calls against a project proposal.
 *
 * Rules:
 * 1. Scores candidates based on thematic fit (65% weight) and budget fit (35% weight).
 * 2. If userRole === 'community_member', ONLY confirmed matches (is_human_confirmed = true) are returned.
 * 3. Operators/officers/admins see all candidate matches with match scores and confirmation flags.
 */
export function matchFundingCalls(
  project: ProjectForMatching,
  calls: FundingCall[],
  options?: MatchOptions
): FundingMatchResult[] {
  if (!project || !Array.isArray(calls)) {
    return [];
  }

  const role = options?.userRole;
  const isCommunityRole = role === 'community_member';
  const minThreshold = options?.minScoreThreshold ?? 10;
  const projectThemes = extractProjectThemes(project);

  const confirmedSet = new Set<string>();
  if (project.confirmed_call_ids) {
    if (project.confirmed_call_ids instanceof Set) {
      for (const id of project.confirmed_call_ids) confirmedSet.add(id);
    } else if (Array.isArray(project.confirmed_call_ids)) {
      for (const id of project.confirmed_call_ids) confirmedSet.add(id);
    }
  }

  const results: FundingMatchResult[] = [];

  for (const call of calls) {
    if (!call || !call.id) continue;

    // Check deadline if requested
    if (!options?.includeExpired && call.application_deadline) {
      const deadlineDate = new Date(call.application_deadline);
      if (!Number.isNaN(deadlineDate.getTime())) {
        const now = new Date();
        // If deadline is strictly before today (ignoring hours if date-only)
        if (deadlineDate.getTime() < now.setHours(0, 0, 0, 0)) {
          // expired
          continue;
        }
      }
    }

    const { score: thematicScore, matchedThemes } = calculateThematicOverlap(
      projectThemes,
      call.thematic_fit || []
    );

    const { score: budgetScore, reason: budgetReason } = calculateBudgetFit(
      project.budget_total || 0,
      call.max_amount || 0,
      call.co_financing_required
    );

    const weightedScore = Math.round(
      (thematicScore * 0.65 + budgetScore * 0.35) * 100
    );

    const isConfirmed = confirmedSet.has(call.id);

    const matchReasons: string[] = [];
    if (matchedThemes.length > 0) {
      matchReasons.push(`Matched themes: ${matchedThemes.join(', ')}`);
    }
    matchReasons.push(budgetReason);

    const matchResult: FundingMatchResult = {
      project_id: project.id,
      funding_call_id: call.id,
      match_score: weightedScore,
      is_human_confirmed: isConfirmed,
      confirmed_by: isConfirmed ? 'operator' : null,
      confirmed_at: isConfirmed ? new Date().toISOString() : null,
      match_reasons: matchReasons,
      funding_call: call,
    };

    // Filter by role: community members ONLY see human-confirmed matches
    if (isCommunityRole) {
      if (isConfirmed) {
        results.push(matchResult);
      }
    } else {
      if (weightedScore >= minThreshold || isConfirmed) {
        results.push(matchResult);
      }
    }
  }

  // Sort descending by match score
  results.sort((a, b) => b.match_score - a.match_score);

  return results;
}

/**
 * Confirms a candidate funding match by an operator or admin.
 */
export function confirmFundingMatch(
  match: FundingMatchResult,
  confirmedByUserId: string
): FundingMatchResult {
  return {
    ...match,
    is_human_confirmed: true,
    confirmed_by: confirmedByUserId,
    confirmed_at: new Date().toISOString(),
  };
}
