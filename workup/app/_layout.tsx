import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppLockGate } from '../src/components/AppLockGate';
import { SettingsProvider } from '../src/data/SettingsContext';
import { WorkupDataProvider } from '../src/data/WorkupDataContext';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <WorkupDataProvider>
            <StatusBar style="light" />
            <AppLockGate>
              <Stack
                screenOptions={{
                  headerShown: true,
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.text,
                  contentStyle: { backgroundColor: colors.background },
                  animation: 'fade',
                }}
              />
            </AppLockGate>
          </WorkupDataProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
