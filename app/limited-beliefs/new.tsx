import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { LimitedBeliefFields } from '../../src/components/LimitedBeliefFields';
import { StackHeader } from '../../src/components/StackHeader';
import { FREE_LIMITED_BELIEFS_LIMIT, limitedBeliefsLimitReached } from '../../src/lib/entitlements';
import { useAppData } from '../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function NewLimitedBelief() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data, addLimitedBelief } = useAppData();
  const [belief, setBelief] = useState('');
  const [origin, setOrigin] = useState('');
  const [replacement, setReplacement] = useState('');

  const atLimit = limitedBeliefsLimitReached(data.limitedBeliefs.length);
  const canSave = !atLimit && belief.trim().length > 0 && replacement.trim().length > 0;

  function save() {
    if (!canSave) return;
    addLimitedBelief(belief.trim(), origin.trim(), replacement.trim());
    router.back();
  }

  return (
    <HudScreen>
      <StackHeader title="NEW LIMITED BELIEF" />

      <LimitedBeliefFields
        belief={belief}
        onBeliefChange={setBelief}
        origin={origin}
        onOriginChange={setOrigin}
        replacement={replacement}
        onReplacementChange={setReplacement}
      />

      {atLimit ? (
        <Pressable
          onPress={() => router.push('/alter-xtra')}
          style={styles.limitNotice}
          accessibilityRole="button"
          accessibilityLabel={`Free plan limit of ${FREE_LIMITED_BELIEFS_LIMIT} limited beliefs reached. See Alter-Xtra.`}
        >
          <Text style={styles.limitText}>
            Free plan is limited to {FREE_LIMITED_BELIEFS_LIMIT} limited beliefs. Alter-Xtra removes the limit.
          </Text>
          <Text style={styles.limitLink}>SEE ALTER-XTRA →</Text>
        </Pressable>
      ) : (
        <GlowButton label="SAVE" onPress={save} disabled={!canSave} style={styles.spacer} />
      )}
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
  spacer: {
    marginTop: 4,
  },
  limitNotice: {
    marginTop: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelSolid,
    gap: 6,
  },
  limitText: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  limitLink: {
    fontFamily: typography.label.fontFamily,
    color: colors.glow,
    fontSize: 12,
    letterSpacing: 1,
  },
});
