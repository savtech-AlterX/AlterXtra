import React from 'react';
import { View, ViewStyle } from 'react-native';

type Props = {
  size?: number;
  style?: ViewStyle;
};

// Reserves the space an identity avatar used to occupy, without drawing
// anything in it — AlterX no longer shows any avatar/identity-mark artwork.
export function IdentityMarkRing({ size = 130, style }: Props) {
  return <View style={[{ width: size, height: size }, style]} />;
}
