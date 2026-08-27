import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../src/components/GlowButton';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { StackHeader } from '../src/components/StackHeader';
import { ThemePicker } from '../src/components/ThemePicker';
import { useAppTheme, useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

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
  {
    icon: 'calendar-outline',
    title: 'Full-Year Activity Map',
    body: 'See your whole journey at a glance with a year-long activity heatmap, not just the last few weeks.',
  },
  {
    icon: 'sparkles-outline',
    title: 'Personal Insights',
    body: 'Real patterns pulled from your own data — your most consistent days, and what actually correlates with staying aligned.',
  },
  {
    icon: 'flame-outline',
    title: 'Personal-Best Streaks',
    body: 'Your all-time best streak is tracked alongside your current one, so a bad day never erases the record you set.',
  },
  {
    icon: 'share-social-outline',
    title: 'Shareable Progress Reports',
    body: 'Export a snapshot of your growth anytime — streaks, beliefs rewired, goals hit — to share or keep.',
  },
  {
    icon: 'time-outline',
    title: 'App Open Activity',
    body: 'See exactly when and how often you open AlterX — total opens, this week’s count, your open streak, and your most active time of day.',
  },
];

export default function AlterXtra() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <HudScreen>
      <StackHeader title="ALTER-XTRA" />

      <GlowCard strong style={styles.priceCard}>
        <Text style={styles.eyebrow}>ALTER X</Text>
        <Text style={styles.title}>Alter-Xtra</Text>
        <Text style={styles.price}>$17.99 <Text style={styles.priceUnit}>one-time unlock</Text></Text>
        <Text style={styles.tagline}>
          Buy it once and keep it. No subscription, and nothing you've written ever expires.
        </Text>
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

      <Text style={[typography.label, styles.spacer]}>XTRA.THEMES</Text>
      <Text style={styles.themeHint}>Tap a theme to try it on. Your choice applies across the whole app.</Text>
      <ThemePicker />

      {/* Deliberately not a button. A live-looking purchase control with no
          purchase behind it is the single thing that would fail App Store
          review, so there is nothing to tap until in-app purchases are wired. */}
      <Text style={[styles.disclaimer, styles.spacer]}>
        Alter-Xtra isn't on sale yet. Every theme above is free to use in the meantime.
      </Text>
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
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
    lineHeight: 20,
    color: colors.textSecondary,
  },
  tagline: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
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
    lineHeight: 19,
    color: colors.textSecondary,
  },
  themeHint: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    marginTop: -6,
  },
  spacer: {
    marginTop: 6,
  },
  disclaimer: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
