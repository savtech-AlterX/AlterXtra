import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { WorkupDataProvider } from '../src/data/WorkupDataContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <WorkupDataProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          />
        </WorkupDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
