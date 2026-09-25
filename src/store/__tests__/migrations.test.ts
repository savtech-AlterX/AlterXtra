import { emptyAppStore } from '../types';
import { isEnvelope, migrate, SCHEMA_VERSION } from '../migrations';

describe('migrate', () => {
  it('wraps a single identity into the first (and only) profile, active', () => {
    const result = migrate({ identity: { archetype: 'Warrior', icon: 'male', name: 'Sav' } }, 2);
    expect(result.profiles).toHaveLength(1);
    expect(result.profiles[0].identity.archetype).toBe('Warrior');
    expect(result.activeIdentityId).toBe(result.profiles[0].id);
    expect(result.profiles[0].journalEntries).toEqual([]);
    expect(result.profiles[0].goals).toEqual([]);
  });

  it('does not drop unrelated existing data when merging defaults', () => {
    const existing = {
      ...emptyAppStore,
      profiles: [
        {
          id: 'p1',
          identity: { archetype: 'Warrior', icon: 'male', name: 'Sav' },
          journalEntries: [],
          futureSelfLetters: [],
          futureSelfVideos: [],
          goals: [],
          logEntries: [],
          albums: [],
          limitedBeliefs: [],
          habitReprograms: [],
          habitCheckIns: [],
          quickNotes: [{ id: '1', createdAt: 'now', title: 'Note', body: 'Body' }],
          identitySessions: [],
          appOpens: [],
        },
      ],
      activeIdentityId: 'p1',
    };
    const result = migrate(existing, SCHEMA_VERSION);
    expect(result.profiles[0].quickNotes).toHaveLength(1);
    expect(result.profiles[0].quickNotes[0].title).toBe('Note');
  });

  it('recovers to a valid, empty-shaped store for garbage input instead of throwing', () => {
    expect(() => migrate(null, SCHEMA_VERSION)).not.toThrow();
    expect(() => migrate('not an object', SCHEMA_VERSION)).not.toThrow();
    expect(() => migrate(42, SCHEMA_VERSION)).not.toThrow();
    const result = migrate(undefined, SCHEMA_VERSION);
    expect(result).toEqual(emptyAppStore);
  });

  it('treats legacy pre-envelope data (schemaVersion 1 shape) the same as versioned data', () => {
    const legacy = { identity: null, goals: [{ id: 'g1', createdAt: 'now', objective: 'Ship it', targetDate: '2026-12-01', steps: [] }] };
    const result = migrate(legacy, 1);
    // No identity means onboarding never finished — nothing to carry into a
    // profile, so the stray top-level `goals` from that legacy shape is
    // correctly dropped rather than kept somewhere with no owner.
    expect(result.profiles).toHaveLength(0);
    expect(result.activeIdentityId).toBeNull();
  });

  it('backfills identity.createdAt for v1 data that predates it, without touching other fields', () => {
    const v1Data = { identity: { archetype: 'Warrior', icon: 'male', name: 'Sav' } };
    const result = migrate(v1Data, 1);
    expect(result.profiles[0].identity.createdAt).toBeDefined();
    expect(result.profiles[0].identity.archetype).toBe('Warrior');
  });

  it('does not overwrite an existing identity.createdAt on migration', () => {
    const v1Data = { identity: { archetype: 'Warrior', icon: 'male', name: 'Sav', createdAt: '2026-01-01T00:00:00.000Z' } };
    const result = migrate(v1Data, 1);
    expect(result.profiles[0].identity.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('is a no-op when there is no identity to backfill', () => {
    const result = migrate({ identity: null }, 1);
    expect(result.profiles).toHaveLength(0);
  });

  it('leaves an already-migrated (v3+) store alone', () => {
    const store = {
      onboardingDraft: null,
      activeIdentityId: 'p1',
      profiles: [
        {
          id: 'p1',
          identity: { archetype: 'Warrior', icon: 'male', name: 'Sav', createdAt: 'now' },
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
          appOpens: [],
        },
      ],
    };
    const result = migrate(store, SCHEMA_VERSION);
    expect(result.profiles).toHaveLength(1);
    expect(result.profiles[0].id).toBe('p1');
  });
});

describe('isEnvelope', () => {
  it('recognizes a properly-shaped envelope', () => {
    expect(isEnvelope({ schemaVersion: 1, data: {} })).toBe(true);
  });

  it('rejects legacy unwrapped data and other shapes', () => {
    expect(isEnvelope({ identity: null, goals: [] })).toBe(false);
    expect(isEnvelope(null)).toBe(false);
    expect(isEnvelope('string')).toBe(false);
    expect(isEnvelope({ schemaVersion: 'one', data: {} })).toBe(false);
  });
});
