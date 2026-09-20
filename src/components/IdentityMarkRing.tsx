import React from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { useAppData } from '../store/AppDataContext';
import { markSource } from '../lib/avatar';
import { AppIconChoice } from '../store/types';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  size?: number;
  style?: ViewStyle;
  // Override the mark shown. Defaults to whichever icon the user picked
  // during onboarding, so the choice carries through the whole app.
  icon?: AppIconChoice;
};

// The identity-mark icon, shown consistently across choose-icon, the
// loading screen, the home hero, and the lock screen. The 4 real-photo
// marks already include their own ring/glow baked in; only the abstract
// 'mystery' glyph needs the theme tint applied on top.
export function IdentityMarkRing({ size = 130, style, icon }: Props) {
  const { colors } = useAppTheme();
  const { data } = useAppData();
  // Falls back through the in-progress onboarding draft too — during
  // onboarding itself (loading screen) or if a route param carrying the
  // choice ever fails to arrive, the identity object may still be unset even
  // though the user already picked a real avatar.
  const resolved = icon ?? data.identity?.icon ?? data.onboardingDraft?.icon;
  const { source, aspect, tint } = markSource(resolved);

  return (
    <View
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Image
        source={source}
        style={{
          width: size,
          height: size / aspect,
          tintColor: tint ? colors.glow : undefined,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
