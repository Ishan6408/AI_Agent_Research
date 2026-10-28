import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { apiCache } from '../cache.ts';

describe('ApiCacheManager', () => {
  beforeEach(() => {
    apiCache.clear();
  });

  test('stores and retrieves cache entries synchronously', () => {
    apiCache.set('test-key', { count: 42 });
    const entry = apiCache.get<{ count: number }>('test-key');
    assert.ok(entry);
    assert.strictEqual(entry.data.count, 42);
    assert.strictEqual(typeof entry.timestamp, 'number');
  });

  test('correctly evaluates freshness within staleTime', async () => {
    apiCache.set('fresh-key', { status: 'ok' });
    assert.strictEqual(apiCache.isFresh('fresh-key', 1000), true);

    // Stale time of -1ms should be immediately not fresh
    assert.strictEqual(apiCache.isFresh('fresh-key', -1), false);
  });

  test('deduplicates concurrent in-flight requests', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 50));
      return { result: 'data' };
    };

    const [p1, p2, p3] = await Promise.all([
      apiCache.fetchWithDeduplication('dedup-key', fetcher),
      apiCache.fetchWithDeduplication('dedup-key', fetcher),
      apiCache.fetchWithDeduplication('dedup-key', fetcher),
    ]);

    assert.strictEqual(callCount, 1, 'Fetcher should be invoked only once for concurrent requests');
    assert.deepStrictEqual(p1, { result: 'data' });
    assert.deepStrictEqual(p2, { result: 'data' });
    assert.deepStrictEqual(p3, { result: 'data' });
  });

  test('prevents older concurrent requests from overwriting newer results', async () => {
    const slowFetcher = async () => {
      await new Promise((r) => setTimeout(r, 60));
      return { version: 'slow-v1' };
    };
    const fastFetcher = async () => {
      await new Promise((r) => setTimeout(r, 10));
      return { version: 'fast-v2' };
    };

    const slowPromise = apiCache.fetchWithDeduplication('order-key', slowFetcher);
    // Small delay before starting second request
    await new Promise((r) => setTimeout(r, 5));
    const fastPromise = apiCache.fetchWithDeduplication('order-key', fastFetcher, 30000, true);

    await Promise.all([slowPromise, fastPromise]);
    const finalCache = apiCache.get<{ version: string }>('order-key');
    assert.ok(finalCache);
    assert.strictEqual(finalCache.data.version, 'fast-v2');
  });

  test('invalidates cache by string prefix or pattern', () => {
    apiCache.set('analytics/overview', { val: 1 });
    apiCache.set('analytics/scatter', { val: 2 });
    apiCache.set('experiments/list', { val: 3 });

    assert.strictEqual(apiCache.isFresh('analytics/overview', 60000), true);
    assert.strictEqual(apiCache.isFresh('analytics/scatter', 60000), true);
    assert.strictEqual(apiCache.isFresh('experiments/list', 60000), true);

    apiCache.invalidate('analytics');

    assert.strictEqual(apiCache.isFresh('analytics/overview', 60000), false);
    assert.strictEqual(apiCache.isFresh('analytics/scatter', 60000), false);
    assert.strictEqual(apiCache.isFresh('experiments/list', 60000), true);
  });

  test('subscriber receives notifications when cache updates or is invalidated', () => {
    const received: any[] = [];
    const unsubscribe = apiCache.subscribe('sub-key', (entry) => {
      received.push(entry ? entry.data : null);
    });

    apiCache.set('sub-key', { step: 1 });
    apiCache.set('sub-key', { step: 2 });
    apiCache.invalidate('sub-key');
    unsubscribe();
    apiCache.set('sub-key', { step: 3 });

    assert.strictEqual(received.length, 3);
    assert.deepStrictEqual(received[0], { step: 1 });
    assert.deepStrictEqual(received[1], { step: 2 });
    assert.deepStrictEqual(received[2], { step: 2 }); // Invalidated marks isStale on entry
  });
});
