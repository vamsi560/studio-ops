'use client';

import { useState, useEffect } from 'react';
import type { Resource } from '@/lib/types';

interface UseResourcesResult {
  data: Resource[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useResources(): UseResourcesResult {
  const [data, setData] = useState<Resource[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchResources,
  };
}

