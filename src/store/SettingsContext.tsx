import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SETTINGS_KEY = 'alterx:settings:v1';

type Settings = {
  appLockEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  mascotEnabled: boolean;
  showGoalBarOnHome: boolean;
  // Limited Beliefs no longer sits in the onboarding stack — the avatar
  // surfaces it on Home instead, once. This tracks whether that's happened
  // yet, independent of whether the user actually filled anything in.
  limitedBeliefsIntroShown: boolean;
  // Same idea, for the mascot's one-time lean-walk-reveal toward Alter-Xtra.
  alterXtraIntroShown: boolean;
};

const defaultSettings: Settings = {
  appLockEnabled: false,
  dailyReminderEnabled: false,
  dailyReminderHour: 19,
  dailyReminderMinute: 0,
  mascotEnabled: true,
  showGoalBarOnHome: true,
  limitedBeliefsIntroShown: false,
  alterXtraIntroShown: false,
};

type SettingsContextValue = {
  settings: Settings;
  isLoaded: boolean;
  setAppLockEnabled: (enabled: boolean) => void;
  setDailyReminder: (partial: Partial<Pick<Settings, 'dailyReminderEnabled' | 'dailyReminderHour' | 'dailyReminderMinute'>>) => void;
  setMascotEnabled: (enabled: boolean) => void;
  setShowGoalBarOnHome: (enabled: boolean) => void;
  setLimitedBeliefsIntroShown: (shown: boolean) => void;
  setAlterXtraIntroShown: (shown: boolean) => void;
  resetSettings: () => void;
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

  const setShowGoalBarOnHome = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, showGoalBarOnHome: enabled }));
  }, []);

  const setLimitedBeliefsIntroShown = useCallback((shown: boolean) => {
    setSettings((prev) => ({ ...prev, limitedBeliefsIntroShown: shown }));
  }, []);

  const setAlterXtraIntroShown = useCallback((shown: boolean) => {
    setSettings((prev) => ({ ...prev, alterXtraIntroShown: shown }));
  }, []);

  // "Reset All Data" is meant to hand back a genuine beginner's experience —
  // that has to include the once-only onboarding flags, not just app data,
  // or a returning tester (or a real user starting over) never sees them again.
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isLoaded,
      setAppLockEnabled,
      setDailyReminder,
      setMascotEnabled,
      setShowGoalBarOnHome,
      setLimitedBeliefsIntroShown,
      setAlterXtraIntroShown,
      resetSettings,
    }),
    [
      settings,
      isLoaded,
      setAppLockEnabled,
      setDailyReminder,
      setMascotEnabled,
      setShowGoalBarOnHome,
      setLimitedBeliefsIntroShown,
      setAlterXtraIntroShown,
      resetSettings,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
