import { useState, useEffect, useRef, useCallback } from 'react';
import { apiCache } from '../services/cache';

export interface UseApiDataOptions<T> {
  staleTime?: number;
  cacheTime?: number;
  revalidateOnMount?: boolean;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

export interface UseApiDataResult<T> {
  data: T | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  revalidateError: Error | null;
  isStale: boolean;
  lastUpdated: number | null;
  refetch: () => Promise<T | null>;
  mutate: (newData?: T | Promise<T>, shouldRevalidate?: boolean) => Promise<void>;
}

export function useApiData<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseApiDataOptions<T> = {}
): UseApiDataResult<T> {
  const {
    staleTime = apiCache.defaultStaleTime,
    cacheTime = apiCache.defaultCacheTime,
    revalidateOnMount = true,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  // Initial synchronous cache probe
  const initialCache = key ? apiCache.get<T>(key, cacheTime) : undefined;

  const [data, setData] = useState<T | null>(initialCache ? initialCache.data : null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCache && enabled && key !== null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [revalidateError, setRevalidateError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(initialCache ? initialCache.lastUpdated : null);

  const isMountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const currentKeyRef = useRef(key);

  useEffect(() => {
    fetcherRef.current = fetcher;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    currentKeyRef.current = key;
  });

  const executeFetch = useCallback(
    async (isBackground: boolean): Promise<T | null> => {
      if (!key || !enabled) return null;

      if (isBackground) {
        setIsValidating(true);
        setRevalidateError(null);
      } else {
        setIsLoading(true);
        setIsValidating(true);
        setError(null);
      }

      try {
        const freshData = await apiCache.fetchWithDeduplication(key, () => fetcherRef.current(), staleTime);

        if (!isMountedRef.current || currentKeyRef.current !== key) {
          return null;
        }

        setData(freshData);
        setError(null);
        setRevalidateError(null);
        setLastUpdated(Date.now());
        onSuccessRef.current?.(freshData);
        return freshData;
      } catch (err: unknown) {
        const fetchError = err instanceof Error ? err : new Error(String(err));

        if (!isMountedRef.current || currentKeyRef.current !== key) {
          return null;
        }

        if (isBackground) {
          // Non-blocking: maintain current data, only set revalidate error
          setRevalidateError(fetchError);
        } else {
          // Blocking: no cached data was available
          setError(fetchError);
        }
        onErrorRef.current?.(fetchError);
        return null;
      } finally {
        if (isMountedRef.current && currentKeyRef.current === key) {
          setIsLoading(false);
          setIsValidating(false);
        }
      }
    },
    [key, enabled, staleTime]
  );

  const refetch = useCallback(() => {
    const hasExistingData = data !== null || (key ? !!apiCache.get<T>(key, cacheTime) : false);
    return executeFetch(hasExistingData);
  }, [executeFetch, data, key, cacheTime]);

  const mutate = useCallback(
    async (newData?: T | Promise<T>, shouldRevalidate: boolean = true) => {
      if (!key) return;

      if (newData !== undefined) {
        const resolvedData = await Promise.resolve(newData);
        apiCache.set(key, resolvedData);
        if (isMountedRef.current && currentKeyRef.current === key) {
          setData(resolvedData);
          setLastUpdated(Date.now());
        }
      }

      if (shouldRevalidate) {
        await executeFetch(true);
      }
    },
    [key, executeFetch]
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (!key || !enabled) {
      return;
    }

    // Check cache status on mount / key change
    const cached = apiCache.get<T>(key, cacheTime);
    const isFresh = apiCache.isFresh(key, staleTime);

    if (cached) {
      setData(cached.data);
      setLastUpdated(cached.lastUpdated);
      setIsLoading(false);

      if (!isFresh || revalidateOnMount) {
        executeFetch(true);
      }
    } else {
      executeFetch(false);
    }

    // Subscribe to external cache events (e.g. invalidations or sibling updates)
    const unsubscribe = apiCache.subscribe<T>(key, (entry) => {
      if (!isMountedRef.current || currentKeyRef.current !== key) return;

      if (entry) {
        setData(entry.data);
        setLastUpdated(entry.lastUpdated);
        if (entry.isStale) {
          // Marked stale via invalidation, re-fetch in background
          executeFetch(true);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [key, enabled, cacheTime, staleTime, revalidateOnMount, executeFetch]);

  const isStale = key ? !apiCache.isFresh(key, staleTime) : false;

  return {
    data,
    isLoading,
    isValidating,
    error,
    revalidateError,
    isStale,
    lastUpdated,
    refetch,
    mutate,
  };
}
