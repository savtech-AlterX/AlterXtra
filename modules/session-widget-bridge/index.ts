import { requireOptionalNativeModule } from 'expo-modules-core';

export type SessionWidgetBridgeModuleType = {
  getActiveStartedAt(): Promise<string | null>;
  setActiveStartedAt(startedAt: string | null): Promise<void>;
  reloadWidgets(): Promise<void>;
};

// Optional: this module only exists in a custom dev/production build that
// includes the widget target, never in Expo Go.
export default requireOptionalNativeModule<SessionWidgetBridgeModuleType>('SessionWidgetBridge');
