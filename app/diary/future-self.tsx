import { Ionicons } from '@expo/vector-icons';
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
import { iconGlow, typography } from '../../src/theme/typography';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FutureSelf() {
  const router = useRouter();
  const { data, addFutureSelfLetter } = useAppData();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function save() {
    if (!body.trim()) return;
    addFutureSelfLetter(title.trim(), body.trim());
    setTitle('');
    setBody('');
  }

  function discard() {
    setTitle('');
    setBody('');
    router.back();
  }

  return (
    <HudScreen>
      <StackHeader title="WRITE TO FUTURE SELF" />

      <Text style={typography.label}>LETTER TITLE (OPTIONAL)</Text>
      <HudTextInput placeholder="e.g. One year from now..." value={title} onChangeText={setTitle} />

      <Text style={[typography.label, styles.spacer]}>YOUR LETTER</Text>
      <HudTextInput
        placeholder="Write your letter to your future self..."
        value={body}
        onChangeText={setBody}
        multiline
      />

      <GlowButton
        label="SEAL LETTER"
        onPress={save}
        disabled={!body.trim()}
        style={styles.spacer}
        icon={<Ionicons name="lock-closed" size={14} color="#02141f" style={iconGlow} />}
      />
      <GlowButton
        label="DISCARD"
        variant="outline"
        labelColor={colors.danger}
        style={styles.discardButton}
        onPress={discard}
      />

      <View style={styles.list}>
        {data.futureSelfLetters.length === 0 && (
          <Text style={styles.empty}>No letters sealed yet.</Text>
        )}
        {data.futureSelfLetters.map((letter) => (
          <GlowCard key={letter.id} style={styles.entry}>
            <Text style={styles.entryDate}>SEALED {formatDate(letter.createdAt)}</Text>
            {!!letter.title && <Text style={styles.entryTitle}>{letter.title}</Text>}
            <Text style={styles.entryBody}>{letter.body}</Text>
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
