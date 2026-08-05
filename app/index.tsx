import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../src/store/AuthContext';
import { useAppTheme } from '../src/theme/useAppTheme';

export default function Index() {
  const { colors } = useAppTheme();
  const { isLoaded, session } = useAuth();

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
