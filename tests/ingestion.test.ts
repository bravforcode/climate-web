import { describe, expect, test } from 'bun:test';
import {
  parseGistdaFloodData,
  parseTmdRiskData,
  parseThaiCiFundingCall,
  checkCommercialLicenseAllowed,
} from '../src/domain/ingestion';

describe('Data Ingestion & Copyright Verification Domain Engine', () => {
  describe('GISTDA Flood Ingestion (Automated Lane)', () => {
    test('parses GISTDA GeoJSON FeatureCollection and tags with source_type=api_automated', () => {
      const geojsonPayload = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [100.5, 13.7],
                  [100.6, 13.7],
                  [100.6, 13.8],
                  [100.5, 13.8],
                  [100.5, 13.7],
                ],
              ],
            },
            properties: {
              flood_depth_m: 0.85,
              risk_level: 'high',
              confidence: 'high',
              valid_until: '2026-09-25T00:00:00Z',
            },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [100.7, 13.6],
                  [100.8, 13.6],
                  [100.8, 13.7],
                  [100.7, 13.7],
                  [100.7, 13.6],
                ],
              ],
            },
            properties: {
              flood_depth_m: 1.4,
              risk_level: 'severe',
              confidence: 'high',
            },
          },
        ],
      };

      const records = parseGistdaFloodData(geojsonPayload);

      expect(records).toHaveLength(2);

      expect(records[0].hazard_type).toBe('flood');
      expect(records[0].source_type).toBe('api_automated');
      expect(records[0].source_name).toBe('GISTDA Open Data');
      expect(records[0].risk_level).toBe('high');
      expect(records[0].confidence).toBe('high');
      expect(records[0].valid_until).toBe('2026-09-25T00:00:00Z');

      expect(records[1].risk_level).toBe('severe');
      expect(records[1].source_type).toBe('api_automated');
    });

    test('handles empty or malformed GeoJSON without crashing', () => {
      expect(parseGistdaFloodData(null)).toEqual([]);
      expect(parseGistdaFloodData({})).toEqual([]);
      expect(parseGistdaFloodData({ type: 'FeatureCollection', features: [] })).toEqual([]);
    });
  });

  describe('Commercial License & Copyright Verification', () => {
    test('enforces Copyright Act B.E. 2537 non-commercial restriction for TMD', () => {
      const check = checkCommercialLicenseAllowed('TMD');

      expect(check.commercial_use_allowed).toBe(false);
      expect(check.attribution_required).toBe(true);
      expect(check.reason).toContain('2537');
    });

    test('permits commercial grant facilitation for ThaiCI with mandatory attribution', () => {
      const check = checkCommercialLicenseAllowed('ThaiCI');

      expect(check.commercial_use_allowed).toBe(true);
      expect(check.attribution_required).toBe(true);
      expect(check.source_name).toContain('ThaiCI');
    });

    test('permits open data use for GISTDA with attribution', () => {
      const check = checkCommercialLicenseAllowed('GISTDA Open Data');

      expect(check.commercial_use_allowed).toBe(true);
      expect(check.attribution_required).toBe(true);
    });
  });

  describe('TMD Ingestion (Curated/Manual Lane)', () => {
    test('tags TMD records with source_type=manual_curated', () => {
      const tmdPayload = [
        {
          hazard_type: 'heat',
          temperature_max: 41.5,
          risk_level: 'severe',
          confidence: 'high',
          latitude: 13.7563,
          longitude: 100.5018,
        },
      ];

      const records = parseTmdRiskData(tmdPayload, { verifiedBy: 'user_operator_01' });

      expect(records).toHaveLength(1);
      expect(records[0].hazard_type).toBe('heat');
      expect(records[0].source_type).toBe('manual_curated');
      expect(records[0].source_name).toBe('TMD TMDAPI');
      expect(records[0].risk_level).toBe('severe');
      expect(records[0].verified_by).toBe('user_operator_01');
    });
  });

  describe('ThaiCI Funding Call Ingestion', () => {
    test('parses ThaiCI call details properly', () => {
      const thaiciPayload = {
        id: 'thaici_round_2026_adaptation',
        funder_name: 'ThaiCI / Environmental Fund',
        thematic_fit: ['heat_adaptation', 'urban_cooling', 'food_waste'],
        max_amount: 300000,
        co_financing_required: true,
        application_deadline: '2026-11-30',
      };

      const parsed = parseThaiCiFundingCall(thaiciPayload, { enteredBy: 'officer_somchai' });

      expect(parsed.id).toBe('thaici_round_2026_adaptation');
      expect(parsed.max_amount).toBe(300000);
      expect(parsed.co_financing_required).toBe(true);
      expect(parsed.thematic_fit).toContain('heat_adaptation');
      expect(parsed.entered_by).toBe('officer_somchai');
    });
  });
});
