import { describe, expect, test } from 'bun:test';
import {
  computeSHA256,
  OfflineEvidenceQueue,
  normalizeHash,
} from '../src/domain/evidence';

describe('Evidence & Offline Sync Domain Engine', () => {
  describe('computeSHA256', () => {
    test('computes correct standard SHA-256 hex digest for string input', async () => {
      // Known standard SHA-256 for "hello world"
      const hash = await computeSHA256('hello world');
      expect(hash).toBe(
        'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
      );
    });

    test('supports prefix option', async () => {
      const hash = await computeSHA256('hello world', { prefix: true });
      expect(hash).toBe(
        'sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
      );
    });

    test('supports Uint8Array and ArrayBuffer inputs', async () => {
      const encoder = new TextEncoder();
      const uint8 = encoder.encode('market-waste-ticket-001');
      const hash1 = await computeSHA256(uint8);
      const hash2 = await computeSHA256(uint8.buffer);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    test('normalizeHash strips sha256: prefix correctly', () => {
      expect(normalizeHash('sha256:abcd1234')).toBe('abcd1234');
      expect(normalizeHash('abcd1234')).toBe('abcd1234');
      expect(normalizeHash('')).toBe('');
    });
  });

  describe('OfflineEvidenceQueue', () => {
    test('enqueues records locally with pending status and synced_from_offline=true', async () => {
      const queue = new OfflineEvidenceQueue();
      await queue.clear();

      const item = await queue.enqueue({
        project_id: 'proj_pilot_01',
        evidence_type: 'weigh_ticket',
        file_hash: 'abc123hash',
        captured_at: '2026-09-24T07:00:00Z',
        weight_kg: 42.5,
      });

      expect(item.local_id).toBeDefined();
      expect(item.synced_from_offline).toBe(true);
      expect(item.status).toBe('pending');
      expect(await queue.size()).toBe(1);
    });

    test('syncs successfully with server ACK timestamp winning', async () => {
      const queue = new OfflineEvidenceQueue();
      await queue.clear();

      const testContent = 'photo_binary_content_bytes';
      const validHash = await computeSHA256(testContent);

      await queue.enqueue({
        project_id: 'proj_pilot_01',
        evidence_type: 'photo',
        file_hash: validHash,
        content: testContent,
        captured_at: '2026-09-24T07:15:00Z',
      });

      const serverAckTimestamp = '2026-09-24T07:18:22Z';
      const mockServerSubmit = async (payload: any) => {
        expect(payload.synced_from_offline).toBe(true);
        expect(payload.file_hash).toBe(validHash);
        return {
          id: 'server_uuid_999',
          server_received_at: serverAckTimestamp,
          status: 'confirmed' as const,
        };
      };

      const syncResult = await queue.sync(mockServerSubmit);

      expect(syncResult.synced).toBe(1);
      expect(syncResult.failed).toBe(0);
      expect(syncResult.conflicts).toBe(0);
      expect(syncResult.results[0].status).toBe('confirmed');
      expect(syncResult.results[0].server_id).toBe('server_uuid_999');
      expect(syncResult.results[0].server_received_at).toBe(serverAckTimestamp);

      // Successfully synced items are flushed from offline queue
      expect(await queue.size()).toBe(0);
    });

    test('detects file hash tampering/mismatch before upload and marks item as failed', async () => {
      const queue = new OfflineEvidenceQueue();
      await queue.clear();

      await queue.enqueue({
        project_id: 'proj_pilot_01',
        evidence_type: 'weigh_ticket',
        file_hash: 'expected_different_sha256_hash',
        content: 'actual_content_that_does_not_match',
        captured_at: '2026-09-24T08:00:00Z',
      });

      let serverCalled = false;
      const mockServer = async () => {
        serverCalled = true;
        return {
          id: 's1',
          server_received_at: new Date().toISOString(),
          status: 'confirmed' as const,
        };
      };

      const syncResult = await queue.sync(mockServer);

      expect(serverCalled).toBe(false); // Server was never called due to local hash check
      expect(syncResult.failed).toBe(1);
      expect(syncResult.synced).toBe(0);
      expect(syncResult.results[0].status).toBe('failed');
      expect(syncResult.results[0].error).toContain('Hash mismatch');
    });

    test('handles server-side conflict resolution according to Section D.3', async () => {
      const queue = new OfflineEvidenceQueue();
      await queue.clear();

      await queue.enqueue({
        project_id: 'proj_pilot_01',
        evidence_type: 'weigh_ticket',
        file_hash: 'somehash',
        captured_at: '2026-09-24T08:00:00Z',
      });

      const conflictAck = {
        id: 'existing_server_record_id',
        server_received_at: '2026-09-24T07:55:00Z',
        status: 'conflict' as const,
        error_message: 'Duplicate capture detected, server entry retained',
      };

      const syncResult = await queue.sync(async () => conflictAck);

      expect(syncResult.conflicts).toBe(1);
      expect(syncResult.results[0].status).toBe('conflict');
      expect(syncResult.results[0].server_id).toBe('existing_server_record_id');
    });

    test('handles network exceptions gracefully during sync', async () => {
      const queue = new OfflineEvidenceQueue();
      await queue.clear();

      await queue.enqueue({
        project_id: 'proj_pilot_01',
        evidence_type: 'photo',
        file_hash: 'hash1',
        captured_at: '2026-09-24T09:00:00Z',
      });

      const failingServer = async () => {
        throw new Error('Connection refused (offline)');
      };

      const syncResult = await queue.sync(failingServer);

      expect(syncResult.failed).toBe(1);
      expect(syncResult.synced).toBe(0);
      expect(syncResult.results[0].error).toContain('Connection refused');
    });
  });
});
