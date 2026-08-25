import type { EvidenceType } from './types';

/**
 * Computes SHA-256 hash of a string, ArrayBuffer, or Uint8Array using the standard Web Crypto API.
 * Returns lowercase hex string. If options.prefix is true, prepends "sha256:".
 */
export async function computeSHA256(
  content: string | ArrayBuffer | Uint8Array,
  options?: { prefix?: boolean }
): Promise<string> {
  let data: Uint8Array;

  if (typeof content === 'string') {
    data = new TextEncoder().encode(content);
  } else if (content instanceof Uint8Array) {
    data = content;
  } else if (content instanceof ArrayBuffer) {
    data = new Uint8Array(content);
  } else {
    throw new TypeError('Content must be a string, ArrayBuffer, or Uint8Array');
  }

  // Web Crypto API only (browser-native); no Node-specific fallback.
  const buffer = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource);

  const hashArray = Array.from(new Uint8Array(buffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return options?.prefix ? `sha256:${hex}` : hex;
}

/**
 * Strips 'sha256:' prefix if present for normalized hash comparison.
 */
export function normalizeHash(hash: string): string {
  if (!hash) return '';
  return hash.startsWith('sha256:') ? hash.slice(7) : hash;
}

export interface EvidenceRecord {
  id?: string;
  local_id: string;
  project_id: string;
  task_id?: string;
  evidence_type: EvidenceType;
  file_url?: string;
  file_hash: string;
  content?: string | ArrayBuffer | Uint8Array;
  captured_at: string;
  captured_by?: string;
  geom?: any;
  weight_kg?: number;
  synced_from_offline: boolean;
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  server_received_at?: string;
  server_ack_id?: string;
  error_message?: string;
}

export interface ServerAckResponse {
  id: string;
  server_received_at: string;
  status: 'confirmed' | 'rejected' | 'conflict';
  error_message?: string;
  [key: string]: any;
}

export interface SyncItemResult {
  local_id: string;
  server_id?: string;
  status: 'confirmed' | 'failed' | 'conflict';
  server_received_at?: string;
  error?: string;
}

export interface SyncSummary {
  total: number;
  synced: number;
  failed: number;
  conflicts: number;
  results: SyncItemResult[];
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Offline evidence queue supporting robust offline-first capturing,
 * hash verification, and server ACK timestamp conflict resolution.
 */
export class OfflineEvidenceQueue {
  private storage: StorageAdapter;
  private readonly storageKey: string;

  constructor(options?: { storage?: StorageAdapter; storageKey?: string }) {
    this.storage = options?.storage || new MemoryStorageAdapter();
    this.storageKey = options?.storageKey || 'climate_os_evidence_queue_v1';
  }

  private async loadQueue(): Promise<EvidenceRecord[]> {
    const raw = await this.storage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private async saveQueue(queue: EvidenceRecord[]): Promise<void> {
    await this.storage.setItem(this.storageKey, JSON.stringify(queue));
  }

  /**
   * Enqueues a new evidence record locally.
   */
  async enqueue(
    record: Omit<EvidenceRecord, 'local_id' | 'synced_from_offline' | 'status'> & {
      local_id?: string;
    }
  ): Promise<EvidenceRecord> {
    const queue = await this.loadQueue();

    const localId =
      record.local_id ||
      `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const queuedItem: EvidenceRecord = {
      ...record,
      local_id: localId,
      synced_from_offline: true,
      status: 'pending',
    };

    queue.push(queuedItem);
    await this.saveQueue(queue);
    return queuedItem;
  }

  /**
   * Returns all records currently in the local queue.
   */
  async getQueue(): Promise<EvidenceRecord[]> {
    return this.loadQueue();
  }

  /**
   * Returns pending records waiting for sync.
   */
  async getPending(): Promise<EvidenceRecord[]> {
    const queue = await this.loadQueue();
    return queue.filter((item) => item.status === 'pending' || item.status === 'failed');
  }

  /**
   * Removes a specific item from queue by local_id.
   */
  async remove(localId: string): Promise<boolean> {
    const queue = await this.loadQueue();
    const filtered = queue.filter((item) => item.local_id !== localId);
    const removed = filtered.length !== queue.length;
    if (removed) {
      await this.saveQueue(filtered);
    }
    return removed;
  }

  /**
   * Clears the entire offline queue.
   */
  async clear(): Promise<void> {
    await this.saveQueue([]);
  }

  /**
   * Returns the count of items in the queue.
   */
  async size(): Promise<number> {
    const queue = await this.loadQueue();
    return queue.length;
  }

  /**
   * Synchronizes the queue with the remote server.
   *
   * Conflict Resolution Policy (Section D.3):
   * 1. Verifies payload hash before submitting if binary/text content is attached.
   * 2. Marks synced_from_offline = true on submission.
   * 3. Server ACK timestamp is the single source of truth.
   * 4. UI/Client confirms status ONLY after server ack is received.
   */
  async sync(
    serverSubmitFn: (evidence: EvidenceRecord) => Promise<ServerAckResponse>
  ): Promise<SyncSummary> {
    const queue = await this.loadQueue();
    const results: SyncItemResult[] = [];
    let synced = 0;
    let failed = 0;
    let conflicts = 0;

    const remainingQueue: EvidenceRecord[] = [];

    for (const item of queue) {
      if (item.status === 'synced') {
        continue;
      }

      // Hash integrity verification
      if (item.content) {
        try {
          const computed = await computeSHA256(item.content);
          const expected = normalizeHash(item.file_hash);
          if (normalizeHash(computed) !== expected) {
            item.status = 'failed';
            item.error_message = `Hash mismatch: expected ${expected}, got ${computed}`;
            failed++;
            results.push({
              local_id: item.local_id,
              status: 'failed',
              error: item.error_message,
            });
            remainingQueue.push(item);
            continue;
          }
        } catch (err: any) {
          item.status = 'failed';
          item.error_message = `Hash calculation failed: ${err.message}`;
          failed++;
          results.push({
            local_id: item.local_id,
            status: 'failed',
            error: item.error_message,
          });
          remainingQueue.push(item);
          continue;
        }
      }

      // Attempt server submission
      try {
        item.status = 'syncing';
        const payloadToSubmit: EvidenceRecord = {
          ...item,
          synced_from_offline: true,
        };

        const ack = await serverSubmitFn(payloadToSubmit);

        if (ack.status === 'confirmed') {
          item.status = 'synced';
          item.id = ack.id;
          item.server_ack_id = ack.id;
          item.server_received_at = ack.server_received_at;
          synced++;
          results.push({
            local_id: item.local_id,
            server_id: ack.id,
            status: 'confirmed',
            server_received_at: ack.server_received_at,
          });
          // On confirmed success, remove from offline pending queue
        } else if (ack.status === 'conflict') {
          item.status = 'conflict';
          item.server_received_at = ack.server_received_at;
          item.error_message = ack.error_message || 'Conflict detected by server';
          conflicts++;
          results.push({
            local_id: item.local_id,
            server_id: ack.id,
            status: 'conflict',
            server_received_at: ack.server_received_at,
            error: item.error_message,
          });
          remainingQueue.push(item);
        } else {
          item.status = 'failed';
          item.error_message = ack.error_message || 'Server rejected submission';
          failed++;
          results.push({
            local_id: item.local_id,
            status: 'failed',
            error: item.error_message,
          });
          remainingQueue.push(item);
        }
      } catch (err: any) {
        item.status = 'failed';
        item.error_message = err.message || 'Network error during sync';
        failed++;
        results.push({
          local_id: item.local_id,
          status: 'failed',
          error: item.error_message,
        });
        remainingQueue.push(item);
      }
    }

    await this.saveQueue(remainingQueue);

    return {
      total: queue.length,
      synced,
      failed,
      conflicts,
      results,
    };
  }
}
