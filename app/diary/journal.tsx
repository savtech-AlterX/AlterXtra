import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { JournalEntry } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Local calendar day, not UTC — calendar.tsx's localDateKey() does the same
// thing for the same reason: an entry written in the evening in a
// negative-UTC-offset zone (or early morning in a positive one) shouldn't
// default to the wrong day just because toISOString() reads in UTC.
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <GlowCard style={styles.entry}>
      <Text style={styles.entryDate}>
        {entry.date} · SAVED {formatDate(entry.createdAt)}
      </Text>
      {!!entry.title && <Text style={styles.entryTitle}>{entry.title}</Text>}
      <Text style={styles.entryBody}>{entry.body}</Text>
    </GlowCard>
  );
}

export default function Journal() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { data, addJournalEntry } = useAppData();

  // The journal is a record you come back to read, so the record is what the
  // screen opens on. Writing is an action you choose, not a blank form the
  // screen greets you with.
  const [composing, setComposing] = useState(false);
  const [date, setDate] = useState(today());
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const entries = data.journalEntries;

  function reset() {
    setDate(today());
    setTitle('');
    setBody('');
  }

  function save() {
    if (!body.trim()) return;
    addJournalEntry(date.trim() || today(), title.trim(), body.trim());
    reset();
    setComposing(false);
  }

  function cancel() {
    reset();
    setComposing(false);
  }

  return (
    <HudScreen scroll={false} style={styles.noPad}>
      {/* A FlatList so a long-running journal (hundreds of entries) stays
          smooth instead of every entry rendering into one giant ScrollView. */}
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <StackHeader
              title="PERSONAL JOURNAL"
              right={
                !composing ? (
                  <Pressable
                    onPress={() => setComposing(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Write a new entry"
                    style={styles.headerAction}
                  >
                    <Ionicons name="add" size={22} color={colors.glow} style={iconGlow} />
                  </Pressable>
                ) : undefined
              }
            />

            {composing && (
              <View style={styles.composer}>
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
                  onPress={cancel}
                />
              </View>
            )}

            {entries.length > 0 && (
              <Text style={[typography.label, styles.listLabel]}>
                {entries.length} {entries.length === 1 ? 'ENTRY' : 'ENTRIES'}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          composing ? undefined : (
            <EmptyState
              icon="book-outline"
              title="YOUR JOURNAL IS EMPTY"
              body="This is where your reflections live. Write the first one and it stays here for you to look back on."
              actionLabel="WRITE FIRST ENTRY"
              onAction={() => setComposing(true)}
              style={styles.emptyState}
            />
          )
        }
        renderItem={({ item }) => <JournalEntryCard entry={item} />}
      />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
    // Zeroes out HudScreen's own padding/gap so the FlatList's
    // contentContainerStyle is the only thing controlling spacing.
    noPad: {
      padding: 0,
      gap: 0,
    },
    listContent: {
      padding: 20,
      paddingBottom: 40,
      gap: 16,
    },
    headerBlock: {
      gap: 16,
    },
    headerAction: {
      width: 40,
      height: 40,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    composer: {
      gap: 6,
    },
    spacer: {
      marginTop: 6,
    },
    discardButton: {
      borderColor: colors.danger,
    },
    emptyState: {
      marginTop: 20,
    },
    listLabel: {
      marginBottom: 2,
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
