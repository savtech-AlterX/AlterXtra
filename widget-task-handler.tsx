import React from 'react';
import { Platform } from 'react-native';
import { registerWidgetTaskHandler, type WidgetTaskHandlerProps } from 'react-native-android-widget';
import { IdentitySessionWidget } from './src/widgets/IdentitySessionWidget';
import SessionWidgetBridge from './modules/session-widget-bridge';

// Runs as a headless JS task whenever Android adds, updates, resizes, or
// taps the home screen widget — this is the widget's entire "backend" since
// there's no running app to talk to. State lives in the native module's
// SharedPreferences (see modules/session-widget-bridge), which
// AppDataContext also reads/writes so the widget and the in-app session log
// agree once the app is next foregrounded.
async function widgetTaskHandler({ widgetAction, clickAction, renderWidget }: WidgetTaskHandlerProps) {
  if (widgetAction === 'WIDGET_DELETED') return;

  if (widgetAction === 'WIDGET_CLICK' && clickAction === 'TOGGLE_SESSION') {
    const current = (await SessionWidgetBridge?.getActiveStartedAt()) ?? null;
    await SessionWidgetBridge?.setActiveStartedAt(current ? null : new Date().toISOString());
  }

  const startedAt = (await SessionWidgetBridge?.getActiveStartedAt()) ?? null;
  renderWidget(
    <IdentitySessionWidget active={!!startedAt} subtitle={startedAt ? 'In identity' : 'Tap to start'} />
  );
}

// Android-only: this is the home screen widget's headless task handler.
// AppRegistry.registerHeadlessTask isn't implemented on react-native-web,
// and iOS's Lock Screen widget runs entirely in native Swift instead.
if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}
