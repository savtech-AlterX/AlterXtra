export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export type Measurement = {
  label: string;
  valueCm: number;
};

export type ProgressEntry = {
  id: string;
  muscleGroup: MuscleGroup;
  photoUri: string;
  date: string; // ISO timestamp
  bodyWeightKg?: number;
  measurements?: Measurement[];
  notes?: string;
};
