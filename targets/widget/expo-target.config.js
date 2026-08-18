/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'IdentitySessionWidget',
  displayName: 'Identity Session',
  deploymentTarget: '17.0',
  frameworks: ['SwiftUI', 'WidgetKit', 'AppIntents'],
  // No entitlements block here on purpose: widget targets auto-sync
  // com.apple.security.application-groups from expo.ios.entitlements in
  // app.json, which is what lets this target and the main app both read
  // group.com.alterxtra.app.
};
