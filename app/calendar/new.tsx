import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const DATE_RE = /^\\d{4}-\\d{2}-\\d{2}$/;

export default function NewCalendarEntry() {
  const params = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { addCalendarEntry } = useAppData();
  const [date, setDate] = useState(typeof params.date === 'string' ? params.date : new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const validDate = DATE_RE.test(date.trim()) && !Number.isNaN(new Date(date + 'T12:00:00').getTime());

  function save() {
    if (!validDate || !title.trim()) return;
    addCalendarEntry(date.trim(), title.trim(), notes);
    router.back();
  }

  return (
    <HudScreen>
      <StackHeader title="NEW CALENDAR ENTRY" />
      <Text style={typography.label}>DATE · YYYY-MM-DD</Text>
      <HudTextInput value={date} onChangeText={setDate} placeholder="2026-11-25" accessibilityLabel="Calendar date" />
      {!validDate && <Text style={styles.error}>Enter a date as YYYY-MM-DD.</Text>}
      <Text style={[typography.label, styles.spacer]}>TITLE</Text>
      <HudTextInput value={title} onChangeText={setTitle} placeholder="What do you want to remember?" accessibilityLabel="Calendar entry title" />
      <Text style={[typography.label, styles.spacer]}>NOTES · OPTIONAL</Text>
      <HudTextInput value={notes} onChangeText={setNotes} placeholder="Add details..." multiline accessibilityLabel="Calendar entry notes" />
      <GlowButton label="SAVE ENTRY" onPress={save} disabled={!validDate || !title.trim()} style={styles.spacer} />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  spacer: { marginTop: 8 },
  error: { fontFamily: typography.bodyMuted.fontFamily, color: colors.danger, fontSize: 12 },
});
