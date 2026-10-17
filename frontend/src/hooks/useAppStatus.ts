'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { AppStatus } from '../lib/types';

interface UseStatusOptions {
  pollingIntervalMs?: number | null; // null disables polling
  autoFetch?: boolean;
}

export function useAppStatus(options: UseStatusOptions = {}) {
  const { pollingIntervalMs = null, autoFetch = true } = options;

  const [status, setStatus] = useState<AppStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAppStatus();
      if (isMountedRef.current) {
        setStatus(data);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch application status');
        // When backend is totally unreachable, set status to null
        setStatus(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (autoFetch) {
      fetchStatus();
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (pollingIntervalMs && pollingIntervalMs > 0) {
      intervalId = setInterval(() => {
        fetchStatus();
      }, pollingIntervalMs);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchStatus, pollingIntervalMs, autoFetch]);

  return {
    status,
    loading,
    error,
    lastUpdated,
    refresh: fetchStatus,
  };
}
