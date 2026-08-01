import { hasCheckedInToday, successRate } from '../habitCheckIns';
import { HabitCheckIn } from '../../store/types';

const checkIns: HabitCheckIn[] = [
  { id: '1', habitId: 'h1', createdAt: '2026-08-01T09:00:00.000Z', followedThrough: true },
  { id: '2', habitId: 'h1', createdAt: '2026-07-31T09:00:00.000Z', followedThrough: false },
  { id: '3', habitId: 'h2', createdAt: '2026-08-01T10:00:00.000Z', followedThrough: true },
];

describe('hasCheckedInToday', () => {
  it('is true when a check-in exists for this habit on the given day', () => {
    expect(hasCheckedInToday(checkIns, 'h1', new Date('2026-08-01T18:00:00.000Z'))).toBe(true);
  });

  it('is false for a different habit or a different day', () => {
    expect(hasCheckedInToday(checkIns, 'h1', new Date('2026-08-02T00:00:00.000Z'))).toBe(false);
    expect(hasCheckedInToday(checkIns, 'h3', new Date('2026-08-01T18:00:00.000Z'))).toBe(false);
  });
});

describe('successRate', () => {
  it('only counts check-ins for the given habit', () => {
    expect(successRate(checkIns, 'h1')).toEqual({ followed: 1, total: 2 });
    expect(successRate(checkIns, 'h2')).toEqual({ followed: 1, total: 1 });
  });

  it('returns zeroes for a habit with no check-ins', () => {
    expect(successRate(checkIns, 'unknown')).toEqual({ followed: 0, total: 0 });
  });
});
