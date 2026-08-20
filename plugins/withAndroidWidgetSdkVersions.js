const { withGradleProperties } = require('@expo/config-plugins');

// react-native-android-widget's build.gradle reads its SDK versions from
// `AndroidWidget_*` gradle properties (its own documented override
// mechanism) when `rootProject.ext` doesn't define them — which is the case
// on Expo's current native template, so without this the library's
// `compileSdkVersion` line resolves to null and the Android build fails
// with "project ':react-native-android-widget' does not specify compileSdk".
const withAndroidWidgetSdkVersions = (config) =>
  withGradleProperties(config, (config) => {
    config.modResults.push(
      { type: 'property', key: 'AndroidWidget_compileSdkVersion', value: '36' },
      { type: 'property', key: 'AndroidWidget_minSdkVersion', value: '24' },
      { type: 'property', key: 'AndroidWidget_targetSdkVersion', value: '36' }
    );
    return config;
  });

module.exports = withAndroidWidgetSdkVersions;
