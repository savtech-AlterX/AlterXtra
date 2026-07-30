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

export default function Journal() {
  const { data, addJournalEntry } = useAppData();
  const [body, setBody] = useState('');

  function save() {
    if (!body.trim()) return;
    addJournalEntry(body.trim());
    setBody('');
  }

  return (
    <HudScreen>
      <StackHeader title="JOURNAL" />
      <Text style={styles.subtitle}>PERSONAL REFLECTIONS</Text>

      <HudTextInput
        placeholder="What's on your mind?"
        value={body}
        onChangeText={setBody}
        multiline
      />
      <GlowButton label="SAVE ENTRY" onPress={save} disabled={!body.trim()} />

      <View style={styles.list}>
        {data.journalEntries.length === 0 && (
          <Text style={styles.empty}>No entries yet. Write your first reflection above.</Text>
        )}
        {data.journalEntries.map((entry) => (
          <GlowCard key={entry.id} style={styles.entry}>
            <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
            <Text style={styles.entryBody}>{entry.body}</Text>
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
