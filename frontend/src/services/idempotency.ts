/**
 * Idempotency key management for VEIL experiment execution.
 *
 * Rules
 * -----
 * - A **new** logical submission generates a fresh UUID-based key.
 * - A **retry** of the same submission reuses the original key.
 * - A successful submission clears the stored key so the next click generates a new one.
 *
 * Usage
 * -----
 *   const { getOrCreateKey, clearKey, resetKey } = useIdempotencyKey('single-run');
 *
 *   // On submit:
 *   const key = getOrCreateKey();     // returns existing key (retry) or creates one
 *   await api.runExperiment(req, key);
 *   clearKey();                       // success → next click is a new submission
 *
 *   // On explicit "new experiment" intent (user changed form params):
 *   resetKey();
 */

function generateKey(): string {
  // UUID v4 via crypto.randomUUID, with a fallback for older environments
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Math.random fallback for non-crypto environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Per-operation idempotency key manager (plain class, not a React hook).
 * Each operation (single, pressure, all) should have its own instance.
 */
export class OperationIdempotencyKey {
  private _key: string | null = null;

  /**
   * Return the existing key (for retries) or generate a fresh one.
   */
  getOrCreate(): string {
    if (!this._key) {
      this._key = generateKey();
    }
    return this._key;
  }

  /**
   * Clear the key after a **successful** submission so the next
   * call to getOrCreate() starts a brand-new logical operation.
   */
  clear(): void {
    this._key = null;
  }

  /**
   * Explicitly reset to force a new key on the next submission
   * (e.g., when the user changes form parameters).
   */
  reset(): void {
    this._key = null;
  }

  /**
   * Peek at the current key without creating one. Useful for tests.
   */
  current(): string | null {
    return this._key;
  }
}
