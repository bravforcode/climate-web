import type { UserRole, VulnerabilityCounts } from './types';

const PRIVILEGED_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  'operator',
  'admin',
  'local_officer',
]);

const STANDARD_COUNT_FIELDS = [
  'elderly_count',
  'disability_count',
  'low_income_household_count',
  'outdoor_worker_count',
] as const;

/**
 * Applies k-anonymity privacy protection to vulnerability count data.
 *
 * Rules:
 * 1. If role is 'operator' | 'admin' | 'local_officer', raw counts are preserved.
 * 2. If role is not in the privileged list (e.g., 'community_member', 'funder', 'auditor'):
 *    - For any count field where count is a valid number < kThreshold (default 10),
 *      the field is suppressed (set to null) and k_anonymity_suppressed is set to true.
 *    - If all count fields are >= kThreshold (or null/undefined), no suppression occurs
 *      and k_anonymity_suppressed is false.
 */
export function applyKAnonymity<T extends VulnerabilityCounts>(
  zone: T,
  role: UserRole | string,
  kThreshold = 10
): T & { k_anonymity_suppressed: boolean } {
  if (!zone || typeof zone !== 'object') {
    return Object.assign({}, zone, {
      k_anonymity_suppressed: false,
    }) as T & { k_anonymity_suppressed: boolean };
  }

  // Clone zone to avoid mutating the original object
  const result: any = { ...zone };

  const isPrivileged = PRIVILEGED_ROLES.has(role as UserRole);

  if (isPrivileged) {
    return {
      ...result,
      k_anonymity_suppressed: false,
    };
  }

  let wasSuppressed = false;

  // Gather count fields to check: standard count fields plus any dynamic keys ending with "_count"
  const keysToCheck = new Set<string>(STANDARD_COUNT_FIELDS);
  for (const key of Object.keys(result)) {
    if (key.endsWith('_count') && key !== 'total_population') {
      keysToCheck.add(key);
    }
  }

  for (const field of keysToCheck) {
    const val = result[field];
    if (val !== null && val !== undefined && typeof val === 'number') {
      if (val < kThreshold) {
        result[field] = null;
        wasSuppressed = true;
      }
    }
  }

  return {
    ...result,
    k_anonymity_suppressed: wasSuppressed,
  };
}
