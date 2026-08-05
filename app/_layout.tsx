import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/store/AuthContext';
import { ThemeProvider, useThemeControls } from '../src/theme/ThemeContext';

function ThemedApp() {
  const { colors, theme } = useThemeControls();
  return (
    <AuthProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      />
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'ChakraPetch-Regular': require('../assets/fonts/ChakraPetch-Regular.ttf'),
    'ChakraPetch-Medium': require('../assets/fonts/ChakraPetch-Medium.ttf'),
    'ChakraPetch-SemiBold': require('../assets/fonts/ChakraPetch-SemiBold.ttf'),
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#f6f8f4' }} />;

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
