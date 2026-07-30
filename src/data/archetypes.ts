import { Ionicons } from '@expo/vector-icons';

export type Archetype = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const archetypes: Archetype[] = [
  { id: 'world-champion', label: 'World Champion', icon: 'trophy' },
  { id: 'entrepreneur', label: 'Entrepreneur', icon: 'briefcase' },
  { id: 'public-speaker', label: 'Public Speaker', icon: 'mic' },
  { id: 'scholar', label: 'Scholar', icon: 'book' },
  { id: 'morning-person', label: 'Morning Person', icon: 'sunny' },
];
