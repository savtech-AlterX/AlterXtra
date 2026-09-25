// Free-tier cap on habit reprograms. Premium removes it entirely.
export const FREE_HABIT_LIMIT = 4;

export function canAddHabit(habitCount: number, isPremium: boolean) {
  return isPremium || habitCount < FREE_HABIT_LIMIT;
}
