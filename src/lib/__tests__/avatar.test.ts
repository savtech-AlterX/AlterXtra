import { markSource } from '../avatar';

describe('markSource', () => {
  it('resolves art for every current icon choice', () => {
    for (const icon of ['male', 'male-mohawk', 'female', 'female-curly', 'mystery'] as const) {
      expect(markSource(icon).source).toBeDefined();
    }
  });

  it('falls back to the male mark for undefined', () => {
    expect(markSource(undefined).source).toBe(markSource('male').source);
  });

  // A persisted identity or onboarding draft can hold an icon value from
  // before a rename of the choice-icon options (e.g. 'afro'/'curly' from an
  // earlier build of the mohawk/curly-afro feature) — MARKS won't have that
  // key, and indexing it directly used to return undefined, crashing on the
  // next line's `.neutral` access. This is the regression that broke every
  // screen rendering the identity mark for anyone who'd picked one of those.
  it('falls back to the male mark for an icon value with no matching art', () => {
    expect(markSource('afro' as never).source).toBe(markSource('male').source);
    expect(markSource('curly' as never).source).toBe(markSource('male').source);
  });
});
