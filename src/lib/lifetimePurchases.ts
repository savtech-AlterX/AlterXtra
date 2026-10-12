import type * as IAP from 'expo-iap';

export const LIFETIME_PRODUCT_ID = 'alterxtra_lifetime';
export type PurchaseSnapshot = {
  connected: boolean;
  busy: boolean;
  price: string | null;
  message: string | null;
};
type StoreApi = Pick<typeof IAP, 'initConnection' | 'endConnection' | 'fetchProducts' |
  'requestPurchase' | 'restorePurchases' | 'currentEntitlementIOS' |
  'isTransactionVerifiedIOS' | 'finishTransaction' | 'purchaseUpdatedListener' | 'purchaseErrorListener'>;

// iOS-only: ownership comes from StoreKit's current, verified entitlement,
// never a profile, a backup, a preview setting, or a persisted Boolean.
export class LifetimePurchases {
  private state: PurchaseSnapshot = { connected: false, busy: false, price: null, message: null };
  private listeners = new Set<() => void>();
  private subscriptions: { remove(): void }[] = [];
  private accepting = new Set<string>();
  private active = false;
  private starting: Promise<void> | null = null;
  private stopping: Promise<void> = Promise.resolve();
  constructor(private api: StoreApi, private setOwned: (owned: boolean) => void) {}
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private update(partial: Partial<PurchaseSnapshot>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(listener => listener());
  }
  private purchaseError = (error: { code?: string; message?: string }) => {
    this.update({ busy: false, message: error.code === 'user-cancelled' ? null :
      error.code === 'deferred-payment' || error.code === 'pending'
        ? 'Waiting for Apple approval. Premium will unlock when the purchase completes.'
        : 'Apple could not complete this purchase. Try again, or restore an existing purchase.' });
  };
  start = (): Promise<void> => {
    if (this.starting) return this.active ? this.starting : this.starting.then(() => this.start());
    if (this.active) return Promise.resolve();
    this.active = true;
    this.subscriptions = [
      this.api.purchaseUpdatedListener(p => { void this.accept(p); }),
      this.api.purchaseErrorListener(this.purchaseError),
    ];
    this.starting = (async () => {
      try {
        await this.stopping;
        if (!await this.api.initConnection()) throw new Error('Store unavailable');
        if (!this.active) return;
        this.update({ connected: true });
        // Ownership recovery and product loading are independent. A failed
        // recovery must not prevent a new customer from seeing the product.
        await this.refresh().catch(() => {});
        await this.loadProduct();
      } catch {
        this.update({ message: 'Unable to connect to the App Store. Check your connection and try again.' });
      } finally { this.starting = null; }
    })();
    return this.starting;
  };
  stop = () => {
    this.active = false;
    this.subscriptions.forEach(s => s.remove());
    this.subscriptions = [];
    this.update({ connected: false, busy: false });
    this.stopping = (this.starting ?? Promise.resolve()).then(async () => {
      if (!this.active) await this.api.endConnection().catch(() => {});
    });
  };
  refresh = async (): Promise<boolean> => {
    const entitlement = await this.api.currentEntitlementIOS(LIFETIME_PRODUCT_ID);
    const eligible = entitlement?.productId === LIFETIME_PRODUCT_ID &&
      entitlement.purchaseState === 'purchased' && entitlement.revocationDateIOS == null;
    const owned = !!eligible && await this.api.isTransactionVerifiedIOS(LIFETIME_PRODUCT_ID);
    this.setOwned(owned);
    return owned;
  };
  private loadProduct = async () => {
    const products = await this.api.fetchProducts({ skus: [LIFETIME_PRODUCT_ID], type: 'in-app' });
    const product = products?.find(p => p.id === LIFETIME_PRODUCT_ID);
    this.update({ price: product?.displayPrice || null, message: product ? null :
      'Alter-Xtra is unavailable from the App Store right now. You can still restore a previous purchase.' });
  };
  retry = async () => {
    if (this.state.busy) return;
    if (!this.state.connected) {
      this.stop();
      await this.start();
      return;
    }
    try { await this.refresh(); await this.loadProduct(); }
    catch { this.update({ message: 'Could not load the App Store. Check your connection and try again.' }); }
  };
  buy = async () => {
    if (!this.state.connected || !this.state.price || this.state.busy) return;
    this.update({ busy: true, message: null });
    try {
      // Completion is delivered through the listener; requesting a purchase
      // alone never grants premium and automatic finishing is disabled.
      await this.api.requestPurchase({ type: 'in-app', request: {
        apple: { sku: LIFETIME_PRODUCT_ID, andDangerouslyFinishTransactionAutomatically: false },
      } });
    } catch (error) { this.purchaseError(error as { code?: string }); }
  };
  private accept = async (purchase: IAP.Purchase) => {
    if (purchase.productId !== LIFETIME_PRODUCT_ID || this.accepting.has(purchase.id)) return;
    if (purchase.purchaseState !== 'purchased') {
      this.purchaseError({ code: 'pending' });
      return;
    }
    this.accepting.add(purchase.id);
    try {
      if (!await this.refresh()) throw new Error('Purchase not verified');
      await this.api.finishTransaction({ purchase, isConsumable: false });
      this.update({ message: 'Alter-Xtra is unlocked.' });
    } catch {
      // Leave unfinished transactions queued for retry on next launch.
      this.update({ message: 'Purchase verification could not finish. Use Restore Purchases to retry; do not buy again.' });
    } finally { this.accepting.delete(purchase.id); this.update({ busy: false }); }
  };
  restore = async () => {
    if (!this.state.connected || this.state.busy) return;
    this.update({ busy: true, message: null });
    try {
      await this.api.restorePurchases();
      const owned = await this.refresh();
      this.update({ message: owned ? 'Alter-Xtra restored.' : 'No Lifetime purchase was found for this Apple account.' });
    } catch {
      this.update({ message: 'Restore could not finish. Check your connection and Apple account, then try again.' });
    } finally { this.update({ busy: false }); }
  };
}
