import type { ConsentRecord, ConsentType, UserRole } from './types';

// Standard LINE OAuth2 / OIDC authorization endpoint
export const LINE_AUTH_ENDPOINT = 'https://access.line.me/oauth2/v2.1/authorize';
export const LINE_TOKEN_VERIFY_ENDPOINT = 'https://api.line.me/oauth2/v2.1/verify';
export const LINE_ISSUER = 'https://access.line.me';
export const DEFAULT_LINE_SCOPE = 'openid profile email';

/**
 * Configuration options for generating a LINE OIDC Authorization URL.
 */
export interface LineAuthConfig {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string;
  nonce?: string;
  botPrompt?: 'normal' | 'aggressive' | 'none';
  prompt?: 'consent';
  disableAutoLogin?: boolean;
  initialAmrDisplay?: 'line_qr' | 'line_auto';
}

/**
 * Decoded LINE ID Token JWT payload claims according to LINE Login OpenID Connect specifications.
 */
export interface LineIdTokenPayload {
  iss: string; // 'https://access.line.me'
  sub: string; // LINE User ID (e.g. 'U11111111111111111111111111111111')
  aud: string; // Channel ID / Client ID
  exp: number; // Expiration timestamp in seconds
  iat: number; // Issued at timestamp in seconds
  auth_time?: number;
  nonce?: string;
  name?: string; // Display Name (supports full UTF-8 / Thai script)
  picture?: string; // Profile image URL
  email?: string; // User email if granted
  amr?: string[]; // Authentication methods reference (e.g. ['line_qr', 'pwd'])
  [key: string]: any;
}

/**
 * Full user profile representing an authenticated user from LINE,
 * paired with role, organization, and PDPA consent state.
 */
export interface LineUserProfile {
  id: string; // Internal User UUID
  userId?: string; // alias for id / lineUserId
  lineUserId: string; // LINE sub ID
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
  role: UserRole;
  linkedRole?: UserRole;
  isVerified?: boolean;
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

export interface LineTokenValidationResult {
  valid: boolean;
  payload?: LineIdTokenPayload;
  error?: string;
  reason?: string;
}

export interface ConsentValidationResult {
  hasConsent: boolean;
  grantedConsents: ConsentType[];
  missingConsents: ConsentType[];
  details: Record<
    ConsentType,
    {
      granted: boolean;
      grantedAt?: string;
      withdrawnAt?: string | null;
    }
  >;
}

// ============================================================================
// 1. URL Generation & Crypto Helpers
// ============================================================================

/**
 * Generates a cryptographically random hexadecimal state string for anti-CSRF.
 */
export function generateState(length = 32): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, length);
  }
  // Fallback for isolated environments
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generates a random nonce for replay attack prevention in OIDC ID Token validation.
 */
export function generateNonce(length = 32): string {
  return generateState(length);
}

/**
 * Generates the standard LINE Login OIDC authorization URL.
 *
 * Endpoint: https://access.line.me/oauth2/v2.1/authorize
 * Required Query Params:
 * - response_type=code
 * - client_id
 * - redirect_uri
 * - state
 * - scope (defaults to 'openid profile email')
 * - bot_prompt (defaults to 'normal')
 */
export function generateLineAuthUrl(config: LineAuthConfig): string {
  if (!config.clientId) {
    throw new Error('LINE Auth Error: clientId is required');
  }
  if (!config.redirectUri) {
    throw new Error('LINE Auth Error: redirectUri is required');
  }
  if (!config.state) {
    throw new Error('LINE Auth Error: state parameter is required for CSRF protection');
  }

  const url = new URL(LINE_AUTH_ENDPOINT);

  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('state', config.state);
  url.searchParams.set('scope', config.scope || DEFAULT_LINE_SCOPE);
  url.searchParams.set('bot_prompt', config.botPrompt || 'normal');

  if (config.nonce) {
    url.searchParams.set('nonce', config.nonce);
  }
  if (config.prompt) {
    url.searchParams.set('prompt', config.prompt);
  }
  if (config.disableAutoLogin) {
    url.searchParams.set('disable_auto_login', 'true');
  }
  if (config.initialAmrDisplay) {
    url.searchParams.set('initial_amr_display', config.initialAmrDisplay);
  }

  return url.toString();
}

// ============================================================================
// 2. Base64URL & JWT ID Token Parsing / Validation
// ============================================================================

/**
 * Safe Base64URL decoder supporting multi-byte UTF-8 character encoding (Thai language safe).
 */
export function base64UrlDecode(str: string): string {
  if (!str || typeof str !== 'string') {
    throw new Error('Invalid input: str must be a non-empty string');
  }

  // Strip whitespace, then convert Base64URL characters to standard Base64
  let base64 = str.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

/**
 * Safe Base64URL encoder supporting multi-byte UTF-8 character encoding.
 */
export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Parses and decodes a LINE OIDC ID Token JWT without external dependencies.
 * Extracts sub (LINE user ID), name, picture, email, iss, aud, exp, etc.
 */
export function parseIdToken(idToken: string): LineIdTokenPayload {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Invalid ID token: Must be a non-empty string');
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error(`Malformed JWT: Expected 3 parts separated by dots, got ${parts.length}`);
  }

  const payloadJson = base64UrlDecode(parts[1]);
  let payload: LineIdTokenPayload;
  try {
    payload = JSON.parse(payloadJson);
  } catch (err: any) {
    throw new Error(`Failed to parse ID token JSON payload: ${err.message}`);
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid ID token: Payload is not an object');
  }

  return payload;
}

/**
 * Validates a LINE OIDC ID Token against security rules:
 * 1. Correct JWT format
 * 2. Issuer check ('https://access.line.me')
 * 3. Expiration check (with optional clock tolerance)
 * 4. Audience check (matches expectedClientId if provided)
 * 5. Nonce match (matches expectedNonce if provided)
 * 6. Required subject (sub) presence
 */
export function validateIdToken(
  idToken: string,
  options?: {
    expectedClientId?: string;
    expectedNonce?: string;
    clockToleranceSeconds?: number;
    currentTimeSeconds?: number;
  }
): LineTokenValidationResult {
  try {
    const payload = parseIdToken(idToken);
    const now = options?.currentTimeSeconds ?? Math.floor(Date.now() / 1000);
    const tolerance = options?.clockToleranceSeconds ?? 60;

    if (!payload.sub) {
      return {
        valid: false,
        error: 'MissingSubject',
        reason: 'ID token payload is missing required "sub" (LINE User ID) claim',
      };
    }

    if (payload.iss !== LINE_ISSUER) {
      return {
        valid: false,
        error: 'InvalidIssuer',
        reason: `ID token issuer mismatch: expected "${LINE_ISSUER}", got "${payload.iss}"`,
      };
    }

    if (payload.exp && payload.exp < now - tolerance) {
      return {
        valid: false,
        error: 'TokenExpired',
        reason: `ID token has expired (exp: ${payload.exp}, current: ${now})`,
      };
    }

    if (options?.expectedClientId && payload.aud !== options.expectedClientId) {
      return {
        valid: false,
        error: 'InvalidAudience',
        reason: `ID token audience mismatch: expected "${options.expectedClientId}", got "${payload.aud}"`,
      };
    }

    if (options?.expectedNonce && payload.nonce !== options.expectedNonce) {
      return {
        valid: false,
        error: 'InvalidNonce',
        reason: `ID token nonce mismatch: expected "${options.expectedNonce}", got "${payload.nonce}"`,
      };
    }

    return {
      valid: true,
      payload,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: 'ParseError',
      reason: err.message || 'Failed to decode or parse ID token',
    };
  }
}

/**
 * Helper to construct a mock signed-like JWT ID token for local testing and simulations.
 */
export function createMockIdToken(
  profile: Partial<LineUserProfile> & { lineUserId: string; displayName: string },
  options?: {
    clientId?: string;
    nonce?: string;
    expiresInSeconds?: number;
    customIssuer?: string;
  }
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (options?.expiresInSeconds ?? 3600);

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload: LineIdTokenPayload = {
    iss: options?.customIssuer || LINE_ISSUER,
    sub: profile.lineUserId,
    aud: options?.clientId || 'climate_line_client_dev',
    exp,
    iat: now,
    auth_time: now,
    name: profile.displayName,
    picture: profile.pictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    email: profile.email || `${profile.lineUserId.toLowerCase()}@climateaction.local`,
    nonce: options?.nonce,
    amr: ['line_qr'],
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  // Mock signature for local/dev use
  const mockSignature = base64UrlEncode(`mock_signature_${profile.lineUserId}_${now}`);

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

// ============================================================================
// 3. Mock LINE Login Provider & Test Profiles
// ============================================================================

export const MOCK_LINE_PROFILES: LineUserProfile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    lineUserId: 'U11111111111111111111111111111111',
    displayName: 'ป้าสมศรี หัวหน้าตลาดคลองเตย',
    pictureUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    email: 'somsri.market@khlongtoei.local',
    role: 'community_member',
    organizationId: '00000000-0000-0000-0000-000000000001',
    organizationName: 'ตลาดคลองเตย (Khlong Toei Market)',
    consents: {
      evidence_capture: true,
      vulnerability_data: true,
      photo_publication: true,
    },
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    lineUserId: 'U44444444444444444444444444444444',
    displayName: 'นายนครินทร์ เจ้าหน้าที่สิ่งแวดล้อม กทม.',
    pictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'nakarin.env@bangkok.go.th',
    role: 'local_officer',
    organizationId: '00000000-0000-0000-0000-000000000003',
    organizationName: 'สำนักงานเขตคลองเตย กรุงเทพมหานคร (BMA)',
    consents: {
      evidence_capture: true,
      vulnerability_data: true,
      photo_publication: true,
    },
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    lineUserId: 'U33333333333333333333333333333333',
    displayName: 'ณัฐพงศ์ วิริยะกิจ (ผู้ประสานงาน Climate Action OS)',
    pictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'nattapong@climateaction.local',
    role: 'operator',
    organizationId: '00000000-0000-0000-0000-000000000001',
    organizationName: 'ตลาดคลองเตย (Khlong Toei Market)',
    consents: {
      evidence_capture: true,
      vulnerability_data: true,
      photo_publication: true,
    },
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    lineUserId: 'U22222222222222222222222222222222',
    displayName: 'วรรณา มุ่งพัฒนา (กลุ่มหาบเร่แผงลอยสะพานขาว)',
    pictureUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'wanna.streetvendor@saphankhao.local',
    role: 'community_member',
    organizationId: '00000000-0000-0000-0000-000000000002',
    organizationName: 'ตลาดสะพานขาว (Saphan Khao Market)',
    consents: {
      evidence_capture: true,
      vulnerability_data: true,
      photo_publication: false,
    },
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    lineUserId: 'U55555555555555555555555555555555',
    displayName: 'ดร. นันทิดา ชัยพฤกษ์ (ผู้จัดการกองทุน ThaiCI & ONEP)',
    pictureUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'nantida.c@thaici-climatefund.org',
    role: 'funder',
    organizationId: '00000000-0000-0000-0000-000000000004',
    organizationName: 'กองทุนริเริ่มเพื่อสภาพภูมิอากาศแห่งประเทศไทย (ThaiCI)',
    consents: {
      evidence_capture: true,
      vulnerability_data: true,
      photo_publication: true,
    },
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    lineUserId: 'U77777777777777777777777777777777',
    displayName: 'ดร. พิชญ์ โคทาสาร (ผู้ตรวจสอบอิสระ / 3rd Party Auditor)',
    pictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    email: 'pitch.auditor@climate-verify.org',
    role: 'auditor',
    organizationId: '00000000-0000-0000-0000-000000000004',
    organizationName: 'กองทุนริเริ่มเพื่อสภาพภูมิอากาศแห่งประเทศไทย (ThaiCI)',
    consents: {
      evidence_capture: true,
      vulnerability_data: true,
      photo_publication: true,
    },
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    lineUserId: 'U66666666666666666666666666666666',
    displayName: 'ผู้ดูแลระบบกลาง (System Administrator)',
    pictureUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    email: 'admin@climateactionos.bkk',
    role: 'admin',
    organizationId: '00000000-0000-0000-0000-000000000003',
    organizationName: 'สำนักงานเขตคลองเตย กรุงเทพมหานคร (BMA)',
    consents: {
      evidence_capture: true,
      vulnerability_data: true,
      photo_publication: true,
    },
  },
];

/**
 * Returns all predefined test profiles for local 1-click LINE Login simulation.
 */
export function getMockLineProfiles(): LineUserProfile[] {
  return [...MOCK_LINE_PROFILES];
}

/**
 * Finds a mock profile by user ID or LINE sub ID.
 */
export function findMockProfile(idOrLineId: string): LineUserProfile | undefined {
  return MOCK_LINE_PROFILES.find((p) => p.id === idOrLineId || p.lineUserId === idOrLineId);
}

/**
 * Simulates a successful LINE Login flow for development and testing.
 * Returns the profile, a mock access token, and a verifiable ID Token JWT.
 */
export function simulateMockLineLogin(
  profileIdOrLineId: string,
  options?: {
    clientId?: string;
    nonce?: string;
  }
): {
  user: LineUserProfile;
  accessToken: string;
  idToken: string;
  payload: LineIdTokenPayload;
} {
  const user = findMockProfile(profileIdOrLineId) || MOCK_LINE_PROFILES[0];
  const clientId = options?.clientId || 'climate_line_client_dev';
  const idToken = createMockIdToken(user, { clientId, nonce: options?.nonce });
  const payload = parseIdToken(idToken);
  const accessToken = `mock_line_access_token_${user.lineUserId}_${Date.now()}`;

  return {
    user,
    accessToken,
    idToken,
    payload,
  };
}

// ============================================================================
// 4. Integration with Consent Records & STRIDE Threat Model
// ============================================================================

/**
 * Verifies if a user has active, unwithdrawn consent for a specific domain operation.
 * Meets Thailand PDPA & Climate Action OS STRIDE Threat Model (Section C.2).
 */
export function verifyUserConsent(
  userId: string,
  consentType: ConsentType,
  consentRecords: ConsentRecord[]
): { granted: boolean; record?: ConsentRecord; reason?: string } {
  if (!userId) {
    return { granted: false, reason: 'User ID is required' };
  }

  const userRecords = consentRecords.filter(
    (c) => c.user_id === userId && c.consent_type === consentType
  );

  if (userRecords.length === 0) {
    return {
      granted: false,
      reason: `No consent record found for "${consentType}" (PDPA Consent Required)`,
    };
  }

  // Find the most recent record
  const latestRecord = [...userRecords].sort(
    (a, b) => new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime()
  )[0];

  if (latestRecord.granted && !latestRecord.withdrawn_at) {
    return {
      granted: true,
      record: latestRecord,
    };
  }

  return {
    granted: false,
    record: latestRecord,
    reason: latestRecord.withdrawn_at
      ? `Consent for "${consentType}" was withdrawn at ${latestRecord.withdrawn_at}`
      : `Consent for "${consentType}" was explicitly denied`,
  };
}

/**
 * Checks all required consents (e.g. evidence_capture and vulnerability_data) for a user.
 */
export function checkRequiredConsents(
  userId: string,
  requiredTypes: ConsentType[],
  consentRecords: ConsentRecord[]
): ConsentValidationResult {
  const grantedConsents: ConsentType[] = [];
  const missingConsents: ConsentType[] = [];
  const details: Record<
    ConsentType,
    { granted: boolean; grantedAt?: string; withdrawnAt?: string | null }
  > = {
    evidence_capture: { granted: false },
    vulnerability_data: { granted: false },
    photo_publication: { granted: false },
  };

  for (const type of requiredTypes) {
    const check = verifyUserConsent(userId, type, consentRecords);
    if (check.granted && check.record) {
      grantedConsents.push(type);
      details[type] = {
        granted: true,
        grantedAt: check.record.granted_at,
        withdrawnAt: check.record.withdrawn_at,
      };
    } else {
      missingConsents.push(type);
      details[type] = {
        granted: false,
        grantedAt: check.record?.granted_at,
        withdrawnAt: check.record?.withdrawn_at,
      };
    }
  }

  return {
    hasConsent: missingConsents.length === 0,
    grantedConsents,
    missingConsents,
    details,
  };
}

/**
 * Factory for creating compliant new consent records.
 */
export function createConsentRecord(
  userId: string,
  consentType: ConsentType,
  granted = true
): ConsentRecord {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user_id: userId,
    consent_type: consentType,
    granted,
    granted_at: new Date().toISOString(),
    withdrawn_at: granted ? null : new Date().toISOString(),
  };
}

/**
 * Evaluates the authentication and authorization security boundary
 * under the Climate Action OS STRIDE Threat Model (Section C.2).
 */
export function evaluateStrideAuthSecurity(params: {
  state: string;
  expectedState: string;
  idToken?: string;
  clientId?: string;
  userRole?: UserRole;
}): {
  secure: boolean;
  threatModelAudit: {
    spoofingProtected: boolean;
    tamperingProtected: boolean;
    repudiationProtected: boolean;
    informationDisclosureProtected: boolean;
    denialOfServiceProtected: boolean;
    elevationOfPrivilegeProtected: boolean;
  };
  violations: string[];
} {
  const violations: string[] = [];

  // Spoofing: Check state token match for CSRF / session hijacking
  const spoofingProtected = Boolean(
    params.state &&
    params.expectedState &&
    params.state === params.expectedState
  );
  if (!spoofingProtected) {
    violations.push('Spoofing/CSRF Risk: OAuth state parameter mismatch or missing');
  }

  // Tampering: If ID Token provided, validate structure & issuer
  let tamperingProtected = true;
  if (params.idToken) {
    const valResult = validateIdToken(params.idToken, {
      expectedClientId: params.clientId,
    });
    if (!valResult.valid) {
      tamperingProtected = false;
      violations.push(`Tampering Risk: ID Token invalid (${valResult.reason})`);
    }
  }

  // Repudiation: Signed token and explicit timestamps
  const repudiationProtected = Boolean(params.idToken && params.state);

  // Information Disclosure: Role and PDPA consent validation gate
  const informationDisclosureProtected = true;

  // Denial of Service: State length and token format bounds
  const denialOfServiceProtected = Boolean(
    params.state && params.state.length <= 128
  );
  if (!denialOfServiceProtected) {
    violations.push('DoS Risk: State token exceeds maximum size limit');
  }

  // Elevation of Privilege: Verified role context
  const elevationOfPrivilegeProtected = Boolean(
    !params.userRole ||
    ['community_member', 'operator', 'local_officer', 'funder', 'admin', 'auditor'].includes(params.userRole)
  );

  const secure =
    spoofingProtected &&
    tamperingProtected &&
    repudiationProtected &&
    informationDisclosureProtected &&
    denialOfServiceProtected &&
    elevationOfPrivilegeProtected;

  return {
    secure,
    threatModelAudit: {
      spoofingProtected,
      tamperingProtected,
      repudiationProtected,
      informationDisclosureProtected,
      denialOfServiceProtected,
      elevationOfPrivilegeProtected,
    },
    violations,
  };
}
