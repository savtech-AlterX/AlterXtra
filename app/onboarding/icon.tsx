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

// Two rows of two hairstyle variants around a centered 'mystery' card,
// matching the 5-card reference layout exactly — including its left-to-right
// order, which puts the curly style before the flowing-hair one on the
// bottom row.
const OPTIONS: AppIconChoice[][] = [
  ['male', 'male-mohawk'],
  ['mystery'],
  ['female-curly', 'female'],
];

// Real photo-based avatars — square, already-colored/glowing renders, not
// tintable line work, so no tintColor here (unlike the mystery glyph below).
const GLYPH_WIDTH = 118;
const ICON_CHOICE_MARKS = {
  male: { source: require('../../assets/icon-choice-male.png') },
  'male-mohawk': { source: require('../../assets/icon-choice-male-mohawk.png') },
  female: { source: require('../../assets/icon-choice-female.png') },
  'female-curly': { source: require('../../assets/icon-choice-female-curly.png') },
} as const;

function IconGlyph({ option, tint }: { option: AppIconChoice; tint: string }) {
  const styles = useThemedStyles(makeStyles);
  if (option === 'mystery') {
    return <Text style={[styles.mysteryGlyph, { color: tint, textShadowColor: tint }]}>?</Text>;
  }
  const { source } = ICON_CHOICE_MARKS[option];
  return <Image source={source} style={styles.glyphImage} resizeMode="contain" />;
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
    <HudScreen style={styles.screen}>
      <View style={styles.header}>
        <Text style={[typography.screenTitle, styles.title]}>
          CHOOSE AN ICON{'\n'}FOR YOUR APP
        </Text>
      </View>

      <View style={styles.grid}>
        {OPTIONS.map((rowOptions, i) => {
          const isMysteryRow = rowOptions.length === 1 && rowOptions[0] === 'mystery';
          return (
            <View key={i} style={styles.row}>
              {rowOptions.map((opt) => {
                const isSelected = selected === opt;
                const tint = isSelected ? colors.glowStrong : colors.glow;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      setSelected(opt);
                      setOnboardingDraft({ icon: opt });
                    }}
                    style={[
                      isMysteryRow ? styles.mysteryBox : styles.box,
                      isSelected && styles.boxSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${opt} icon`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <IconGlyph option={opt} tint={tint} />
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </View>

      <View style={styles.comingSoon}>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>COMING SOON</Text>
          <View style={styles.dividerLine} />
        </View>
        <View style={styles.roster}>
          {[0, 1, 2, 3].map((i) => (
            <Text key={i} style={styles.rosterGlyph}>
              ?
            </Text>
          ))}
        </View>
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

// Card size is scaled off the reference design (see the `box` comment
// below) rather than shrunk to guarantee no scrolling on every device —
// on a typical modern phone (390-430pt wide) this still fits without
// scrolling, and the screen falls back to scrolling rather than clipping
// on anything smaller.
const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  // Trims HudScreen's default 40pt bottom padding and 16pt inter-block gap
  // (sized for shorter screens) down to what these three larger blocks
  // actually need, to keep a typical phone from needing to scroll at all.
  screen: {
    gap: 10,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
  },
  // This screen's header is centered (unlike the left-aligned screenTitle
  // used everywhere else), so the shared style still needs a text-align
  // override to sit right in that layout.
  title: {
    textAlign: 'center',
  },
  // Packed right under the title at their natural size (not flex:1 +
  // centered, which splits the leftover space into a gap above the cards
  // and another below) — the button just follows after, with normal flow
  // spacing rather than being force-pinned to the bottom, since the screen
  // scrolls now if a smaller device needs it.
  grid: {
    alignItems: 'center',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  // Card size and aspect measured directly off the reference image (a card
  // there is ~36% of the design's width, at a ~1:1.49 width:height ratio) —
  // scaled to this screen's own width rather than picking an arbitrary size,
  // which is what made earlier passes look noticeably smaller/daintier than
  // the reference despite matching its layout structure. The border is a
  // uniform bright `border` on every card, not a dim one that only lights up
  // once selected — the reference shows all five cards equally glowing;
  // `boxSelected` layers on the extra shadow and full-strength border that
  // mark the actual choice.
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
  // The reference's middle card isn't the same size as the other four — it's
  // noticeably shorter and a touch narrower (~82% of the row cards' height,
  // ~96% of their width), which is what makes it read as sitting "between"
  // the two rows rather than just another card in a taller stack.
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
  mysteryGlyph: {
    fontFamily: typography.screenTitle.fontFamily,
    fontSize: 74,
    ...glowShadow,
    textShadowRadius: 16,
  },
  // More identities in development, teased the same way the mystery card
  // represents an undisclosed one — dimmed '?' glyphs rather than new art,
  // so this needs no assets beyond what the screen already uses.
  comingSoon: {
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDim,
  },
  dividerLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  roster: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 22,
  },
  rosterGlyph: {
    fontFamily: typography.screenTitle.fontFamily,
    fontSize: 28,
    color: colors.textMuted,
    opacity: 0.6,
  },
  footer: {
    marginTop: 4,
    gap: 16,
  },
});
