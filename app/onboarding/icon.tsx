import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { AppIconChoice } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const OPTIONS: AppIconChoice[] = ['male', 'mystery', 'female'];

// The original icon-choice glyphs: the head silhouette merges into a
// question mark (same linework as the real app icon), not the plain suit
// outline used for the identity mark elsewhere in the app.
const ICON_CHOICE_MARKS = {
  male: require('../../assets/icon-choice-male.png'),
  female: require('../../assets/icon-choice-female.png'),
} as const;

function IconGlyph({ option, tint }: { option: AppIconChoice; tint: string }) {
  const styles = useThemedStyles(makeStyles);
  if (option === 'male' || option === 'female') {
    return (
      <Image source={ICON_CHOICE_MARKS[option]} style={[styles.glyphImage, { tintColor: tint }]} resizeMode="contain" />
    );
  }
  return <Text style={[styles.mysteryGlyph, { color: tint, textShadowColor: tint }]}>?</Text>;
}

export default function ChooseIcon() {
  const { colors, typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const [selected, setSelected] = useState<AppIconChoice>('mystery');

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
                onPress={() => setSelected(opt)}
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
          onPress={() => router.push({ pathname: '/onboarding/account', params: { icon: selected } })}
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
    height: 66 * 1.67,
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
