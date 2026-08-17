import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../store/AppDataContext';
import { useMascotCue } from '../store/MascotCueContext';
import { useSettings } from '../store/SettingsContext';
import { useThemeControls } from '../theme/ThemeContext';
import { computeGrowthStats } from '../lib/growth';
import { buildMascotMessagePool, pickMascotMessage } from '../lib/mascotMessages';
import {
  AVATAR_ASPECT,
  avatarSource,
  PAPER_PLANE_ASPECT,
  paperPlaneSource,
  presentPoseSource,
  sideStandSource,
  walkFrameSource,
} from '../lib/avatar';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

// The figure's height as a fraction of screen height, clamped so it reads as
// a small companion at every device size rather than a fixed pixel value
// tuned for one screen. The previous fixed-width (90px, ~287px tall)
// approach was calibrated against the old trenchcoat art; the business-suit
// art rendered at that same height turned out to eat close to a third of
// the screen and clip straight through the card grid above it — confirmed
// by measuring the character's rendered bounds against a real screen
// recording, not assumed.
const FIGURE_HEIGHT_RATIO = 0.15;
const FIGURE_HEIGHT_MIN = 110;
const FIGURE_HEIGHT_MAX = 170;
// The on-screen slot the figure occupies. Wider than the standing figure
// because a mid-stride walk frame is wider than it is — keeping the slot
// exactly at the figure's own width would let the leading leg clip off the
// right edge of the screen. Scaled down to match the smaller figure.
const SLOT_WIDTH = 96;

const WALK_SPEED = 30; // px per second
const STEP_MS = 300; // one stride, so the bob reads as footfalls
const BOB_HEIGHT = 3.5;
const LEAN_DEG = 2.5;
const IDLE_MIN_MS = 2000;
const IDLE_MAX_MS = 5200;
const WALK_MIN_MS = 2500;
const WALK_MAX_MS = 6000;
const MESSAGE_VISIBLE_MS = 4000;
// The current Alter-Xtra premium reveal: seated -> winds up -> throws a
// paper airplane that flies off and bursts, then the panel appears and the
// mascot fades out. Replaces the older lean/walk/reveal choreography.
const SEATED_HOLD_MS = 900;
const WINDUP_HOLD_MS = 500;
const THROW_HOLD_MS = 250;
const PLANE_FLIGHT_MS = 850;
const BURST_MS = 380;
const POST_BURST_DELAY_MS = 250;
const MASCOT_FADE_MS = 450;
const RESUME_IDLE_DELAY_MS = 400;
// The seated/windup/throw poses (roughly as wide as they are tall, chair
// included) are much wider than the narrow standing/walking figure SLOT_WIDTH
// was tuned for. Centered in that slot, the extra width overflows off-screen
// if the mascot happens to be idling near an edge when the sequence starts —
// caught by actually rendering it there, not assumed. This is how far in
// from each edge it's nudged first.
const PRESENT_SIDE_MARGIN = 40;
const PRESENT_REPOSITION_MS = 220;
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
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { xRef, presentRef, alterXtraPresentRef } = useMascotCue();

  const floor = insets.bottom + 10;
  const maxX = Math.max(0, width - SLOT_WIDTH);
  const figureHeight = Math.min(FIGURE_HEIGHT_MAX, Math.max(FIGURE_HEIGHT_MIN, height * FIGURE_HEIGHT_RATIO));
  const presentGlowSize = figureHeight * 0.7;

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
  // Separate from walkAnim on purpose — sharing it meant the idle-wander
  // effect's cleanup (which fires asynchronously once `mode` flips to
  // 'presenting' and calls walkAnim.current?.stop()) was stopping this
  // reposition animation moments after it started, leaving the mascot stuck
  // near its old x instead of the safe, edge-clear position. Same class of
  // bug as the earlier lean-pose timer collision — caught by reading the
  // mascot's actual on-screen rect, not by re-reading the code.
  const repositionAnim = useRef<Animated.CompositeAnimation | null>(null);
  const bobLoop = useRef<Animated.CompositeAnimation | null>(null);

  // 'idle' is the normal random wander loop below. 'presenting' pauses it for
  // the one-time lean -> walk -> reveal sequence toward Alter-Xtra — mode and
  // modeRef stay in lockstep so the idle-loop effect (reads state, re-runs on
  // change) and the imperative sequence function (reads the ref, no re-render
  // needed) always agree on which one is currently in control.
  const [mode, setMode] = useState<'idle' | 'presenting'>('idle');
  const modeRef = useRef<'idle' | 'presenting'>('idle');
  const [presentPhase, setPresentPhase] = useState<'seated' | 'windup' | 'throw' | 'flying'>('seated');
  // Swapping figureSource straight (seated art -> windup art -> throw art)
  // is an instant pop with no motion to soften it. A quick fade through
  // black hides the cut instead of pretending the two poses connect.
  const poseFade = useRef(new Animated.Value(1)).current;
  const [walkFrame, setWalkFrame] = useState(0);
  const planeAnim = useRef(new Animated.Value(0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;
  const mascotFade = useRef(new Animated.Value(1)).current;

  const visible = isLoaded && settings.mascotEnabled && !!data.identity;

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

  // The one-time sequence: seated -> windup -> throw, then the paper plane
  // flies off and bursts, the caller's panel appears, and the mascot fades
  // out — it doesn't walk anywhere for this one, so x/facingLeft are left
  // wherever the idle wander last put them. Runs entirely on refs/imperative
  // timers rather than the idle-loop's effect pattern, because it's a single
  // run-to-completion sequence, not a repeating cycle.
  const beginAlterXtraPresent = useCallback(
    (onRevealed: () => void) => {
      if (modeRef.current === 'presenting') return;
      modeRef.current = 'presenting';
      setMode('presenting');
      if (presentTimer.current) clearTimeout(presentTimer.current);
      walkAnim.current?.stop();
      setWalking(false);
      planeAnim.setValue(0);
      burstAnim.setValue(0);
      mascotFade.setValue(1);

      function toFlying() {
        setPresentPhase('flying');
        Animated.timing(planeAnim, {
          toValue: 1,
          duration: PLANE_FLIGHT_MS,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (!finished) return;
          burstAnim.setValue(0);
          Animated.timing(burstAnim, { toValue: 1, duration: BURST_MS, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
          presentTimer.current = setTimeout(() => {
            onRevealed();
            presentTimer.current = setTimeout(() => {
              Animated.timing(mascotFade, { toValue: 0, duration: MASCOT_FADE_MS, useNativeDriver: false }).start(() => {
                presentTimer.current = setTimeout(() => {
                  modeRef.current = 'idle';
                  setMode('idle');
                  // Without this, mascotFade stays at 0 forever — the normal
                  // standing/walking companion would never become visible
                  // again after this one-time sequence, instead of resuming
                  // as intended. Caught by checking computed opacity in a
                  // browser well after the sequence finished, not assumed.
                  mascotFade.setValue(1);
                }, RESUME_IDLE_DELAY_MS);
              });
            }, POST_BURST_DELAY_MS);
          }, BURST_MS);
        });
      }

      function toThrow() {
        setPresentPhase('throw');
        presentTimer.current = setTimeout(toFlying, THROW_HOLD_MS);
      }

      function toWindup() {
        setPresentPhase('windup');
        presentTimer.current = setTimeout(toThrow, WINDUP_HOLD_MS);
      }

      function beginSeated() {
        setPresentPhase('seated');
        presentTimer.current = setTimeout(toWindup, SEATED_HOLD_MS);
      }

      setWalking(false);
      const from = xValue.current;
      const safeTarget = Math.min(Math.max(from, PRESENT_SIDE_MARGIN), Math.max(PRESENT_SIDE_MARGIN, maxX - PRESENT_SIDE_MARGIN));
      if (Math.abs(safeTarget - from) < 1) {
        beginSeated();
      } else {
        repositionAnim.current = Animated.timing(x, {
          toValue: safeTarget,
          duration: PRESENT_REPOSITION_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        });
        repositionAnim.current.start(({ finished }) => {
          if (finished) beginSeated();
        });
      }
    },
    [burstAnim, mascotFade, maxX, planeAnim, x]
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
      repositionAnim.current?.stop();
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
  //   held seated/windup/throw pose during the present sequence  >
  //   drawn walk frame while travelling  >  side-profile idle  >  the
  //   front-facing standing figure. Both icons have full art for the
  //   present sequence, so unlike the idle-wander fallbacks below there's
  //   no missing-art case to fall through for it.
  const icon = data.identity?.icon;
  let figureSource = avatarSource(icon);
  let figureAspect: number = AVATAR_ASPECT;

  const heldPose = mode === 'presenting' ? presentPoseSource(icon, presentPhase === 'flying' ? 'throw' : presentPhase) : null;
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
  const figureWidth = figureHeight / figureAspect;

  // The reference art has a soft neon bloom baked into every line plus a
  // glowing floor reflection. The extracted line art itself is hard-edged
  // (checked the raw alpha channel — 1-2px antialiasing, no soft falloff),
  // so the bloom has to come from rendering, not the source PNGs. Native
  // shadow* props follow a transparent image's actual alpha shape on iOS
  // (no shadowPath set), giving a real per-line glow; Android's shadow
  // support for that is weaker but still reads as an ambient glow. On web,
  // drop-shadow (unlike box-shadow) also hugs the alpha silhouette.
  const glowStyle = Platform.select({
    web: {
      filter: `drop-shadow(0 0 3px ${colors.glow}) drop-shadow(0 0 9px ${colors.glowStrong})`,
    } as Record<string, unknown>,
    default: {
      shadowColor: colors.glow,
      shadowOpacity: 0.9,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
    },
  });

  const lift = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -BOB_HEIGHT] });
  // Shadow tightens as the figure rises, as if pushing off the floor.
  const shadowScale = bob.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] });
  const shadowOpacity = bob.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.26] });
  const lean = `${(facingLeft ? 1 : -1) * (walking ? LEAN_DEG : 0)}deg`;

  // The "present" gesture: a scale bump on the figure plus a glow burst
  // behind it. Used by the separate presentRef cue (e.g. Limited Beliefs),
  // not by the Alter-Xtra sequence, which has its own paper-plane animation
  // below.
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });
  const pulseGlowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] });
  const pulseGlowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  // The paper plane: launches from roughly the throwing hand, flies up and
  // to the right while growing — reads as approaching the viewer — then
  // fades out right as the burst flash takes over at its final position.
  const planeHeight = 26;
  const planeWidth = planeHeight / PAPER_PLANE_ASPECT;
  const PLANE_FLY_DX = 190;
  const PLANE_FLY_DY = -70;
  // Flies toward whichever side the figure is actually facing (it's mirrored
  // via scaleX when facingLeft, so the thrown arm — and the plane — needs to
  // mirror with it, not always fly rightward regardless of orientation).
  const planeTranslateX = Animated.multiply(
    planeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PLANE_FLY_DX] }),
    facingLeft ? -1 : 1
  );
  const planeTranslateY = planeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PLANE_FLY_DY] });
  const planeScale = planeAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1.9, 3.4] });
  const planeRotate = planeAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', facingLeft ? '10deg' : '-10deg'] });
  const planeOpacity = planeAnim.interpolate({ inputRange: [0, 0.08, 0.85, 1], outputRange: [0, 1, 1, 0] });
  const burstScale = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.6] });
  const burstOpacity = burstAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.9, 0] });
  // Roughly where the throwing hand sits in the throw pose art (upper area,
  // toward the side the arm extends). The burst flash sits at the plane's
  // landing spot, so it uses the same offset without the animated part.
  const planeStartLeft = figureWidth * 0.75;
  const planeStartTop = figureHeight * 0.05;
  const burstLeft = planeStartLeft + (facingLeft ? -PLANE_FLY_DX : PLANE_FLY_DX);
  const burstTop = planeStartTop + PLANE_FLY_DY;
  const burstSize = planeHeight * 2.2;

  return (
    <View pointerEvents="box-none" style={[styles.layer, { bottom: floor }]}>
      <Animated.View pointerEvents="box-none" style={[styles.column, { opacity: mascotFade, transform: [{ translateX: x }] }]}>
        {message && (
          <View style={[styles.bubble, { bottom: figureHeight + 12 }]}>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
        )}

        <View style={styles.figureStack}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.presentGlow,
              {
                width: presentGlowSize,
                height: presentGlowSize,
                borderRadius: presentGlowSize / 2,
                left: (SLOT_WIDTH - presentGlowSize) / 2,
                bottom: -presentGlowSize * 0.12,
                opacity: pulseGlowOpacity,
                transform: [{ scale: pulseGlowScale }],
              },
            ]}
          />

          {mode === 'presenting' && presentPhase === 'flying' && (
            <>
              <Animated.View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: planeStartLeft,
                  top: planeStartTop,
                  width: planeWidth,
                  height: planeHeight,
                  opacity: planeOpacity,
                  transform: [
                    { translateX: planeTranslateX },
                    { translateY: planeTranslateY },
                    { scale: planeScale },
                    { rotate: planeRotate },
                    { scaleX: facingLeft ? -1 : 1 },
                  ],
                }}
              >
                <Image
                  source={paperPlaneSource()}
                  style={[{ width: planeWidth, height: planeHeight, tintColor: colors.glow }, glowStyle]}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* The flash where the plane bursts — same technique as
                  presentGlow, just relocated to the plane's landing spot. */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.presentGlow,
                  {
                    left: burstLeft - burstSize / 2,
                    top: burstTop - burstSize / 2,
                    width: burstSize,
                    height: burstSize,
                    borderRadius: burstSize / 2,
                    opacity: burstOpacity,
                    transform: [{ scale: burstScale }],
                  },
                ]}
              />
            </>
          )}

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
                  { width: figureWidth, height: figureHeight, tintColor: colors.glow },
                  glowStyle,
                  { transform: [{ scaleX: facingLeft ? -1 : 1 }] },
                ]}
                resizeMode="contain"
              />
            </Pressable>

            {/* A faded, vertically-flipped copy of the same frame — the glossy
                floor-reflection the style reference has. Clipped to less than
                the figure's own height and faded to transparent so it reads
                as a reflection dying out on the floor, not a second figure. */}
            <View pointerEvents="none" style={[styles.reflectionClip, { width: figureWidth, height: figureHeight * 0.4 }]}>
              <Image
                source={figureSource}
                style={{
                  width: figureWidth,
                  height: figureHeight,
                  tintColor: colors.glow,
                  opacity: 0.32,
                  transform: [{ scaleX: facingLeft ? -1 : 1 }, { scaleY: -1 }],
                }}
                resizeMode="contain"
              />
              <LinearGradient
                colors={['transparent', colors.background]}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
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
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    reflectionClip: {
      position: 'absolute',
      top: '100%',
      left: 0,
      overflow: 'hidden',
    },
    presentGlow: {
      position: 'absolute',
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
