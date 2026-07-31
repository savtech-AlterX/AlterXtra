import { useRouter } from 'expo-router';
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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Journal() {
  const router = useRouter();
  const { data, addJournalEntry } = useAppData();
  const [date, setDate] = useState(today());
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function save() {
    if (!body.trim()) return;
    addJournalEntry(date.trim() || today(), title.trim(), body.trim());
    setDate(today());
    setTitle('');
    setBody('');
  }

  function discard() {
    setDate(today());
    setTitle('');
    setBody('');
    router.back();
  }

  return (
    <HudScreen>
      <StackHeader title="PERSONAL JOURNAL" />

      <Text style={typography.label}>DATE</Text>
      <HudTextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

      <Text style={[typography.label, styles.spacer]}>TITLE (OPTIONAL)</Text>
      <HudTextInput placeholder="Give your entry a title..." value={title} onChangeText={setTitle} />

      <Text style={[typography.label, styles.spacer]}>YOUR ENTRY</Text>
      <HudTextInput
        placeholder="Write your thoughts..."
        value={body}
        onChangeText={setBody}
        multiline
      />

      <GlowButton label="SAVE ENTRY" onPress={save} disabled={!body.trim()} style={styles.spacer} />
      <GlowButton
        label="DISCARD"
        variant="outline"
        style={styles.discardButton}
        labelColor={colors.danger}
        onPress={discard}
      />

      <View style={styles.list}>
        {data.journalEntries.length === 0 && (
          <Text style={styles.empty}>No entries yet. Write your first reflection above.</Text>
        )}
        {data.journalEntries.map((entry) => (
          <GlowCard key={entry.id} style={styles.entry}>
            <Text style={styles.entryDate}>
              {entry.date} · SAVED {formatDate(entry.createdAt)}
            </Text>
            {!!entry.title && <Text style={styles.entryTitle}>{entry.title}</Text>}
            <Text style={styles.entryBody}>{entry.body}</Text>
          </GlowCard>
        ))}
      </View>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  spacer: {
    marginTop: 6,
  },
  discardButton: {
    borderColor: colors.danger,
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
  entryTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 15,
    color: colors.textPrimary,
  },
  entryBody: {
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
});
