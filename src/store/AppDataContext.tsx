import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Album,
  AppData,
  emptyAppData,
  FutureSelfLetter,
  Goal,
  Identity,
  JournalEntry,
  LogEntry,
} from './types';

const STORAGE_KEY = 'alterx:appData:v1';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type AppDataContextValue = {
  data: AppData;
  isLoaded: boolean;
  setIdentity: (identity: Identity) => void;
  addJournalEntry: (body: string) => void;
  addFutureSelfLetter: (body: string, deliverOn: string) => void;
  addGoal: (objective: string, targetDate: string, steps: string[]) => void;
  addLogEntry: (aligned: boolean, proof: string, correction: string) => void;
  deleteLogEntry: (id: string) => void;
  addAlbum: (title: string) => Album;
  addPhotosToAlbum: (albumId: string, uris: string[]) => void;
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

  const addJournalEntry = useCallback((body: string) => {
    const entry: JournalEntry = { id: makeId(), createdAt: new Date().toISOString(), body };
    setData((prev) => ({ ...prev, journalEntries: [entry, ...prev.journalEntries] }));
  }, []);

  const addFutureSelfLetter = useCallback((body: string, deliverOn: string) => {
    const letter: FutureSelfLetter = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      deliverOn,
      body,
    };
    setData((prev) => ({ ...prev, futureSelfLetters: [letter, ...prev.futureSelfLetters] }));
  }, []);

  const addGoal = useCallback((objective: string, targetDate: string, steps: string[]) => {
    const goal: Goal = { id: makeId(), createdAt: new Date().toISOString(), objective, targetDate, steps };
    setData((prev) => ({ ...prev, goals: [goal, ...prev.goals] }));
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
      addLogEntry,
      deleteLogEntry,
      addAlbum,
      addPhotosToAlbum,
      resetAll,
    }),
    [data, isLoaded, setIdentity, addJournalEntry, addFutureSelfLetter, addGoal, addLogEntry, deleteLogEntry, addAlbum, addPhotosToAlbum, resetAll]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
