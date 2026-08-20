import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../../src/components/GlowButton';
import { HudScreen } from '../../../src/components/HudScreen';
import { HudTextInput } from '../../../src/components/HudTextInput';
import { StackHeader } from '../../../src/components/StackHeader';
import { explainPermissionDenied } from '../../../src/lib/permissionAlert';
import { useAppData } from '../../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../../src/theme/useAppTheme';
import type { AppTheme } from '../../../src/theme/useAppTheme';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Local calendar day, not UTC — see journal.tsx's today() for why.
function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(s: string) {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  // new Date() silently rolls invalid days (e.g. Feb 30) into the next
  // month rather than rejecting them — round-tripping catches that.
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function VideoPreview({ uri }: { uri: string }) {
  const styles = useThemedStyles(makeStyles);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return <VideoView style={styles.preview} player={player} contentFit="cover" nativeControls />;
}

const MIN_UNLOCK_LOGS = 1;
const MAX_UNLOCK_LOGS = 30;

export default function RecordFutureSelfVideo() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { addFutureSelfVideo } = useAppData();
  const [question, setQuestion] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [answerDate, setAnswerDate] = useState(tomorrow());
  const [lockMode, setLockMode] = useState<'date' | 'consistency'>('date');
  const [unlockAfterLogEntries, setUnlockAfterLogEntries] = useState(5);

  async function record() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      explainPermissionDenied('camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 120,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      explainPermissionDenied('photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  }

  const dateValid = isValidDateString(answerDate.trim());
  const canSave = !!videoUri && (lockMode === 'date' ? dateValid : unlockAfterLogEntries >= MIN_UNLOCK_LOGS);

  function save() {
    if (!canSave || !videoUri) return;
    addFutureSelfVideo(
      question.trim(),
      videoUri,
      lockMode === 'date' ? answerDate.trim() : tomorrow(),
      lockMode,
      lockMode === 'consistency' ? unlockAfterLogEntries : undefined
    );
    router.back();
  }

  function adjustUnlockCount(delta: number) {
    setUnlockAfterLogEntries((n) => Math.max(MIN_UNLOCK_LOGS, Math.min(MAX_UNLOCK_LOGS, n + delta)));
  }

  return (
    <HudScreen>
      <StackHeader title="RECORD FOR FUTURE SELF" />
      <Text style={styles.subtitle}>
        Ask your future self something now. You won't be able to answer it until the date you set.
      </Text>

      <Text style={typography.label}>QUESTION (OPTIONAL)</Text>
      <HudTextInput
        placeholder="What do you want to ask your future self?"
        value={question}
        onChangeText={setQuestion}
        multiline
      />

      <Text style={[typography.label, styles.spacer]}>YOUR VIDEO</Text>
      {videoUri ? (
        <VideoPreview uri={videoUri} />
      ) : (
        <View style={styles.emptyPreview}>
          <Ionicons name="videocam-outline" size={40} color={colors.glow} style={iconGlow} />
          <Text style={styles.emptyPreviewText}>No video recorded yet</Text>
        </View>
      )}

      <View style={styles.recordRow}>
        <GlowButton
          label={videoUri ? 'RE-RECORD' : 'RECORD VIDEO'}
          variant="outline"
          icon={<Ionicons name="videocam" size={16} color={colors.glow} style={iconGlow} />}
          onPress={record}
          style={styles.recordButton}
        />
        <GlowButton
          label="CHOOSE"
          variant="outline"
          icon={<Ionicons name="albums-outline" size={16} color={colors.glow} style={iconGlow} />}
          onPress={pickFromLibrary}
          style={styles.recordButton}
        />
      </View>

      <Text style={[typography.label, styles.spacer]}>WHEN DOES IT UNLOCK?</Text>
      <View style={styles.lockModeRow}>
        <Pressable
          style={[styles.lockModeButton, lockMode === 'date' && styles.lockModeButtonActive]}
          onPress={() => setLockMode('date')}
          accessibilityRole="button"
          accessibilityLabel="Unlock on a date"
        >
          <Text style={[styles.lockModeLabel, lockMode === 'date' && styles.lockModeLabelActive]}>ON A DATE</Text>
        </Pressable>
        <Pressable
          style={[styles.lockModeButton, lockMode === 'consistency' && styles.lockModeButtonActive]}
          onPress={() => setLockMode('consistency')}
          accessibilityRole="button"
          accessibilityLabel="Unlock by showing up"
        >
          <Text style={[styles.lockModeLabel, lockMode === 'consistency' && styles.lockModeLabelActive]}>
            BY SHOWING UP
          </Text>
        </Pressable>
      </View>

      {lockMode === 'date' ? (
        <>
          <HudTextInput value={answerDate} onChangeText={setAnswerDate} placeholder="2027-01-01" style={styles.spacer} />
          {answerDate.trim().length > 0 && !dateValid ? (
            <Text style={[styles.hint, { color: colors.danger }]}>Enter a real date as YYYY-MM-DD.</Text>
          ) : (
            <Text style={styles.hint}>Locked until this date — you'll then record your reply.</Text>
          )}
        </>
      ) : (
        <>
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => adjustUnlockCount(-1)}
              accessibilityRole="button"
              accessibilityLabel="Fewer log entries required"
              style={styles.stepperButton}
            >
              <Ionicons name="chevron-back" size={18} color={colors.glow} style={iconGlow} />
            </Pressable>
            <Text style={styles.stepperValue}>{unlockAfterLogEntries}</Text>
            <Pressable
              onPress={() => adjustUnlockCount(1)}
              accessibilityRole="button"
              accessibilityLabel="More log entries required"
              style={styles.stepperButton}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.glow} style={iconGlow} />
            </Pressable>
          </View>
          <Text style={styles.hint}>
            Locked until you've logged {unlockAfterLogEntries} Log Book {unlockAfterLogEntries === 1 ? 'entry' : 'entries'} after sealing this — no
            calendar, just showing up.
          </Text>
        </>
      )}

      <GlowButton label="SEAL VIDEO" onPress={save} disabled={!canSave} style={styles.spacer} />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  subtitle: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },
  spacer: {
    marginTop: 6,
  },
  preview: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    backgroundColor: colors.panelSolid,
  },
  emptyPreview: {
    height: 180,
    borderWidth: 1,
    borderColor: colors.borderDim,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyPreviewText: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  recordRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recordButton: {
    flex: 1,
  },
  hint: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  lockModeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  lockModeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderDim,
    alignItems: 'center',
  },
  lockModeButtonActive: {
    borderColor: colors.glowStrong,
    backgroundColor: colors.glowDim,
  },
  lockModeLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  lockModeLabelActive: {
    color: colors.glowStrong,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 6,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 28,
    color: colors.textPrimary,
    minWidth: 50,
    textAlign: 'center',
    ...glowShadow,
  },
});
