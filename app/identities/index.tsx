import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { IdentityMarkRing } from '../../src/components/IdentityMarkRing';
import { StackHeader } from '../../src/components/StackHeader';
import { confirmDestructive } from '../../src/lib/confirm';
import { MAX_FREE_IDENTITIES, useAppData } from '../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function Identities() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { identities, activeIdentityId, canAddIdentity, switchActiveIdentity, deleteIdentity } = useAppData();

  function selectIdentity(id: string) {
    if (id === activeIdentityId) return;
    switchActiveIdentity(id);
    router.replace('/(tabs)');
  }

  function removeIdentity(id: string, label: string) {
    confirmDestructive(
      'Delete this identity?',
      `This permanently deletes "${label}" and everything in it — diary, goals, habits, beliefs, log book, and photos. This cannot be undone.`,
      'Delete',
      () => deleteIdentity(id)
    );
  }

  function handleAdd() {
    if (canAddIdentity) {
      router.push({ pathname: '/onboarding/icon', params: { mode: 'add' } });
    } else {
      router.push('/alter-xtra');
    }
  }

  return (
    <HudScreen>
      <StackHeader title="IDENTITIES" />

      {identities.map(({ id, identity }) => {
        const active = id === activeIdentityId;
        return (
          <GlowCard key={id} strong={active} style={styles.row}>
            <Pressable
              style={styles.rowMain}
              onPress={() => selectIdentity(id)}
              accessibilityRole="button"
              accessibilityLabel={active ? `${identity.archetype}, active identity` : `Switch to ${identity.archetype}`}
            >
              <IdentityMarkRing size={44} icon={identity.icon} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{identity.archetype}</Text>
                <Text style={styles.rowName}>{identity.name}</Text>
              </View>
              {active ? (
                <Text style={styles.activeBadge}>ACTIVE</Text>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.glow} style={iconGlow} />
              )}
            </Pressable>
            {identities.length > 1 && (
              <Pressable
                style={styles.deleteButton}
                onPress={() => removeIdentity(id, identity.archetype)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${identity.archetype}`}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </GlowCard>
        );
      })}

      <GlowButton
        label="ADD IDENTITY"
        icon={<Ionicons name={canAddIdentity ? 'add' : 'lock-closed'} size={16} color="#02141f" />}
        onPress={handleAdd}
      />

      {!canAddIdentity && (
        <Text style={styles.hint}>
          Free AlterX includes {MAX_FREE_IDENTITIES} identity. Unlock Alter-Xtra for unlimited identities.
        </Text>
      )}
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow }: AppTheme) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 15,
    color: colors.textPrimary,
    ...glowShadow,
  },
  rowName: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeBadge: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.glowStrong,
  },
  deleteButton: {
    padding: 8,
  },
  hint: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -4,
  },
});
