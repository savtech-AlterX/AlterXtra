import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';
import { CATEGORY_ICONS, CATEGORY_LABELS, PostCategory } from '../store/types';

export function CategoryBadge({ category }: { category: PostCategory }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.badge}>
      <Ionicons name={CATEGORY_ICONS[category]} size={13} color={styles.icon.color} />
      <Text style={styles.label}>{CATEGORY_LABELS[category]}</Text>
    </View>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      backgroundColor: colors.primaryDim,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    icon: { color: colors.primaryStrong },
    label: { ...typography.label, color: colors.primaryStrong, letterSpacing: 0 },
  });
