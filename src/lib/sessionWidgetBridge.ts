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
  getActiveStreakDays(): Promise<number>;
  setActiveStreakDays(days: number): Promise<void>;
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

// Android's RemoteViews-based widget has no timeline provider to pull fresh
// state on its own (unlike iOS WidgetKit) — every state change needs an
// explicit re-render pushed from here with the full current picture.
async function rerenderAndroidWidget(startedAt: string | null, streakDays: number): Promise<void> {
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
        streakDays,
      }),
  });
}

export async function writeWidgetSessionStartedAt(startedAt: string | null): Promise<void> {
  if (!native) return;
  try {
    await native.setActiveStartedAt(startedAt);
    await native.reloadWidgets();
    // iOS widgets pick up the change via reloadWidgets() above (WidgetCenter
    // re-invokes the timeline provider).
    if (Platform.OS === 'android') {
      const streakDays = await native.getActiveStreakDays();
      await rerenderAndroidWidget(startedAt, streakDays);
    }
  } catch {
    // Best-effort mirror — the in-app session log is the source of truth.
  }
}

// Mirrors the current-streak count computed in growth.ts so the home screen
// widget can show it without re-deriving anything from the full session log
// itself — called whenever data changes, see AppDataContext.
export async function writeWidgetStreak(days: number): Promise<void> {
  if (!native) return;
  try {
    await native.setActiveStreakDays(days);
    await native.reloadWidgets();
    if (Platform.OS === 'android') {
      const startedAt = await native.getActiveStartedAt();
      await rerenderAndroidWidget(startedAt, days);
    }
  } catch {
    // Best-effort mirror — the in-app session log is the source of truth.
  }
}
