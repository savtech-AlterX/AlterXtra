import React, { createContext, useContext, useMemo, useRef } from 'react';

/**
 * A thin channel between the walking mascot (mounted once, globally, in the
 * root layout) and anything elsewhere in the tree — like the Limited Beliefs
 * panel on Home — that wants to visibly cue off it.
 *
 * Refs rather than state on purpose: the mascot's x position changes on every
 * animation frame, and neither side needs a re-render when it moves. A
 * consumer reads xRef.current at the one moment it actually cares (right
 * before it fires an effect), and calls presentRef.current() to ask the
 * mascot to react — it doesn't need to know how, just that it can.
 */
type MascotCueValue = {
  xRef: React.MutableRefObject<number>;
  presentRef: React.MutableRefObject<(() => void) | null>;
  // The one-time lean -> walk -> reveal sequence toward Alter-Xtra. The
  // mascot registers a handler that runs the sequence and calls back once
  // it's holding the reveal pose, so the caller knows when to raise the
  // panel — same "ask, don't orchestrate" shape as presentRef.
  alterXtraPresentRef: React.MutableRefObject<((onRevealed: () => void) => void) | null>;
  // The mascot fades out once the panel is up and stays hidden — it has no
  // way to know when the panel actually closes, so the panel calls this to
  // hand control back. Without it the mascot could only guess with a timer,
  // which meant it was popping back into view while the panel was still
  // open.
  resumeIdleRef: React.MutableRefObject<(() => void) | null>;
};

const MascotCueContext = createContext<MascotCueValue | null>(null);

export function MascotCueProvider({ children }: { children: React.ReactNode }) {
  const xRef = useRef(0);
  const presentRef = useRef<(() => void) | null>(null);
  const alterXtraPresentRef = useRef<((onRevealed: () => void) => void) | null>(null);
  const resumeIdleRef = useRef<(() => void) | null>(null);
  const value = useMemo(() => ({ xRef, presentRef, alterXtraPresentRef, resumeIdleRef }), []);
  return <MascotCueContext.Provider value={value}>{children}</MascotCueContext.Provider>;
}

export function useMascotCue() {
  const ctx = useContext(MascotCueContext);
  if (!ctx) throw new Error('useMascotCue must be used within MascotCueProvider');
  return ctx;
}
