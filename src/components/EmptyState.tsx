import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  /** One sentence. Say what goes here and what to do — never just "nothing yet". */
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  /** Inline variant for a section inside a screen, rather than a whole screen. */
  compact?: boolean;
};

/**
 * The "nothing here yet" panel, shared by every list in the app.
 *
 * Empty screens used to be a bare sentence floating in a black void, which
 * reads as broken rather than new. A bordered panel with a dashed edge reads
 * instead as a space deliberately waiting to be filled — the outline says
 * "your thing goes here", and the copy says what the thing is.
 */
export function EmptyState({ icon, title, body, actionLabel, onAction, style, compact }: Props) {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.panel, compact && styles.panelCompact, style]}>
      <View style={[styles.iconRing, compact && styles.iconRingCompact]}>
        <Ionicons
          name={icon}
          size={compact ? 20 : 26}
          color={colors.glow}
          style={iconGlow}
        />
      </View>

      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      <Text style={styles.body}>{body}</Text>

      {!!actionLabel && !!onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Ionicons name="add" size={15} color={colors.glowStrong} />
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = ({ colors, typography, glowShadow }: AppTheme) =>
  StyleSheet.create({
    panel: {
      borderWidth: 1,
      borderColor: colors.borderDim,
      borderStyle: 'dashed',
      borderRadius: 16,
      paddingVertical: 34,
      paddingHorizontal: 26,
      alignItems: 'center',
      gap: 10,
    },
    panelCompact: {
      paddingVertical: 22,
      paddingHorizontal: 20,
      gap: 8,
    },
    iconRing: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.borderDim,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    iconRingCompact: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },
    title: {
      fontFamily: typography.cardTitle.fontFamily,
      fontSize: 15,
      letterSpacing: 2,
      color: colors.textPrimary,
      textAlign: 'center',
      ...glowShadow,
    },
    titleCompact: {
      fontSize: 13,
    },
    body: {
      fontFamily: typography.bodyMuted.fontFamily,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      paddingVertical: 9,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionPressed: {
      opacity: 0.65,
    },
    actionLabel: {
      fontFamily: typography.buttonLabel.fontFamily,
      fontSize: 12,
      letterSpacing: 2,
      color: colors.glowStrong,
    },
  });
