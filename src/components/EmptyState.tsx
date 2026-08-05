import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
};

export function EmptyState({ icon, title, body }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={40} color={styles.icon.color} />
      <Text style={styles.title}>{title}</Text>
      {!!body && <Text style={styles.body}>{body}</Text>}
    </View>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', gap: 8, paddingVertical: 48, paddingHorizontal: 24 },
    icon: { color: colors.textMuted },
    title: { ...typography.cardTitle, textAlign: 'center' },
    body: { ...typography.bodyMuted, textAlign: 'center' },
  });
