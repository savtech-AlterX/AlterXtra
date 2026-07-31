import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Album,
  AppData,
  emptyAppData,
  FutureSelfLetter,
  Goal,
  GoalStep,
  HabitReprogram,
  Identity,
  JournalEntry,
  LimitedBelief,
  LogEntry,
  QuickNote,
} from './types';

const STORAGE_KEY = 'alterx:appData:v1';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type AppDataContextValue = {
  data: AppData;
  isLoaded: boolean;
  setIdentity: (identity: Identity) => void;
  addJournalEntry: (date: string, title: string, body: string) => void;
  addFutureSelfLetter: (title: string, body: string) => void;
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
  resetAll: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyAppData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setData({ ...emptyAppData, ...JSON.parse(raw) });
      })
      .finally(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, isLoaded]);

  const setIdentity = useCallback((identity: Identity) => {
    setData((prev) => ({ ...prev, identity }));
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

  const resetAll = useCallback(() => {
    setData(emptyAppData);
  }, []);

  const value = useMemo(
    () => ({
      data,
      isLoaded,
      setIdentity,
      addJournalEntry,
      addFutureSelfLetter,
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
      resetAll,
    }),
    [
      data,
      isLoaded,
      setIdentity,
      addJournalEntry,
      addFutureSelfLetter,
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
      resetAll,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
