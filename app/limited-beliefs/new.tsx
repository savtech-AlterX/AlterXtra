import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { LimitedBeliefFields } from '../../src/components/LimitedBeliefFields';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';

export default function NewLimitedBelief() {
  const router = useRouter();
  const { addLimitedBelief } = useAppData();
  const [belief, setBelief] = useState('');
  const [origin, setOrigin] = useState('');
  const [replacement, setReplacement] = useState('');

  const canSave = belief.trim().length > 0 && replacement.trim().length > 0;

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

      <GlowButton label="SAVE" onPress={save} disabled={!canSave} style={styles.spacer} />
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  spacer: {
    marginTop: 4,
  },
});
