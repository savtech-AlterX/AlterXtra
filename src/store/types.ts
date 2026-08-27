export type AppIconChoice = 'male' | 'female' | 'mystery' | 'afro' | 'curly';

export type Identity = {
  archetype: string;
  icon: AppIconChoice;
  name: string;
  email?: string;
  createdAt?: string;
};

// What's been filled in so far on the onboarding screens, before there's a
// real Identity to save. Persisted so a force-quit mid-onboarding doesn't
// silently throw away a name/icon/email the user already typed — cleared the
// moment a real Identity is created.
export type OnboardingDraft = {
  icon?: AppIconChoice;
  name?: string;
  email?: string;
  customArchetype?: string;
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

// A check-in logged against a specific HabitReprogram — closes the loop
// between "I intend to replace X with Y" and "did that actually happen today."
export type HabitCheckIn = {
  id: string;
  habitId: string;
  createdAt: string;
  followedThrough: boolean;
};

// A single "in identity" session, started/stopped either in-app or from the
// lock screen / home screen widget. endedAt is null while the session is
// still running.
export type IdentitySession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
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
  date: string;
  title?: string;
  body: string;
};

export type FutureSelfLetter = {
  id: string;
  createdAt: string;
  title?: string;
  body: string;
};

export type FutureSelfVideo = {
  id: string;
  createdAt: string;
  question: string;
  videoUri: string;
  answerDate: string;
  // Absent (or 'date') means the original date-only behavior: unlocked once
  // answerDate has passed. 'consistency' ignores the date for unlocking and
  // instead requires unlockAfterLogEntries Log Book entries since createdAt
  // — a payoff earned by showing up, not by the calendar turning over.
  lockMode?: 'date' | 'consistency';
  unlockAfterLogEntries?: number;
  replyVideoUri?: string;
  repliedAt?: string;
};

export type GoalStep = {
  text: string;
  done: boolean;
};

export type Goal = {
  id: string;
  createdAt: string;
  objective: string;
  targetDate: string;
  steps: GoalStep[];
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
  onboardingDraft: OnboardingDraft | null;
  journalEntries: JournalEntry[];
  futureSelfLetters: FutureSelfLetter[];
  futureSelfVideos: FutureSelfVideo[];
  goals: Goal[];
  logEntries: LogEntry[];
  albums: Album[];
  limitedBeliefs: LimitedBelief[];
  habitReprograms: HabitReprogram[];
  habitCheckIns: HabitCheckIn[];
  quickNotes: QuickNote[];
  identitySessions: IdentitySession[];
};

export const emptyAppData: AppData = {
  identity: null,
  onboardingDraft: null,
  journalEntries: [],
  futureSelfLetters: [],
  futureSelfVideos: [],
  goals: [],
  logEntries: [],
  albums: [],
  limitedBeliefs: [],
  habitReprograms: [],
  habitCheckIns: [],
  quickNotes: [],
  identitySessions: [],
};
