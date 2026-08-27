import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlterXtraIntro } from '../../src/components/AlterXtraIntro';
import { FreshStartBanner } from '../../src/components/FreshStartBanner';
import { GlowCard } from '../../src/components/GlowCard';
import { GoalCountdownBar } from '../../src/components/GoalCountdownBar';
import { HudScreen } from '../../src/components/HudScreen';
import { IdentityVoiceNudge } from '../../src/components/IdentityVoiceNudge';
import { IdentityMarkRing } from '../../src/components/IdentityMarkRing';
import { LimitedBeliefsIntro } from '../../src/components/LimitedBeliefsIntro';

// Off for now — the Alter-Xtra teaser panel took its place on Home so the
// two don't compete for the same moment. Flip back to true to restore it;
// nothing else needs to change.
const LIMITED_BELIEFS_INTRO_ENABLED = false;
import { useAppData } from '../../src/store/AppDataContext';
import { useSettings } from '../../src/store/SettingsContext';
import { wordmarkSource } from '../../src/lib/avatar';
import { useThemeControls } from '../../src/theme/ThemeContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

function IconBox({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable style={styles.iconBox} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={17} color={colors.glow} style={iconGlow} />
      <Text style={styles.iconBoxLabel}>{label}</Text>
    </Pressable>
  );
}

function GridCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <GlowCard containerStyle={styles.gridCardContainer} style={styles.gridCard} onPress={onPress}>
      <Ionicons name={icon} size={18} color={colors.glow} style={iconGlow} />
      <Text style={styles.gridTitle}>{title}</Text>
      {/* Two lines are reserved whether or not they're used, so cards sitting
          side by side in the wrapped grid always line up. */}
      <Text style={styles.gridSubtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </GlowCard>
  );
}

export default function Home() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data } = useAppData();
  const { settings } = useSettings();
  const { theme } = useThemeControls();
  const identity = data.identity;
  // Same goal the Goals screen treats as primary: the oldest one.
  const primaryGoal = data.goals.length > 0 ? data.goals[data.goals.length - 1] : null;

  return (
    <HudScreen style={styles.screen}>
      <View style={styles.topRow}>
        <IconBox icon="create-outline" label="QUICK NOTES" onPress={() => router.push('/quick-notes')} />
        <View style={styles.wordmarkBlock}>
          <Image source={wordmarkSource()} style={[styles.wordmarkImage, { tintColor: colors.glow }]} resizeMode="contain" />
          <Text style={styles.wordmarkSubtitle}>IDENTITY TRANSFORMATION</Text>
        </View>
        <View style={styles.rightIcons}>
          <Pressable
            style={styles.iconBoxSmall}
            onPress={() => router.push('/limited-beliefs')}
            accessibilityRole="button"
            accessibilityLabel="Limited Beliefs"
          >
            <Ionicons name="bulb-outline" size={16} color={colors.glow} style={iconGlow} />
            <Text style={styles.iconBoxLabel}>LB</Text>
          </Pressable>
          <Pressable
            style={styles.iconBoxSmall}
            onPress={() => router.push('/alter-xtra')}
            accessibilityRole="button"
            accessibilityLabel="Alter-Xtra"
          >
            <MaterialCommunityIcons name="crown-outline" size={16} color={colors.glow} style={iconGlow} />
            <Text style={styles.iconBoxLabel}>XTRA</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <Text style={styles.welcome}>
          {identity?.name ? `Welcome back, ${identity.name}` : 'Welcome back'}
        </Text>
        {/* No archetype yet is a normal state, not a value to print. */}
        {!!identity?.archetype && (
          <Text style={[typography.cardTitle, styles.archetype]}>
            {identity.archetype.toUpperCase()}
          </Text>
        )}
      </View>

      <FreshStartBanner />
      <IdentityVoiceNudge />

      {settings.showGoalBarOnHome && primaryGoal && <GoalCountdownBar goal={primaryGoal} />}

      <GlowCard strong style={styles.hero}>
        <LinearGradient
          colors={['transparent', colors.glowStrong, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.heroAccentLine}
        />
        <IdentityMarkRing size={60} style={styles.heroIcon} />
        <Text style={[typography.cardTitle, styles.heroTitle]}>LIFESTYLE{'\n'}REPROGRAMMING</Text>
        <Text style={styles.heroTagline}>build your reality</Text>
        <Pressable
          style={styles.heroArrow}
          onPress={() => router.push('/habit-reprogramming')}
          accessibilityRole="button"
          accessibilityLabel="Open Habit Reprogramming"
        >
          <Ionicons name="arrow-forward" size={16} color={colors.glow} style={iconGlow} />
        </Pressable>
      </GlowCard>

      <View style={styles.grid}>
        <GridCard
          icon="camera"
          title="Photos"
          subtitle="Identity album"
          onPress={() => router.push('/photos')}
        />
        <GridCard
          icon="book"
          title="Diary"
          subtitle="Journey reflections"
          onPress={() => router.push('/diary/journal')}
        />
        <GridCard
          icon="videocam"
          title="Future Self"
          subtitle="Letters & video messages"
          onPress={() => router.push('/diary/future-self')}
        />
        <GridCard
          icon="flag"
          title="Goals"
          subtitle="Objectives & steps"
          onPress={() => router.push('/(tabs)/goals')}
        />
        <GridCard
          icon="clipboard"
          title="Log Book"
          subtitle="Training log"
          onPress={() => router.push('/(tabs)/logbook')}
        />
        <GridCard
          icon="calendar"
          title="Calendar"
          subtitle="Your activity by day"
          onPress={() => router.push('/calendar')}
        />
        <GridCard
          icon="trending-up"
          title="Growth"
          subtitle="See how far you've come"
          onPress={() => router.push('/growth')}
        />
        <GridCard
          icon="settings-sharp"
          title="Settings"
          subtitle="Lock, reminders, backup"
          onPress={() => router.push('/(tabs)/settings')}
        />
      </View>

      <AlterXtraIntro />
      {LIMITED_BELIEFS_INTRO_ENABLED && <LimitedBeliefsIntro />}
    </HudScreen>
  );
}

// Sized to fit the header, hero card, and all 8 grid cards on one screen
// with no scrolling, down to a 667pt-tall device (iPhone SE) — the
// original sizing (32pt hero padding, 130pt identity ring, 16pt grid
// titles, HudScreen's default 16pt gap between every block) added up to
// well past a phone's fold, forcing a scroll the reference design doesn't
// show.
const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  // Overrides HudScreen's default 16pt gap between top-level blocks (topRow,
  // welcome text, hero, grid) — with four of those on one screen, the
  // default gap alone was costing 48pt of the fold. Also trims HudScreen's
  // default 40pt bottom padding (sized for shorter, scrolling screens) down
  // to what a fixed non-scrolling screen actually needs.
  screen: {
    gap: 8,
    paddingTop: 12,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  iconBox: {
    width: 50,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 4,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBoxSmall: {
    width: 40,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconBoxLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 7,
    color: colors.glow,
    textAlign: 'center',
  },
  wordmarkBlock: {
    alignItems: 'center',
    gap: 2,
  },
  wordmarkImage: {
    width: 120,
    height: 23,
  },
  wordmarkSubtitle: {
    fontFamily: typography.label.fontFamily,
    fontSize: 8,
    color: colors.glowStrong,
    letterSpacing: 2,
  },
  welcome: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.glow,
  },
  archetype: {
    fontSize: 15,
    marginTop: 1,
  },
  hero: {
    alignItems: 'center',
    padding: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  heroAccentLine: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2,
  },
  heroIcon: {
    marginBottom: 6,
  },
  heroTitle: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 18,
  },
  heroTagline: {
    fontFamily: typography.body.fontFamily,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.accentTeal,
    marginTop: 2,
    marginBottom: 5,
  },
  heroArrow: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridCardContainer: {
    width: '47%',
  },
  gridCard: {
    gap: 2,
    padding: 8,
  },
  gridTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 1,
    ...glowShadow,
  },
  gridSubtitle: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 10,
    lineHeight: 12,
    height: 24, // exactly two lines — the grid's alignment depends on it
    color: colors.textSecondary,
  },
});
