import { useCallback, useEffect, useState } from 'react';

/**
 * Tiny data-fetching hook built on the API client.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => fetchCrops());
 */
export function useApi<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, loading, error, refetch: run };
}