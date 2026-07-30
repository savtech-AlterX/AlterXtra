import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { colors } from '../src/theme/colors';
import { useAppData } from '../src/store/AppDataContext';

export default function Index() {
  const { data, isLoaded } = useAppData();

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!data.identity) {
    return <Redirect href="/onboarding/icon" />;
  }

  return <Redirect href="/(tabs)" />;
}
