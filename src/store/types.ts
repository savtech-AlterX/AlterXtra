export type AppIconChoice = 'male' | 'female' | 'mystery';

export type Identity = {
  archetype: string;
  icon: AppIconChoice;
  name: string;
};

export type JournalEntry = {
  id: string;
  createdAt: string;
  body: string;
};

export type FutureSelfLetter = {
  id: string;
  createdAt: string;
  deliverOn: string;
  body: string;
};

export type Goal = {
  id: string;
  createdAt: string;
  objective: string;
  targetDate: string;
  steps: string[];
};

export type LogEntry = {
  id: string;
  createdAt: string;
  aligned: boolean;
  proof: string;
  correction: string;
};

export type Album = {
  id: string;
  createdAt: string;
  title: string;
  photoUris: string[];
};

export type AppData = {
  identity: Identity | null;
  journalEntries: JournalEntry[];
  futureSelfLetters: FutureSelfLetter[];
  goals: Goal[];
  logEntries: LogEntry[];
  albums: Album[];
};

export const emptyAppData: AppData = {
  identity: null,
  journalEntries: [],
  futureSelfLetters: [],
  goals: [],
  logEntries: [],
  albums: [],
};
