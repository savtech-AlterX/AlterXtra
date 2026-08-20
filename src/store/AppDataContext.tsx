import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  Album,
  AppData,
  emptyAppData,
  FutureSelfLetter,
  FutureSelfVideo,
  Goal,
  GoalStep,
  HabitCheckIn,
  HabitReprogram,
  Identity,
  IdentitySession,
  JournalEntry,
  LimitedBelief,
  LogEntry,
  OnboardingDraft,
  QuickNote,
} from './types';
import { isEnvelope, migrate, SCHEMA_VERSION } from './migrations';
import { readWidgetSessionStartedAt, writeWidgetSessionStartedAt } from '../lib/sessionWidgetBridge';

const STORAGE_KEY = 'alterx:appData:v1';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type AppDataContextValue = {
  data: AppData;
  isLoaded: boolean;
  // True when the most recent write to local storage failed — the in-app
  // state above is still correct, but it isn't safely on disk yet.
  saveError: boolean;
  retrySave: () => void;
  setIdentity: (identity: Identity) => void;
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
  const [data, setData] = useState<AppData>(emptyAppData);
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
          setData(migrate(parsed.data, parsed.schemaVersion));
        } else {
          // Pre-migration data (no envelope) shipped as schemaVersion 1's shape.
          setData(migrate(parsed, 1));
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  // A failed write here means whatever the user just did (a saved journal
  // entry, a completed habit check-in) LOOKS saved — the screen already
  // re-rendered from the optimistic state update — but isn't actually on
  // disk. Surfacing that (and retrying) beats losing it silently on next
  // launch with no sign anything went wrong.
  const persist = useCallback((toSave: AppData) => {
    const envelope = { schemaVersion: SCHEMA_VERSION, data: toSave };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    persist(data);
  }, [data, isLoaded, persist]);

  const retrySave = useCallback(() => persist(data), [persist, data]);

  const setIdentity = useCallback((identity: Identity) => {
    setData((prev) => ({
      ...prev,
      identity: { ...identity, createdAt: prev.identity?.createdAt ?? identity.createdAt ?? new Date().toISOString() },
      // Onboarding is done — the draft that was covering for a mid-flow
      // force-quit has served its purpose.
      onboardingDraft: null,
    }));
  }, []);

  const setOnboardingDraft = useCallback((partial: Partial<OnboardingDraft>) => {
    setData((prev) => ({ ...prev, onboardingDraft: { ...prev.onboardingDraft, ...partial } }));
  }, []);

  const addJournalEntry = useCallback((date: string, title: string, body: string) => {
    const entry: JournalEntry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      date,
      title: title || undefined,
      body,
    };
    setData((prev) => ({ ...prev, journalEntries: [entry, ...prev.journalEntries] }));
  }, []);

  const addFutureSelfLetter = useCallback((title: string, body: string) => {
    const letter: FutureSelfLetter = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      title: title || undefined,
      body,
    };
    setData((prev) => ({ ...prev, futureSelfLetters: [letter, ...prev.futureSelfLetters] }));
  }, []);

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
      setData((prev) => ({ ...prev, futureSelfVideos: [video, ...prev.futureSelfVideos] }));
    },
    []
  );

  const addFutureSelfVideoReply = useCallback((id: string, replyVideoUri: string) => {
    setData((prev) => ({
      ...prev,
      futureSelfVideos: prev.futureSelfVideos.map((v) =>
        v.id === id ? { ...v, replyVideoUri, repliedAt: new Date().toISOString() } : v
      ),
    }));
  }, []);

  const addGoal = useCallback((objective: string, targetDate: string, steps: string[]) => {
    const goalSteps: GoalStep[] = steps.map((text) => ({ text, done: false }));
    const goal: Goal = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      objective,
      targetDate,
      steps: goalSteps,
    };
    setData((prev) => ({ ...prev, goals: [goal, ...prev.goals] }));
  }, []);

  const toggleGoalStep = useCallback((goalId: string, stepIndex: number) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              steps: g.steps.map((s, i) => (i === stepIndex ? { ...s, done: !s.done } : s)),
            }
          : g
      ),
    }));
  }, []);

  const addLogEntry = useCallback((aligned: boolean, proof: string, correction: string) => {
    const entry: LogEntry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      aligned,
      proof,
      correction,
    };
    setData((prev) => ({ ...prev, logEntries: [entry, ...prev.logEntries] }));
  }, []);

  const deleteLogEntry = useCallback((id: string) => {
    setData((prev) => ({ ...prev, logEntries: prev.logEntries.filter((e) => e.id !== id) }));
  }, []);

  const addAlbum = useCallback((title: string) => {
    const album: Album = { id: makeId(), createdAt: new Date().toISOString(), title, photoUris: [] };
    setData((prev) => ({ ...prev, albums: [album, ...prev.albums] }));
    return album;
  }, []);

  const addPhotosToAlbum = useCallback((albumId: string, uris: string[]) => {
    setData((prev) => ({
      ...prev,
      albums: prev.albums.map((a) =>
        a.id === albumId ? { ...a, photoUris: [...a.photoUris, ...uris] } : a
      ),
    }));
  }, []);

  const addLimitedBelief = useCallback((belief: string, origin: string, replacement: string) => {
    const entry: LimitedBelief = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      belief,
      origin,
      replacement,
    };
    setData((prev) => ({ ...prev, limitedBeliefs: [entry, ...prev.limitedBeliefs] }));
  }, []);

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
      setData((prev) => ({ ...prev, habitReprograms: [entry, ...prev.habitReprograms] }));
    },
    []
  );

  const addQuickNote = useCallback(() => {
    const note: QuickNote = { id: makeId(), createdAt: new Date().toISOString(), title: '', body: '' };
    setData((prev) => ({ ...prev, quickNotes: [note, ...prev.quickNotes] }));
    return note;
  }, []);

  const updateQuickNote = useCallback((id: string, title: string, body: string) => {
    setData((prev) => ({
      ...prev,
      quickNotes: prev.quickNotes.map((n) => (n.id === id ? { ...n, title, body } : n)),
    }));
  }, []);

  const deleteQuickNote = useCallback((id: string) => {
    setData((prev) => ({ ...prev, quickNotes: prev.quickNotes.filter((n) => n.id !== id) }));
  }, []);

  const addHabitCheckIn = useCallback((habitId: string, followedThrough: boolean) => {
    const entry: HabitCheckIn = { id: makeId(), habitId, createdAt: new Date().toISOString(), followedThrough };
    setData((prev) => ({ ...prev, habitCheckIns: [entry, ...prev.habitCheckIns] }));
  }, []);

  const startIdentitySession = useCallback(() => {
    if (data.identitySessions.some((s) => s.endedAt === null)) return;
    const session: IdentitySession = { id: makeId(), startedAt: new Date().toISOString(), endedAt: null };
    setData((prev) => ({ ...prev, identitySessions: [session, ...prev.identitySessions] }));
    writeWidgetSessionStartedAt(session.startedAt);
  }, [data.identitySessions]);

  const stopIdentitySession = useCallback(() => {
    const active = data.identitySessions.find((s) => s.endedAt === null);
    if (!active) return;
    const endedAt = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      identitySessions: prev.identitySessions.map((s) => (s.id === active.id ? { ...s, endedAt } : s)),
    }));
    writeWidgetSessionStartedAt(null);
  }, [data.identitySessions]);

  // Reconciles session state set by the Lock Screen / home screen widget
  // (a separate native process on iOS) into the in-app session log. Runs on
  // load and whenever the app returns to the foreground, since that's the
  // only reliable moment to learn what happened while the app wasn't running.
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const reconcileFromWidget = useCallback(async () => {
    const widgetStartedAt = await readWidgetSessionStartedAt();
    const current = dataRef.current;
    const active = current.identitySessions.find((s) => s.endedAt === null) ?? null;
    if (widgetStartedAt && !active) {
      const session: IdentitySession = { id: makeId(), startedAt: widgetStartedAt, endedAt: null };
      setData((prev) => ({ ...prev, identitySessions: [session, ...prev.identitySessions] }));
    } else if (!widgetStartedAt && active) {
      // We only know a stop happened, not exactly when — "now" is the best
      // available approximation for a manually tracked practice session.
      const endedAt = new Date().toISOString();
      setData((prev) => ({
        ...prev,
        identitySessions: prev.identitySessions.map((s) => (s.id === active.id ? { ...s, endedAt } : s)),
      }));
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    reconcileFromWidget();
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') reconcileFromWidget();
    });
    return () => sub.remove();
  }, [isLoaded, reconcileFromWidget]);

  const resetAll = useCallback(() => {
    setData(emptyAppData);
  }, []);

  const restoreAll = useCallback((incoming: unknown, fromVersion: number) => {
    setData(migrate(incoming, fromVersion));
  }, []);

  const value = useMemo(
    () => ({
      data,
      isLoaded,
      saveError,
      retrySave,
      setIdentity,
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
      isLoaded,
      saveError,
      retrySave,
      setIdentity,
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
