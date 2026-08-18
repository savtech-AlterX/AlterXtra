import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../store/AppDataContext';
import { useMascotCue } from '../store/MascotCueContext';
import { useSettings } from '../store/SettingsContext';
import { useThemeControls } from '../theme/ThemeContext';
import { computeGrowthStats } from '../lib/growth';
import { buildMascotMessagePool, pickMascotMessage } from '../lib/mascotMessages';
import { PAPER_PLANE_ASPECT, paperPlaneSource, presentFrameSource, throwCycleLength } from '../lib/avatar';
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

const MESSAGE_VISIBLE_MS = 4000;
// The companion no longer wanders the floor — she appears seated, holds,
// then fades out, once per arrival on Home. This is how long she stays
// before that fade starts. Originally 3500ms — confirmed too short to
// actually notice on a normal glance at the phone: by the time a real user
// looks at the screen a few seconds after opening the app, she'd already be
// gone (and often the first-visit Alter-Xtra sequence has already taken
// over by then too). 25s keeps the fade-out behaviour but gives it a real
// chance of being seen.
const IDLE_SEATED_HOLD_MS = 25000;
// The current Alter-Xtra premium reveal: seated -> a real multi-frame
// throw-arm animation (not held poses crossfaded together — the source
// material was shot specifically for fluid motion, and holding 3 static
// frames for hundreds of ms each is exactly what made the first version of
// this read as jumpy rather than like a person moving) -> the paper
// airplane flies off and bursts, then the panel appears and the mascot
// fades out. Replaces the older lean/walk/reveal choreography.
const SEATED_HOLD_MS = 700;
// Per-frame advance through the throw-cycle art (seated -> windup -> every
// extracted in-between frame -> settled, ~37 frames). Started at 24ms/frame
// (under a second total) — too fast to read as fluid motion, registered as
// a blur. 40ms/frame was a first pass at slowing it down but still read as
// laggy/cheap rather than smooth. 65ms/frame stretches the whole arm motion
// to a bit over 2s — closer to how a real throw's windup-and-release
// actually reads.
const MOTION_FRAME_MS = 65;
const SETTLE_HOLD_MS = 200;
const PLANE_FLIGHT_MS = 850;
const BURST_MS = 380;
const POST_BURST_DELAY_MS = 250;
const MASCOT_FADE_MS = 450;
// The seated/windup/throw poses (roughly as wide as they are tall, chair
// included) are much wider than SLOT_WIDTH. Centered in that slot, the extra
// width overflows off-screen if rendered flush at x=0 — this is how far in
// from the left edge it's nudged before sitting. The mascot always starts at
// the left already (idle wander was removed), so this is mostly a small,
// deliberate scoot rather than a correction.
const PRESENT_SIDE_MARGIN = 40;
const PRESENT_REPOSITION_MS = 220;
// The whole sequence above is a chain of setTimeouts, each one scheduling the
// next — reported on a real device (not reproduced locally) as occasionally
// freezing on the seated pose forever, mode stuck at 'presenting' and never
// releasing, including on screens that aren't Home at all since the mascot is
// mounted once at the app root. Whatever stalls that chain on-device, this is
// a hard backstop: however long the reposition + seated hold + full motion
// sweep + flight + burst should ever legitimately take, well past it, force
// back to idle so a stall degrades to "the intro didn't play that time"
// instead of "the companion is broken for the rest of the session." Only
// covers up to the fade-out — once the mascot is actually hidden and waiting
// on the panel to close, HIDDEN_WATCHDOG_MS below takes over, since that wait
// is supposed to be open-ended.
const PRESENT_WATCHDOG_MS = 6000;
// Once faded out, the mascot has no way to know when the Alter-Xtra panel
// actually closes — the panel calls resumeIdleRef when it does. This is
// purely a fallback for that call never arriving (panel unmounting some
// other way), not a normal-path timer, so it's generous — long enough that
// it never fires while someone's just reading the panel.
const HIDDEN_WATCHDOG_MS = 30000;

/**
 * A companion that appears seated on Home, holds for a few seconds, and
 * fades out — a presence, not a figure that wanders the floor.
 */
export function MascotCompanion() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const { data } = useAppData();
  const { theme } = useThemeControls();
  const { settings, isLoaded } = useSettings();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { xRef, presentRef, alterXtraPresentRef, resumeIdleRef } = useMascotCue();
  // Mounted once at the app root (see _layout.tsx), so without this it shows
  // on every screen in the app — onboarding, settings, diary, the loading
  // transition, all of it. The companion belongs on Home only; state keeps
  // running underneath everywhere else so anything already in flight (the
  // Alter-Xtra present sequence, in particular — it only ever starts from
  // Home anyway) still resolves once back there.
  const pathname = usePathname();
  const onHome = pathname === '/';

  const floor = insets.bottom + 10;
  const maxX = Math.max(0, width - SLOT_WIDTH);
  const figureHeight = Math.min(FIGURE_HEIGHT_MAX, Math.max(FIGURE_HEIGHT_MIN, height * FIGURE_HEIGHT_RATIO));
  const presentGlowSize = figureHeight * 0.7;

  // Starts pinned to the left edge, not centred, per the brief — the present
  // sequence's reposition step reads its starting point off this ref, so
  // nothing else needed to change when the idle wander was removed.
  const x = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const xValue = useRef(0);
  // No longer toggled by a wander direction (there isn't one any more) —
  // stays at the art's default orientation. Kept as a real value rather than
  // deleted outright since the throw pose and paper-plane flight direction
  // both still mirror off it.
  const facingLeft = false;
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Separate from presentTimer on purpose — sharing it meant the idle
  // seated-then-fade effect's cleanup (which fires asynchronously once
  // `mode` flips to 'presenting') was clearing a timer the present sequence
  // had just scheduled. Same class of bug as the other timer collisions
  // documented below — caught by actually watching it run, not by reading
  // the code.
  const repositionAnim = useRef<Animated.CompositeAnimation | null>(null);
  // See PRESENT_WATCHDOG_MS above — a hard ceiling independent of presentTimer,
  // so clearing/reusing presentTimer along the normal chain can never also
  // cancel the safety net.
  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The idle seated-then-fade timer — separate from presentTimer/watchdogTimer
  // so starting the present sequence can cleanly cancel it without touching
  // either of those.
  const idleFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 'idle' is just sitting there before the fade-out below. 'presenting' pauses
  // that for the one-time seated -> throw -> reveal sequence toward
  // Alter-Xtra — mode and modeRef stay in lockstep so the idle effect (reads
  // state, re-runs on change) and the imperative sequence function (reads the
  // ref, no re-render needed) always agree on which one is currently in
  // control.
  const [mode, setMode] = useState<'idle' | 'presenting'>('idle');
  const modeRef = useRef<'idle' | 'presenting'>('idle');
  const [presentPhase, setPresentPhase] = useState<'seated' | 'motion' | 'flying'>('seated');
  // Which frame of the throw-cycle art is showing during 'motion'/'flying' —
  // a real index into a multi-frame animation, not a named pose. Advancing
  // it doesn't retrigger poseFade (that only depends on mode/presentPhase
  // below), which is deliberate: real motion frames read as continuous
  // without a crossfade between each one; the fade is only for the one hard
  // cut into the sequence (plain seated -> throw motion).
  const [throwFrame, setThrowFrame] = useState(0);
  const poseFade = useRef(new Animated.Value(1)).current;
  const planeAnim = useRef(new Animated.Value(0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;
  const mascotFade = useRef(new Animated.Value(1)).current;

  const visible = isLoaded && settings.mascotEnabled && !!data.identity && onHome;

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

  // Hands control back to the idle seated state — called either by the
  // Alter-Xtra panel itself once it actually closes (the normal path) or by
  // HIDDEN_WATCHDOG_MS if that call never arrives. Also reachable mid-flight
  // via PRESENT_WATCHDOG_MS if the animation chain itself stalls, which is
  // why every step is guarded by modeRef rather than assuming it always
  // starts from the faded-out end state.
  const resumeFromPresent = useCallback(() => {
    if (modeRef.current !== 'presenting') return;
    if (presentTimer.current) clearTimeout(presentTimer.current);
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    modeRef.current = 'idle';
    setMode('idle');
    // setValue, not an animated timing — the panel that calls this (via
    // dismiss()) typically navigates away in the same tick (see
    // AlterXtraIntro.viewAlterXtra), which unmounts this component's JSX
    // (visible flips false, render returns null) before an in-flight
    // Animated.timing ever gets to apply a frame. The animation doesn't
    // survive that gap — confirmed by logging the value through the
    // navigate-away-and-back sequence, it stayed frozen at the timing's
    // starting value forever, leaving the mascot invisible even once back on
    // Home. An instant set has nothing to lose mid-flight.
    mascotFade.setValue(1);
  }, [mascotFade]);

  useEffect(() => {
    if (!visible) return;
    resumeIdleRef.current = resumeFromPresent;
    return () => {
      if (resumeIdleRef.current === resumeFromPresent) resumeIdleRef.current = null;
    };
  }, [visible, resumeIdleRef, resumeFromPresent]);

  // The one-time sequence: seated -> windup -> throw, then the paper plane
  // flies off and bursts, the caller's panel appears, and the mascot fades
  // out and stays out until that panel actually closes (see resumeIdleRef
  // above). Runs entirely on refs/imperative timers rather than an effect
  // pattern, because it's a single run-to-completion sequence, not a
  // repeating cycle.
  const beginAlterXtraPresent = useCallback(
    (onRevealed: () => void) => {
      if (modeRef.current === 'presenting') return;
      modeRef.current = 'presenting';
      setMode('presenting');
      if (presentTimer.current) clearTimeout(presentTimer.current);
      if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
      if (idleFadeTimer.current) clearTimeout(idleFadeTimer.current);
      watchdogTimer.current = setTimeout(() => {
        if (modeRef.current !== 'presenting') return;
        modeRef.current = 'idle';
        setMode('idle');
        mascotFade.setValue(1);
      }, PRESENT_WATCHDOG_MS);
      planeAnim.setValue(0);
      burstAnim.setValue(0);
      mascotFade.setValue(1);

      const icon = data.identity?.icon;
      const lastFrame = throwCycleLength(icon) - 1;

      function toFlying() {
        setPresentPhase('flying');
        Animated.timing(planeAnim, {
          toValue: 1,
          duration: PLANE_FLIGHT_MS,
          // A thrown object is fastest the instant it leaves the hand and
          // decelerates from there (release energy, then drag) — ease-out,
          // not ease-in. The previous ease-in made it crawl for most of the
          // flight and then rocket away in the last instant, backwards from
          // how a throw actually reads.
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (!finished) return;
          burstAnim.setValue(0);
          Animated.timing(burstAnim, { toValue: 1, duration: BURST_MS, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
          presentTimer.current = setTimeout(() => {
            onRevealed();
            presentTimer.current = setTimeout(() => {
              Animated.timing(mascotFade, { toValue: 0, duration: MASCOT_FADE_MS, useNativeDriver: false }).start(() => {
                // Faded out now — done with the animation chain, so the 6s
                // stall watchdog no longer applies. From here it's an
                // open-ended wait for the panel to close, guarded only by
                // the much longer HIDDEN_WATCHDOG_MS fallback.
                if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
                watchdogTimer.current = setTimeout(resumeFromPresent, HIDDEN_WATCHDOG_MS);
              });
            }, POST_BURST_DELAY_MS);
          }, BURST_MS);
        });
      }

      // Steps through every extracted in-between frame (windup, then the
      // arm's full sweep through the throw) at a fast, fixed cadence via a
      // chained setTimeout, since this run runs once and stops, not loops.
      function advanceMotion(frame: number) {
        setThrowFrame(frame);
        if (frame < lastFrame) {
          presentTimer.current = setTimeout(() => advanceMotion(frame + 1), MOTION_FRAME_MS);
        } else {
          presentTimer.current = setTimeout(toFlying, SETTLE_HOLD_MS);
        }
      }

      function beginSeated() {
        setThrowFrame(0);
        setPresentPhase('seated');
        presentTimer.current = setTimeout(() => {
          setPresentPhase('motion');
          advanceMotion(1);
        }, SEATED_HOLD_MS);
      }

      const from = xValue.current;
      const target = PRESENT_SIDE_MARGIN;
      if (Math.abs(target - from) < 1) {
        beginSeated();
      } else {
        repositionAnim.current = Animated.timing(x, {
          toValue: target,
          duration: PRESENT_REPOSITION_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        });
        repositionAnim.current.start(({ finished }) => {
          if (finished) beginSeated();
        });
      }
    },
    [burstAnim, data, mascotFade, planeAnim, resumeFromPresent, x]
  );

  useEffect(() => {
    if (!visible) return;
    alterXtraPresentRef.current = beginAlterXtraPresent;
    return () => {
      if (alterXtraPresentRef.current === beginAlterXtraPresent) alterXtraPresentRef.current = null;
    };
  }, [visible, alterXtraPresentRef, beginAlterXtraPresent]);

  // Appear seated, hold, then fade out — fires each time the mascot becomes
  // visible (i.e. each arrival on Home), not just once ever. Paused entirely
  // while the present sequence above has control; reads modeRef rather than
  // depending on `mode` so this doesn't also re-fire the moment the present
  // sequence hands control back (that already ends on its own fade-out —
  // replaying this one right after would just be a redundant second fade).
  useEffect(() => {
    if (!visible || modeRef.current === 'presenting') return;
    mascotFade.setValue(1);
    // poseFade has the same failure mode mascotFade did (see
    // resumeFromPresent above): its own effect fades it in via
    // Animated.timing whenever `mode` changes, and that animation doesn't
    // survive being interrupted by a quick navigate-away. Unlike mascotFade
    // it has no dependency on `visible`, so nothing else would ever recover
    // it. Idle is always fully opaque, so forcing it here on every arrival
    // is safe regardless of whether a stale fade left it stuck.
    poseFade.setValue(1);
    idleFadeTimer.current = setTimeout(() => {
      if (modeRef.current === 'presenting') return;
      Animated.timing(mascotFade, { toValue: 0, duration: MASCOT_FADE_MS, useNativeDriver: false }).start();
    }, IDLE_SEATED_HOLD_MS);
    return () => {
      if (idleFadeTimer.current) clearTimeout(idleFadeTimer.current);
    };
  }, [visible, mascotFade, poseFade]);

  useEffect(() => {
    return () => {
      if (messageTimeout.current) clearTimeout(messageTimeout.current);
      if (presentTimer.current) clearTimeout(presentTimer.current);
      if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
      if (idleFadeTimer.current) clearTimeout(idleFadeTimer.current);
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

  // Which art is on screen right now: the held throw-cycle frame while
  // presenting, otherwise just the seated frame (frame 0 of the same cycle)
  // — she's never anything but seated outside the present sequence now.
  const icon = data.identity?.icon;
  const heldPose = presentFrameSource(icon, mode === 'presenting' ? throwFrame : 0);
  const figureSource = heldPose.source;
  const figureAspect = heldPose.aspect;

  // Height is the fixed dimension; width follows from the pose's own aspect,
  // so the character stays the same height whatever it's doing.
  const figureWidth = figureHeight / figureAspect;

  // These seated/throw-cycle poses already have a soft neon bloom baked
  // into their own alpha channel (checked directly — a wide spread of
  // partial-alpha pixels around every line, not a hard 1-2px antialiased
  // edge). Stacking an additional CSS drop-shadow blur on top of art that's
  // already soft compounds into an oversaturated blob that swallows the
  // linework entirely — confirmed by rendering the raw asset with nothing
  // but a plain tint next to the in-app result. Native shadow* props have
  // the same problem for the same reason, so this is a plain tint
  // everywhere now; the art supplies its own glow.
  const glowStyle = Platform.select({
    web: {} as Record<string, unknown>,
    default: {},
  });

  // No more footfall bob to drive these — she just sits, so the lift/lean
  // stay neutral and the shadow stays put under her.
  const lift = 0;
  const shadowScale = 1;
  const shadowOpacity = 0.5;
  const lean = '0deg';

  // The "present" gesture: a scale bump on the figure plus a glow burst
  // behind it. Used by the separate presentRef cue (e.g. Limited Beliefs),
  // not by the Alter-Xtra sequence, which has its own paper-plane animation
  // below.
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });
  const pulseGlowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] });
  const pulseGlowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  // The paper plane: launches from roughly the throwing hand and flies up
  // and away, shrinking as it goes — it's receding into the distance, so
  // growing (the previous behaviour) read as flying both away and toward
  // the viewer at once. Fades out right as the burst flash takes over at
  // its final position.
  const planeHeight = 26;
  const planeWidth = planeHeight / PAPER_PLANE_ASPECT;
  const PLANE_FLY_DX = 190;
  const PLANE_FLY_DY = -70;
  // A thrown paper plane climbs on the initial force then settles/dips as
  // that force runs out and gravity takes over — not a dead-straight line.
  // The peak sits above the final resting height so the last leg of the
  // flight reads as a gentle downward settle, matching the burst landing
  // slightly below where the arc topped out.
  const PLANE_ARC_PEAK_DY = -105;
  // Flies toward whichever side the figure is actually facing (it's mirrored
  // via scaleX when facingLeft, so the thrown arm — and the plane — needs to
  // mirror with it, not always fly rightward regardless of orientation).
  const planeTranslateX = Animated.multiply(
    planeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PLANE_FLY_DX] }),
    facingLeft ? -1 : 1
  );
  const planeTranslateY = planeAnim.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, PLANE_ARC_PEAK_DY, PLANE_FLY_DY],
  });
  const planeScale = planeAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.78, 0.5] });
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
                the figure's own height so it reads as a partial reflection,
                not a second figure. Used to fade to a solid background-color
                rectangle at the bottom, which looked fine over the plain
                background but showed up as a visible mismatched box wherever
                the mascot happened to sit over a card (different shade) —
                dropped it; a hard clip edge at low opacity reads better than
                a seam. */}
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
