import { AppStore, emptyAppStore } from './types';

/**
 * Bump this whenever the shape of AppData changes in a way that would break
 * loading older stored data (renamed/removed/required fields, restructured
 * lists, etc). Add the transform to `migrations` keyed by the version it
 * upgrades FROM, so existing users' data is upgraded instead of crashing or
 * silently losing content on their next app open.
 */
export const SCHEMA_VERSION = 3;

type Migration = (data: any) => any;

function makeMigrationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// migrations[v] transforms data from schemaVersion v to v + 1.
const migrations: Record<number, Migration> = {
  // v1 -> v2: added Identity.createdAt (powers the Growth screen's "days
  // since you began" stat). Existing identities predate that field — backfill
  // rather than leaving it undefined so the stat doesn't just disappear for
  // anyone who onboarded before this update.
  1: (data) => {
    if (data && typeof data === 'object' && data.identity && !data.identity.createdAt) {
      return { ...data, identity: { ...data.identity, createdAt: new Date().toISOString() } };
    }
    return data;
  },
  // v2 -> v3: went from a single global identity to unlimited identities,
  // each with its own diary/goals/habits/etc. Wraps the old flat shape into
  // one IdentityProfile so nobody's existing data goes anywhere — it just
  // becomes their first (and, until they add more, only) identity.
  2: (data) => {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray((data as any).profiles)) return data; // already this shape
    const {
      identity,
      onboardingDraft,
      journalEntries,
      futureSelfLetters,
      futureSelfVideos,
      goals,
      logEntries,
      albums,
      limitedBeliefs,
      habitReprograms,
      habitCheckIns,
      quickNotes,
      identitySessions,
      appOpens,
    } = data as any;
    if (!identity) {
      // Never finished onboarding — nothing to carry into a profile.
      return { onboardingDraft: onboardingDraft ?? null, activeIdentityId: null, profiles: [] };
    }
    const id = makeMigrationId();
    const profile = {
      id,
      identity,
      journalEntries: journalEntries ?? [],
      futureSelfLetters: futureSelfLetters ?? [],
      futureSelfVideos: futureSelfVideos ?? [],
      goals: goals ?? [],
      logEntries: logEntries ?? [],
      albums: albums ?? [],
      limitedBeliefs: limitedBeliefs ?? [],
      habitReprograms: habitReprograms ?? [],
      habitCheckIns: habitCheckIns ?? [],
      quickNotes: quickNotes ?? [],
      identitySessions: identitySessions ?? [],
      appOpens: appOpens ?? [],
    };
    return { onboardingDraft: onboardingDraft ?? null, activeIdentityId: id, profiles: [profile] };
  },
};

export type StoredEnvelope = {
  schemaVersion: number;
  data: unknown;
};

export function isEnvelope(raw: unknown): raw is StoredEnvelope {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    'schemaVersion' in raw &&
    'data' in raw &&
    typeof (raw as any).schemaVersion === 'number'
  );
}

export function migrate(rawData: unknown, fromVersion: number): AppStore {
  let data: any = rawData ?? {};
  for (let v = fromVersion; v < SCHEMA_VERSION; v++) {
    const step = migrations[v];
    if (step) data = step(data);
  }
  if (typeof data !== 'object' || data === null) data = {};
  return { ...emptyAppStore, ...data };
}
