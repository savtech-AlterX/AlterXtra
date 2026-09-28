import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../src/components/GlowButton';
import { HudScreen } from '../src/components/HudScreen';
import { StackHeader } from '../src/components/StackHeader';
import { useAppData } from '../src/store/AppDataContext';
import { AppIconChoice } from '../src/store/types';
import { useAppTheme, useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

// Same 5-card layout as onboarding/icon.tsx, kept as its own copy rather
// than a shared import: onboarding's version drives a multi-step flow
// (continue -> account -> identity), while this one is a single in-place
// swap reachable from Settings, and the two are unlikely to want the same
// changes going forward.
const OPTIONS: AppIconChoice[][] = [
  ['male', 'male-mohawk'],
  ['mystery'],
  ['female-curly', 'female'],
];

// Mystery reuses the same identity-mark asset shown everywhere else the
// mystery icon appears (Settings, Identities, onboarding) — a real icon of
// its own, not a bare "?" character standing in for one.
const GLYPH_WIDTH = 118;
const ICON_CHOICE_MARKS = {
  male: { source: require('../assets/icon-choice-male.png') },
  'male-mohawk': { source: require('../assets/icon-choice-male-mohawk.png') },
  female: { source: require('../assets/icon-choice-female.png') },
  'female-curly': { source: require('../assets/icon-choice-female-curly.png') },
  mystery: { source: require('../assets/identity-mark-mystery.png') },
} as const;

function IconGlyph({ option }: { option: AppIconChoice }) {
  const styles = useThemedStyles(makeStyles);
  const { source } = ICON_CHOICE_MARKS[option];
  return <Image source={source} style={styles.glyphImage} resizeMode="contain" />;
}

export default function ChangeIcon() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data, setIdentity } = useAppData();
  const [selected, setSelected] = useState<AppIconChoice>(data.identity?.icon ?? 'mystery');

  function save() {
    if (!data.identity) return;
    setIdentity({ ...data.identity, icon: selected });
    router.back();
  }

  return (
    <HudScreen style={styles.screen}>
      <StackHeader title="CHANGE ICON" />

      <View style={styles.grid}>
        {OPTIONS.map((rowOptions, i) => (
          <View key={i} style={styles.row}>
            {rowOptions.map((opt) => {
              const isSelected = selected === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setSelected(opt)}
                  style={[
                    rowOptions.length === 1 ? styles.mysteryBox : styles.box,
                    isSelected && styles.boxSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${opt} icon`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <IconGlyph option={opt} />
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <GlowButton
        label="SAVE"
        icon={<Ionicons name="checkmark" size={16} color="#02141f" />}
        onPress={save}
        disabled={selected === data.identity?.icon}
        style={styles.save}
      />
    </HudScreen>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
  screen: {
    gap: 10,
  },
  grid: {
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  box: {
    width: 138,
    height: 206,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.panelSolid,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mysteryBox: {
    width: 132,
    height: 169,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.panelSolid,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  boxSelected: {
    borderColor: colors.glowStrong,
    shadowColor: colors.glow,
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  glyphImage: {
    width: GLYPH_WIDTH,
    height: GLYPH_WIDTH,
  },
  save: {
    marginTop: 12,
  },
});
