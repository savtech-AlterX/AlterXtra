import React from 'react';
import { CelebrationOverlay } from './CelebrationOverlay';

type Props = {
  days: number;
  onDismiss: () => void;
};

const HEADLINES: Record<number, string> = {
  7: "One week in identity. That's a real habit forming.",
  30: 'Thirty days. This is who you are now, not just who you decided to be.',
  100: "A hundred days. Most people never make it this far. You're not most people.",
  365: 'A full year in identity. This is who you are.',
};

// Fires once when a streak-day milestone is crossed for the first time —
// see growth.tsx / SettingsContext.celebratedStreakMilestone.
export function MilestoneCelebration({ days, onDismiss }: Props) {
  return (
    <CelebrationOverlay
      kicker={`${days}-DAY STREAK`}
      body={HEADLINES[days] ?? `${days} days in identity, without a break.`}
      onDismiss={onDismiss}
    />
  );
}
