import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { AppDataProvider } from '../src/store/AppDataContext';
import { SettingsProvider } from '../src/store/SettingsContext';
import { AppLockGate } from '../src/components/AppLockGate';
import { Platform, View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'LCD-Bold': require('../assets/fonts/LCD-Bold.ttf'),
    'LCD2-Bold': require('../assets/fonts/LCD2-Bold.ttf'),
    'Spaceline-Regular': require('../assets/fonts/Spaceline-Regular.ttf'),
  });

  useEffect(() => {
    if (Platform.OS === 'web') return;
    import('expo-notifications').then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    });
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <AppDataProvider>
            <StatusBar style="light" />
            <AppLockGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                  animation: 'fade',
                }}
              />
            </AppLockGate>
          </AppDataProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
