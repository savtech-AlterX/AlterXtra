const { withXcodeProject } = require('@expo/config-plugins');

// Keep the App Store capability when Codemagic regenerates the iOS project.
module.exports = (config) => withXcodeProject(config, (config) => {
  const project = config.modResults;
  const target = project.getFirstTarget().uuid;
  const attributes = project.getFirstProject().firstProject.attributes;
  attributes.TargetAttributes = attributes.TargetAttributes || {};
  attributes.TargetAttributes[target] = attributes.TargetAttributes[target] || {};
  const capabilities = attributes.TargetAttributes[target].SystemCapabilities || {};
  capabilities['com.apple.InAppPurchase'] = { enabled: 1 };
  attributes.TargetAttributes[target].SystemCapabilities = capabilities;
  return config;
});
