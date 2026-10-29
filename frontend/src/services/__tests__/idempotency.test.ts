import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { OperationIdempotencyKey } from '../idempotency.ts';

describe('OperationIdempotencyKey', () => {
  let opKey: OperationIdempotencyKey;

  beforeEach(() => {
    opKey = new OperationIdempotencyKey();
  });

  // -----------------------------------------------------------------------
  // Key generation
  // -----------------------------------------------------------------------

  test('generates a non-empty string key', () => {
    const key = opKey.getOrCreate();
    assert.ok(key, 'Key must be truthy');
    assert.strictEqual(typeof key, 'string');
    assert.ok(key.length > 0);
  });

  // -----------------------------------------------------------------------
  // Key reuse during retries
  // -----------------------------------------------------------------------

  test('returns the same key on subsequent calls (retry reuse)', () => {
    const k1 = opKey.getOrCreate();
    const k2 = opKey.getOrCreate();
    const k3 = opKey.getOrCreate();
    assert.strictEqual(k1, k2, 'Same key must be returned for retries');
    assert.strictEqual(k2, k3);
  });

  // -----------------------------------------------------------------------
  // New key for new logical submissions
  // -----------------------------------------------------------------------

  test('generates a new key after clear() (successful submission)', () => {
    const k1 = opKey.getOrCreate();
    opKey.clear();
    const k2 = opKey.getOrCreate();
    assert.notStrictEqual(k1, k2, 'A new key must be generated after clear()');
  });

  test('generates a new key after reset() (explicit new-submission intent)', () => {
    const k1 = opKey.getOrCreate();
    opKey.reset();
    const k2 = opKey.getOrCreate();
    assert.notStrictEqual(k1, k2, 'A new key must be generated after reset()');
  });

  // -----------------------------------------------------------------------
  // Key is NOT replaced on failure (retry reuse)
  // -----------------------------------------------------------------------

  test('retains the key when clear() is NOT called (failure path)', () => {
    const k1 = opKey.getOrCreate();
    // Simulate failure: do NOT call clear()
    const k2 = opKey.getOrCreate();
    assert.strictEqual(k1, k2, 'Key must persist across retries after failure');
  });

  // -----------------------------------------------------------------------
  // current() introspection
  // -----------------------------------------------------------------------

  test('current() returns null before any key is generated', () => {
    assert.strictEqual(opKey.current(), null);
  });

  test('current() returns the active key', () => {
    const k = opKey.getOrCreate();
    assert.strictEqual(opKey.current(), k);
  });

  test('current() returns null after clear()', () => {
    opKey.getOrCreate();
    opKey.clear();
    assert.strictEqual(opKey.current(), null);
  });

  // -----------------------------------------------------------------------
  // Separate instances are independent
  // -----------------------------------------------------------------------

  test('two independent OperationIdempotencyKey instances generate distinct keys', () => {
    const a = new OperationIdempotencyKey();
    const b = new OperationIdempotencyKey();
    assert.notStrictEqual(a.getOrCreate(), b.getOrCreate(), 'Each instance must produce its own unique key');
  });

  // -----------------------------------------------------------------------
  // Duplicate-click prevention logic
  // -----------------------------------------------------------------------

  test('simulated double-click: second invocation reuses the same key', () => {
    // Click 1: caller begins, grabs key
    const k1 = opKey.getOrCreate();
    // Click 2 arrives before success clears the key
    const k2 = opKey.getOrCreate();
    assert.strictEqual(k1, k2, 'Double-click must not generate a second key');
  });

  // -----------------------------------------------------------------------
  // HTTP 409 handling: key is preserved, error propagated
  // -----------------------------------------------------------------------

  test('409 scenario: key is preserved after simulated conflict error', () => {
    const k1 = opKey.getOrCreate();
    // Simulate a 409 response — caller does NOT call clear() or reset()
    // (the key must remain so subsequent investigation can distinguish this
    //  from a brand-new submission)
    const k2 = opKey.getOrCreate();
    assert.strictEqual(k1, k2, 'Key must not be discarded when a 409 is received');
  });
});

describe('API Service Idempotency Integration', () => {
  const originalFetch = globalThis.fetch;

  test('runExperiment propagates Idempotency-Key header', async () => {
    let capturedHeaders: Record<string, string> = {};
    let capturedBody = '';

    globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      capturedBody = (init?.body as string) || '';
      return new Response(JSON.stringify({ success: true, experiment_id: 'exp-single-1', result: {}, experiments: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const { api } = await import('../api.ts');
      const res = await api.runExperiment({ pressure: 'LOW' }, 'test-single-key-123');
      assert.strictEqual(capturedHeaders['Idempotency-Key'], 'test-single-key-123');
      assert.strictEqual(JSON.parse(capturedBody).pressure, 'LOW');
      assert.strictEqual(res.experiment_id, 'exp-single-1');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('runPressureExperiments propagates Idempotency-Key header', async () => {
    let capturedHeaders: Record<string, string> = {};

    globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      return new Response(JSON.stringify({ success: true, count: 5, experiments: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const { api } = await import('../api.ts');
      const res = await api.runPressureExperiments({ pressure: 'HIGH', runs: 5 }, 'test-pressure-key-456');
      assert.strictEqual(capturedHeaders['Idempotency-Key'], 'test-pressure-key-456');
      assert.strictEqual(res.count, 5);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('runAllExperiments propagates Idempotency-Key header', async () => {
    let capturedHeaders: Record<string, string> = {};

    globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      return new Response(JSON.stringify({ success: true, count: 20, experiments: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const { api } = await import('../api.ts');
      const res = await api.runAllExperiments({ runs: 5 }, 'test-all-key-789');
      assert.strictEqual(capturedHeaders['Idempotency-Key'], 'test-all-key-789');
      assert.strictEqual(res.count, 20);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('runPressureExperiments handles HTTP 409 conflict with clear message', async () => {
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ detail: 'Idempotency conflict: partial execution' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const { api } = await import('../api.ts');
      await assert.rejects(
        () => api.runPressureExperiments({ pressure: 'HIGH', runs: 2 }, 'conflict-key'),
        (err: Error) => {
          assert.match(err.message, /Duplicate submission detected/);
          assert.match(err.message, /partial execution/);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('runAllExperiments handles HTTP 409 conflict with clear message', async () => {
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ detail: 'Idempotency-Key conflict: endpoint mismatch' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const { api } = await import('../api.ts');
      await assert.rejects(
        () => api.runAllExperiments({ runs: 2 }, 'conflict-key'),
        (err: Error) => {
          assert.match(err.message, /Duplicate submission detected/);
          assert.match(err.message, /endpoint mismatch/);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('API call surfaces backend detail on 400 Bad Request', async () => {
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ detail: 'Idempotency-Key header is required for this endpoint.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const { api } = await import('../api.ts');
      await assert.rejects(
        () => api.runExperiment({ pressure: 'LOW' }, ''),
        (err: Error) => {
          assert.match(err.message, /Idempotency-Key header is required/);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

