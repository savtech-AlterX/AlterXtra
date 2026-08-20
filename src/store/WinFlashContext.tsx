import React, { createContext, useCallback, useContext, useRef } from 'react';

/**
 * A one-shot "you did something good" signal, fired from anywhere in the
 * tree (a log entry, a habit check-in, a completed identity session) and
 * consumed by a single overlay mounted once at the root. Ref-based like
 * MascotCueContext's presentRef, for the same reason: the trigger fires from
 * deep leaf screens that have no reason to re-render when it does, and the
 * overlay is the only thing that needs to react.
 */
type WinFlashValue = {
  flashRef: React.MutableRefObject<(() => void) | null>;
};

const WinFlashContext = createContext<WinFlashValue | null>(null);

export function WinFlashProvider({ children }: { children: React.ReactNode }) {
  const flashRef = useRef<(() => void) | null>(null);
  const value = React.useMemo(() => ({ flashRef }), []);
  return <WinFlashContext.Provider value={value}>{children}</WinFlashContext.Provider>;
}

export function useWinFlash() {
  const ctx = useContext(WinFlashContext);
  if (!ctx) throw new Error('useWinFlash must be used within WinFlashProvider');
  const { flashRef } = ctx;
  return useCallback(() => flashRef.current?.(), [flashRef]);
}

export function useWinFlashRegistration() {
  const ctx = useContext(WinFlashContext);
  if (!ctx) throw new Error('useWinFlashRegistration must be used within WinFlashProvider');
  return ctx.flashRef;
}
