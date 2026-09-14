import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { startAmbientLoop, stopAmbientLoop } from '../lib/sound';
import { useSettings } from '../store/SettingsContext';

/**
 * Renders nothing — just keeps the ambient background loop running while
 * AlterX is open and the setting is on, and stops it the moment either
 * stops being true (backgrounded, or turned off in Settings).
 */
export function AmbientSoundController() {
  const { settings, isLoaded } = useSettings();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS === 'web' || !isLoaded) return;

    function sync() {
      const foreground = appState.current === 'active';
      if (foreground && settings.ambientSoundEnabled) {
        void startAmbientLoop();
      } else {
        stopAmbientLoop();
      }
    }

    sync();
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      appState.current = next;
      sync();
    });
    return () => sub.remove();
  }, [isLoaded, settings.ambientSoundEnabled]);

  useEffect(() => stopAmbientLoop, []);

  return null;
}
