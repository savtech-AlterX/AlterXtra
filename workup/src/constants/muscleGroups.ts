import type { MuscleGroup } from '../types';

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  glutes: 'Glutes',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
};

export const ALL_MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];

export function isMuscleGroup(value: string): value is MuscleGroup {
  return value in MUSCLE_GROUP_LABELS;
}
