import { Alert, Platform } from 'react-native';

// React Native Web's Alert.alert is a documented no-op — it never calls any
// button's onPress, so a destructive action wired straight to Alert.alert
// silently does nothing in any web preview. window.confirm is the web
// equivalent of the same prompt.
export function confirmDestructive(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}: ${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
