import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { archetypes } from '../../src/data/archetypes';
import { useAppData } from '../../src/store/AppDataContext';
import { AppIconChoice } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function ChooseIdentity() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { icon, name, email } = useLocalSearchParams<{
    icon: AppIconChoice;
    name?: string;
    email?: string;
  }>();
  const { data, setIdentity } = useAppData();
  const [query, setQuery] = useState('');
  const [customName, setCustomName] = useState('');

  const filtered = useMemo(
    () => archetypes.filter((a) => a.label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  function embody(label: string) {
    setIdentity({
      archetype: label,
      icon: icon ?? data.identity?.icon ?? 'mystery',
      name: name || data.identity?.name || 'there',
      email: email || data.identity?.email,
    });
    router.push('/onboarding/loading');
  }

  return (
    <HudScreen>
      <Text style={[typography.screenTitle, styles.title]}>WHO ARE YOU NOW?</Text>

      <HudTextInput
        placeholder="Search archetypes..."
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.grid}>
        {filtered.map((a) => (
          <Pressable key={a.id} style={styles.archetypeCard} onPress={() => embody(a.label)}>
            <View style={styles.archetypeIcon}>
              <Ionicons name={a.icon} size={18} color={colors.glow} style={iconGlow} />
            </View>
            <Text style={styles.archetypeLabel}>{a.label.toUpperCase()}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.glow} style={iconGlow} />
          </Pressable>
        ))}
      </View>

      <Text style={[typography.label, styles.sectionLabel]}>CREATE YOUR OWN IDENTITY</Text>
      <HudTextInput
        placeholder="e.g. Elite Founder"
        value={customName}
        onChangeText={setCustomName}
      />

      <GlowButton
        label="EMBODY THIS PERSONA"
        icon={<Ionicons name="arrow-forward" size={16} color="#02141f" />}
        disabled={customName.trim().length === 0}
        onPress={() => embody(customName.trim())}
      />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  title: {
    marginTop: 16,
  },
  grid: {
    gap: 12,
  },
  archetypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderDim,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.panelSolid,
  },
  archetypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archetypeLabel: {
    flex: 1,
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: 1,
    ...glowShadow,
  },
  sectionLabel: {
    marginTop: 8,
  },
});
