'use client';

import { getApp } from 'firebase/app';
import {
  fetchAndActivate,
  fetchConfig,
  getRemoteConfig,
  getValue,
  type RemoteConfig,
} from 'firebase/remote-config';
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib/logger';

interface RemoteConfigHookReturn {
  getStringValue: (key: string, defaultValue?: string) => string;
  getBooleanValue: (key: string, defaultValue?: boolean) => boolean;
  getNumberValue: (key: string, defaultValue?: number) => number;
  getJsonValue: <T = unknown>(key: string, defaultValue?: T) => T;
  refreshConfig: () => Promise<boolean>;
  lastFetchTime: Date | null;
  isLoading: boolean;
  error: Error | null;
}

// Default values for remote config parameters
const DEFAULT_FETCH_TIMEOUT_MILLISECONDS = 43200000; // 12 hours in milliseconds
const DEFAULT_MINIMIUM_FETCH_INTERVAL_MILLISECONDS = 3600000; // 1 hour in milliseconds

export function useRemoteConfig(): RemoteConfigHookReturn {
  const [remoteConfig, setRemoteConfig] = useState<RemoteConfig | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize Remote Config
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const app = getApp();
      const remoteConfigInstance = getRemoteConfig(app);

      // Set fetch parameters
      remoteConfigInstance.settings.minimumFetchIntervalMillis =
        DEFAULT_MINIMIUM_FETCH_INTERVAL_MILLISECONDS;
      remoteConfigInstance.settings.fetchTimeoutMillis =
        DEFAULT_FETCH_TIMEOUT_MILLISECONDS;

      setRemoteConfig(remoteConfigInstance);

      // Fetch and activate remote config values
      fetchAndActivate(remoteConfigInstance)
        .then(_activated => {
          setLastFetchTime(new Date());
          setIsLoading(false);
          logger.info('Remote config activated successfully');
        })
        .catch(err => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
          logger.error('Error activating remote config:', err);
        });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsLoading(false);
      logger.error('Error initializing remote config:', error);
    }
  }, []);

  // Refresh config values from the server
  const refreshConfig = useCallback(async (): Promise<boolean> => {
    if (!remoteConfig) return false;

    setIsLoading(true);

    try {
      await fetchConfig(remoteConfig);
      const activated = await fetchAndActivate(remoteConfig);
      setLastFetchTime(new Date());
      setIsLoading(false);
      return activated;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsLoading(false);
      logger.error('Error refreshing remote config:', error);
      return false;
    }
  }, [remoteConfig]);

  // Get string value from remote config
  const getStringValue = useCallback(
    (key: string, defaultValue = ''): string => {
      if (!remoteConfig) return defaultValue;

      try {
        return getValue(remoteConfig, key).asString();
      } catch (err: unknown) {
        console.error(`Error getting string value for key ${key}:`, err);
        return defaultValue;
      }
    },
    [remoteConfig]
  );

  // Get boolean value from remote config
  const getBooleanValue = useCallback(
    (key: string, defaultValue = false): boolean => {
      if (!remoteConfig) return defaultValue;

      try {
        return getValue(remoteConfig, key).asBoolean();
      } catch (err: unknown) {
        console.error(`Error getting boolean value for key ${key}:`, err);
        return defaultValue;
      }
    },
    [remoteConfig]
  );

  // Get number value from remote config
  const getNumberValue = useCallback(
    (key: string, defaultValue = 0): number => {
      if (!remoteConfig) return defaultValue;

      try {
        return Number(getValue(remoteConfig, key).asString()) || defaultValue;
      } catch (err: unknown) {
        console.error(`Error getting number value for key ${key}:`, err);
        return defaultValue;
      }
    },
    [remoteConfig]
  ); // Get JSON value from remote config
  const getJsonValue = useCallback(
    <T = unknown>(key: string, defaultValue?: T): T => {
      if (!remoteConfig) return defaultValue as T;

      try {
        const jsonString = getValue(remoteConfig, key).asString();
        return JSON.parse(jsonString) as T;
      } catch (err: unknown) {
        logger.error(`Error getting JSON value for key ${key}:`, err);
        return defaultValue as T;
      }
    },
    [remoteConfig]
  );

  return {
    getStringValue,
    getBooleanValue,
    getNumberValue,
    getJsonValue,
    refreshConfig,
    lastFetchTime,
    isLoading,
    error,
  };
}
