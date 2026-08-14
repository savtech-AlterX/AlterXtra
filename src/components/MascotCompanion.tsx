import { usePathname } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../store/AppDataContext';
import { useMascotCue } from '../store/MascotCueContext';
import { useSettings } from '../store/SettingsContext';
import { useThemeControls } from '../theme/ThemeContext';
import { computeGrowthStats } from '../lib/growth';
import { buildMascotMessagePool, pickMascotMessage } from '../lib/mascotMessages';
import { AVATAR_ASPECT, avatarSource, poseSource, sideStandSource, walkFrameSource } from '../lib/avatar';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

// 62px used to crush the artwork's linework into an unreadable smudge —
// verified by rendering both sizes and comparing. 90px is the smallest width
// where the coat, collar and face still read.
const FIGURE_WIDTH = 90;
// Every pose is sized to this HEIGHT, with its width derived from its own
// aspect. Sizing by width instead (what this used to do) silently shrank the
// character whenever it changed pose — a lean or a walk frame is a wider,
// shorter image than a standing figure, so at a fixed width it rendered
// noticeably shorter than the figure it had just been.
const FIGURE_HEIGHT = FIGURE_WIDTH * AVATAR_ASPECT;
// The on-screen slot the figure occupies. Wider than the standing figure
// because a mid-stride walk frame is wider than it is — keeping the slot at
// 90 would let the leading leg clip off the right edge of the screen.
const SLOT_WIDTH = 132;

const WALK_SPEED = 30; // px per second
const STEP_MS = 300; // one stride, so the bob reads as footfalls
const BOB_HEIGHT = 3.5;
const LEAN_DEG = 2.5;
const IDLE_MIN_MS = 2000;
const IDLE_MAX_MS = 5200;
const WALK_MIN_MS = 2500;
const WALK_MAX_MS = 6000;
const MESSAGE_VISIBLE_MS = 4000;
const PRESENT_GLOW_SIZE = FIGURE_WIDTH * 1.5;
const LEAN_HOLD_MS = 900;
const REVEAL_HOLD_MS = 1400;
const RESUME_IDLE_DELAY_MS = 400;
// One drawn frame per half-stride, matching the footfall bob's cadence so the
// art and the bob stay in phase rather than drifting against each other.
const WALK_FRAME_MS = STEP_MS / 2;

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * A companion that walks the floor.
 *
 * The art is a single static image, so there are no moving legs to animate —
 * the sense of walking has to come from motion cues instead:
 *   - a contact shadow pinned to the floor line, which never bobs, so the
 *     figure reads as standing ON something rather than hovering over it
 *   - a footfall bob that runs ONLY while travelling; standing still means
 *     standing perfectly still (a bob while stationary is what made the
 *     earlier version look like it was floating)
 *   - the shadow tightening on each footfall, and a slight forward lean
 */
export function MascotCompanion() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const { data } = useAppData();
  const { theme } = useThemeControls();
  const { settings, isLoaded } = useSettings();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { xRef, presentRef, alterXtraPresentRef } = useMascotCue();
  const pathname = usePathname();

  const floor = insets.bottom + 10;
  const maxX = Math.max(0, width - SLOT_WIDTH);

  // Starts pinned to the left edge, not centred, per the brief — everything
  // downstream (the idle wander loop, the present sequence) already reads
  // position off this ref, so nothing else needed to change.
  const x = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const xValue = useRef(0);
  const [facingLeft, setFacingLeft] = useState(false);
  const [walking, setWalking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Separate from phaseTimer on purpose: setMode('presenting') triggers the
  // idle-loop effect's cleanup asynchronously (after this function returns,
  // once React re-renders), and that cleanup unconditionally clears
  // phaseTimer.current. Sharing one ref meant the cleanup was silently
  // cancelling the walk-transition timer this function had just scheduled —
  // the sequence got stuck holding the lean pose forever. Caught by actually
  // watching it run in a browser, not by reading the code.
  const presentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkAnim = useRef<Animated.CompositeAnimation | null>(null);
  const bobLoop = useRef<Animated.CompositeAnimation | null>(null);

  // 'idle' is the normal random wander loop below. 'presenting' pauses it for
  // the one-time lean -> walk -> reveal sequence toward Alter-Xtra — mode and
  // modeRef stay in lockstep so the idle-loop effect (reads state, re-runs on
  // change) and the imperative sequence function (reads the ref, no re-render
  // needed) always agree on which one is currently in control.
  const [mode, setMode] = useState<'idle' | 'presenting'>('idle');
  const modeRef = useRef<'idle' | 'presenting'>('idle');
  const [presentPhase, setPresentPhase] = useState<'lean' | 'walking' | 'reveal'>('lean');
  // Swapping figureSource straight (lean art -> plain standing figure ->
  // reveal art) is an instant pop with no motion to soften it, unlike a
  // walk which eases frame to frame. A quick fade through black hides the
  // cut instead of pretending the two poses connect.
  const poseFade = useRef(new Animated.Value(1)).current;
  const [walkFrame, setWalkFrame] = useState(0);

  // The reprogramming-identity screen sets data.identity moments before
  // navigating here — without this the companion would already be visible
  // and pacing behind that screen's own progress bar.
  const visible = isLoaded && settings.mascotEnabled && !!data.identity && pathname !== '/onboarding/loading';

  // Fires on every pose change, including into/out of 'presenting' — each
  // one is a different piece of art now, not a continuation of the last.
  useEffect(() => {
    poseFade.setValue(0);
    Animated.timing(poseFade, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [mode, presentPhase, poseFade]);

  useEffect(() => {
    const id = x.addListener(({ value }) => {
      xValue.current = value;
      // Centre of the figure, not its left edge — so anything cueing off this
      // (like the Limited Beliefs panel) points at where the figure actually
      // is, not a spot half its width away from it.
      xRef.current = value + SLOT_WIDTH / 2;
    });
    return () => x.removeListener(id);
  }, [x, xRef]);

  // Lets something elsewhere in the tree (the Limited Beliefs panel on Home)
  // ask the mascot to visibly react, without either side knowing the other's
  // internals — see MascotCueContext.
  const triggerPulse = useCallback(() => {
    pulse.setValue(0);
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(pulse, { toValue: 0, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver: false }),
    ]).start();
  }, [pulse]);

  useEffect(() => {
    if (!visible) return;
    presentRef.current = triggerPulse;
    return () => {
      if (presentRef.current === triggerPulse) presentRef.current = null;
    };
  }, [visible, presentRef, triggerPulse]);

  // The one-time sequence: lean (if this icon has that art), walk to the
  // right edge, hold the reveal pose (or pulse, if this icon has no reveal
  // art yet), then call back so the caller can raise its panel. Runs
  // entirely on refs/imperative timers rather than the idle-loop's effect
  // pattern, because it's a single run-to-completion sequence, not a
  // repeating cycle.
  const beginAlterXtraPresent = useCallback(
    (onRevealed: () => void) => {
      if (modeRef.current === 'presenting') return;
      modeRef.current = 'presenting';
      setMode('presenting');
      if (presentTimer.current) clearTimeout(presentTimer.current);
      walkAnim.current?.stop();
      setWalking(false);

      const icon = data.identity?.icon;
      const hasLean = !!poseSource(icon, 'lean');
      const hasReveal = !!poseSource(icon, 'reveal');

      function toReveal() {
        setPresentPhase('reveal');
        setWalking(false);
        if (!hasReveal) triggerPulse();
        presentTimer.current = setTimeout(() => {
          onRevealed();
          presentTimer.current = setTimeout(() => {
            modeRef.current = 'idle';
            setMode('idle');
          }, RESUME_IDLE_DELAY_MS);
        }, REVEAL_HOLD_MS);
      }

      function toWalk() {
        setPresentPhase('walking');
        const from = xValue.current;
        const target = maxX;
        const distance = Math.abs(target - from);
        setFacingLeft(target < from);
        setWalking(true);
        walkAnim.current = Animated.timing(x, {
          toValue: target,
          duration: Math.max(500, (distance / WALK_SPEED) * 1000),
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        });
        walkAnim.current.start(({ finished }) => {
          if (finished) toReveal();
        });
      }

      setPresentPhase('lean');
      setWalking(false);
      if (hasLean) {
        presentTimer.current = setTimeout(toWalk, LEAN_HOLD_MS);
      } else {
        toWalk();
      }
    },
    [data, maxX, x, triggerPulse]
  );

  useEffect(() => {
    if (!visible) return;
    alterXtraPresentRef.current = beginAlterXtraPresent;
    return () => {
      if (alterXtraPresentRef.current === beginAlterXtraPresent) alterXtraPresentRef.current = null;
    };
  }, [visible, alterXtraPresentRef, beginAlterXtraPresent]);

  // Alternate between standing still and walking to a new spot on the floor.
  // Paused entirely while the present sequence above has control.
  useEffect(() => {
    if (!visible || mode === 'presenting') return;
    let cancelled = false;

    function stand() {
      if (cancelled) return;
      setWalking(false);
      phaseTimer.current = setTimeout(walk, randBetween(IDLE_MIN_MS, IDLE_MAX_MS));
    }

    function walk() {
      if (cancelled) return;
      const from = xValue.current;
      const reach = (WALK_SPEED * randBetween(WALK_MIN_MS, WALK_MAX_MS)) / 1000;
      const direction = Math.random() < 0.5 ? -1 : 1;
      // Keep it on screen: fold the target back inside the bounds.
      let target = from + direction * reach;
      if (target < 0) target = Math.min(maxX, Math.abs(target));
      if (target > maxX) target = Math.max(0, maxX - (target - maxX));

      const distance = Math.abs(target - from);
      if (distance < 4) {
        stand();
        return;
      }

      setFacingLeft(target < from);
      setWalking(true);

      walkAnim.current = Animated.timing(x, {
        toValue: target,
        duration: (distance / WALK_SPEED) * 1000,
        easing: Easing.inOut(Easing.quad), // ease off the mark and settle, not a constant glide
        useNativeDriver: false,
      });
      walkAnim.current.start(({ finished }) => {
        if (finished && !cancelled) stand();
      });
    }

    stand();
    return () => {
      cancelled = true;
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
      walkAnim.current?.stop();
    };
  }, [visible, maxX, x, mode]);

  // Advance the drawn walk frames — only while actually travelling, and reset
  // to a consistent pose on stopping so the figure never freezes mid-stride
  // with a leg hanging in the air.
  useEffect(() => {
    if (!visible || !walking) {
      setWalkFrame(0);
      return;
    }
    const id = setInterval(() => setWalkFrame((f) => f + 1), WALK_FRAME_MS);
    return () => clearInterval(id);
  }, [visible, walking]);

  // Footfall bob — only while actually travelling.
  useEffect(() => {
    bobLoop.current?.stop();
    if (!visible || !walking) {
      Animated.timing(bob, { toValue: 0, duration: 120, useNativeDriver: false }).start();
      return;
    }
    bobLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: STEP_MS / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: STEP_MS / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );
    bobLoop.current.start();
    return () => bobLoop.current?.stop();
  }, [visible, walking, bob]);

  useEffect(() => {
    return () => {
      if (messageTimeout.current) clearTimeout(messageTimeout.current);
      if (presentTimer.current) clearTimeout(presentTimer.current);
    };
  }, []);

  const handlePress = useCallback(() => {
    const stats = computeGrowthStats(data);
    setMessage(pickMascotMessage(buildMascotMessagePool(stats)));
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => setMessage(null), MESSAGE_VISIBLE_MS);
  }, [data]);

  if (!visible) return null;

  // Which art is on screen right now, in priority order:
  //   held lean/reveal pose  >  drawn walk frame while travelling  >
  //   side-profile idle  >  the front-facing standing figure.
  // Each step falls through to the next when an icon has no art for it, so a
  // figure with no walk cycle (male, currently) still behaves exactly as
  // before rather than rendering nothing.
  const icon = data.identity?.icon;
  let figureSource = avatarSource(icon);
  let figureAspect: number = AVATAR_ASPECT;

  const heldPose = mode === 'presenting' && presentPhase !== 'walking' ? poseSource(icon, presentPhase) : null;
  if (heldPose) {
    figureSource = heldPose.source;
    figureAspect = heldPose.aspect;
  } else {
    const cycle = walking ? walkFrameSource(icon, walkFrame) : sideStandSource(icon);
    if (cycle) {
      figureSource = cycle.source;
      figureAspect = cycle.aspect;
    }
  }

  // Height is the fixed dimension; width follows from the pose's own aspect,
  // so the character stays the same height whatever it's doing.
  const figureHeight = FIGURE_HEIGHT;
  const figureWidth = FIGURE_HEIGHT / figureAspect;

  const lift = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -BOB_HEIGHT] });
  // Shadow tightens as the figure rises, as if pushing off the floor.
  const shadowScale = bob.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] });
  const shadowOpacity = bob.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.26] });
  const lean = `${(facingLeft ? 1 : -1) * (walking ? LEAN_DEG : 0)}deg`;

  // The "present" gesture: a scale bump on the figure plus a glow burst
  // behind it. Placeholder motion, not the eventual choreography — there's
  // no walk-cycle or gesture reference art yet, so this is built from pure
  // animation on the existing figure rather than new art.
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });
  const pulseGlowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] });
  const pulseGlowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <View pointerEvents="box-none" style={[styles.layer, { bottom: floor }]}>
      <Animated.View pointerEvents="box-none" style={[styles.column, { transform: [{ translateX: x }] }]}>
        {message && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
        )}

        <View style={styles.figureStack}>
          <Animated.View
            pointerEvents="none"
            style={[styles.presentGlow, { opacity: pulseGlowOpacity, transform: [{ scale: pulseGlowScale }] }]}
          />

          {/* Rises and falls with the stride; scales up on a present cue;
              fades through each pose change instead of popping. */}
          <Animated.View
            style={{ opacity: poseFade, transform: [{ translateY: lift }, { rotate: lean }, { scale: pulseScale }] }}
          >
            <Pressable
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityLabel="AlterX companion — tap for a message"
              style={[styles.figureButton, { width: figureWidth, height: figureHeight }]}
            >
              <Image
                source={figureSource}
                style={[
                  styles.figure,
                  {
                    width: figureWidth,
                    height: figureHeight,
                    tintColor: colors.glow,
                    transform: [{ scaleX: facingLeft ? -1 : 1 }],
                  },
                ]}
                resizeMode="contain"
              />
            </Pressable>
          </Animated.View>
        </View>

        {/* Stays welded to the floor line — the cue that it isn't hovering. */}
        <Animated.View
          pointerEvents="none"
          style={[styles.shadow, { opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] }]}
        />
      </Animated.View>
    </View>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    layer: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 50,
    },
    column: {
      width: SLOT_WIDTH,
      alignItems: 'center',
    },
    figureStack: {
      position: 'relative',
    },
    figureButton: {
      width: FIGURE_WIDTH,
      height: FIGURE_HEIGHT,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    figure: {
      width: FIGURE_WIDTH,
      height: FIGURE_HEIGHT,
    },
    presentGlow: {
      position: 'absolute',
      bottom: -PRESENT_GLOW_SIZE * 0.12,
      left: (SLOT_WIDTH - PRESENT_GLOW_SIZE) / 2,
      width: PRESENT_GLOW_SIZE,
      height: PRESENT_GLOW_SIZE,
      borderRadius: PRESENT_GLOW_SIZE / 2,
      backgroundColor: colors.glowStrong,
      shadowColor: colors.glowStrong,
      shadowOpacity: 0.9,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 0 },
    },
    shadow: {
      width: SLOT_WIDTH * 0.36,
      height: 5,
      borderRadius: 3,
      marginTop: -2,
      backgroundColor: colors.glow,
    },
    bubble: {
      position: 'absolute',
      left: 0,
      bottom: FIGURE_HEIGHT + 12,
      width: 180,
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.panelSolid,
    },
    bubbleText: {
      fontFamily: typography.body.fontFamily,
      fontSize: 12,
      color: colors.textPrimary,
      textAlign: 'center',
      lineHeight: 17,
    },
  });
