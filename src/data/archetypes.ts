import { Ionicons } from '@expo/vector-icons';

export type Archetype = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const archetypes: Archetype[] = [
  // Career & business
  { id: 'world-champion', label: 'World Champion', icon: 'trophy' },
  { id: 'entrepreneur', label: 'Entrepreneur', icon: 'briefcase' },
  { id: 'ceo', label: 'CEO', icon: 'business' },
  { id: 'startup-founder', label: 'Startup Founder', icon: 'rocket' },
  { id: 'investor', label: 'Investor', icon: 'trending-up' },
  { id: 'freelancer', label: 'Freelancer', icon: 'laptop' },
  { id: 'sales-closer', label: 'Sales Closer', icon: 'cash' },
  { id: 'team-leader', label: 'Team Leader', icon: 'flag' },
  { id: 'negotiator', label: 'Negotiator', icon: 'chatbubbles' },

  // Fitness & health
  { id: 'athlete', label: 'Athlete', icon: 'fitness' },
  { id: 'bodybuilder', label: 'Bodybuilder', icon: 'barbell' },
  { id: 'runner', label: 'Runner', icon: 'walk' },
  { id: 'yogi', label: 'Yogi', icon: 'flower' },
  { id: 'martial-artist', label: 'Martial Artist', icon: 'shield' },
  { id: 'morning-person', label: 'Morning Person', icon: 'sunny' },

  // Creative
  { id: 'artist', label: 'Artist', icon: 'color-palette' },
  { id: 'writer', label: 'Writer', icon: 'create' },
  { id: 'musician', label: 'Musician', icon: 'musical-notes' },
  { id: 'filmmaker', label: 'Filmmaker', icon: 'film' },
  { id: 'photographer', label: 'Photographer', icon: 'camera' },
  { id: 'designer', label: 'Designer', icon: 'brush' },

  // Social & leadership
  { id: 'public-speaker', label: 'Public Speaker', icon: 'mic' },
  { id: 'influencer', label: 'Influencer', icon: 'megaphone' },
  { id: 'mentor', label: 'Mentor', icon: 'people' },
  { id: 'community-builder', label: 'Community Builder', icon: 'people-circle' },
  { id: 'networker', label: 'Networker', icon: 'link' },

  // Mindset & philosophy
  { id: 'stoic', label: 'Stoic', icon: 'infinite' },
  { id: 'philosopher', label: 'Philosopher', icon: 'bulb' },
  { id: 'visionary', label: 'Visionary', icon: 'telescope' },
  { id: 'disciplined-achiever', label: 'Disciplined Achiever', icon: 'checkmark-done' },
  { id: 'resilient-survivor', label: 'Resilient Survivor', icon: 'pulse' },
  { id: 'minimalist', label: 'Minimalist', icon: 'square' },

  // Lifestyle
  { id: 'traveler', label: 'Traveler', icon: 'airplane' },
  { id: 'homebody', label: 'Homebody', icon: 'home' },
  { id: 'chef', label: 'Chef', icon: 'restaurant' },
  { id: 'family-first', label: 'Family First', icon: 'heart' },
  { id: 'environmentalist', label: 'Environmentalist', icon: 'earth' },

  // Academic & technical
  { id: 'scholar', label: 'Scholar', icon: 'book' },
  { id: 'scientist', label: 'Scientist', icon: 'flask' },
  { id: 'engineer', label: 'Engineer', icon: 'construct' },
  { id: 'lifelong-learner', label: 'Lifelong Learner', icon: 'school' },
  { id: 'polyglot', label: 'Polyglot', icon: 'language' },
  { id: 'maker', label: 'Maker', icon: 'hammer' },
  { id: 'gamer', label: 'Gamer', icon: 'game-controller' },

  // Competition & wealth
  { id: 'competitor', label: 'Competitor', icon: 'medal' },
  { id: 'saver', label: 'Saver', icon: 'wallet' },
  { id: 'philanthropist', label: 'Philanthropist', icon: 'gift' },
];
