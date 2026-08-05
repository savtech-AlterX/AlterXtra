import { formatRelativeTime } from '../format';

function isoSecondsAgo(seconds: number): string {
  return new Date(Date.now() - seconds * 1000).toISOString();
}

describe('formatRelativeTime', () => {
  it('formats seconds', () => {
    expect(formatRelativeTime(isoSecondsAgo(30))).toBe('30s');
  });

  it('formats minutes', () => {
    expect(formatRelativeTime(isoSecondsAgo(5 * 60))).toBe('5m');
  });

  it('formats hours', () => {
    expect(formatRelativeTime(isoSecondsAgo(3 * 60 * 60))).toBe('3h');
  });

  it('formats days', () => {
    expect(formatRelativeTime(isoSecondsAgo(2 * 24 * 60 * 60))).toBe('2d');
  });

  it('formats weeks', () => {
    expect(formatRelativeTime(isoSecondsAgo(15 * 24 * 60 * 60))).toBe('2w');
  });
});
