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
import { fonts } from '../../src/theme/typography';

// Two rows of two hairstyle variants around a centered 'mystery' card,
// matching the 5-card reference layout — not the original single row of
// three, now that there are hairstyle options to show alongside the plain
// male/female marks.
const OPTIONS: AppIconChoice[][] = [
  ['male', 'male-mohawk'],
  ['mystery'],
  ['female', 'female-curly'],
];

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
  'male-mohawk': { source: require('../../assets/icon-choice-male-mohawk.png'), width: GLYPH_WIDTH, height: GLYPH_WIDTH * (307 / 236) },
  female: { source: require('../../assets/icon-choice-female.png'), width: GLYPH_WIDTH, height: GLYPH_WIDTH * (716 / 362) },
  'female-curly': { source: require('../../assets/icon-choice-female-curly.png'), width: GLYPH_WIDTH, height: GLYPH_WIDTH * (309 / 229) },
} as const;

function IconGlyph({ option, tint }: { option: AppIconChoice; tint: string }) {
  const styles = useThemedStyles(makeStyles);
  if (option === 'mystery') {
    return <Text style={[styles.mysteryGlyph, { color: tint, textShadowColor: tint }]}>?</Text>;
  }
  const { source, width, height } = ICON_CHOICE_MARKS[option];
  return <Image source={source} style={[styles.glyphImage, { tintColor: tint, width, height }]} resizeMode="contain" />;
}

export default function ChooseIcon() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data, setOnboardingDraft } = useAppData();
  // Resume a choice already made before a force-quit, instead of starting
  // this pick over from scratch every time onboarding is re-entered.
  const [selected, setSelected] = useState<AppIconChoice>(data.onboardingDraft?.icon ?? 'mystery');

  return (
    <HudScreen>
      <View style={styles.header}>
        <Text style={styles.title}>
          choose an icon{'\n'}for your app
        </Text>
      </View>

      <View style={styles.grid}>
        {OPTIONS.map((rowOptions, i) => (
          <View key={i} style={styles.row}>
            {rowOptions.map((opt) => {
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
        ))}
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
  // LCD-Bold (screenTitle's usual font, used everywhere else in the app) is
  // a segmented-display face with no real lowercase forms — feeding it
  // lowercase text just renders as caps, silently undoing the point of this
  // one screen matching the reference's lowercase title. Chakra Petch (the
  // app's other, "reading voice" font) has real lowercase, so this title
  // uses that instead, with the glow added by hand since body text normally
  // has none.
  title: {
    textAlign: 'center',
    fontFamily: fonts.bodyMedium,
    fontSize: 20,
    letterSpacing: 1,
    color: colors.glow,
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  grid: {
    gap: 20,
    marginTop: 32,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
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
