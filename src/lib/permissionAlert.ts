import { Alert, Platform } from 'react-native';

// Same Alert.alert-is-a-no-op-on-web caveat as confirm.ts — window.alert is
// the web equivalent.
export function explainPermissionDenied(what: string) {
  const message = `AlterX needs ${what} access to do this. You can grant it in your device Settings.`;
  if (Platform.OS === 'web') {
    window.alert(message);
    return;
  }
  Alert.alert('Permission needed', message);
}
