import { buildShareReport, computeGrowthStats, formatDurationShort } from '../growth';
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

  it('aggregates habit check-ins across all habits into a single follow-through rate', () => {
    const data = {
      ...emptyAppData,
      habitCheckIns: [
        { id: '1', habitId: 'h1', createdAt: 'x', followedThrough: true },
        { id: '2', habitId: 'h1', createdAt: 'x', followedThrough: false },
        { id: '3', habitId: 'h2', createdAt: 'x', followedThrough: true },
      ],
    };
    expect(computeGrowthStats(data, NOW).habitFollowThrough).toEqual({ followed: 2, total: 3 });
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

  describe('identitySession', () => {
    it('reports no active session and zeroed stats when there are none', () => {
      const stats = computeGrowthStats(emptyAppData, NOW);
      expect(stats.identitySession).toEqual({
        active: null,
        totalSessions: 0,
        totalSeconds: 0,
        todaySessions: 0,
        currentStreakDays: 0,
        bestStreakDays: 0,
      });
    });

    it('surfaces the in-progress session as active and excludes it from totals', () => {
      const data = {
        ...emptyAppData,
        identitySessions: [{ id: '1', startedAt: '2026-08-01T11:00:00.000Z', endedAt: null }],
      };
      const stats = computeGrowthStats(data, NOW);
      expect(stats.identitySession.active?.id).toBe('1');
      expect(stats.identitySession.totalSessions).toBe(0);
      expect(stats.identitySession.totalSeconds).toBe(0);
    });

    it('sums completed session durations and counts sessions ended today', () => {
      const data = {
        ...emptyAppData,
        identitySessions: [
          { id: '1', startedAt: '2026-08-01T10:00:00.000Z', endedAt: '2026-08-01T10:10:00.000Z' }, // 600s, today
          { id: '2', startedAt: '2026-07-31T10:00:00.000Z', endedAt: '2026-07-31T10:05:00.000Z' }, // 300s, yesterday
        ],
      };
      const stats = computeGrowthStats(data, NOW);
      expect(stats.identitySession.totalSessions).toBe(2);
      expect(stats.identitySession.totalSeconds).toBe(900);
      expect(stats.identitySession.todaySessions).toBe(1);
    });

    it('counts the current streak back from today, carrying over before today has a session', () => {
      const data = {
        ...emptyAppData,
        identitySessions: [
          { id: '1', startedAt: '2026-07-31T10:00:00.000Z', endedAt: '2026-07-31T10:05:00.000Z' },
          { id: '2', startedAt: '2026-07-30T10:00:00.000Z', endedAt: '2026-07-30T10:05:00.000Z' },
        ],
      };
      expect(computeGrowthStats(data, NOW).identitySession.currentStreakDays).toBe(2);
    });

    it('resets the streak once a day is skipped', () => {
      const data = {
        ...emptyAppData,
        identitySessions: [
          { id: '1', startedAt: '2026-07-31T10:00:00.000Z', endedAt: '2026-07-31T10:05:00.000Z' },
          { id: '2', startedAt: '2026-07-20T10:00:00.000Z', endedAt: '2026-07-20T10:05:00.000Z' },
        ],
      };
      expect(computeGrowthStats(data, NOW).identitySession.currentStreakDays).toBe(1);
    });
  });
});

describe('activeStreakDays', () => {
  it('counts a streak from mixed activity types, not just sessions', () => {
    const data = {
      ...emptyAppData,
      logEntries: [{ id: '1', createdAt: '2026-08-01T00:00:00.000Z', aligned: true, proof: '', correction: '' }],
      habitCheckIns: [{ id: '1', habitId: 'h', createdAt: '2026-07-31T00:00:00.000Z', followedThrough: true }],
      journalEntries: [{ id: '1', createdAt: '2026-07-30T00:00:00.000Z', date: '', body: 'x' }],
    };
    expect(computeGrowthStats(data, NOW).activeStreakDays).toBe(3);
  });

  it('ignores entries with unparseable timestamps instead of throwing', () => {
    const data = {
      ...emptyAppData,
      habitCheckIns: [{ id: '1', habitId: 'h', createdAt: 'not-a-date', followedThrough: true }],
    };
    expect(() => computeGrowthStats(data, NOW)).not.toThrow();
    expect(computeGrowthStats(data, NOW).activeStreakDays).toBe(0);
  });
});

describe('bestStreakDays', () => {
  it('keeps the longest historical streak even after it is broken', () => {
    const data = {
      ...emptyAppData,
      // A 4-day streak (7/1-7/4) well in the past, then a gap, then a
      // 1-day streak today. Best should stay at 4 even though current is 1.
      logEntries: [
        { id: '1', createdAt: '2026-07-01T00:00:00.000Z', aligned: true, proof: '', correction: '' },
        { id: '2', createdAt: '2026-07-02T00:00:00.000Z', aligned: true, proof: '', correction: '' },
        { id: '3', createdAt: '2026-07-03T00:00:00.000Z', aligned: true, proof: '', correction: '' },
        { id: '4', createdAt: '2026-07-04T00:00:00.000Z', aligned: true, proof: '', correction: '' },
        { id: '5', createdAt: NOW.toISOString(), aligned: true, proof: '', correction: '' },
      ],
    };
    const stats = computeGrowthStats(data, NOW);
    expect(stats.activeStreakDays).toBe(1);
    expect(stats.bestStreakDays).toBe(4);
  });

  it('is 0 when there is no activity at all', () => {
    expect(computeGrowthStats(emptyAppData, NOW).bestStreakDays).toBe(0);
  });
});

describe('correctionsWritten', () => {
  it('counts log entries with a non-empty correction, aligned or not', () => {
    const data = {
      ...emptyAppData,
      logEntries: [
        { id: '1', createdAt: 'x', aligned: false, proof: '', correction: 'Go to bed earlier' },
        { id: '2', createdAt: 'x', aligned: true, proof: '', correction: 'Keep the streak going' },
        { id: '3', createdAt: 'x', aligned: false, proof: '', correction: '' },
        { id: '4', createdAt: 'x', aligned: false, proof: '', correction: '   ' },
      ],
    };
    expect(computeGrowthStats(data, NOW).correctionsWritten).toBe(2);
  });
});

describe('activityHeatmap', () => {
  it('is padded to whole weeks and every cell falls on a real calendar day', () => {
    const stats = computeGrowthStats(emptyAppData, NOW);
    stats.activityHeatmap.forEach((week) => {
      expect(week).toHaveLength(7);
    });
    // Every non-future cell's weekday should match its column position (0=Sun..6=Sat).
    stats.activityHeatmap.forEach((week) => {
      week.forEach((cell, dayIndex) => {
        if (!cell.date) return;
        expect(new Date(`${cell.date}T00:00:00.000Z`).getUTCDay()).toBe(dayIndex);
      });
    });
  });

  it('marks today with the right activity level and leaves future cells null', () => {
    const data = {
      ...emptyAppData,
      logEntries: [
        { id: '1', createdAt: NOW.toISOString(), aligned: true, proof: '', correction: '' },
        { id: '2', createdAt: NOW.toISOString(), aligned: false, proof: '', correction: '' },
      ],
    };
    const stats = computeGrowthStats(data, NOW);
    const lastWeek = stats.activityHeatmap[stats.activityHeatmap.length - 1];
    const todayKey = NOW.toISOString().slice(0, 10);
    const todayCell = lastWeek.find((c) => c.date === todayKey);
    expect(todayCell?.level).toBe(2);
    const futureCells = stats.activityHeatmap.flat().filter((c) => c.date && c.date > todayKey);
    expect(futureCells).toHaveLength(0);
  });

  it('flags days before the identity was created', () => {
    const data = {
      ...emptyAppData,
      identity: { archetype: 'Warrior', icon: 'male' as const, name: 'Sav', createdAt: NOW.toISOString() },
    };
    const stats = computeGrowthStats(data, NOW);
    const allCells = stats.activityHeatmap.flat().filter((c) => c.date);
    const beforeStartCells = allCells.filter((c) => c.beforeStart);
    const todayKey = NOW.toISOString().slice(0, 10);
    expect(beforeStartCells.every((c) => c.date! < todayKey)).toBe(true);
    expect(allCells.find((c) => c.date === todayKey)?.beforeStart).toBe(false);
  });
});

describe('insights', () => {
  it('is empty with no data', () => {
    expect(computeGrowthStats(emptyAppData, NOW).insights).toEqual([]);
  });

  it('surfaces a journaling-vs-alignment correlation once there is enough sample on both sides', () => {
    const logEntries = [];
    // 6 days journaled + aligned, 6 days not journaled + not aligned — a clean split.
    const journalEntries = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(NOW.getTime() - (i + 1) * 24 * 60 * 60 * 1000).toISOString();
      logEntries.push({ id: `j${i}`, createdAt: d, aligned: true, proof: '', correction: '' });
      journalEntries.push({ id: `je${i}`, createdAt: d, date: '', body: 'x' });
    }
    for (let i = 0; i < 6; i++) {
      const d = new Date(NOW.getTime() - (i + 20) * 24 * 60 * 60 * 1000).toISOString();
      logEntries.push({ id: `n${i}`, createdAt: d, aligned: false, proof: '', correction: '' });
    }
    const data = { ...emptyAppData, logEntries, journalEntries };
    const insights = computeGrowthStats(data, NOW).insights;
    expect(insights.some((s) => s.includes('journaled'))).toBe(true);
  });
});

describe('buildShareReport', () => {
  it('includes the streak, key counts, and a closing signature', () => {
    const data = {
      ...emptyAppData,
      identity: { archetype: 'The Visionary', icon: 'male' as const, name: 'Sav', createdAt: '2026-06-01T00:00:00.000Z' },
      limitedBeliefs: [{ id: '1', createdAt: 'x', belief: 'x', origin: 'x', replacement: 'x' }],
    };
    const stats = computeGrowthStats(data, NOW);
    const report = buildShareReport(data, stats);
    expect(report).toContain('The Visionary');
    expect(report).toContain('1 beliefs rewired');
    expect(report).toContain('— via AlterX');
  });
});

describe('recentAdds', () => {
  it('counts beliefs, habits, and unlocked future-self videos from the last 7 days', () => {
    const data = {
      ...emptyAppData,
      limitedBeliefs: [
        { id: '1', createdAt: '2026-07-30T00:00:00.000Z', belief: 'x', origin: 'x', replacement: 'x' }, // this week
        { id: '2', createdAt: '2026-07-01T00:00:00.000Z', belief: 'x', origin: 'x', replacement: 'x' }, // not this week
      ],
      habitReprograms: [
        { id: '1', createdAt: '2026-08-01T00:00:00.000Z', trigger: 'x', oldHabit: 'x', replacement: 'x', reward: 'x', identityStatement: 'x' },
      ],
      futureSelfVideos: [
        { id: '1', createdAt: 'x', question: '', videoUri: 'x', answerDate: '2026-07-31T00:00:00.000Z' }, // unlocked this week
        { id: '2', createdAt: 'x', question: '', videoUri: 'x', answerDate: '2026-07-01T00:00:00.000Z' }, // unlocked earlier
      ],
    };
    expect(computeGrowthStats(data, NOW).recentAdds).toEqual({ beliefs: 1, habits: 1, futureSelfUnlocked: 1 });
  });
});

describe('weeklyTrend', () => {
  it('returns 8 weeks oldest-first, with the last matching alignment.thisWeek', () => {
    const data = {
      ...emptyAppData,
      logEntries: [{ id: '1', createdAt: '2026-08-01T00:00:00.000Z', aligned: true, proof: '', correction: '' }],
    };
    const stats = computeGrowthStats(data, NOW);
    expect(stats.weeklyTrend).toHaveLength(8);
    expect(stats.weeklyTrend[7]).toEqual({ weekStart: stats.weeklyTrend[7].weekStart, aligned: 1, total: 1, rate: 100 });
    expect(stats.weeklyTrend[7].aligned).toBe(stats.alignment.thisWeek.aligned);
    expect(stats.weeklyTrend[7].total).toBe(stats.alignment.thisWeek.total);
  });
});

describe('journalThenNow (rolling 30-day window)', () => {
  it('picks the entry closest to 30 days before now when history is long enough', () => {
    const data = {
      ...emptyAppData,
      journalEntries: [
        { id: 'oldest', createdAt: '2026-06-01T00:00:00.000Z', date: '', body: 'oldest' },
        { id: 'thirtyish', createdAt: '2026-07-01T00:00:00.000Z', date: '', body: 'thirtyish' }, // ~31 days before NOW
        { id: 'newest', createdAt: NOW.toISOString(), date: '', body: 'newest' },
      ],
    };
    const stats = computeGrowthStats(data, NOW);
    expect(stats.journalThenNow?.then.body).toBe('thirtyish');
    expect(stats.journalThenNow?.now.body).toBe('newest');
  });
});

describe('formatDurationShort', () => {
  it('formats sub-minute durations as seconds', () => {
    expect(formatDurationShort(45)).toBe('45s');
  });

  it('formats sub-hour durations as minutes', () => {
    expect(formatDurationShort(125)).toBe('2m');
  });

  it('formats hour-plus durations as hours and minutes', () => {
    expect(formatDurationShort(3725)).toBe('1h 2m');
  });
});
