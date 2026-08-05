import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowCard } from '../../src/components/GlowCard';
import { GoalCountdownBar } from '../../src/components/GoalCountdownBar';
import { HudScreen } from '../../src/components/HudScreen';
import { IdentityMarkRing } from '../../src/components/IdentityMarkRing';
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
      <Ionicons name={icon} size={20} color={colors.glow} style={iconGlow} />
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
      <Ionicons name={icon} size={26} color={colors.glow} style={iconGlow} />
      <Text style={styles.gridTitle}>{title}</Text>
      <Text style={styles.gridSubtitle}>{subtitle}</Text>
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
    <HudScreen>
      <View style={styles.topRow}>
        <IconBox icon="create-outline" label="QUICK NOTES" onPress={() => router.push('/quick-notes')} />
        <View style={styles.wordmarkBlock}>
          <Image source={wordmarkSource(theme)} style={styles.wordmarkImage} resizeMode="contain" />
          <Text style={styles.wordmarkSubtitle}>IDENTITY TRANSFORMATION</Text>
        </View>
        <View style={styles.rightIcons}>
          <Pressable
            style={styles.iconBoxSmall}
            onPress={() => router.push('/limited-beliefs')}
            accessibilityRole="button"
            accessibilityLabel="Limited Beliefs"
          >
            <Ionicons name="bulb-outline" size={18} color={colors.glow} style={iconGlow} />
            <Text style={styles.iconBoxLabel}>LB</Text>
          </Pressable>
          <Pressable
            style={styles.iconBoxSmall}
            onPress={() => router.push('/alter-xtra')}
            accessibilityRole="button"
            accessibilityLabel="Alter-Xtra"
          >
            <MaterialCommunityIcons name="crown-outline" size={18} color={colors.glow} style={iconGlow} />
            <Text style={styles.iconBoxLabel}>XTRA</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <Text style={styles.welcome}>Welcome back, {identity?.name ?? 'there'}</Text>
        <Text style={[typography.cardTitle, styles.archetype]}>
          {(identity?.archetype ?? 'UNDEFINED').toUpperCase()}
        </Text>
      </View>

      {settings.showGoalBarOnHome && primaryGoal && <GoalCountdownBar goal={primaryGoal} />}

      <GlowCard strong style={styles.hero}>
        <LinearGradient
          colors={['transparent', colors.glowStrong, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.heroAccentLine}
        />
        <IdentityMarkRing size={130} style={styles.heroIcon} />
        <Text style={[typography.cardTitle, styles.heroTitle]}>LIFESTYLE{'\n'}REPROGRAMMING</Text>
        <Text style={styles.heroTagline}>build your reality</Text>
        <Pressable
          style={styles.heroArrow}
          onPress={() => router.push('/habit-reprogramming')}
          accessibilityRole="button"
          accessibilityLabel="Open Habit Reprogramming"
        >
          <Ionicons name="arrow-forward" size={20} color={colors.glow} style={iconGlow} />
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
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  iconBox: {
    width: 58,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBoxSmall: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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
    width: 150,
    height: 29,
  },
  wordmarkSubtitle: {
    fontFamily: typography.label.fontFamily,
    fontSize: 9,
    color: colors.glowStrong,
    letterSpacing: 3,
  },
  welcome: {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    color: colors.glow,
  },
  archetype: {
    marginTop: 2,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
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
    marginBottom: 18,
  },
  heroTitle: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
  },
  heroTagline: {
    fontFamily: typography.body.fontFamily,
    fontStyle: 'italic',
    color: colors.accentTeal,
    marginTop: 8,
    marginBottom: 20,
  },
  heroArrow: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  gridCardContainer: {
    width: '47%',
  },
  gridCard: {
    gap: 6,
  },
  gridTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 4,
    ...glowShadow,
  },
  gridSubtitle: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
