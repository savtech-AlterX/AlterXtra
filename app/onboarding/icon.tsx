import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { useAppData } from '../../src/store/AppDataContext';
import { AppIconChoice } from '../../src/store/types';
import { fonts } from '../../src/theme/typography';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

// A more saturated, deliberately "brand blue" than the default theme's glow
// accent (#3da8f5) — just for this screen's CONTINUE button, which reads as
// a touch pale/washed-out at its usual glow-tinted opacity next to a solid
// fill. Chakra Petch (SIL Open Font License, cleared for commercial use —
// see src/theme/typography.ts) instead of the LCD family here specifically,
// per a request to not have this one button ride on the display font.
const CONTINUE_BLUE = '#0B84F3';

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
// Mystery reuses the same identity-mark asset shown everywhere else the
// mystery icon appears (Settings, Identities) — a real icon of its own,
// not a bare "?" character standing in for one.
const GLYPH_WIDTH = 118;
// The mystery asset is a tall, narrow glyph (290x480), not a 1:1 square like
// the photo avatars — boxing it at GLYPH_WIDTH's fixed 118x118 left it
// visibly smaller than the reference (which fills most of mysteryBox's
// height). Sized to nearly fill mysteryBox (132x169) instead.
const MYSTERY_GLYPH_WIDTH = 100;
const MYSTERY_GLYPH_HEIGHT = 162;
const ICON_CHOICE_MARKS = {
  male: { source: require('../../assets/icon-choice-male.png'), tint: false },
  'male-mohawk': { source: require('../../assets/icon-choice-male-mohawk.png'), tint: false },
  female: { source: require('../../assets/icon-choice-female.png'), tint: false },
  'female-curly': { source: require('../../assets/icon-choice-female-curly.png'), tint: false },
  // Unlike the 4 real photos (already colored/glowing), this is a plain white
  // line glyph — needs the theme's glow tint to read as the same blue neon
  // as the rest of the row instead of standing out as a white outlier.
  mystery: { source: require('../../assets/identity-mark-mystery.png'), tint: true },
} as const;

function IconGlyph({ option }: { option: AppIconChoice }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { source, tint } = ICON_CHOICE_MARKS[option];
  return (
    <Image
      source={source}
      style={[
        option === 'mystery' ? styles.mysteryGlyphImage : styles.glyphImage,
        tint ? { tintColor: colors.glow } : null,
      ]}
      resizeMode="contain"
    />
  );
}

export default function ChooseIcon() {
  const { typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
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
                    <IconGlyph option={opt} />
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <GlowButton
          label="CONTINUE"
          icon={<Ionicons name="arrow-forward" size={16} color="#ffffff" />}
          backgroundColor={CONTINUE_BLUE}
          labelFontFamily={fonts.bodyBold}
          onPress={() => {
            setOnboardingDraft({ icon: selected });
            router.push({ pathname: '/onboarding/account', params: { icon: selected, mode } });
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
const makeStyles = ({ colors }: AppTheme) =>
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
  mysteryGlyphImage: {
    width: MYSTERY_GLYPH_WIDTH,
    height: MYSTERY_GLYPH_HEIGHT,
  },
  footer: {
    marginTop: 4,
    gap: 16,
  },
});
