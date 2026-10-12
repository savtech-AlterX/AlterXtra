import type { PurchaseSnapshot } from './lifetimePurchases';

// Native StoreKit is never imported into the web preview or Android build.
const state: PurchaseSnapshot = {
  connected: false, busy: false, price: null,
  message: 'Alter-Xtra purchases are available in the iPhone app.',
};
export const purchases = {
  getSnapshot: () => state,
  subscribe: (_listener: () => void) => () => {},
  start: async () => {}, stop: () => {}, refresh: async () => false,
  retry: async () => {}, buy: async () => {}, restore: async () => {},
};
