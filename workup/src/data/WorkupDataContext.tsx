import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { MuscleGroup, ProgressEntry } from '../types';
import { loadEntries, saveEntries } from './store';

type WorkupDataContextValue = {
  entries: ProgressEntry[];
  isLoading: boolean;
  addEntry: (entry: ProgressEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesForGroup: (group: MuscleGroup) => ProgressEntry[];
};

const WorkupDataContext = createContext<WorkupDataContextValue | undefined>(undefined);

export function WorkupDataProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries().then((loaded) => {
      setEntries(loaded);
      setIsLoading(false);
    });
  }, []);

  const addEntry = useCallback(async (entry: ProgressEntry) => {
    setEntries((prev) => {
      const next = [entry, ...prev];
      saveEntries(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      saveEntries(next);
      return next;
    });
  }, []);

  const getEntriesForGroup = useCallback(
    (group: MuscleGroup) =>
      entries
        .filter((entry) => entry.muscleGroup === group)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  );

  const value = useMemo(
    () => ({ entries, isLoading, addEntry, deleteEntry, getEntriesForGroup }),
    [entries, isLoading, addEntry, deleteEntry, getEntriesForGroup]
  );

  return <WorkupDataContext.Provider value={value}>{children}</WorkupDataContext.Provider>;
}

export function useWorkupData() {
  const ctx = useContext(WorkupDataContext);
  if (!ctx) throw new Error('useWorkupData must be used within a WorkupDataProvider');
  return ctx;
}
