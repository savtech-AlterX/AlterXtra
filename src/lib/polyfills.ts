// Expo Router's static web export prerenders every route once inside plain
// Node (no browser, no requestAnimationFrame). Anything using RN's Animated
// API on mount — WinFlashOverlay's registration, CelebrationOverlay's
// spin/pop — calls it unconditionally, which crashes the export before it
// ever reaches a real browser. This only fills the gap when it's actually
// missing, so the browser's and native's own implementations are untouched.
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 16) as unknown as number;
  (globalThis as unknown as Record<string, unknown>).cancelAnimationFrame = (id: number) => clearTimeout(id);
}
