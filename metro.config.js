const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure font assets from @expo/vector-icons are handled correctly
// and avoid ENOTDIR on the nested vendor path during EAS builds.
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'ttf', 'otf'];

module.exports = config;
