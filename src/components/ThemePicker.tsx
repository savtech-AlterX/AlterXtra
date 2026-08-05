import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palettes, ThemeName } from '../theme/colors';
import { useThemeControls } from '../theme/ThemeContext';
import { useAppTheme, useThemedStyles, type AppTheme } from '../theme/useAppTheme';

const THEMES: { key: ThemeName; label: string }[] = [
  { key: 'blue', label: 'BLUE' },
  { key: 'purple', label: 'PURPLE' },
  { key: 'pink', label: 'PINK' },
  { key: 'green', label: 'GREEN' },
  { key: 'amber', label: 'AMBER' },
  { key: 'white', label: 'WHITE' },
  { key: 'vintage', label: 'VINTAGE' },
];

/**
 * Live theme previews. Each swatch is painted in its own palette rather than
 * the active one, so you can see what you're choosing before you choose it.
 */
export function ThemePicker() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { theme, setTheme } = useThemeControls();

  return (
    <View style={styles.row}>
      {THEMES.map(({ key, label }) => {
        const p = palettes[key];
        const selected = theme === key;
        return (
          <Pressable
            key={key}
            onPress={() => setTheme(key)}
            style={styles.item}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${label} theme`}
          >
            <View
              style={[
                styles.swatch,
                { backgroundColor: p.background, borderColor: selected ? colors.glowStrong : p.border },
                selected && styles.swatchSelected,
              ]}
            >
              <View style={[styles.swatchBar, { backgroundColor: p.glow }]} />
              <View style={[styles.swatchBar, styles.swatchBarShort, { backgroundColor: p.textSecondary }]} />
            </View>
            <Text style={[styles.label, selected && { color: colors.glowStrong }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    item: {
      width: '30%',
      alignItems: 'center',
      gap: 6,
    },
    swatch: {
      width: '100%',
      height: 52,
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 10,
      justifyContent: 'center',
      gap: 6,
    },
    swatchSelected: {
      shadowColor: colors.glow,
      shadowOpacity: 0.7,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
      elevation: 5,
    },
    swatchBar: {
      height: 5,
      borderRadius: 3,
      width: '100%',
    },
    swatchBarShort: {
      width: '60%',
    },
    label: {
      fontFamily: typography.label.fontFamily,
      fontSize: 10,
      letterSpacing: 1.5,
      color: colors.textSecondary,
    },
  });
