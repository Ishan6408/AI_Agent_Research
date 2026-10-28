/**
 * VEIL Cache Management Engine
 * Stale-While-Revalidate caching with request deduplication,
 * monotonic sequence protection, and pattern-based invalidation.
 */

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  lastUpdated: number;
  isStale?: boolean;
}

export type CacheSubscriber<T = unknown> = (entry: CacheEntry<T> | null) => void;

class ApiCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlightRequests = new Map<string, Promise<any>>();
  private latestSequence = new Map<string, number>();
  private globalSequence = 0;
  private subscribers = new Map<string, Set<CacheSubscriber<any>>>();

  /**
   * Default stale time in milliseconds (30 seconds)
   */
  public defaultStaleTime = 30_000;

  /**
   * Default cache retention in milliseconds (5 minutes)
   */
  public defaultCacheTime = 300_000;

  /**
   * Synchronously retrieve a cache entry if available and not expired.
   */
  get<T>(key: string, maxAge: number = this.defaultCacheTime): CacheEntry<T> | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const age = Date.now() - entry.timestamp;
    if (age > maxAge) {
      this.cache.delete(key);
      this.notify(key, null);
      return undefined;
    }

    return entry as CacheEntry<T>;
  }

  /**
   * Check whether the cache entry exists and is fresh within staleTime.
   */
  isFresh(key: string, staleTime: number = this.defaultStaleTime): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.isStale) return false;
    return Date.now() - entry.timestamp < staleTime;
  }

  /**
   * Store data in cache and notify subscribers.
   */
  set<T>(key: string, data: T): CacheEntry<T> {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      lastUpdated: now,
      isStale: false,
    };
    this.cache.set(key, entry);
    this.notify(key, entry);
    return entry;
  }

  /**
   * Deduplicate concurrent in-flight requests and avoid race conditions
   * using monotonic sequence counters.
   */
  async fetchWithDeduplication<T>(
    key: string,
    fetcher: () => Promise<T>,
    _staleTime: number = this.defaultStaleTime,
    force: boolean = false
  ): Promise<T> {
    // If request already in flight for this exact key and not forced, reuse it
    if (!force) {
      const existing = this.inFlightRequests.get(key);
      if (existing) {
        return existing as Promise<T>;
      }
    }

    // Monotonically increasing sequence to prevent out-of-order writes
    const seq = ++this.globalSequence;
    this.latestSequence.set(key, seq);

    const promise = (async () => {
      try {
        const result = await fetcher();

        // Check if a newer request was dispatched while this was resolving
        if (this.latestSequence.get(key) === seq) {
          this.set(key, result);
        }

        return result;
      } finally {
        // Only clean up inFlightRequests if this request is still the active one
        if (this.latestSequence.get(key) === seq) {
          this.inFlightRequests.delete(key);
        }
      }
    })();

    this.inFlightRequests.set(key, promise);
    return promise;
  }

  /**
   * Invalidate cache entries matching string prefix, array of prefixes, or RegExp.
   */
  invalidate(patterns?: string | string[] | RegExp): void {
    if (!patterns) {
      // Invalidate all
      for (const [key, entry] of this.cache.entries()) {
        entry.isStale = true;
        this.notify(key, entry);
      }
      return;
    }

    const matches = (key: string): boolean => {
      if (typeof patterns === 'string') {
        return key.startsWith(patterns) || key.includes(patterns);
      }
      if (Array.isArray(patterns)) {
        return patterns.some(p => key.startsWith(p) || key.includes(p));
      }
      if (patterns instanceof RegExp) {
        return patterns.test(key);
      }
      return false;
    };

    for (const [key, entry] of this.cache.entries()) {
      if (matches(key)) {
        entry.isStale = true;
        this.notify(key, entry);
      }
    }
  }

  /**
   * Hard clear cache entries.
   */
  clear(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
    // Do not reset latestSequence so in-flight requests cannot overwrite post-clear state
    for (const [key] of this.subscribers) {
      this.notify(key, null);
    }
  }

  /**
   * Subscribe to cache updates for a given key.
   */
  subscribe<T>(key: string, subscriber: CacheSubscriber<T>): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    const set = this.subscribers.get(key)!;
    set.add(subscriber as CacheSubscriber<any>);

    return () => {
      set.delete(subscriber as CacheSubscriber<any>);
      if (set.size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  private notify(key: string, entry: CacheEntry<any> | null): void {
    const set = this.subscribers.get(key);
    if (set) {
      for (const sub of set) {
        try {
          sub(entry);
        } catch (e) {
          console.error(`Error in cache subscriber for ${key}:`, e);
        }
      }
    }
  }
}

export const apiCache = new ApiCacheManager();
