import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Experiment } from '../types/api';

export function useExperiments() {
  const [data, setData] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const result = await api.getExperiments();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  return { data, loading, error };
}
