const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure ttf fonts are treated as assets and not directories
config.resolver.assetExts.push('ttf');

// Prevent nested path issues with @expo/vector-icons
config.transformer.assetPlugins = [];

module.exports = config;
