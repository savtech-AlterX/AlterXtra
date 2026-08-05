import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../../../src/components/GlowButton';
import { GlowCard } from '../../../../src/components/GlowCard';
import { HudScreen } from '../../../../src/components/HudScreen';
import { StackHeader } from '../../../../src/components/StackHeader';
import { useAppData } from '../../../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../../../src/theme/useAppTheme';
import type { AppTheme } from '../../../../src/theme/useAppTheme';

function VideoPreview({ uri }: { uri: string }) {
  const styles = useThemedStyles(makeStyles);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return <VideoView style={styles.preview} player={player} contentFit="cover" nativeControls />;
}

export default function RecordReply() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, addFutureSelfVideoReply } = useAppData();
  const entry = data.futureSelfVideos.find((v) => v.id === id);
  const [replyUri, setReplyUri] = useState<string | null>(null);

  async function record() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 120,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setReplyUri(result.assets[0].uri);
    }
  }

  function save() {
    if (!replyUri || !entry) return;
    addFutureSelfVideoReply(entry.id, replyUri);
    router.back();
  }

  if (!entry) {
    return (
      <HudScreen>
        <StackHeader title="RECORD REPLY" />
        <Text style={styles.empty}>This entry no longer exists.</Text>
      </HudScreen>
    );
  }

  return (
    <HudScreen>
      <StackHeader title="RECORD REPLY" />
      <Text style={styles.subtitle}>Your past self asked:</Text>

      <GlowCard style={styles.questionCard}>
        {!!entry.question && <Text style={styles.question}>{entry.question}</Text>}
        <VideoPreview uri={entry.videoUri} />
      </GlowCard>

      <Text style={[typography.label, styles.spacer]}>YOUR REPLY</Text>
      {replyUri ? (
        <VideoPreview uri={replyUri} />
      ) : (
        <View style={styles.emptyPreview}>
          <Ionicons name="videocam-outline" size={40} color={colors.glow} style={iconGlow} />
          <Text style={styles.emptyPreviewText}>No reply recorded yet</Text>
        </View>
      )}

      <GlowButton
        label={replyUri ? 'RE-RECORD REPLY' : 'RECORD REPLY'}
        variant="outline"
        icon={<Ionicons name="videocam" size={16} color={colors.glow} style={iconGlow} />}
        onPress={record}
        style={styles.spacer}
      />

      <GlowButton label="SAVE REPLY" onPress={save} disabled={!replyUri} style={styles.spacer} />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  subtitle: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: -8,
  },
  spacer: {
    marginTop: 6,
  },
  questionCard: {
    gap: 10,
  },
  question: {
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 15,
  },
  preview: {
    width: '100%',
    height: 220,
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
  },
  empty: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
