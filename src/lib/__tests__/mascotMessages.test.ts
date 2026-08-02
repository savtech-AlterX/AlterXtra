import { buildMascotMessagePool, pickMascotMessage } from '../mascotMessages';
import { computeGrowthStats } from '../growth';
import { emptyAppData } from '../../store/types';

describe('buildMascotMessagePool', () => {
  it('always includes the static lines, even with no data', () => {
    const stats = computeGrowthStats(emptyAppData, new Date('2026-08-01'));
    const pool = buildMascotMessagePool(stats);
    expect(pool.length).toBeGreaterThanOrEqual(6);
    expect(pool).toContain('Every rep counts.');
  });

  it('adds dynamic lines only for stats that actually have data', () => {
    const data = {
      ...emptyAppData,
      limitedBeliefs: [{ id: '1', createdAt: 'x', belief: 'x', origin: 'x', replacement: 'x' }],
    };
    const stats = computeGrowthStats(data, new Date('2026-08-01'));
    const pool = buildMascotMessagePool(stats);
    expect(pool.some((m) => m.includes('rewired 1 limited belief'))).toBe(true);
    expect(pool.some((m) => m.includes('habit'))).toBe(false);
  });

  it('pluralizes correctly for counts of 1 vs many', () => {
    const oneData = {
      ...emptyAppData,
      habitReprograms: [{ id: '1', createdAt: 'x', trigger: 'x', oldHabit: 'x', replacement: 'x', reward: 'x', identityStatement: 'x' }],
    };
    const manyData = {
      ...emptyAppData,
      habitReprograms: [oneData.habitReprograms[0], { ...oneData.habitReprograms[0], id: '2' }],
    };
    const onePool = buildMascotMessagePool(computeGrowthStats(oneData, new Date('2026-08-01')));
    const manyPool = buildMascotMessagePool(computeGrowthStats(manyData, new Date('2026-08-01')));
    expect(onePool.some((m) => m === '1 habit reprogrammed and counting.')).toBe(true);
    expect(manyPool.some((m) => m === '2 habits reprogrammed and counting.')).toBe(true);
  });
});

describe('pickMascotMessage', () => {
  it('picks deterministically based on the injected rng', () => {
    const pool = ['a', 'b', 'c'];
    expect(pickMascotMessage(pool, () => 0)).toBe('a');
    expect(pickMascotMessage(pool, () => 0.5)).toBe('b');
    expect(pickMascotMessage(pool, () => 0.99)).toBe('c');
  });

  it('falls back gracefully for an empty pool', () => {
    expect(pickMascotMessage([])).toBe('Keep going.');
  });
});
