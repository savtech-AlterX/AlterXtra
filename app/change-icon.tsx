import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageStyle, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../src/components/GlowButton';
import { HudScreen } from '../src/components/HudScreen';
import { StackHeader } from '../src/components/StackHeader';
import { markSource } from '../src/lib/avatar';
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

const GLYPH_WIDTH = 118;

// Sourced from markSource() — same asset + tint rule used everywhere else
// the identity mark appears, so 'mystery' can't drift back to a plain white
// question mark on just this screen again.
function IconGlyph({ option }: { option: AppIconChoice }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { source, tint } = markSource(option);
  return (
    <Image
      source={source}
      resizeMode="contain"
      style={[
        styles.glyphImage,
        tint ? ({ tintColor: colors.glow, boxShadow: `0 0 26px ${colors.glow}` } as ImageStyle) : null,
      ]}
    />
  );
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
