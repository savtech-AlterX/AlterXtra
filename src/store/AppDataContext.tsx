import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  Album,
  AppData,
  AppStore,
  emptyAppData,
  emptyAppStore,
  emptyIdentityProfile,
  FutureSelfLetter,
  FutureSelfVideo,
  Goal,
  GoalStep,
  HabitCheckIn,
  HabitReprogram,
  Identity,
  IdentityProfile,
  IdentitySession,
  JournalEntry,
  LimitedBelief,
  LogEntry,
  OnboardingDraft,
  QuickNote,
} from './types';
import { isEnvelope, migrate, SCHEMA_VERSION } from './migrations';
import { readWidgetSessionStartedAt, writeWidgetSessionStartedAt, writeWidgetStreak } from '../lib/sessionWidgetBridge';
import { computeActiveStreakDays } from '../lib/growth';
import { deleteAllLocalMedia } from '../lib/localMedia';
import { useSettings } from './SettingsContext';

const STORAGE_KEY = 'alterx:appData:v1';

// Free tier: one identity. Alter-Xtra unlocks unlimited — see
// settings.alterXtraUnlocked (SettingsContext), which real purchase
// wiring will flip once Alter-Xtra is actually on sale.
export const MAX_FREE_IDENTITIES = 1;

// A foreground within this many ms of the last recorded open is treated as
// the same "sitting down with the app," not a separate open — otherwise a
// notification banner or a quick app-switch would inflate the open count.
const APP_OPEN_DEDUPE_MS = 15 * 60 * 1000;
// Recency, not full lifetime history, is what the open-activity stat needs —
// this caps local storage growth for someone who's had the app for years.
const MAX_APP_OPENS = 500;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function profileToAppData(profile: IdentityProfile, onboardingDraft: OnboardingDraft | null): AppData {
  const { id: _id, ...rest } = profile;
  return { ...rest, onboardingDraft };
}

type IdentitySummary = { id: string; identity: Identity };

type AppDataContextValue = {
  data: AppData;
  // Every identity's own data, plus which one is active — what backups
  // actually need to cover. Only backup/restore code should touch this;
  // everything else should read `data` (the active identity's view).
  store: AppStore;
  isLoaded: boolean;
  // True when the most recent write to local storage failed — the in-app
  // state above is still correct, but it isn't safely on disk yet.
  saveError: boolean;
  retrySave: () => void;
  identities: IdentitySummary[];
  activeIdentityId: string | null;
  canAddIdentity: boolean;
  // Creates the first identity (onboarding) or edits the active identity's
  // archetype/icon/name in place ("Change Identity" in Settings) — it never
  // creates a second profile. Use addIdentity for that.
  setIdentity: (identity: Identity) => void;
  // Creates a brand-new, empty identity profile and switches to it. Refuses
  // (returns null) past the free-tier cap unless Alter-Xtra is unlocked —
  // check canAddIdentity first to steer the UI to the paywall instead.
  addIdentity: (identity: Identity) => string | null;
  switchActiveIdentity: (id: string) => void;
  deleteIdentity: (id: string) => void;
  setOnboardingDraft: (partial: Partial<OnboardingDraft>) => void;
  addJournalEntry: (date: string, title: string, body: string) => void;
  addFutureSelfLetter: (title: string, body: string) => void;
  addFutureSelfVideo: (
    question: string,
    videoUri: string,
    answerDate: string,
    lockMode?: 'date' | 'consistency',
    unlockAfterLogEntries?: number
  ) => void;
  addFutureSelfVideoReply: (id: string, replyVideoUri: string) => void;
  addGoal: (objective: string, targetDate: string, steps: string[]) => void;
  toggleGoalStep: (goalId: string, stepIndex: number) => void;
  addLogEntry: (aligned: boolean, proof: string, correction: string) => void;
  deleteLogEntry: (id: string) => void;
  addAlbum: (title: string) => Album;
  addPhotosToAlbum: (albumId: string, uris: string[]) => void;
  addLimitedBelief: (belief: string, origin: string, replacement: string) => void;
  addHabitReprogram: (
    trigger: string,
    oldHabit: string,
    replacement: string,
    reward: string,
    identityStatement: string
  ) => void;
  addQuickNote: () => QuickNote;
  updateQuickNote: (id: string, title: string, body: string) => void;
  deleteQuickNote: (id: string) => void;
  addHabitCheckIn: (habitId: string, followedThrough: boolean) => void;
  startIdentitySession: () => void;
  stopIdentitySession: () => void;
  resetAll: () => void;
  restoreAll: (incoming: unknown, fromVersion: number) => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [store, setStore] = useState<AppStore>(emptyAppStore);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          // Corrupted storage — start clean rather than crashing on launch.
          return;
        }
        if (isEnvelope(parsed)) {
          setStore(migrate(parsed.data, parsed.schemaVersion));
        } else {
          // Pre-migration data (no envelope) shipped as schemaVersion 1's shape.
          setStore(migrate(parsed, 1));
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  // A failed write here means whatever the user just did (a saved journal
  // entry, a completed habit check-in) LOOKS saved — the screen already
  // re-rendered from the optimistic state update — but isn't actually on
  // disk. Surfacing that (and retrying) beats losing it silently on next
  // launch with no sign anything went wrong.
  const persist = useCallback((toSave: AppStore) => {
    const envelope = { schemaVersion: SCHEMA_VERSION, data: toSave };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    persist(store);
  }, [store, isLoaded, persist]);

  const retrySave = useCallback(() => persist(store), [persist, store]);

  const activeProfile = useMemo(
    () => store.profiles.find((p) => p.id === store.activeIdentityId) ?? null,
    [store.profiles, store.activeIdentityId]
  );

  const data = useMemo<AppData>(
    () =>
      activeProfile
        ? profileToAppData(activeProfile, store.onboardingDraft)
        : { ...emptyAppData, onboardingDraft: store.onboardingDraft },
    [activeProfile, store.onboardingDraft]
  );

  const identities = useMemo<IdentitySummary[]>(
    () => store.profiles.map((p) => ({ id: p.id, identity: p.identity })),
    [store.profiles]
  );

  const canAddIdentity = settings.alterXtraUnlocked || store.profiles.length < MAX_FREE_IDENTITIES;

  // Applies `updater` to the currently active profile only — every content
  // mutator (journal, goals, habits, ...) goes through this so it never
  // touches a different identity's data.
  const updateActiveProfile = useCallback((updater: (p: IdentityProfile) => IdentityProfile) => {
    setStore((prev) => {
      if (!prev.activeIdentityId) return prev;
      return {
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === prev.activeIdentityId ? updater(p) : p)),
      };
    });
  }, []);

  const setIdentity = useCallback((identity: Identity) => {
    setStore((prev) => {
      if (prev.activeIdentityId) {
        // An identity is already active — this is "Change Identity":
        // updates its archetype/icon/name in place, keeping its diary,
        // goals, and everything else exactly as they were.
        return {
          ...prev,
          onboardingDraft: null,
          profiles: prev.profiles.map((p) =>
            p.id === prev.activeIdentityId
              ? { ...p, identity: { ...identity, createdAt: p.identity.createdAt ?? identity.createdAt ?? new Date().toISOString() } }
              : p
          ),
        };
      }
      // No active identity yet — first-run onboarding. Create the first profile.
      const id = makeId();
      const profile = emptyIdentityProfile(id, {
        ...identity,
        createdAt: identity.createdAt ?? new Date().toISOString(),
      });
      return { ...prev, onboardingDraft: null, activeIdentityId: id, profiles: [...prev.profiles, profile] };
    });
  }, []);

  const addIdentity = useCallback(
    (identity: Identity): string | null => {
      if (!canAddIdentity) return null;
      const id = makeId();
      const profile = emptyIdentityProfile(id, {
        ...identity,
        createdAt: identity.createdAt ?? new Date().toISOString(),
      });
      setStore((prev) => ({
        ...prev,
        onboardingDraft: null,
        activeIdentityId: id,
        profiles: [...prev.profiles, profile],
      }));
      return id;
    },
    [canAddIdentity]
  );

  const switchActiveIdentity = useCallback((id: string) => {
    setStore((prev) => (prev.profiles.some((p) => p.id === id) ? { ...prev, activeIdentityId: id } : prev));
  }, []);

  const deleteIdentity = useCallback(
    (id: string) => {
      const target = store.profiles.find((p) => p.id === id);
      if (target) deleteAllLocalMedia(target).catch(() => {});
      setStore((prev) => {
        const profiles = prev.profiles.filter((p) => p.id !== id);
        const activeIdentityId =
          prev.activeIdentityId === id ? (profiles[0]?.id ?? null) : prev.activeIdentityId;
        return { ...prev, profiles, activeIdentityId };
      });
    },
    [store.profiles]
  );

  const setOnboardingDraft = useCallback((partial: Partial<OnboardingDraft>) => {
    setStore((prev) => ({ ...prev, onboardingDraft: { ...prev.onboardingDraft, ...partial } }));
  }, []);

  const addJournalEntry = useCallback((date: string, title: string, body: string) => {
    const entry: JournalEntry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      date,
      title: title || undefined,
      body,
    };
    updateActiveProfile((p) => ({ ...p, journalEntries: [entry, ...p.journalEntries] }));
  }, [updateActiveProfile]);

  const addFutureSelfLetter = useCallback((title: string, body: string) => {
    const letter: FutureSelfLetter = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      title: title || undefined,
      body,
    };
    updateActiveProfile((p) => ({ ...p, futureSelfLetters: [letter, ...p.futureSelfLetters] }));
  }, [updateActiveProfile]);

  const addFutureSelfVideo = useCallback(
    (
      question: string,
      videoUri: string,
      answerDate: string,
      lockMode?: 'date' | 'consistency',
      unlockAfterLogEntries?: number
    ) => {
      const video: FutureSelfVideo = {
        id: makeId(),
        createdAt: new Date().toISOString(),
        question,
        videoUri,
        answerDate,
        lockMode,
        unlockAfterLogEntries,
      };
      updateActiveProfile((p) => ({ ...p, futureSelfVideos: [video, ...p.futureSelfVideos] }));
    },
    [updateActiveProfile]
  );

  const addFutureSelfVideoReply = useCallback((id: string, replyVideoUri: string) => {
    updateActiveProfile((p) => ({
      ...p,
      futureSelfVideos: p.futureSelfVideos.map((v) =>
        v.id === id ? { ...v, replyVideoUri, repliedAt: new Date().toISOString() } : v
      ),
    }));
  }, [updateActiveProfile]);

  const addGoal = useCallback((objective: string, targetDate: string, steps: string[]) => {
    const goalSteps: GoalStep[] = steps.map((text) => ({ text, done: false }));
    const goal: Goal = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      objective,
      targetDate,
      steps: goalSteps,
    };
    updateActiveProfile((p) => ({ ...p, goals: [goal, ...p.goals] }));
  }, [updateActiveProfile]);

  const toggleGoalStep = useCallback((goalId: string, stepIndex: number) => {
    updateActiveProfile((p) => ({
      ...p,
      goals: p.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              steps: g.steps.map((s, i) => (i === stepIndex ? { ...s, done: !s.done } : s)),
            }
          : g
      ),
    }));
  }, [updateActiveProfile]);

  const addLogEntry = useCallback((aligned: boolean, proof: string, correction: string) => {
    const entry: LogEntry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      aligned,
      proof,
      correction,
    };
    updateActiveProfile((p) => ({ ...p, logEntries: [entry, ...p.logEntries] }));
  }, [updateActiveProfile]);

  const deleteLogEntry = useCallback((id: string) => {
    updateActiveProfile((p) => ({ ...p, logEntries: p.logEntries.filter((e) => e.id !== id) }));
  }, [updateActiveProfile]);

  const addAlbum = useCallback((title: string) => {
    const album: Album = { id: makeId(), createdAt: new Date().toISOString(), title, photoUris: [] };
    updateActiveProfile((p) => ({ ...p, albums: [album, ...p.albums] }));
    return album;
  }, [updateActiveProfile]);

  const addPhotosToAlbum = useCallback((albumId: string, uris: string[]) => {
    updateActiveProfile((p) => ({
      ...p,
      albums: p.albums.map((a) => (a.id === albumId ? { ...a, photoUris: [...a.photoUris, ...uris] } : a)),
    }));
  }, [updateActiveProfile]);

  const addLimitedBelief = useCallback((belief: string, origin: string, replacement: string) => {
    const entry: LimitedBelief = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      belief,
      origin,
      replacement,
    };
    updateActiveProfile((p) => ({ ...p, limitedBeliefs: [entry, ...p.limitedBeliefs] }));
  }, [updateActiveProfile]);

  const addHabitReprogram = useCallback(
    (trigger: string, oldHabit: string, replacement: string, reward: string, identityStatement: string) => {
      const entry: HabitReprogram = {
        id: makeId(),
        createdAt: new Date().toISOString(),
        trigger,
        oldHabit,
        replacement,
        reward,
        identityStatement,
      };
      updateActiveProfile((p) => ({ ...p, habitReprograms: [entry, ...p.habitReprograms] }));
    },
    [updateActiveProfile]
  );

  const addQuickNote = useCallback(() => {
    const note: QuickNote = { id: makeId(), createdAt: new Date().toISOString(), title: '', body: '' };
    updateActiveProfile((p) => ({ ...p, quickNotes: [note, ...p.quickNotes] }));
    return note;
  }, [updateActiveProfile]);

  const updateQuickNote = useCallback((id: string, title: string, body: string) => {
    updateActiveProfile((p) => ({
      ...p,
      quickNotes: p.quickNotes.map((n) => (n.id === id ? { ...n, title, body } : n)),
    }));
  }, [updateActiveProfile]);

  const deleteQuickNote = useCallback((id: string) => {
    updateActiveProfile((p) => ({ ...p, quickNotes: p.quickNotes.filter((n) => n.id !== id) }));
  }, [updateActiveProfile]);

  const addHabitCheckIn = useCallback((habitId: string, followedThrough: boolean) => {
    const entry: HabitCheckIn = { id: makeId(), habitId, createdAt: new Date().toISOString(), followedThrough };
    updateActiveProfile((p) => ({ ...p, habitCheckIns: [entry, ...p.habitCheckIns] }));
  }, [updateActiveProfile]);

  const startIdentitySession = useCallback(() => {
    if (data.identitySessions.some((s) => s.endedAt === null)) return;
    const session: IdentitySession = { id: makeId(), startedAt: new Date().toISOString(), endedAt: null };
    updateActiveProfile((p) => ({ ...p, identitySessions: [session, ...p.identitySessions] }));
    writeWidgetSessionStartedAt(session.startedAt);
  }, [data.identitySessions, updateActiveProfile]);

  const stopIdentitySession = useCallback(() => {
    const active = data.identitySessions.find((s) => s.endedAt === null);
    if (!active) return;
    const endedAt = new Date().toISOString();
    updateActiveProfile((p) => ({
      ...p,
      identitySessions: p.identitySessions.map((s) => (s.id === active.id ? { ...s, endedAt } : s)),
    }));
    writeWidgetSessionStartedAt(null);
  }, [data.identitySessions, updateActiveProfile]);

  // Reconciles session state set by the Lock Screen / home screen widget
  // (a separate native process on iOS) into the in-app session log. Runs on
  // load and whenever the app returns to the foreground, since that's the
  // only reliable moment to learn what happened while the app wasn't running.
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const logAppOpen = useCallback(() => {
    const last = dataRef.current.appOpens[0];
    const now = Date.now();
    if (last && now - new Date(last).getTime() < APP_OPEN_DEDUPE_MS) return;
    const timestamp = new Date(now).toISOString();
    updateActiveProfile((p) => ({ ...p, appOpens: [timestamp, ...p.appOpens].slice(0, MAX_APP_OPENS) }));
  }, [updateActiveProfile]);

  const reconcileFromWidget = useCallback(async () => {
    const widgetStartedAt = await readWidgetSessionStartedAt();
    const current = dataRef.current;
    const active = current.identitySessions.find((s) => s.endedAt === null) ?? null;
    if (widgetStartedAt && !active) {
      const session: IdentitySession = { id: makeId(), startedAt: widgetStartedAt, endedAt: null };
      updateActiveProfile((p) => ({ ...p, identitySessions: [session, ...p.identitySessions] }));
    } else if (!widgetStartedAt && active) {
      // We only know a stop happened, not exactly when — "now" is the best
      // available approximation for a manually tracked practice session.
      const endedAt = new Date().toISOString();
      updateActiveProfile((p) => ({
        ...p,
        identitySessions: p.identitySessions.map((s) => (s.id === active.id ? { ...s, endedAt } : s)),
      }));
    }
  }, [updateActiveProfile]);

  useEffect(() => {
    if (!isLoaded) return;
    reconcileFromWidget();
    logAppOpen();
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        reconcileFromWidget();
        logAppOpen();
      }
    });
    return () => sub.remove();
  }, [isLoaded, reconcileFromWidget, logAppOpen]);

  // Keeps the home screen widget's streak display current — cheap enough to
  // recompute on every data change since it only walks the day-key sets, not
  // the full growth screen.
  useEffect(() => {
    if (!isLoaded) return;
    writeWidgetStreak(computeActiveStreakDays(data));
  }, [isLoaded, data]);

  const resetAll = useCallback(() => {
    Promise.all(store.profiles.map((p) => deleteAllLocalMedia(p))).catch(() => {});
    setStore(emptyAppStore);
  }, [store]);

  const restoreAll = useCallback((incoming: unknown, fromVersion: number) => {
    setStore(migrate(incoming, fromVersion));
  }, []);

  const value = useMemo(
    () => ({
      data,
      store,
      isLoaded,
      saveError,
      retrySave,
      identities,
      activeIdentityId: store.activeIdentityId,
      canAddIdentity,
      setIdentity,
      addIdentity,
      switchActiveIdentity,
      deleteIdentity,
      setOnboardingDraft,
      addJournalEntry,
      addFutureSelfLetter,
      addFutureSelfVideo,
      addFutureSelfVideoReply,
      addGoal,
      toggleGoalStep,
      addLogEntry,
      deleteLogEntry,
      addAlbum,
      addPhotosToAlbum,
      addLimitedBelief,
      addHabitReprogram,
      addQuickNote,
      updateQuickNote,
      deleteQuickNote,
      addHabitCheckIn,
      startIdentitySession,
      stopIdentitySession,
      resetAll,
      restoreAll,
    }),
    [
      data,
      store,
      isLoaded,
      saveError,
      retrySave,
      identities,
      canAddIdentity,
      setIdentity,
      addIdentity,
      switchActiveIdentity,
      deleteIdentity,
      setOnboardingDraft,
      addJournalEntry,
      addFutureSelfLetter,
      addFutureSelfVideo,
      addFutureSelfVideoReply,
      addGoal,
      toggleGoalStep,
      addLogEntry,
      deleteLogEntry,
      addAlbum,
      addPhotosToAlbum,
      addLimitedBelief,
      addHabitReprogram,
      addQuickNote,
      updateQuickNote,
      deleteQuickNote,
      addHabitCheckIn,
      startIdentitySession,
      stopIdentitySession,
      resetAll,
      restoreAll,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
