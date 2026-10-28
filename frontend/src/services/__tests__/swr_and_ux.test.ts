import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { apiCache } from '../cache.ts';

describe('SWR Caching & Revalidation Logic', () => {
  beforeEach(() => {
    apiCache.clear();
  });

  test('serves stale cached data immediately on subsequent requests', async () => {
    // 1. Initial request populates cache
    apiCache.set('kpi-overview', { total: 100, deception_gap: 12.5 });

    // 2. Synchronous probe returns cached data instantly without waiting
    const cached = apiCache.get<{ total: number; deception_gap: number }>('kpi-overview');
    assert.ok(cached, 'Cache should exist');
    assert.strictEqual(cached.data.total, 100);
    assert.strictEqual(cached.data.deception_gap, 12.5);

    // 3. Mark stale
    apiCache.invalidate('kpi-overview');
    assert.strictEqual(apiCache.isFresh('kpi-overview'), false, 'Should be marked stale');

    // 4. Stale data is STILL retrievable while revalidating
    const stillAvailable = apiCache.get<{ total: number }>('kpi-overview');
    assert.ok(stillAvailable, 'Stale data must remain retrievable');
    assert.strictEqual(stillAvailable.data.total, 100);
  });

  test('retains valid cached data when background refresh fails', async () => {
    // Seed initial cache
    apiCache.set('analytics/pressure', [{ pressure: 'HIGH', deception_gap: 45.2 }]);

    const failingFetcher = async () => {
      throw new Error('503 Service Unavailable: Backend node offline');
    };

    // Attempting background revalidation with failing fetcher
    let errorCaught = false;
    try {
      await apiCache.fetchWithDeduplication('analytics/pressure', failingFetcher, 30000, true);
    } catch (err: any) {
      errorCaught = true;
      assert.strictEqual(err.message, '503 Service Unavailable: Backend node offline');
    }

    assert.strictEqual(errorCaught, true, 'Error should be thrown to caller');

    // The previously cached valid data must NOT be erased or overwritten!
    const preserved = apiCache.get<any[]>('analytics/pressure');
    assert.ok(preserved, 'Cached data must survive failed background revalidation');
    assert.strictEqual(preserved.data.length, 1);
    assert.strictEqual(preserved.data[0].pressure, 'HIGH');
    assert.strictEqual(preserved.data[0].deception_gap, 45.2);
  });

  test('deduplicates multiple simultaneous requests across components', async () => {
    let networkCalls = 0;
    const slowApiCall = async () => {
      networkCalls++;
      await new Promise((r) => setTimeout(r, 40));
      return { status: 'LIVE', active_nodes: 8 };
    };

    // Simulate 5 components mounting simultaneously asking for the same data
    const requests = [
      apiCache.fetchWithDeduplication('system/status', slowApiCall),
      apiCache.fetchWithDeduplication('system/status', slowApiCall),
      apiCache.fetchWithDeduplication('system/status', slowApiCall),
      apiCache.fetchWithDeduplication('system/status', slowApiCall),
      apiCache.fetchWithDeduplication('system/status', slowApiCall),
    ];

    const results = await Promise.all(requests);
    assert.strictEqual(networkCalls, 1, 'Only one actual network call should occur');
    results.forEach((res) => {
      assert.deepStrictEqual(res, { status: 'LIVE', active_nodes: 8 });
    });
  });

  test('mutation invalidates multiple affected cache scopes', () => {
    apiCache.set('experiments/list', [{ id: 'exp-1' }]);
    apiCache.set('analytics/overview', { count: 1 });
    apiCache.set('dataset/records', [{ row: 1 }]);
    apiCache.set('system/model', { model: 'llama' });

    assert.strictEqual(apiCache.isFresh('experiments/list'), true);
    assert.strictEqual(apiCache.isFresh('analytics/overview'), true);
    assert.strictEqual(apiCache.isFresh('dataset/records'), true);
    assert.strictEqual(apiCache.isFresh('system/model'), true);

    // After running an experiment, invalidate affected data
    apiCache.invalidate(['experiments', 'analytics', 'dataset']);

    assert.strictEqual(apiCache.isFresh('experiments/list'), false);
    assert.strictEqual(apiCache.isFresh('analytics/overview'), false);
    assert.strictEqual(apiCache.isFresh('dataset/records'), false);
    // Unrelated system/model cache remains fresh!
    assert.strictEqual(apiCache.isFresh('system/model'), true);
  });

  test('rapid navigation: outdated responses do not overwrite newer responses', async () => {
    // User rapidly navigates to page A, then quickly switches parameters/view
    let resolveFirst!: (val: any) => void;
    const slowPending = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    const promise1 = apiCache.fetchWithDeduplication('nav/page', () => slowPending);
    // User switches to fresh request (force fresh)
    const promise2 = apiCache.fetchWithDeduplication(
      'nav/page',
      async () => ({ view: 'page-v2' }),
      30000,
      true
    );

    const res2 = await promise2;
    assert.deepStrictEqual(res2, { view: 'page-v2' });

    // Now slow first request finally finishes in the background
    resolveFirst({ view: 'page-v1' });
    await promise1;

    // Cache MUST still have page-v2, NOT page-v1
    const finalCache = apiCache.get<{ view: string }>('nav/page');
    assert.ok(finalCache);
    assert.strictEqual(finalCache.data.view, 'page-v2', 'Newer request must never be overwritten by older request');
  });

  test('preserves exact underlying numeric values and precision', () => {
    const rawPrecisionValues = {
      avg_deception_gap: 12.3456789,
      stress_index: 0.88776655,
      honesty_score: 95.1234,
      total_experiments: 1042,
    };

    apiCache.set('precision-test', rawPrecisionValues);
    const entry = apiCache.get<typeof rawPrecisionValues>('precision-test');
    assert.ok(entry);
    // Exact floating point values and integers must not be truncated in cache
    assert.strictEqual(entry.data.avg_deception_gap, 12.3456789);
    assert.strictEqual(entry.data.stress_index, 0.88776655);
    assert.strictEqual(entry.data.honesty_score, 95.1234);
    assert.strictEqual(entry.data.total_experiments, 1042);
  });
});
