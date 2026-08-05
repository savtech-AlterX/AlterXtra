import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function isUnlocked(answerDate: string) {
  return new Date(`${answerDate}T00:00:00`).getTime() <= Date.now();
}

type Mode = 'letters' | 'video';

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.toggleRow}>
      <Pressable
        style={[styles.toggleButton, mode === 'letters' && styles.toggleButtonActive]}
        onPress={() => onChange('letters')}
      >
        <Text style={[styles.toggleLabel, mode === 'letters' && styles.toggleLabelActive]}>LETTERS</Text>
      </Pressable>
      <Pressable
        style={[styles.toggleButton, mode === 'video' && styles.toggleButtonActive]}
        onPress={() => onChange('video')}
      >
        <Text style={[styles.toggleLabel, mode === 'video' && styles.toggleLabelActive]}>VIDEO</Text>
      </Pressable>
    </View>
  );
}

function LettersPanel() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
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
    <>
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
          <EmptyState
            compact
            icon="mail-outline"
            title="NO LETTERS SEALED"
            body="Write to the person you're becoming. Sealed letters stay here waiting for you."
          />
        )}
        {data.futureSelfLetters.map((letter) => (
          <GlowCard key={letter.id} style={styles.entry}>
            <Text style={styles.entryDate}>SEALED {formatDate(letter.createdAt)}</Text>
            {!!letter.title && <Text style={styles.entryTitle}>{letter.title}</Text>}
            <Text style={styles.entryBody}>{letter.body}</Text>
          </GlowCard>
        ))}
      </View>
    </>
  );
}

function VideoPanel() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data } = useAppData();

  return (
    <>
      <GlowButton
        label="RECORD A VIDEO MESSAGE"
        icon={<Ionicons name="videocam" size={16} color="#02141f" style={iconGlow} />}
        onPress={() => router.push('/diary/future-self-video/new')}
      />

      <View style={styles.list}>
        {data.futureSelfVideos.length === 0 && (
          <EmptyState
            compact
            icon="videocam-outline"
            title="NO VIDEO MESSAGES"
            body="Record yourself a message and set the date it unlocks. Your future self answers back."
            actionLabel="RECORD ONE"
            onAction={() => router.push('/diary/future-self-video/new')}
          />
        )}
        {data.futureSelfVideos.map((v) => {
          const unlocked = isUnlocked(v.answerDate);
          const completed = !!v.replyVideoUri;
          return (
            <GlowCard key={v.id} style={styles.entry}>
              <View style={styles.entryHeaderRow}>
                <Ionicons
                  name={completed ? 'checkmark-circle' : unlocked ? 'lock-open-outline' : 'lock-closed'}
                  size={16}
                  color={completed ? colors.success : unlocked ? colors.accentTeal : colors.textMuted}
                  style={iconGlow}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    completed && { color: colors.success },
                    !completed && unlocked && { color: colors.accentTeal },
                  ]}
                >
                  {completed ? 'COMPLETED' : unlocked ? 'READY TO ANSWER' : `LOCKED UNTIL ${v.answerDate}`}
                </Text>
              </View>
              {!!v.question && <Text style={styles.entryBody}>{v.question}</Text>}
              <Text style={styles.entryDate}>RECORDED {formatDate(v.createdAt)}</Text>

              {completed ? (
                <GlowButton
                  label="WATCH"
                  icon={<Ionicons name="play" size={14} color="#02141f" />}
                  onPress={() => router.push({ pathname: '/diary/future-self-video/[id]', params: { id: v.id } })}
                />
              ) : unlocked ? (
                <GlowButton
                  label="RECORD REPLY"
                  variant="outline"
                  icon={<Ionicons name="videocam" size={14} color={colors.glow} style={iconGlow} />}
                  onPress={() =>
                    router.push({ pathname: '/diary/future-self-video/reply/[id]', params: { id: v.id } })
                  }
                />
              ) : null}
            </GlowCard>
          );
        })}
      </View>
    </>
  );
}

export default function FutureSelf() {
  const [mode, setMode] = useState<Mode>('letters');

  return (
    <HudScreen>
      <StackHeader title="FUTURE SELF" />
      <ModeToggle mode={mode} onChange={setMode} />
      {mode === 'letters' ? <LettersPanel /> : <VideoPanel />}
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: -4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderDim,
    alignItems: 'center',
  },
  toggleButtonActive: {
    borderColor: colors.glowStrong,
    backgroundColor: 'rgba(63, 169, 255, 0.1)',
  },
  toggleLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  toggleLabelActive: {
    color: colors.glowStrong,
  },
  spacer: {
    marginTop: 6,
  },
  discardButton: {
    borderColor: colors.danger,
  },
  list: {
    gap: 12,
    marginTop: 4,
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
  entryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
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
