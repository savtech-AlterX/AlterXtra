import { emptyAppData } from '../types';
import { isEnvelope, migrate, SCHEMA_VERSION } from '../migrations';

describe('migrate', () => {
  it('fills in missing fields with defaults', () => {
    const result = migrate({ identity: { archetype: 'Warrior', icon: 'male', name: 'Sav' } }, SCHEMA_VERSION);
    expect(result.identity?.archetype).toBe('Warrior');
    expect(result.journalEntries).toEqual([]);
    expect(result.goals).toEqual([]);
  });

  it('does not drop unrelated existing data when merging defaults', () => {
    const existing = {
      ...emptyAppData,
      quickNotes: [{ id: '1', createdAt: 'now', title: 'Note', body: 'Body' }],
    };
    const result = migrate(existing, SCHEMA_VERSION);
    expect(result.quickNotes).toHaveLength(1);
    expect(result.quickNotes[0].title).toBe('Note');
  });

  it('recovers to a valid, empty-shaped AppData for garbage input instead of throwing', () => {
    expect(() => migrate(null, SCHEMA_VERSION)).not.toThrow();
    expect(() => migrate('not an object', SCHEMA_VERSION)).not.toThrow();
    expect(() => migrate(42, SCHEMA_VERSION)).not.toThrow();
    const result = migrate(undefined, SCHEMA_VERSION);
    expect(result).toEqual(emptyAppData);
  });

  it('treats legacy pre-envelope data (schemaVersion 1 shape) the same as versioned data', () => {
    const legacy = { identity: null, goals: [{ id: 'g1', createdAt: 'now', objective: 'Ship it', targetDate: '2026-12-01', steps: [] }] };
    const result = migrate(legacy, 1);
    expect(result.goals).toHaveLength(1);
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
