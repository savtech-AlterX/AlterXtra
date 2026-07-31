export type AppIconChoice = 'male' | 'female' | 'mystery';

export type Identity = {
  archetype: string;
  icon: AppIconChoice;
  name: string;
  email?: string;
};

export type LimitedBelief = {
  id: string;
  createdAt: string;
  belief: string;
  origin: string;
  replacement: string;
};

export type HabitReprogram = {
  id: string;
  createdAt: string;
  trigger: string;
  oldHabit: string;
  replacement: string;
  reward: string;
  identityStatement: string;
};

export type QuickNote = {
  id: string;
  createdAt: string;
  title: string;
  body: string;
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
  limitedBeliefs: LimitedBelief[];
  habitReprograms: HabitReprogram[];
  quickNotes: QuickNote[];
};

export const emptyAppData: AppData = {
  identity: null,
  journalEntries: [],
  futureSelfLetters: [],
  goals: [],
  logEntries: [],
  albums: [],
  limitedBeliefs: [],
  habitReprograms: [],
  quickNotes: [],
};
