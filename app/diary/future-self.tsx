import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FutureSelf() {
  const { data, addFutureSelfLetter } = useAppData();
  const [body, setBody] = useState('');
  const [deliverOn, setDeliverOn] = useState('');

  function save() {
    if (!body.trim() || !deliverOn.trim()) return;
    addFutureSelfLetter(body.trim(), deliverOn.trim());
    setBody('');
    setDeliverOn('');
  }

  return (
    <HudScreen>
      <StackHeader title="FUTURE SELF" />
      <Text style={styles.subtitle}>LETTERS FORWARD IN TIME</Text>

      <Text style={typography.label}>DELIVER ON (YYYY-MM-DD)</Text>
      <HudTextInput placeholder="2027-01-01" value={deliverOn} onChangeText={setDeliverOn} />

      <Text style={typography.label}>LETTER</Text>
      <HudTextInput
        placeholder="Dear future me..."
        value={body}
        onChangeText={setBody}
        multiline
      />
      <GlowButton label="SEAL LETTER" onPress={save} disabled={!body.trim() || !deliverOn.trim()} />

      <View style={styles.list}>
        {data.futureSelfLetters.length === 0 && (
          <Text style={styles.empty}>No letters sealed yet.</Text>
        )}
        {data.futureSelfLetters.map((letter) => (
          <GlowCard key={letter.id} style={styles.entry}>
            <Text style={styles.entryDate}>
              WRITTEN {formatDate(letter.createdAt)} · DELIVERS {letter.deliverOn}
            </Text>
            <Text style={styles.entryBody}>{letter.body}</Text>
          </GlowCard>
        ))}
      </View>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
    letterSpacing: 3,
    marginTop: -8,
    textAlign: 'center',
  },
  list: {
    gap: 12,
    marginTop: 8,
  },
  empty: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  entry: {
    gap: 8,
  },
  entryDate: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
    letterSpacing: 1,
  },
  entryBody: {
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
});
