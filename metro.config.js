const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Suppress the annoying React Native 0.74+ internal exports warning
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args.length > 0 && 
    typeof args[0] === 'string' && 
    args[0].includes('ReactNativeFeatureFlags')
  ) {
    return;
  }
  originalWarn(...args);
};

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
