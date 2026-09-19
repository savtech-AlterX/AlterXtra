import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSettings } from '../src/data/SettingsContext';
import { cancelAllReminders } from '../src/notifications/reminders';
import { colors } from '../src/theme/colors';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>Require Face ID / passcode</Text>
          <Text style={styles.hint}>Lock progress photos behind device authentication.</Text>
        </View>
        <Switch
          value={settings.appLockEnabled}
          onValueChange={(value) => updateSettings({ appLockEnabled: value })}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>Check-in reminders</Text>
          <Text style={styles.hint}>Get notified 14 days after your last photo for a muscle group.</Text>
        </View>
        <Switch
          value={settings.remindersEnabled}
          onValueChange={(value) => {
            updateSettings({ remindersEnabled: value });
            if (!value) cancelAllReminders();
          }}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
