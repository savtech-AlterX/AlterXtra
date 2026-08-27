import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

// The home screen counterpart to the iOS Lock Screen widget
// (targets/widget/IdentitySessionWidget.swift) — same start/stop concept,
// rendered as RemoteViews via react-native-android-widget instead of
// SwiftUI/WidgetKit.
export function IdentitySessionWidget({
  active,
  subtitle,
  streakDays,
}: {
  active: boolean;
  subtitle: string;
  streakDays: number;
}) {
  return (
    <FlexWidget
      clickAction="TOGGLE_SESSION"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: active ? '#ff5470' : '#3da8f5',
      }}
    >
      <TextWidget
        text={active ? 'STOP' : 'START'}
        style={{ fontSize: 16, fontWeight: 'bold', color: active ? '#ff5470' : '#3da8f5' }}
      />
      <TextWidget text={subtitle} style={{ fontSize: 11, color: '#9a9a9a', marginTop: 2 }} />
      {streakDays > 0 ? (
        <TextWidget
          text={`🔥 ${streakDays}-day streak`}
          style={{ fontSize: 11, color: '#f5a623', marginTop: 6 }}
        />
      ) : null}
    </FlexWidget>
  );
}
