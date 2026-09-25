import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { LimitedBeliefFields } from '../../src/components/LimitedBeliefFields';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { useSettings } from '../../src/store/SettingsContext';
import { FREE_LIMITED_BELIEFS_LIMIT } from '../../src/store/types';

export default function NewLimitedBelief() {
  const router = useRouter();
  const { data, addLimitedBelief } = useAppData();
  const { settings } = useSettings();
  const [belief, setBelief] = useState('');
  const [origin, setOrigin] = useState('');
  const [replacement, setReplacement] = useState('');

  // Reachable by deep link or back-navigation even when the list screen's own
  // button is already swapped for the upsell — addLimitedBelief would just
  // silently no-op past the cap, so this catches it before the form even
  // renders rather than let someone fill it in for nothing.
  const atFreeLimit = !settings.xtraUnlocked && data.limitedBeliefs.length >= FREE_LIMITED_BELIEFS_LIMIT;

  const canSave = belief.trim().length > 0 && replacement.trim().length > 0;

  function save() {
    if (!canSave) return;
    addLimitedBelief(belief.trim(), origin.trim(), replacement.trim());
    router.back();
  }

  if (atFreeLimit) {
    return (
      <HudScreen>
        <StackHeader title="NEW LIMITED BELIEF" />
        <EmptyState
          icon="lock-closed"
          title="FREE LIMIT REACHED"
          body={`Free accounts can log up to ${FREE_LIMITED_BELIEFS_LIMIT} limited beliefs. Unlock Alter-Xtra for unlimited.`}
          actionLabel="SEE ALTER-XTRA"
          actionIcon="arrow-forward"
          onAction={() => router.replace('/alter-xtra')}
        />
      </HudScreen>
    );
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

      <GlowButton label="SAVE" onPress={save} disabled={!canSave} style={styles.spacer} />
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  spacer: {
    marginTop: 4,
  },
});
