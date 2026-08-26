import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlowButton } from './GlowButton';
import { LimitedBeliefFields } from './LimitedBeliefFields';
import { useAppData } from '../store/AppDataContext';
import { useSettings } from '../store/SettingsContext';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

const DELAY_MS = 2500;
const BURST_SIZE = 70;
const BURST_IN_MS = 260;
const BURST_OUT_MS = 340;
// Panel starts rising once the burst has peaked — if both ran together, the
// panel's own 88%-height body would cover the burst's position almost
// immediately, and the light-burst gesture would never actually be seen.
const PANEL_START_MS = 220;

/**
 * Limited Beliefs used to be a mandatory onboarding screen — asking a brand
 * new user to name what's broken in them before they'd had a single win in
 * the app. It's surfaced here instead: a panel that rises over most of Home
 * a few seconds after your first arrival, so there's at least a homepage
 * behind you before this question shows up.
 */
export function LimitedBeliefsIntro() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data, addLimitedBelief } = useAppData();
  const { settings, isLoaded, setLimitedBeliefsIntroShown } = useSettings();

  // Two phases: the gesture plays alone, against the still-fully-visible
  // Home screen, then the panel rises. gestureActive covers both — it's what
  // keeps the Modal mounted from the moment the burst starts.
  const [gestureActive, setGestureActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [belief, setBelief] = useState('');
  const [origin, setOrigin] = useState('');
  const [replacement, setReplacement] = useState('');

  const rise = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;

  const eligible = isLoaded && !settings.limitedBeliefsIntroShown && !!data.identity;

  useEffect(() => {
    if (!eligible) return;
    const openTimer = setTimeout(() => {
      setGestureActive(true);
      Animated.sequence([
        Animated.timing(burst, { toValue: 1, duration: BURST_IN_MS, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(burst, { toValue: 0, duration: BURST_OUT_MS, easing: Easing.in(Easing.quad), useNativeDriver: false }),
      ]).start();
    }, DELAY_MS);
    return () => clearTimeout(openTimer);
  }, [eligible, burst]);

  useEffect(() => {
    if (!gestureActive) return;
    const panelTimer = setTimeout(() => setVisible(true), PANEL_START_MS);
    return () => clearTimeout(panelTimer);
  }, [gestureActive]);

  useEffect(() => {
    if (!visible) return;
    Animated.timing(rise, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [visible, rise]);

  function dismiss() {
    setLimitedBeliefsIntroShown(true);
    setVisible(false);
    setGestureActive(false);
  }

  function skip() {
    dismiss();
  }

  function save() {
    if (belief.trim() || origin.trim() || replacement.trim()) {
      addLimitedBelief(belief.trim(), origin.trim(), replacement.trim());
    }
    dismiss();
  }

  if (!gestureActive && !visible) return null;

  const canSave = belief.trim().length > 0 && replacement.trim().length > 0;
  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });
  const burstOpacity = burst.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] });
  const burstScale = burst.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.6] });
  const burstLeft = width / 2 - BURST_SIZE / 2;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={skip}>
      {/* The gesture: a burst of light from the bottom-center of the screen.
          Rendered — and fully visible, nothing drawn over it yet — before
          the panel exists at all, so it reads as the panel's source rather
          than something the panel immediately buries. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.burst,
          {
            left: burstLeft,
            bottom: insets.bottom + 70,
            opacity: burstOpacity,
            transform: [{ scale: burstScale }],
          },
        ]}
      />

      {visible && <Animated.View style={[styles.scrim, { opacity: rise }]} />}

      {visible && (
        <Animated.View style={[styles.panel, { paddingBottom: insets.bottom + 20, transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.kicker}>BEFORE YOU CONTINUE</Text>
              <Text style={[typography.cardTitle, styles.title]}>A BELIEF WORTH REWIRING</Text>
            </View>
            <Pressable
              onPress={skip}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Skip for now"
              style={styles.closeButton}
            >
              <Ionicons name="close" size={18} color={colors.glow} style={iconGlow} />
            </Pressable>
          </View>

          <Text style={styles.body}>
            Somewhere you're holding a belief that isn't true anymore. Naming one now — and what replaces it —
            is how the rewiring starts.
          </Text>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <LimitedBeliefFields
              belief={belief}
              onBeliefChange={setBelief}
              origin={origin}
              onOriginChange={setOrigin}
              replacement={replacement}
              onReplacementChange={setReplacement}
            />
          </ScrollView>

          <GlowButton label="SAVE AND CONTINUE" disabled={!canSave} onPress={save} style={styles.spacer} />
          <GlowButton label="SKIP FOR NOW" variant="outline" onPress={skip} />
        </Animated.View>
      )}
    </Modal>
  );
}

const makeStyles = ({ colors, typography, glowShadow }: AppTheme) =>
  StyleSheet.create({
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    burst: {
      position: 'absolute',
      width: BURST_SIZE,
      height: BURST_SIZE,
      borderRadius: BURST_SIZE / 2,
      backgroundColor: colors.glowStrong,
      shadowColor: colors.glowStrong,
      shadowOpacity: 0.95,
      shadowRadius: 40,
      shadowOffset: { width: 0, height: 0 },
    },
    panel: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '88%',
      backgroundColor: colors.panelSolid,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderTopWidth: 1,
      borderColor: colors.glowStrong,
      paddingHorizontal: 22,
      paddingTop: 14,
      shadowColor: colors.glow,
      shadowOpacity: 0.4,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: -6 },
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderDim,
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    kicker: {
      fontFamily: typography.label.fontFamily,
      fontSize: 11,
      letterSpacing: 2,
      color: colors.glow,
    },
    title: {
      fontSize: 19,
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      fontFamily: typography.body.fontFamily,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      marginTop: 12,
      marginBottom: 14,
    },
    scroll: {
      flex: 1,
    },
    spacer: {
      marginTop: 14,
    },
  });
