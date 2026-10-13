import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useSyncExternalStore } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../src/components/GlowButton';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { StackHeader } from '../src/components/StackHeader';
import { ThemePicker } from '../src/components/ThemePicker';
import { useAlterXtra } from '../src/lib/entitlements';
import { purchases } from '../src/lib/purchases';
import { useAppTheme, useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'people-outline',
    title: 'Unlimited Identities',
    body: 'Create and manage as many identities as you want.',
  },
  {
    icon: 'mail-open-outline',
    title: 'Future Self',
    body: 'Seal letters and record video messages to the person you’re becoming, locked until the date you choose.',
  },
  {
    icon: 'locate-outline',
    title: 'Unlimited Habits',
    body: 'Add and track unlimited habits to build who you want to become.',
  },
  {
    icon: 'bulb-outline',
    title: 'Unlimited Limited Beliefs',
    body: 'Rewire as many limiting beliefs as you need to, with no cap on your rewiring log.',
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
  const owned = useAlterXtra();
  const store = useSyncExternalStore(purchases.subscribe, purchases.getSnapshot, purchases.getSnapshot);
  const purchaseDisabled = Platform.OS !== 'ios' || !store.connected || !store.price || store.busy;

  const themesBlock = (
    <View key="themes">
      <Text style={typography.label}>XTRA.THEMES</Text>
      <Text style={styles.themeHint}>
        {owned
          ? 'Every colour is unlocked. Tap one to try it on.'
          : "Blue and Navy are free. The rest unlock with Alter-Xtra."}
      </Text>
      <ThemePicker />
    </View>
  );

  return (
    <HudScreen>
      <StackHeader title="ALTER-XTRA" />

      <GlowCard strong style={styles.priceCard}>
        <View style={styles.accessRow}>
          <View style={styles.accessLine} />
          <Text style={styles.eyebrow}>LIFETIME ACCESS</Text>
        </View>
        <Text style={styles.title}>Alter-Xtra</Text>
        {owned ? (
          <Text style={styles.tagline}>You own Alter-Xtra. Every perk below is already yours.</Text>
        ) : (
          <>
            <Text style={[styles.price, !store.price && styles.pricePending]} accessibilityLabel={store.price ? `Price: ${store.price}, one-time unlock` : undefined}>{store.price ?? (Platform.OS === 'ios' ? (store.message ? 'Price unavailable' : 'Loading price…') : 'Available on iPhone')}</Text>
            <Text style={styles.priceUnit}>ONE PURCHASE. YOURS TO KEEP.</Text>
            <Text style={styles.tagline}>
              Buy it once and keep it. No subscription, no recurring fees.
            </Text>
          </>
        )}
        {!owned && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={store.price ? `Buy Alter-Xtra for ${store.price}, one-time purchase` : 'Buy Alter-Xtra, price unavailable'}
            accessibilityState={{ disabled: purchaseDisabled, busy: store.busy }}
            style={({ pressed }) => [styles.purchaseButton, purchaseDisabled && styles.purchaseDisabled, pressed && styles.purchasePressed]}
            disabled={purchaseDisabled}
            onPress={() => { void purchases.buy(); }}
          >
            <LinearGradient
              colors={['#315FFF', '#2455FF', '#1537B8']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.purchaseSurface}
            >
              <View pointerEvents="none" style={styles.purchaseHighlight} />
              <Text style={styles.purchaseLabel}>
                {Platform.OS !== 'ios' ? 'AVAILABLE ON IPHONE' : store.busy ? 'PLEASE WAIT…' : 'BUY ALTER-XTRA'}
              </Text>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        )}
        {store.message && (
          <Text accessibilityRole="alert" style={styles.storeMessage}>{store.message}</Text>
        )}
        {Platform.OS === 'ios' && !store.busy && (!store.connected || !store.price) && (
          <GlowButton label="RELOAD PRICE" variant="outline"
            onPress={() => { void purchases.retry(); }} />
        )}
        {Platform.OS === 'ios' && (
          <Pressable accessibilityRole="button" accessibilityLabel="Restore purchases"
            accessibilityState={{ disabled: !store.connected || store.busy }}
            style={({ pressed }) => [styles.restoreButton, (pressed || !store.connected || store.busy) && styles.purchaseDisabled]}
            disabled={!store.connected || store.busy}
            onPress={() => { void purchases.restore(); }}>
            <Text style={styles.restoreLabel}>Restore purchases</Text>
          </Pressable>
        )}
      </GlowCard>

      <Image
        source={require('../assets/alter-xtra/unlimited-identities-banner.jpg')}
        style={styles.banner}
        resizeMode="cover"
        accessibilityLabel="Five glowing silhouettes, each a different identity you could become"
      />

      {themesBlock}

      <Text style={[typography.label, styles.spacer]}>XTRA.BENEFITS</Text>

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


    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  banner: {
    width: '100%',
    height: 175,
    borderRadius: 16,
  },
  priceCard: {
    gap: 8,
    padding: 24,
    backgroundColor: '#000000',
    borderColor: '#2455FF',
    borderRadius: 20,
    shadowColor: '#2455FF',
    shadowOpacity: 0.3,
    shadowRadius: 22,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  accessLine: {
    width: 24,
    height: 2,
    backgroundColor: '#2455FF',
  },
  eyebrow: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: '#8EA8FF',
    letterSpacing: 2,
  },
  title: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 26,
    color: colors.textPrimary,
    ...glowShadow,
  },
  price: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 40,
    color: colors.textPrimary,
    marginTop: 4,
    ...glowShadow,
  },
  priceUnit: {
    fontFamily: typography.body.fontFamily,
    fontSize: 10,
    letterSpacing: 1.6,
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
  purchaseButton: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#2455FF',
    shadowOpacity: 0.6,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  purchaseSurface: {
    minHeight: 76,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7895FF',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  purchaseHighlight: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  purchaseLabel: {
    fontFamily: typography.bodyStrong.fontFamily,
    fontSize: 17,
    letterSpacing: 1.8,
    lineHeight: 24,
    color: '#FFFFFF',
    flex: 1,
  },
  purchaseDisabled: {
    opacity: 0.65,
  },
  purchasePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  pricePending: {
    fontSize: 22,
  },
  restoreButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  storeMessage: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});
