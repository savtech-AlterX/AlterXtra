import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SETTINGS_KEY = 'alterx:settings:v1';

type Settings = {
  appLockEnabled: boolean;
};

const defaultSettings: Settings = {
  appLockEnabled: false,
};

type SettingsContextValue = {
  settings: Settings;
  isLoaded: boolean;
  setAppLockEnabled: (enabled: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, isLoaded]);

  const setAppLockEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, appLockEnabled: enabled }));
  }, []);

  const value = useMemo(
    () => ({ settings, isLoaded, setAppLockEnabled }),
    [settings, isLoaded, setAppLockEnabled]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
