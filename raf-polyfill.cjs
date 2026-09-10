// Expo SDK 57's static web renderer (React 19.2's scheduler, reached via
// @expo/router-server's node/render.js) calls requestAnimationFrame
// unconditionally during `expo start --web` and `expo export --platform web`
// — a browser-only global Node doesn't provide, which crashes the export
// with "ReferenceError: requestAnimationFrame is not defined" before this
// existed. Load with `node -r ./raf-polyfill.cjs` (see the "web" script)
// or `NODE_OPTIONS="--require ./raf-polyfill.cjs"` for ad hoc export runs.
if (typeof global.requestAnimationFrame !== 'function') {
  global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
}
