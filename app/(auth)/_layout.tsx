import { Stack } from 'expo-router';
import React from 'react';
import { useAppTheme } from '../../src/theme/useAppTheme';

export default function AuthLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
