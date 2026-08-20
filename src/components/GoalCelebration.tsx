import React from 'react';
import { CelebrationOverlay } from './CelebrationOverlay';

type Props = {
  objective: string;
  onDismiss: () => void;
};

// Fires once when the final step of a goal is checked off.
export function GoalCelebration({ objective, onDismiss }: Props) {
  return <CelebrationOverlay kicker="GOAL COMPLETE" body={objective} onDismiss={onDismiss} />;
}
