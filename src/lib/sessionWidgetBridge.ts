import { requireOptionalNativeModule } from 'expo-modules-core';
import React from 'react';
import { Platform } from 'react-native';

// Bridges the in-app "identity session" state to the native module backing
// the iOS Lock Screen widget (App Group UserDefaults) and Android home
// screen widget (SharedPreferences), so starting/stopping a session from
// either the app or a widget stays in sync. The native module only exists
// in a custom dev/production build (see modules/session-widget-bridge) — in
// Expo Go, or before that build is installed, every call below is a no-op
// and the app works exactly as if there were no widget at all.
type SessionWidgetBridgeModule = {
  getActiveStartedAt(): Promise<string | null>;
  setActiveStartedAt(startedAt: string | null): Promise<void>;
  reloadWidgets(): Promise<void>;
};

const native = requireOptionalNativeModule<SessionWidgetBridgeModule>('SessionWidgetBridge');

export async function readWidgetSessionStartedAt(): Promise<string | null> {
  if (!native) return null;
  try {
    return await native.getActiveStartedAt();
  } catch {
    return null;
  }
}

export async function writeWidgetSessionStartedAt(startedAt: string | null): Promise<void> {
  if (!native) return;
  try {
    await native.setActiveStartedAt(startedAt);
    await native.reloadWidgets();
    // iOS widgets pick up the change via reloadWidgets() above (WidgetCenter
    // re-invokes the timeline provider). Android's RemoteViews-based widgets
    // need an explicit re-render pushed from here instead.
    if (Platform.OS === 'android') {
      const [{ requestWidgetUpdate }, { IdentitySessionWidget }] = await Promise.all([
        import('react-native-android-widget'),
        import('../widgets/IdentitySessionWidget'),
      ]);
      await requestWidgetUpdate({
        widgetName: 'IdentitySession',
        renderWidget: () =>
          React.createElement(IdentitySessionWidget, {
            active: !!startedAt,
            subtitle: startedAt ? 'In identity' : 'Tap to start',
          }),
      });
    }
  } catch {
    // Best-effort mirror — the in-app session log is the source of truth.
  }
}
