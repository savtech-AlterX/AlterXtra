import { isFutureSelfUnlocked, logEntriesSince } from '../futureSelfUnlock';

const baseVideo = {
  id: '1',
  createdAt: '2026-08-01T00:00:00.000Z',
  question: '',
  videoUri: 'x',
  answerDate: '2027-01-01',
};

describe('logEntriesSince', () => {
  it('counts only entries at or after the given timestamp', () => {
    const logEntries = [
      { id: '1', createdAt: '2026-08-02T00:00:00.000Z', aligned: true, proof: '', correction: '' },
      { id: '2', createdAt: '2026-07-31T00:00:00.000Z', aligned: true, proof: '', correction: '' },
    ];
    expect(logEntriesSince(logEntries, '2026-08-01T00:00:00.000Z')).toBe(1);
  });

  it('returns 0 for an unparseable timestamp instead of throwing', () => {
    expect(logEntriesSince([], 'not-a-date')).toBe(0);
  });
});

describe('isFutureSelfUnlocked', () => {
  it('date mode: unlocked once answerDate has passed', () => {
    const past = { ...baseVideo, answerDate: '2020-01-01' };
    const future = { ...baseVideo, answerDate: '2099-01-01' };
    expect(isFutureSelfUnlocked(past, [])).toBe(true);
    expect(isFutureSelfUnlocked(future, [])).toBe(false);
  });

  it('date mode: fails open on a malformed date rather than locking forever', () => {
    const video = { ...baseVideo, answerDate: 'not-a-date' };
    expect(isFutureSelfUnlocked(video, [])).toBe(true);
  });

  it('consistency mode: locked until enough log entries exist since createdAt', () => {
    const video = { ...baseVideo, lockMode: 'consistency' as const, unlockAfterLogEntries: 3 };
    const twoEntries = [
      { id: '1', createdAt: '2026-08-02T00:00:00.000Z', aligned: true, proof: '', correction: '' },
      { id: '2', createdAt: '2026-08-03T00:00:00.000Z', aligned: true, proof: '', correction: '' },
    ];
    expect(isFutureSelfUnlocked(video, twoEntries)).toBe(false);

    const threeEntries = [
      ...twoEntries,
      { id: '3', createdAt: '2026-08-04T00:00:00.000Z', aligned: false, proof: '', correction: '' },
    ];
    expect(isFutureSelfUnlocked(video, threeEntries)).toBe(true);
  });

  it('consistency mode: ignores entries logged before the video was created', () => {
    const video = { ...baseVideo, lockMode: 'consistency' as const, unlockAfterLogEntries: 1 };
    const oldEntry = [{ id: '1', createdAt: '2026-07-01T00:00:00.000Z', aligned: true, proof: '', correction: '' }];
    expect(isFutureSelfUnlocked(video, oldEntry)).toBe(false);
  });

  it('consistency mode: defaults unlockAfterLogEntries to 1 when unset', () => {
    const video = { ...baseVideo, lockMode: 'consistency' as const };
    const oneEntry = [{ id: '1', createdAt: '2026-08-02T00:00:00.000Z', aligned: true, proof: '', correction: '' }];
    expect(isFutureSelfUnlocked(video, oneEntry)).toBe(true);
  });
});
