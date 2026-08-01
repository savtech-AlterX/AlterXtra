import { computeGrowthStats } from '../growth';
import { emptyAppData } from '../../store/types';

const NOW = new Date('2026-08-01T12:00:00.000Z');

describe('computeGrowthStats', () => {
  it('returns null daysSinceStart when identity has no createdAt', () => {
    const stats = computeGrowthStats(emptyAppData, NOW);
    expect(stats.daysSinceStart).toBeNull();
  });

  it('computes daysSinceStart from identity.createdAt', () => {
    const data = {
      ...emptyAppData,
      identity: { archetype: 'Warrior', icon: 'male' as const, name: 'Sav', createdAt: '2026-07-22T12:00:00.000Z' },
    };
    expect(computeGrowthStats(data, NOW).daysSinceStart).toBe(10);
  });

  it('counts completed goals only when every step is done and there is at least one step', () => {
    const data = {
      ...emptyAppData,
      goals: [
        { id: '1', createdAt: 'x', objective: 'Done goal', targetDate: 'x', steps: [{ text: 'a', done: true }] },
        { id: '2', createdAt: 'x', objective: 'Not done', targetDate: 'x', steps: [{ text: 'a', done: false }] },
        { id: '3', createdAt: 'x', objective: 'No steps', targetDate: 'x', steps: [] },
      ],
    };
    const stats = computeGrowthStats(data, NOW);
    expect(stats.goalsTotal).toBe(3);
    expect(stats.goalsCompleted).toBe(1);
  });

  it('buckets log entries into this-week vs last-week alignment rates', () => {
    const data = {
      ...emptyAppData,
      logEntries: [
        { id: '1', createdAt: '2026-08-01T00:00:00.000Z', aligned: true, proof: '', correction: '' }, // this week
        { id: '2', createdAt: '2026-07-30T00:00:00.000Z', aligned: false, proof: '', correction: '' }, // this week
        { id: '3', createdAt: '2026-07-20T00:00:00.000Z', aligned: true, proof: '', correction: '' }, // last week
      ],
    };
    const stats = computeGrowthStats(data, NOW);
    expect(stats.alignment.thisWeek).toEqual({ aligned: 1, total: 2 });
    expect(stats.alignment.lastWeek).toEqual({ aligned: 1, total: 1 });
  });

  it('pairs oldest and newest journal entries as then/now, only with 2+ entries', () => {
    const one = computeGrowthStats(
      { ...emptyAppData, journalEntries: [{ id: '1', createdAt: '2026-07-01T00:00:00.000Z', date: '2026-07-01', body: 'only entry' }] },
      NOW
    );
    expect(one.journalThenNow).toBeNull();

    const two = computeGrowthStats(
      {
        ...emptyAppData,
        journalEntries: [
          { id: '2', createdAt: '2026-07-15T00:00:00.000Z', date: '2026-07-15', body: 'newest' },
          { id: '1', createdAt: '2026-07-01T00:00:00.000Z', date: '2026-07-01', body: 'oldest' },
        ],
      },
      NOW
    );
    expect(two.journalThenNow?.then.body).toBe('oldest');
    expect(two.journalThenNow?.now.body).toBe('newest');
  });

  it('counts unlocked future-self videos as those whose answerDate has passed', () => {
    const data = {
      ...emptyAppData,
      futureSelfVideos: [
        { id: '1', createdAt: 'x', question: '', videoUri: 'x', answerDate: '2026-07-01T00:00:00.000Z' },
        { id: '2', createdAt: 'x', question: '', videoUri: 'x', answerDate: '2026-12-01T00:00:00.000Z' },
      ],
    };
    const stats = computeGrowthStats(data, NOW);
    expect(stats.futureSelf.videosSealed).toBe(2);
    expect(stats.futureSelf.videosUnlocked).toBe(1);
  });
});
