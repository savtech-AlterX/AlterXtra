import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { MUSCLE_GROUP_LABELS } from '../constants/muscleGroups';
import type { MuscleGroup } from '../types';

const LIMB_GROUPS: MuscleGroup[] = ['biceps', 'triceps', 'forearms', 'quads', 'hamstrings', 'calves'];

type Props = {
  group: MuscleGroup;
};

// A fixed guide frame the user lines their muscle group up against, so every
// photo of a given group is captured from the same distance and position.
export function CameraFrameOverlay({ group }: Props) {
  const isLimb = LIMB_GROUPS.includes(group);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.instructionWrap}>
        <Text style={styles.instruction}>
          Line up your {MUSCLE_GROUP_LABELS[group].toLowerCase()} inside the frame
        </Text>
      </View>
      <View style={styles.frameWrap}>
        <View style={[styles.frame, isLimb ? styles.frameLimb : styles.frameTorso]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  instructionWrap: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instruction: {
    color: colors.text,
    backgroundColor: 'rgba(11, 13, 18, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    overflow: 'hidden',
  },
  frameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 16,
  },
  frameTorso: {
    width: '70%',
    height: '55%',
  },
  frameLimb: {
    width: '38%',
    height: '65%',
  },
});
