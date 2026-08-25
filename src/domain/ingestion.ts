import type {
  HazardType,
  RiskLevel,
  ConfidenceLevel,
  RiskAssessmentRecord,
  FundingCall,
  FundingCallSource,
} from './types';

export interface CommercialLicenseCheckResult {
  source_name: string;
  commercial_use_allowed: boolean;
  attribution_required: boolean;
  reason: string;
}

/**
 * Checks commercial license allowance and attribution requirements according to Section C.3:
 * - TMD: Restricted by Thai Copyright Act B.E. 2537 (requires explicit commercial permission, mandatory attribution).
 * - ThaiCI: Curated public grant calls under ONEP/GIZ (commercial grant application assistance permitted, attribution required).
 * - GISTDA Open Data: Open public API (commercial use permitted with attribution).
 */
export function checkCommercialLicenseAllowed(
  source: string | FundingCallSource
): CommercialLicenseCheckResult {
  const sourceName = typeof source === 'string' ? source : source.source_name;
  const normalized = (sourceName || '').toLowerCase().trim();

  if (typeof source === 'object' && 'commercial_use_allowed' in source) {
    return {
      source_name: source.source_name,
      commercial_use_allowed: Boolean(source.commercial_use_allowed),
      attribution_required: Boolean(source.attribution_required),
      reason:
        source.notes ||
        (source.commercial_use_allowed
          ? 'Commercial use permitted under source license.'
          : 'Commercial use restricted by source terms.'),
    };
  }

  if (normalized.includes('tmd')) {
    return {
      source_name: 'TMD TMDAPI',
      commercial_use_allowed: false,
      attribution_required: true,
      reason:
        'TMDAPI is subject to Thai Copyright Act B.E. 2537. Non-commercial use permitted with mandatory source attribution. Commercial exploitation prohibited without prior license.',
    };
  }

  if (normalized.includes('thaici') || normalized.includes('giz') || normalized.includes('กองทุนสิ่งแวดล้อม')) {
    return {
      source_name: 'ThaiCI (Thailand Climate Initiative)',
      commercial_use_allowed: true,
      attribution_required: true,
      reason:
        'ThaiCI public call data is curated for community grant accessibility. Mandatory attribution to ONEP and GIZ.',
    };
  }

  if (normalized.includes('gistda')) {
    return {
      source_name: 'GISTDA Open Data',
      commercial_use_allowed: true,
      attribution_required: true,
      reason:
        'GISTDA Open Data allows automated risk intelligence ingestion with attribution to GISTDA.',
    };
  }

  return {
    source_name: sourceName || 'Unknown Source',
    commercial_use_allowed: false,
    attribution_required: true,
    reason: 'Unverified third-party data source. Defaulting to strict non-commercial restriction.',
  };
}

/**
 * Normalizes risk level string or depth number into standardized RiskLevel.
 */
function normalizeRiskLevel(level: any, depthMeters?: number): RiskLevel {
  if (typeof depthMeters === 'number') {
    if (depthMeters >= 1.0) return 'severe';
    if (depthMeters >= 0.5) return 'high';
    if (depthMeters >= 0.2) return 'medium';
    return 'low';
  }

  if (typeof level === 'string') {
    const l = level.toLowerCase().trim();
    if (l === 'severe' || l === 'critical' || l === 'วิกฤต') return 'severe';
    if (l === 'high' || l === 'สูง') return 'high';
    if (l === 'medium' || l === 'moderate' || l === 'ปานกลาง') return 'medium';
    if (l === 'low' || l === 'ต่ำ') return 'low';
  }

  return 'medium';
}

/**
 * Normalizes confidence level.
 */
function normalizeConfidence(conf: any): ConfidenceLevel {
  if (typeof conf === 'string') {
    const c = conf.toLowerCase().trim();
    if (c === 'high' || c === 'สูง') return 'high';
    if (c === 'low' || c === 'ต่ำ') return 'low';
  }
  return 'medium';
}

/**
 * Parses raw GISTDA flood GeoJSON payload into normalized RiskAssessmentRecord objects.
 * Automatically tags records with source_type = 'api_automated'.
 */
export function parseGistdaFloodData(
  payload: any,
  options?: { fetchedAt?: string; defaultConfidence?: ConfidenceLevel }
): RiskAssessmentRecord[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const fetchedAt = options?.fetchedAt || new Date().toISOString();
  const defaultConfidence = options?.defaultConfidence || 'high';

  let features: any[] = [];

  if (payload.type === 'FeatureCollection' && Array.isArray(payload.features)) {
    features = payload.features;
  } else if (payload.type === 'Feature') {
    features = [payload];
  } else if (Array.isArray(payload.data)) {
    features = payload.data;
  } else if (Array.isArray(payload)) {
    features = payload;
  }

  const records: RiskAssessmentRecord[] = [];

  for (const feature of features) {
    if (!feature) continue;

    const geometry = feature.geometry || (feature.type === 'Polygon' ? feature : null);
    if (!geometry || !geometry.type || !geometry.coordinates) {
      continue;
    }

    const properties = feature.properties || {};
    const depth = properties.flood_depth_m ?? properties.depth_m ?? properties.depth;
    const rawRisk = properties.risk_level ?? properties.level ?? properties.status;
    const rawConfidence = properties.confidence ?? defaultConfidence;

    const risk_level = normalizeRiskLevel(rawRisk, typeof depth === 'number' ? depth : undefined);
    const confidence = normalizeConfidence(rawConfidence);

    records.push({
      hazard_type: 'flood',
      zone: geometry,
      risk_level,
      confidence,
      source_type: 'api_automated',
      source_name: 'GISTDA Open Data',
      fetched_at: fetchedAt,
      valid_until: properties.valid_until || properties.valid_to || null,
      raw_payload: feature,
    });
  }

  return records;
}

/**
 * Parses manual/curated TMD weather and climate hazard data.
 * Tags records with source_type = 'manual_curated' and source_name = 'TMD TMDAPI'.
 */
export function parseTmdRiskData(
  payload: any,
  options?: { verifiedBy?: string; fetchedAt?: string }
): RiskAssessmentRecord[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const fetchedAt = options?.fetchedAt || new Date().toISOString();
  const items = Array.isArray(payload) ? payload : (payload.records || [payload]);
  const records: RiskAssessmentRecord[] = [];

  for (const item of items) {
    if (!item) continue;

    const hazard: HazardType =
      item.hazard_type === 'heat' || item.hazard_type === 'pm25' || item.hazard_type === 'drought'
        ? item.hazard_type
        : (item.temperature_max && item.temperature_max > 38 ? 'heat' : 'heat');

    const geometry = item.zone || item.geometry || {
      type: 'Point',
      coordinates: [item.longitude || 100.5, item.latitude || 13.75],
    };

    const risk_level = normalizeRiskLevel(item.risk_level || (item.temperature_max > 40 ? 'severe' : 'high'));
    const confidence = normalizeConfidence(item.confidence || 'high');

    records.push({
      hazard_type: hazard,
      zone: geometry,
      risk_level,
      confidence,
      source_type: 'manual_curated',
      source_name: 'TMD TMDAPI',
      fetched_at: fetchedAt,
      verified_by: options?.verifiedBy || item.verified_by || null,
      raw_payload: item,
    });
  }

  return records;
}

/**
 * Parses a ThaiCI funding call payload into a strongly typed FundingCall record.
 */
export function parseThaiCiFundingCall(
  payload: any,
  options?: { enteredBy?: string }
): FundingCall {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid ThaiCI payload');
  }

  const thematicFit: string[] = Array.isArray(payload.thematic_fit)
    ? payload.thematic_fit
    : typeof payload.thematic_fit === 'string'
      ? payload.thematic_fit.split(',').map((s: string) => s.trim())
      : ['climate_adaptation', 'urban_resilience'];

  return {
    id: payload.id || `thaici_${Date.now()}`,
    source_id: payload.source_id,
    funder_name: payload.funder_name || 'ThaiCI (Thailand Climate Initiative) / ONEP & GIZ',
    thematic_fit: thematicFit,
    eligibility_notes: payload.eligibility_notes || 'Community organizations and local markets in pilot provinces',
    max_amount: Number(payload.max_amount) || 500000,
    co_financing_required: Boolean(payload.co_financing_required),
    application_deadline: payload.application_deadline || undefined,
    source_url: payload.source_url || 'https://www.thai-german-cooperation.info/project/thaici/',
    entered_by: options?.enteredBy || payload.entered_by,
    last_verified_at: payload.last_verified_at || new Date().toISOString(),
    created_at: payload.created_at || new Date().toISOString(),
  };
}
