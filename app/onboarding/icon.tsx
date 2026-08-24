import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { useAppData } from '../../src/store/AppDataContext';
import { AppIconChoice } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const OPTIONS: AppIconChoice[] = ['male', 'mystery', 'female'];

// The original icon-choice glyphs: the head silhouette merges into a
// question mark (same linework as the real app icon), not the plain suit
// outline used for the identity mark elsewhere in the app. Each renders at
// a fixed shared width (GLYPH_WIDTH) with its own height computed from its
// own aspect ratio, rather than a fixed height for both — the two aren't
// drawn to the same canvas (the female mark's flowing hair makes it taller
// relative to its width than the male mark), and forcing a shared height
// squeezed the taller one down narrower than the other, reading as smaller.
// (react-native-web's Image doesn't derive a resizeMode="contain" box's
// height from an `aspectRatio` style the way RN does — it renders at the
// source file's raw pixel height instead — so this computes explicit
// per-icon width/height rather than relying on that.)
const GLYPH_WIDTH = 66;
const ICON_CHOICE_MARKS = {
  male: { source: require('../../assets/icon-choice-male.png'), width: GLYPH_WIDTH, height: GLYPH_WIDTH * (633 / 368) },
  female: { source: require('../../assets/icon-choice-female.png'), width: GLYPH_WIDTH, height: GLYPH_WIDTH * (716 / 362) },
} as const;

function IconGlyph({ option, tint }: { option: AppIconChoice; tint: string }) {
  const styles = useThemedStyles(makeStyles);
  if (option === 'male' || option === 'female') {
    const { source, width, height } = ICON_CHOICE_MARKS[option];
    return <Image source={source} style={[styles.glyphImage, { tintColor: tint, width, height }]} resizeMode="contain" />;
  }
  return <Text style={[styles.mysteryGlyph, { color: tint, textShadowColor: tint }]}>?</Text>;
}

export default function ChooseIcon() {
  const { colors, typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data, setOnboardingDraft } = useAppData();
  // Resume a choice already made before a force-quit, instead of starting
  // this pick over from scratch every time onboarding is re-entered.
  const [selected, setSelected] = useState<AppIconChoice>(data.onboardingDraft?.icon ?? 'mystery');

  return (
    <HudScreen scroll={false}>
      <View style={styles.header}>
        <Text style={[typography.screenTitle, styles.title]}>
          CHOOSE AN ICON{'\n'}FOR YOUR APP
        </Text>
      </View>

      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt;
          const tint = isSelected ? colors.glowStrong : colors.glow;
          return (
            <View key={opt} style={styles.cardWrap}>
              <Pressable
                onPress={() => {
                  setSelected(opt);
                  setOnboardingDraft({ icon: opt });
                }}
                style={[styles.box, isSelected && styles.boxSelected]}
                accessibilityRole="button"
                accessibilityLabel={`${opt} icon`}
                accessibilityState={{ selected: isSelected }}
              >
                <IconGlyph option={opt} tint={tint} />
              </Pressable>
              <View style={[styles.reflection, { backgroundColor: tint, opacity: isSelected ? 0.9 : 0.45 }]} />
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <GlowButton
          label="CONTINUE"
          icon={<Ionicons name="arrow-forward" size={16} color="#02141f" />}
          onPress={() => {
            setOnboardingDraft({ icon: selected });
            router.push({ pathname: '/onboarding/account', params: { icon: selected } });
          }}
        />
      </View>
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  header: {
    marginTop: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 40,
  },
  cardWrap: {
    alignItems: 'center',
  },
  box: {
    width: 104,
    height: 176,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderDim,
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
    width: 66,
  },
  mysteryGlyph: {
    fontFamily: typography.screenTitle.fontFamily,
    fontSize: 64,
    ...glowShadow,
    textShadowRadius: 16,
  },
  reflection: {
    width: 56,
    height: 5,
    borderRadius: 3,
    marginTop: 10,
    shadowColor: colors.glow,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  footer: {
    marginTop: 'auto',
    gap: 16,
  },
});
