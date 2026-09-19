import { Platform } from 'react-native';

// Sound effects and the ambient loop share one audio session, configured once
// so nothing here ever fights the user's own music or the phone's silent
// switch — this is background flavor, not something that should interrupt.
let modeConfigured = false;
async function ensureAudioMode() {
  if (modeConfigured || Platform.OS === 'web') return;
  modeConfigured = true;
  const { setAudioModeAsync } = await import('expo-audio');
  await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
}

type Clip = 'win-chime' | 'milestone-fanfare';

const SOURCES: Record<Clip, number> = {
  'win-chime': require('../../assets/sounds/win-chime.wav'),
  'milestone-fanfare': require('../../assets/sounds/milestone-fanfare.wav'),
};

// One player per clip, created lazily and reused — replaying just seeks back
// to the start, so rapid-fire wins (e.g. two habit check-ins back to back)
// don't pile up overlapping player instances.
const players: Partial<Record<Clip, import('expo-audio').AudioPlayer>> = {};

async function play(clip: Clip) {
  if (Platform.OS === 'web') return;
  try {
    await ensureAudioMode();
    const { createAudioPlayer } = await import('expo-audio');
    let player = players[clip];
    if (!player) {
      player = createAudioPlayer(SOURCES[clip]);
      players[clip] = player;
    }
    await player.seekTo(0);
    player.play();
  } catch {
    // A missing/broken audio device shouldn't take the rest of the
    // interaction down with it — the visual celebration still lands either way.
  }
}

export function playWinChime() {
  void play('win-chime');
}

export function playMilestoneFanfare() {
  void play('milestone-fanfare');
}

// --- Ambient background loop ---

let ambientPlayer: import('expo-audio').AudioPlayer | null = null;

export async function startAmbientLoop() {
  if (Platform.OS === 'web' || ambientPlayer) return;
  try {
    await ensureAudioMode();
    const { createAudioPlayer } = await import('expo-audio');
    const player = createAudioPlayer(require('../../assets/sounds/ambient-loop.wav'));
    player.loop = true;
    player.volume = 0.35;
    player.play();
    ambientPlayer = player;
  } catch {
    // No ambient bed is a quiet-app experience, not a broken one.
  }
}

export function stopAmbientLoop() {
  if (!ambientPlayer) return;
  ambientPlayer.pause();
  ambientPlayer.remove();
  ambientPlayer = null;
}
