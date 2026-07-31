import { AppData, emptyAppData } from './types';

/**
 * Bump this whenever the shape of AppData changes in a way that would break
 * loading older stored data (renamed/removed/required fields, restructured
 * lists, etc). Add the transform to `migrations` keyed by the version it
 * upgrades FROM, so existing users' data is upgraded instead of crashing or
 * silently losing content on their next app open.
 */
export const SCHEMA_VERSION = 1;

type Migration = (data: any) => any;

// migrations[v] transforms data from schemaVersion v to v + 1.
// Empty for now — schemaVersion 1 is the first versioned shape, matching
// everything that shipped before this migration system existed.
const migrations: Record<number, Migration> = {};

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

export function migrate(rawData: unknown, fromVersion: number): AppData {
  let data: any = rawData ?? {};
  for (let v = fromVersion; v < SCHEMA_VERSION; v++) {
    const step = migrations[v];
    if (step) data = step(data);
  }
  if (typeof data !== 'object' || data === null) data = {};
  return { ...emptyAppData, ...data };
}
