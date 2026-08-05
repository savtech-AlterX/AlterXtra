import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider } from '../src/store/AppDataContext';
import { SettingsProvider } from '../src/store/SettingsContext';
import { AppLockGate } from '../src/components/AppLockGate';
import { MascotCompanion } from '../src/components/MascotCompanion';
import { Platform, View } from 'react-native';
import { ThemeProvider } from '../src/theme/ThemeContext';
import { useAppTheme } from '../src/theme/useAppTheme';

// Everything below the ThemeProvider, so `useAppTheme` resolves the live theme.
function ThemedApp() {
  const { colors } = useAppTheme();
  return (
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
          <MascotCompanion />
        </AppLockGate>
      </AppDataProvider>
    </SettingsProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'LCD-Bold': require('../assets/fonts/LCD-Bold.ttf'),
    'LCD2-Bold': require('../assets/fonts/LCD2-Bold.ttf'),
    'ChakraPetch-Regular': require('../assets/fonts/ChakraPetch-Regular.ttf'),
    'ChakraPetch-Medium': require('../assets/fonts/ChakraPetch-Medium.ttf'),
    'ChakraPetch-SemiBold': require('../assets/fonts/ChakraPetch-SemiBold.ttf'),
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

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#000000' }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
