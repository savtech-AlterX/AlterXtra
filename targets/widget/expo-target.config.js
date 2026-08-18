/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'IdentitySessionWidget',
  displayName: 'Identity Session',
  deploymentTarget: '17.0',
  frameworks: ['SwiftUI', 'WidgetKit', 'AppIntents'],
  // Empty on purpose, not omitted: @bacons/apple-targets only runs its
  // App Group auto-sync (mirroring expo.ios.entitlements from app.json)
  // when this key is present at all, even as {} — omitting it entirely
  // skips entitlements generation for the target completely, verified
  // against the installed plugin version via `npx expo prebuild --clean`.
  entitlements: {},
};
