import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  size?: number;
  style?: ViewStyle;
};

// The identity-mark icon inside a circular glowing ring, as shown
// consistently across the reference recording (splash + home hero).
export function IdentityMarkRing({ size = 130, style }: Props) {
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Image
        source={require('../../assets/identity-mark.png')}
        style={{ width: size * 0.46, height: size * 0.46 * (350 / 207) }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.glow,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
});
