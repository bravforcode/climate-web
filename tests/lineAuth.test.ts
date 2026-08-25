import { describe, expect, test } from 'bun:test';
import {
  generateLineAuthUrl,
  generateState,
  generateNonce,
  base64UrlEncode,
  base64UrlDecode,
  parseIdToken,
  validateIdToken,
  createMockIdToken,
  getMockLineProfiles,
  findMockProfile,
  simulateMockLineLogin,
  verifyUserConsent,
  checkRequiredConsents,
  createConsentRecord,
  evaluateStrideAuthSecurity,
  LINE_AUTH_ENDPOINT,
  LINE_ISSUER,
  DEFAULT_LINE_SCOPE,
} from '../src/domain/lineAuth';
import type { ConsentRecord } from '../src/domain/types';

describe('LINE Login & Auth Integration Domain Engine', () => {
  
  // ==========================================================================
  // 1. LINE OIDC Authorization URL Generator
  // ==========================================================================
  describe('generateLineAuthUrl', () => {
    const validConfig = {
      clientId: '1650000001',
      redirectUri: 'https://climate.bkk.go.th/auth/line/callback',
      state: 'csrf_anti_tamper_state_12345',
    };

    test('generates valid URL matching standard LINE OIDC endpoint', () => {
      const urlString = generateLineAuthUrl(validConfig);
      const url = new URL(urlString);

      expect(urlString.startsWith(LINE_AUTH_ENDPOINT)).toBe(true);
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('client_id')).toBe('1650000001');
      expect(url.searchParams.get('redirect_uri')).toBe(
        'https://climate.bkk.go.th/auth/line/callback'
      );
      expect(url.searchParams.get('state')).toBe('csrf_anti_tamper_state_12345');
      expect(url.searchParams.get('scope')).toBe(DEFAULT_LINE_SCOPE);
      expect(url.searchParams.get('bot_prompt')).toBe('normal');
    });

    test('supports custom scopes and bot_prompt options', () => {
      const urlString = generateLineAuthUrl({
        ...validConfig,
        scope: 'openid profile',
        botPrompt: 'aggressive',
      });
      const url = new URL(urlString);

      expect(url.searchParams.get('scope')).toBe('openid profile');
      expect(url.searchParams.get('bot_prompt')).toBe('aggressive');
    });

    test('supports optional nonce, prompt, and disableAutoLogin parameters', () => {
      const urlString = generateLineAuthUrl({
        ...validConfig,
        nonce: 'nonce_replay_guard_67890',
        prompt: 'consent',
        disableAutoLogin: true,
        initialAmrDisplay: 'line_qr',
      });
      const url = new URL(urlString);

      expect(url.searchParams.get('nonce')).toBe('nonce_replay_guard_67890');
      expect(url.searchParams.get('prompt')).toBe('consent');
      expect(url.searchParams.get('disable_auto_login')).toBe('true');
      expect(url.searchParams.get('initial_amr_display')).toBe('line_qr');
    });

    test('throws descriptive error if required parameters are missing', () => {
      expect(() =>
        generateLineAuthUrl({
          clientId: '',
          redirectUri: 'https://example.com',
          state: 'state123',
        })
      ).toThrow('clientId is required');

      expect(() =>
        generateLineAuthUrl({
          clientId: '123',
          redirectUri: '',
          state: 'state123',
        })
      ).toThrow('redirectUri is required');

      expect(() =>
        generateLineAuthUrl({
          clientId: '123',
          redirectUri: 'https://example.com',
          state: '',
        })
      ).toThrow('state parameter is required');
    });
  });

  // ==========================================================================
  // 2. Cryptographic State & Nonce Helpers
  // ==========================================================================
  describe('generateState & generateNonce', () => {
    test('generates random hex strings of requested length', () => {
      const state32 = generateState(32);
      const state16 = generateState(16);
      const nonce = generateNonce(24);

      expect(state32).toHaveLength(32);
      expect(state16).toHaveLength(16);
      expect(nonce).toHaveLength(24);
      expect(state32).not.toBe(generateState(32));
    });
  });

  // ==========================================================================
  // 3. UTF-8 Base64URL Encoding and Decoding
  // ==========================================================================
  describe('base64UrlEncode & base64UrlDecode', () => {
    test('correctly encodes and decodes ASCII strings', () => {
      const original = 'Hello World from Climate Action OS 2026';
      const encoded = base64UrlEncode(original);
      const decoded = base64UrlDecode(encoded);

      expect(decoded).toBe(original);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    test('correctly preserves Thai UTF-8 characters without corruption', () => {
      const original = 'ป้าสมศรี หัวหน้าตลาดคลองเตย นายนครินทร์ เจ้าหน้าที่สิ่งแวดล้อม กทม.';
      const encoded = base64UrlEncode(original);
      const decoded = base64UrlDecode(encoded);

      expect(decoded).toBe(original);
    });

    test('handles URL-safe characters (- and _) correctly during decoding', () => {
      // JSON: {"test": "value"} in base64url
      const raw = JSON.stringify({ message: 'ทดสอบระบบ', count: 42 });
      const encoded = base64UrlEncode(raw);
      expect(JSON.parse(base64UrlDecode(encoded))).toEqual({
        message: 'ทดสอบระบบ',
        count: 42,
      });
    });

    test('throws error on empty or invalid input to base64UrlDecode', () => {
      expect(() => base64UrlDecode('')).toThrow();
      expect(() => base64UrlDecode(null as any)).toThrow();
    });
  });

  // ==========================================================================
  // 4. LINE ID Token Parsing & Validation
  // ==========================================================================
  describe('parseIdToken & validateIdToken', () => {
    const sampleProfile = {
      lineUserId: 'U11111111111111111111111111111111',
      displayName: 'ป้าสมศรี หัวหน้าตลาดคลองเตย',
      email: 'somsri@market.local',
    };

    test('parses a valid JWT ID Token and extracts claims with Thai display name', () => {
      const idToken = createMockIdToken(sampleProfile, {
        clientId: 'climate_client_001',
        nonce: 'test_nonce_123',
      });

      const payload = parseIdToken(idToken);

      expect(payload.iss).toBe(LINE_ISSUER);
      expect(payload.sub).toBe('U11111111111111111111111111111111');
      expect(payload.aud).toBe('climate_client_001');
      expect(payload.name).toBe('ป้าสมศรี หัวหน้าตลาดคลองเตย');
      expect(payload.email).toBe('somsri@market.local');
      expect(payload.nonce).toBe('test_nonce_123');
      expect(typeof payload.exp).toBe('number');
      expect(typeof payload.iat).toBe('number');
    });

    test('validates a valid ID token successfully', () => {
      const idToken = createMockIdToken(sampleProfile, {
        clientId: 'climate_client_001',
        nonce: 'nonce_abc_123',
      });

      const result = validateIdToken(idToken, {
        expectedClientId: 'climate_client_001',
        expectedNonce: 'nonce_abc_123',
      });

      expect(result.valid).toBe(true);
      expect(result.payload?.sub).toBe(sampleProfile.lineUserId);
      expect(result.payload?.name).toBe(sampleProfile.displayName);
    });

    test('rejects token with malformed structure (not 3 segments)', () => {
      const result = validateIdToken('header.payload');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ParseError');
    });

    test('rejects token with invalid issuer', () => {
      const idToken = createMockIdToken(sampleProfile, {
        customIssuer: 'https://fake-login.attacker.org',
      });

      const result = validateIdToken(idToken);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('InvalidIssuer');
    });

    test('rejects token when expired', () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredToken = createMockIdToken(sampleProfile, {
        expiresInSeconds: -100, // Expired 100 seconds ago
      });

      const result = validateIdToken(expiredToken, {
        currentTimeSeconds: now,
        clockToleranceSeconds: 10,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBe('TokenExpired');
    });

    test('rejects token when client ID (audience) does not match', () => {
      const idToken = createMockIdToken(sampleProfile, {
        clientId: 'channel_id_aaa',
      });

      const result = validateIdToken(idToken, {
        expectedClientId: 'channel_id_bbb',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBe('InvalidAudience');
    });

    test('rejects token when nonce does not match', () => {
      const idToken = createMockIdToken(sampleProfile, {
        nonce: 'nonce_sent_originally',
      });

      const result = validateIdToken(idToken, {
        expectedNonce: 'different_nonce',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBe('InvalidNonce');
    });
  });

  // ==========================================================================
  // 5. Mock Profiles & Development Simulation Flow
  // ==========================================================================
  describe('Mock LINE Profiles & Simulation Flow', () => {
    test('contains required 1-click test profiles: ป้าสมศรี and นายนครินทร์', () => {
      const profiles = getMockLineProfiles();
      expect(profiles.length).toBeGreaterThanOrEqual(2);

      const somsri = profiles.find((p) => p.displayName.includes('ป้าสมศรี'));
      expect(somsri).toBeDefined();
      expect(somsri?.role).toBe('community_member');
      expect(somsri?.organizationName).toContain('ตลาดคลองเตย');
      expect(somsri?.consents.evidence_capture).toBe(true);
      expect(somsri?.consents.vulnerability_data).toBe(true);

      const nakarin = profiles.find((p) => p.displayName.includes('นายนครินทร์'));
      expect(nakarin).toBeDefined();
      expect(nakarin?.role).toBe('local_officer');
      expect(nakarin?.organizationName).toContain('กรุงเทพมหานคร');
    });

    test('finds mock profile by ID or LINE User ID', () => {
      const somsri = findMockProfile('11111111-1111-1111-1111-111111111111');
      expect(somsri?.displayName).toContain('ป้าสมศรี');

      const byLineId = findMockProfile('U44444444444444444444444444444444');
      expect(byLineId?.displayName).toContain('นายนครินทร์');
    });

    test('simulates 1-click mock login with valid accessToken and verifiable ID Token', () => {
      const result = simulateMockLineLogin('U11111111111111111111111111111111', {
        clientId: 'climate_dev_client',
        nonce: 'sim_nonce_123',
      });

      expect(result.user.displayName).toContain('ป้าสมศรี');
      expect(result.accessToken.startsWith('mock_line_access_token_')).toBe(true);
      expect(result.payload.sub).toBe('U11111111111111111111111111111111');

      // Verify generated ID token
      const valResult = validateIdToken(result.idToken, {
        expectedClientId: 'climate_dev_client',
        expectedNonce: 'sim_nonce_123',
      });
      expect(valResult.valid).toBe(true);
    });
  });

  // ==========================================================================
  // 6. Thailand PDPA Consent Records Integration
  // ==========================================================================
  describe('PDPA Consent Records Integration', () => {
    const mockConsentRecords: ConsentRecord[] = [
      {
        id: 'c1',
        user_id: 'user_somsri_01',
        consent_type: 'evidence_capture',
        granted: true,
        granted_at: '2026-08-20T10:00:00Z',
        withdrawn_at: null,
      },
      {
        id: 'c2',
        user_id: 'user_somsri_01',
        consent_type: 'vulnerability_data',
        granted: true,
        granted_at: '2026-08-20T10:00:00Z',
        withdrawn_at: null,
      },
      {
        id: 'c3',
        user_id: 'user_wanna_02',
        consent_type: 'evidence_capture',
        granted: true,
        granted_at: '2026-08-20T10:00:00Z',
        withdrawn_at: null,
      },
      {
        id: 'c4',
        user_id: 'user_wanna_02',
        consent_type: 'vulnerability_data',
        granted: false,
        granted_at: '2026-08-20T10:00:00Z',
        withdrawn_at: '2026-08-21T10:00:00Z',
      },
    ];

    test('verifies active granted consent successfully', () => {
      const check = verifyUserConsent(
        'user_somsri_01',
        'evidence_capture',
        mockConsentRecords
      );
      expect(check.granted).toBe(true);
      expect(check.record?.id).toBe('c1');
    });

    test('fails verification when consent is withdrawn or missing', () => {
      const withdrawnCheck = verifyUserConsent(
        'user_wanna_02',
        'vulnerability_data',
        mockConsentRecords
      );
      expect(withdrawnCheck.granted).toBe(false);
      expect(withdrawnCheck.reason).toContain('withdrawn');

      const missingCheck = verifyUserConsent(
        'user_somsri_01',
        'photo_publication',
        mockConsentRecords
      );
      expect(missingCheck.granted).toBe(false);
      expect(missingCheck.reason).toContain('PDPA Consent Required');
    });

    test('checkRequiredConsents validates multiple required consents', () => {
      const somsriCheck = checkRequiredConsents(
        'user_somsri_01',
        ['evidence_capture', 'vulnerability_data'],
        mockConsentRecords
      );
      expect(somsriCheck.hasConsent).toBe(true);
      expect(somsriCheck.grantedConsents).toHaveLength(2);
      expect(somsriCheck.missingConsents).toHaveLength(0);

      const wannaCheck = checkRequiredConsents(
        'user_wanna_02',
        ['evidence_capture', 'vulnerability_data'],
        mockConsentRecords
      );
      expect(wannaCheck.hasConsent).toBe(false);
      expect(wannaCheck.missingConsents).toContain('vulnerability_data');
    });

    test('createConsentRecord generates compliant new consent object', () => {
      const record = createConsentRecord('user_new_01', 'evidence_capture', true);

      expect(record.id).toBeDefined();
      expect(record.user_id).toBe('user_new_01');
      expect(record.consent_type).toBe('evidence_capture');
      expect(record.granted).toBe(true);
      expect(record.granted_at).toBeDefined();
      expect(record.withdrawn_at).toBeNull();
    });
  });

  // ==========================================================================
  // 7. STRIDE Threat Model (Section C.2) Evaluation
  // ==========================================================================
  describe('STRIDE Threat Model Evaluation', () => {
    test('passes all STRIDE checks for valid state, token, and role context', () => {
      const state = 'valid_csrf_token_12345';
      const sampleProfile = getMockLineProfiles()[0];
      const idToken = createMockIdToken(sampleProfile, {
        clientId: 'climate_client_001',
      });

      const audit = evaluateStrideAuthSecurity({
        state,
        expectedState: state,
        idToken,
        clientId: 'climate_client_001',
        userRole: 'community_member',
      });

      expect(audit.secure).toBe(true);
      expect(audit.threatModelAudit.spoofingProtected).toBe(true);
      expect(audit.threatModelAudit.tamperingProtected).toBe(true);
      expect(audit.threatModelAudit.repudiationProtected).toBe(true);
      expect(audit.threatModelAudit.informationDisclosureProtected).toBe(true);
      expect(audit.threatModelAudit.denialOfServiceProtected).toBe(true);
      expect(audit.threatModelAudit.elevationOfPrivilegeProtected).toBe(true);
      expect(audit.violations).toHaveLength(0);
    });

    test('flags CSRF/Spoofing violations when state token does not match', () => {
      const audit = evaluateStrideAuthSecurity({
        state: 'attacker_provided_state',
        expectedState: 'server_generated_state',
      });

      expect(audit.secure).toBe(false);
      expect(audit.threatModelAudit.spoofingProtected).toBe(false);
      expect(audit.violations.some((v) => v.includes('CSRF'))).toBe(true);
    });
  });
});
