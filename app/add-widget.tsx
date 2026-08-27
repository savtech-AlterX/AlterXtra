import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { StackHeader } from '../src/components/StackHeader';
import { useAppTheme, useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBubble}>
        <Text style={styles.stepNumber}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{children}</Text>
    </View>
  );
}

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <GlowCard style={styles.section}>
      <Text style={typography.label}>{title}</Text>
      <View style={styles.steps}>{children}</View>
    </GlowCard>
  );
}

export default function AddWidget() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <HudScreen>
      <StackHeader title="ADD WIDGET" />

      <GlowCard style={styles.intro}>
        <Ionicons name="apps-outline" size={28} color={colors.glow} style={iconGlow} />
        <Text style={styles.introText}>
          Add the AlterX widget to start or stop an identity session with one tap — right from your{' '}
          {Platform.OS === 'ios' ? 'Lock Screen or Home Screen' : 'Home Screen'}, no need to open the app.
        </Text>
      </GlowCard>

      {Platform.OS === 'ios' && (
        <>
          <GuideSection title="LOCK SCREEN WIDGET">
            <Step number={1}>Lock your iPhone, then touch and hold the Lock Screen until Customize appears.</Step>
            <Step number={2}>Tap Customize, then tap the widget area below the clock.</Step>
            <Step number={3}>Tap Add Widgets, then search for AlterX.</Step>
            <Step number={4}>Tap it to add it, pick a style, then tap Done.</Step>
          </GuideSection>

          <GuideSection title="HOME SCREEN WIDGET">
            <Step number={1}>Touch and hold an empty area of your Home Screen until the apps jiggle.</Step>
            <Step number={2}>Tap the + button in the top corner.</Step>
            <Step number={3}>Search for AlterX, pick a size, then tap Add Widget.</Step>
            <Step number={4}>Drag it wherever you'd like, then tap Done.</Step>
          </GuideSection>
        </>
      )}

      {Platform.OS === 'android' && (
        <GuideSection title="HOME SCREEN WIDGET">
          <Step number={1}>Touch and hold an empty area of your Home Screen.</Step>
          <Step number={2}>Tap Widgets.</Step>
          <Step number={3}>Find AlterX in the list, then touch and hold its widget.</Step>
          <Step number={4}>Drag it onto your Home Screen and drop it wherever you'd like.</Step>
        </GuideSection>
      )}

      {Platform.OS === 'web' && (
        <GlowCard style={styles.section}>
          <Text style={styles.stepText}>
            Widgets are only available on the iOS and Android apps, not in the web preview.
          </Text>
        </GlowCard>
      )}

      <Text style={styles.footnote}>
        This is a standard iOS/Android step required for every app's widgets — Apple and Google don't allow
        any app to add itself to your Home Screen or Lock Screen automatically.
      </Text>
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow }: AppTheme) =>
  StyleSheet.create({
    intro: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    introText: {
      flex: 1,
      fontFamily: typography.bodyMuted.fontFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },
    section: {
      gap: 10,
    },
    steps: {
      gap: 12,
      marginTop: 4,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    stepBubble: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.glow,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    stepNumber: {
      fontFamily: typography.label.fontFamily,
      fontSize: 11,
      color: colors.glow,
      ...glowShadow,
    },
    stepText: {
      flex: 1,
      fontFamily: typography.bodyMuted.fontFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textPrimary,
    },
    footnote: {
      fontFamily: typography.bodyMuted.fontFamily,
      fontSize: 11,
      lineHeight: 16,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 4,
    },
  });
