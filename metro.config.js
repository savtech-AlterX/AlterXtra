const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for ENOTDIR on @expo/vector-icons fonts during EAS iOS archive
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

config.resolver.assetExts = [...new Set([...(config.resolver.assetExts || []), 'ttf', 'otf', 'woff', 'woff2'])];

module.exports = config;
