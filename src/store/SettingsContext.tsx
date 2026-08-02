import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SETTINGS_KEY = 'alterx:settings:v1';

export type MascotColor = 'blue' | 'teal' | 'amber';

type Settings = {
  appLockEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  mascotEnabled: boolean;
  mascotColor: MascotColor;
};

const defaultSettings: Settings = {
  appLockEnabled: false,
  dailyReminderEnabled: false,
  dailyReminderHour: 19,
  dailyReminderMinute: 0,
  mascotEnabled: true,
  mascotColor: 'blue',
};

type SettingsContextValue = {
  settings: Settings;
  isLoaded: boolean;
  setAppLockEnabled: (enabled: boolean) => void;
  setDailyReminder: (partial: Partial<Pick<Settings, 'dailyReminderEnabled' | 'dailyReminderHour' | 'dailyReminderMinute'>>) => void;
  setMascotEnabled: (enabled: boolean) => void;
  setMascotColor: (color: MascotColor) => void;
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

  const setDailyReminder = useCallback(
    (partial: Partial<Pick<Settings, 'dailyReminderEnabled' | 'dailyReminderHour' | 'dailyReminderMinute'>>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const setMascotEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, mascotEnabled: enabled }));
  }, []);

  const setMascotColor = useCallback((color: MascotColor) => {
    setSettings((prev) => ({ ...prev, mascotColor: color }));
  }, []);

  const value = useMemo(
    () => ({ settings, isLoaded, setAppLockEnabled, setDailyReminder, setMascotEnabled, setMascotColor }),
    [settings, isLoaded, setAppLockEnabled, setDailyReminder, setMascotEnabled, setMascotColor]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
