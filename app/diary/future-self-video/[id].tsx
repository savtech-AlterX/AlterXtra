import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IdentityMarkRing } from '../../../src/components/IdentityMarkRing';
import { useAppData } from '../../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../../src/theme/useAppTheme';
import type { AppTheme } from '../../../src/theme/useAppTheme';

type Stage = 'original' | 'reply' | 'ended';

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FutureSelfCall() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const entry = data.futureSelfVideos.find((v) => v.id === id);

  const [stage, setStage] = useState<Stage>('original');
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const player = useVideoPlayer(entry?.videoUri ?? null, (p) => {
    p.play();
  });

  useEffect(() => {
    if (!entry || !entry.replyVideoUri) return;
    const replyUri = entry.replyVideoUri;
    const sub = player.addListener('playToEnd', () => {
      if (stage === 'original') {
        setStage('reply');
        player.replaceAsync(replyUri).then(() => player.play());
      } else if (stage === 'reply') {
        setStage('ended');
        player.pause();
      }
    });
    return () => sub.remove();
  }, [player, stage, entry]);

  useEffect(() => {
    if (stage === 'ended') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stage]);

  function replay() {
    if (!entry) return;
    setElapsed(0);
    setStage('original');
    player.replaceAsync(entry.videoUri).then(() => player.play());
  }

  if (!entry || !entry.replyVideoUri) {
    return (
      <SafeAreaView style={styles.missing}>
        <Text style={styles.missingText}>This call isn't ready yet.</Text>
        <Pressable
          style={styles.endButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {stage !== 'ended' && (
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      )}
      {stage === 'ended' && (
        <View style={[StyleSheet.absoluteFill, styles.endedBg]}>
          <IdentityMarkRing size={140} />
        </View>
      )}

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Text style={styles.callerName}>{stage === 'reply' ? 'YOU' : 'PAST YOU'}</Text>
          <Text style={styles.timer}>{stage === 'ended' ? 'CALL ENDED' : formatTimer(elapsed)}</Text>
        </View>

        {stage !== 'ended' && (
          <View style={styles.pip}>
            <IdentityMarkRing size={70} />
          </View>
        )}

        <View style={styles.bottomBar}>
          {stage === 'ended' ? (
            <>
              <Pressable
                style={styles.replayButton}
                onPress={replay}
                accessibilityRole="button"
                accessibilityLabel="Replay"
              >
                <Ionicons name="refresh" size={22} color={colors.background} />
                <Text style={styles.replayLabel}>REPLAY</Text>
              </Pressable>
              <Pressable
                style={styles.endButton}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={26} color="#fff" />
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.endButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Hang up"
            >
              <Ionicons name="call" size={24} color="#fff" style={styles.hangupIcon} />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  missing: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  missingText: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  endedBg: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 6,
  },
  callerName: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 20,
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 2 },
  },
  timer: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 2,
  },
  pip: {
    position: 'absolute',
    top: 100,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingBottom: 40,
  },
  endButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangupIcon: {
    transform: [{ rotate: '135deg' }],
  },
  replayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.glow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  replayLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 7,
    color: colors.background,
  },
});
