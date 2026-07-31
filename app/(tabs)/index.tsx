import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { IdentityMark } from '../../src/components/IdentityMark';
import { useAppData } from '../../src/store/AppDataContext';
import { colors } from '../../src/theme/colors';
import { glowShadow, iconGlow, typography } from '../../src/theme/typography';

function IconBox({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.iconBox} onPress={onPress}>
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
  return (
    <GlowCard containerStyle={styles.gridCardContainer} style={styles.gridCard} onPress={onPress}>
      <Ionicons name={icon} size={26} color={colors.glow} style={iconGlow} />
      <Text style={styles.gridTitle}>{title}</Text>
      <Text style={styles.gridSubtitle}>{subtitle}</Text>
    </GlowCard>
  );
}

export default function Home() {
  const router = useRouter();
  const { data } = useAppData();
  const identity = data.identity;

  return (
    <HudScreen>
      <View style={styles.topRow}>
        <IconBox icon="create-outline" label="QUICK NOTES" />
        <View style={styles.wordmarkBlock}>
          <Text style={[typography.wordmark, styles.wordmark]}>ALTER X</Text>
          <Text style={styles.wordmarkSubtitle}>IDENTITY TRANSFORMATION</Text>
        </View>
        <Pressable style={styles.iconBox}>
          <MaterialCommunityIcons name="crown-outline" size={20} color={colors.glow} style={iconGlow} />
          <Text style={styles.iconBoxLabel}>ALTER-XTRA</Text>
        </Pressable>
      </View>

      <View>
        <Text style={styles.welcome}>Welcome back, {identity?.name ?? 'there'}</Text>
        <Text style={[typography.cardTitle, styles.archetype]}>
          {(identity?.archetype ?? 'UNDEFINED').toUpperCase()}
        </Text>
      </View>

      <GlowCard strong style={styles.hero}>
        <LinearGradient
          colors={['transparent', colors.glowStrong, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.heroAccentLine}
        />
        <View style={styles.heroIcon}>
          <IdentityMark size={50} />
        </View>
        <Text style={[typography.cardTitle, styles.heroTitle]}>LIFESTYLE{'\n'}REPROGRAMMING</Text>
        <Text style={styles.heroTagline}>build your reality</Text>
        <Pressable style={styles.heroArrow} onPress={() => router.push('/onboarding/identity')}>
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
          onPress={() => router.push('/(tabs)/diary')}
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
      </View>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  iconBox: {
    width: 68,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  iconBoxLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 8,
    color: colors.glow,
    textAlign: 'center',
  },
  wordmarkBlock: {
    alignItems: 'center',
    gap: 2,
  },
  wordmark: {
    fontSize: 22,
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
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.glowStrong,
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
