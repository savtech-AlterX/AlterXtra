import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlowButton } from './GlowButton';
import { useAppData } from '../store/AppDataContext';
import { useMascotCue } from '../store/MascotCueContext';
import { useSettings } from '../store/SettingsContext';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

const DELAY_MS = 2000;

const TEASER_POINTS = ['Unlimited identities', 'Unlimited habits', 'Weekly reports', 'Every neon theme'];

/**
 * The mascot's one-time nudge toward Alter-Xtra: it leans, walks to the edge
 * of the screen, holds the reveal pose (see MascotCompanion), and this panel
 * rises once that's done. Same rising-panel mechanism as
 * LimitedBeliefsIntro, condensed — a teaser and a link to the real screen,
 * not the whole page crammed into a sheet.
 *
 * Currently the only thing on Home that triggers on arrival — Limited
 * Beliefs is switched off for now (see index.tsx) so the two don't compete
 * for the same moment.
 */
export function AlterXtraIntro() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data } = useAppData();
  const { settings, isLoaded, setAlterXtraIntroShown } = useSettings();
  const { alterXtraPresentRef, resumeIdleRef } = useMascotCue();

  const [visible, setVisible] = useState(false);
  const rise = useRef(new Animated.Value(0)).current;

  const eligible = isLoaded && !settings.alterXtraIntroShown && !!data.identity;

  useEffect(() => {
    if (!eligible) return;
    const timer = setTimeout(() => {
      // The mascot is held off for now (see _layout.tsx) — when there's no
      // present sequence to wait for, show the panel directly instead of
      // never showing it at all, since this teaser is the actual point,
      // the mascot animation was only ever the lead-in to it.
      if (alterXtraPresentRef.current) {
        alterXtraPresentRef.current(() => setVisible(true));
      } else {
        setVisible(true);
      }
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [eligible, alterXtraPresentRef]);

  useEffect(() => {
    if (!visible) return;
    Animated.spring(rise, { toValue: 1, friction: 8, tension: 60, useNativeDriver: false }).start();
  }, [visible, rise]);

  function dismiss() {
    setAlterXtraIntroShown(true);
    setVisible(false);
    // The mascot has been sitting there faded out since the panel rose —
    // this is what actually hands it back, not a fixed timer that can't
    // know whether the panel is still on screen.
    resumeIdleRef.current?.();
  }

  function viewAlterXtra() {
    dismiss();
    router.push('/alter-xtra');
  }

  if (!visible) return null;

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    // A Modal, not an inline card in Home's scroll — the previous version sat
    // after all seven grid cards, well below the fold, so it was reachable
    // only by scrolling. This docks to the bottom of the actual viewport
    // instead, the same way MilestoneCelebration and LimitedBeliefsIntro sit above
    // whatever Home's scroll position happens to be.
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={dismiss}>
      <View style={styles.wrap} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            { marginBottom: insets.bottom + 16, opacity: rise, transform: [{ translateY }] },
          ]}
        >
          <Pressable onPress={dismiss} hitSlop={10} accessibilityRole="button" accessibilityLabel="Dismiss" style={styles.closeButton}>
            <Ionicons name="close" size={16} color={colors.glow} style={iconGlow} />
          </Pressable>

          <Text style={styles.kicker}>PSST</Text>
          <Text style={[typography.cardTitle, styles.title]}>THERE'S MORE IN ALTER-XTRA</Text>

          <View style={styles.list}>
            {TEASER_POINTS.map((point) => (
              <View key={point} style={styles.listRow}>
                <Ionicons name="checkmark" size={14} color={colors.glow} style={iconGlow} />
                <Text style={styles.listText}>{point}</Text>
              </View>
            ))}
          </View>

          <GlowButton label="TAKE A LOOK" onPress={viewAlterXtra} style={styles.spacer} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
    },
    card: {
      borderWidth: 1,
      borderColor: colors.glowStrong,
      borderRadius: 20,
      backgroundColor: colors.panelSolid,
      padding: 20,
      shadowColor: colors.glow,
      shadowOpacity: 0.4,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 0 },
    },
    closeButton: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 30,
      height: 30,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    kicker: {
      fontFamily: typography.label.fontFamily,
      fontSize: 11,
      letterSpacing: 2,
      color: colors.glow,
    },
    title: {
      fontSize: 18,
      marginTop: 2,
      paddingRight: 30,
    },
    list: {
      gap: 8,
      marginTop: 14,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    listText: {
      fontFamily: typography.body.fontFamily,
      fontSize: 14,
      color: colors.textSecondary,
    },
    spacer: {
      marginTop: 16,
    },
  });
