import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { colors } from '../../src/theme/colors';
import { iconGlow, typography } from '../../src/theme/typography';
import { AppIconChoice } from '../../src/store/types';

const OPTIONS: { key: AppIconChoice; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'male', icon: 'man' },
  { key: 'mystery', icon: 'help' },
  { key: 'female', icon: 'woman' },
];

export default function ChooseIcon() {
  const router = useRouter();
  const [selected, setSelected] = useState<AppIconChoice>('mystery');

  return (
    <HudScreen scroll={false}>
      <View style={styles.header}>
        <Text style={[typography.screenTitle, styles.title]}>
          CHOOSE AN ICON{'\n'}FOR YOUR APP
        </Text>
      </View>

      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setSelected(opt.key)}
              style={[styles.box, isSelected && styles.boxSelected]}
            >
              <Ionicons
                name={opt.icon}
                size={44}
                color={isSelected ? colors.glowStrong : colors.glow}
                style={iconGlow}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={[typography.label, styles.footerLabel]}>
          THIS BECOMES YOUR IDENTITY MARK
        </Text>
        <GlowButton
          label="CONTINUE"
          icon={<Ionicons name="arrow-forward" size={16} color="#02141f" />}
          onPress={() => router.push({ pathname: '/onboarding/account', params: { icon: selected } })}
        />
      </View>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 32,
  },
  box: {
    width: 96,
    height: 128,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDim,
    backgroundColor: colors.panelSolid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxSelected: {
    borderColor: colors.glowStrong,
    shadowColor: colors.glow,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  footer: {
    marginTop: 'auto',
    gap: 16,
  },
  footerLabel: {
    textAlign: 'center',
  },
});
