import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  liked: boolean;
  count: number;
  onPress: () => void;
};

export function LikeButton({ liked, count, onPress }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike' : 'Like'}
    >
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={22}
        color={liked ? styles.liked.color : styles.icon.color}
      />
      <Text style={styles.count}>{count}</Text>
    </Pressable>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    icon: { color: colors.textSecondary },
    liked: { color: colors.danger },
    count: { ...typography.bodyMuted },
  });
