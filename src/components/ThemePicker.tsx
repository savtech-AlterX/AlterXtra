import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isThemeFree } from '../lib/entitlements';
import { palettes, ThemeName } from '../theme/colors';
import { useThemeControls } from '../theme/ThemeContext';
import { useAppTheme, useThemedStyles, type AppTheme } from '../theme/useAppTheme';

const THEMES: { key: ThemeName; label: string }[] = [
  { key: 'navy', label: 'NAVY' },
  { key: 'blue', label: 'BLUE' },
  { key: 'purple', label: 'PURPLE' },
  { key: 'pink', label: 'PINK' },
  { key: 'green', label: 'GREEN' },
  { key: 'amber', label: 'AMBER' },
  { key: 'white', label: 'WHITE' },
  { key: 'red', label: 'RED' },
  { key: 'cyan', label: 'CYAN' },
  { key: 'lime', label: 'LIME' },
  { key: 'vintage', label: 'VINTAGE' },
];

/**
 * HUD-panel style, not plain swatches: a bordered card per theme with the
 * same corner-bracket / progress-bar / status-ring language used elsewhere
 * in the app (Calendar's selected-day reticle, the goal progress bars) —
 * so this reads as part of the interface, not a decoration bolted onto it.
 */
export function ThemePicker() {
  const styles = useThemedStyles(makeStyles);
  const { theme, setTheme } = useThemeControls();
  const router = useRouter();

  return (
    <View style={styles.grid}>
      {THEMES.map(({ key, label }) => {
        const p = palettes[key];
        const selected = theme === key;
        const free = isThemeFree(key);
        return (
          <Pressable
            key={key}
            onPress={() => (free ? setTheme(key) : router.push('/alter-xtra'))}
            style={[styles.panel, { borderColor: selected ? p.glowStrong : p.border }]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: !free }}
            accessibilityLabel={free ? `${label} theme` : `${label} theme. Coming soon with Alter-Xtra.`}
          >
            <View pointerEvents="none" style={[styles.bracket, styles.bracketTL, { borderColor: p.glowStrong }]} />
            <View pointerEvents="none" style={[styles.bracket, styles.bracketBR, { borderColor: p.glowStrong }]} />

            <View style={[styles.row, !free && styles.dimmed]}>
              <View style={[styles.barTrack, { borderColor: p.borderDim }]}>
                <View style={[styles.barFill, { backgroundColor: p.glow, width: '55%' }]} />
              </View>
              <View
                style={[
                  styles.ring,
                  { borderColor: p.glow },
                  selected && { backgroundColor: p.glow },
                ]}
              >
                {!free && <Ionicons name="lock-closed" size={9} color={p.glow} />}
              </View>
            </View>

            <Text style={[styles.label, { color: selected ? p.glowStrong : p.textSecondary }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    panel: {
      width: '31%',
      borderWidth: 1.5,
      borderRadius: 12,
      backgroundColor: colors.panelSolid,
      padding: 10,
      gap: 8,
    },
    bracket: {
      position: 'absolute',
      width: 10,
      height: 10,
      borderColor: colors.glowStrong,
    },
    bracketTL: { top: -1, left: -1, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderTopLeftRadius: 4 },
    bracketBR: { bottom: -1, right: -1, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderBottomRightRadius: 4 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dimmed: {
      opacity: 0.55,
    },
    barTrack: {
      flex: 1,
      height: 5,
      borderRadius: 3,
      borderWidth: 1,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 3,
    },
    ring: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontFamily: typography.label.fontFamily,
      fontSize: 10,
      letterSpacing: 1.5,
    },
  });
