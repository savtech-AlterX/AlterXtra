import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useAppData } from '../src/store/AppDataContext';
import { useAppTheme } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

export default function Index() {
  const { colors } = useAppTheme();
  const { data, isLoaded } = useAppData();

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!data.identity) {
    return <Redirect href="/onboarding/splash" />;
  }

  return <Redirect href="/(tabs)" />;
}
