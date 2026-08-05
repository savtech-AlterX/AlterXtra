import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  url?: string | null;
  name?: string | null;
  size?: number;
};

export function Avatar({ url, name, size = 40 }: Props) {
  const styles = useThemedStyles(makeStyles);
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const dimensions = { width: size, height: size, borderRadius: size / 2 };

  if (url) {
    return <Image source={{ uri: url }} style={[styles.image, dimensions]} />;
  }

  return (
    <View style={[styles.fallback, dimensions]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    image: { backgroundColor: colors.borderDim },
    fallback: {
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initial: { color: colors.primaryStrong, fontFamily: 'ChakraPetch-SemiBold' },
  });
