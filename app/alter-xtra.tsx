import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../src/components/GlowButton';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { StackHeader } from '../src/components/StackHeader';
import { colors } from '../src/theme/colors';
import { glowShadow, iconGlow, typography } from '../src/theme/typography';

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'people-outline',
    title: 'Unlimited Identities',
    body: 'Create and manage as many identities as you want.',
  },
  {
    icon: 'locate-outline',
    title: 'Unlimited Habits',
    body: 'Add and track unlimited habits to build who you want to become.',
  },
  {
    icon: 'bar-chart-outline',
    title: 'Weekly Reports',
    body: 'See your patterns, progress, and alignment every week.',
  },
  {
    icon: 'color-palette-outline',
    title: 'Different Colours',
    body: 'Customize Alter-X with beautiful neon color themes.',
  },
];

export default function AlterXtra() {
  return (
    <HudScreen>
      <StackHeader title="ALTER-XTRA" />

      <GlowCard strong style={styles.priceCard}>
        <Text style={styles.eyebrow}>ALTER X</Text>
        <Text style={styles.title}>Alter-Xtra</Text>
        <Text style={styles.price}>
          $3.99 <Text style={styles.priceUnit}>/ month</Text>
        </Text>
        <Text style={styles.tagline}>More freedom. More customization. More growth.</Text>
      </GlowCard>

      <Text style={typography.label}>XTRA.BENEFITS</Text>

      {BENEFITS.map((b, i) => (
        <GlowCard key={b.title} style={styles.benefitCard}>
          <Text style={styles.benefitIndex}>{String(i + 1).padStart(2, '0')}</Text>
          <View style={styles.benefitIcon}>
            <Ionicons name={b.icon} size={22} color={colors.glow} style={iconGlow} />
          </View>
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>{b.title}</Text>
            <Text style={styles.benefitBody}>{b.body}</Text>
          </View>
        </GlowCard>
      ))}

      <GlowButton label="COMING SOON" disabled style={styles.spacer} />
      <Text style={styles.disclaimer}>Alter-Xtra isn't available to subscribe to yet — check back soon.</Text>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  priceCard: {
    gap: 4,
  },
  eyebrow: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glowStrong,
    letterSpacing: 2,
  },
  title: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 22,
    color: colors.textPrimary,
    ...glowShadow,
  },
  price: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    ...glowShadow,
  },
  priceUnit: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tagline: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  benefitIndex: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.textMuted,
    width: 20,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    gap: 2,
  },
  benefitTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 15,
    color: colors.textPrimary,
    ...glowShadow,
  },
  benefitBody: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
  },
  spacer: {
    marginTop: 6,
  },
  disclaimer: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
