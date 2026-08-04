import { goalCountdown } from '../countdown';
import { Goal } from '../../store/types';

const NOW = new Date('2026-08-04T12:00:00.000Z');

function makeGoal(partial: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    createdAt: '2026-08-01T12:00:00.000Z',
    objective: 'Launch the studio',
    targetDate: '2026-08-11',
    steps: [],
    ...partial,
  };
}

describe('goalCountdown', () => {
  it('reports whole days remaining', () => {
    expect(goalCountdown(makeGoal(), NOW).daysLeft).toBe(8);
  });

  it('tracks how much of the run has elapsed, from creation to target', () => {
    // created Aug 1, target end of Aug 11, now Aug 4 -> a bit under a third in
    const c = goalCountdown(makeGoal(), NOW);
    expect(c.elapsedFraction).toBeGreaterThan(0.2);
    expect(c.elapsedFraction).toBeLessThan(0.4);
  });

  it('clamps elapsed fraction to 1 once the deadline is past', () => {
    const c = goalCountdown(makeGoal({ targetDate: '2026-08-02' }), NOW);
    expect(c.elapsedFraction).toBe(1);
    expect(c.expired).toBe(true);
    expect(c.label).toBe('TARGET DATE PASSED');
  });

  it('pluralises the day label correctly', () => {
    expect(goalCountdown(makeGoal({ targetDate: '2026-08-04' }), NOW).label).toBe('1 DAY LEFT');
    expect(goalCountdown(makeGoal({ targetDate: '2026-08-06' }), NOW).label).toBe('3 DAYS LEFT');
  });

  it('flags an unparseable target date instead of producing NaN', () => {
    const c = goalCountdown(makeGoal({ targetDate: 'whenever' }), NOW);
    expect(c.valid).toBe(false);
    expect(Number.isNaN(c.elapsedFraction)).toBe(false);
    expect(c.label).toBe('NO TARGET DATE');
  });

  it('does not divide by zero when created and target collapse to the same instant', () => {
    const c = goalCountdown(
      makeGoal({ createdAt: '2026-08-11T23:59:59.000Z', targetDate: '2026-08-11' }),
      NOW
    );
    expect(Number.isFinite(c.elapsedFraction)).toBe(true);
  });
});
