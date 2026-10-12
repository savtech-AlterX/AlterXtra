import type * as IAP from 'expo-iap';
import { LifetimePurchases, LIFETIME_PRODUCT_ID } from '../lifetimePurchases';

const purchase = (extra = {}) => ({
  id: 'transaction-1', productId: LIFETIME_PRODUCT_ID, purchaseState: 'purchased',
  store: 'apple', storeId: 'apple', revocationDateIOS: null, ...extra,
}) as IAP.PurchaseIOS;

function setup() {
  let update: (p: IAP.Purchase) => void = () => {};
  let error: (e: { code: string }) => void = () => {};
  const api = {
    initConnection: jest.fn().mockResolvedValue(true),
    endConnection: jest.fn().mockResolvedValue(true),
    fetchProducts: jest.fn().mockResolvedValue([{ id: LIFETIME_PRODUCT_ID, displayPrice: '£14.99' }]),
    requestPurchase: jest.fn().mockResolvedValue(null),
    restorePurchases: jest.fn().mockResolvedValue(undefined),
    currentEntitlementIOS: jest.fn().mockResolvedValue(null),
    isTransactionVerifiedIOS: jest.fn().mockResolvedValue(true),
    finishTransaction: jest.fn().mockResolvedValue(undefined),
    purchaseUpdatedListener: jest.fn(callback => { update = callback; return { remove: jest.fn() }; }),
    purchaseErrorListener: jest.fn(callback => { error = callback; return { remove: jest.fn() }; }),
  };
  const setOwned = jest.fn();
  const store = new LifetimePurchases(api as unknown as typeof IAP, setOwned);
  return { api, store, setOwned, update: (p: IAP.Purchase) => update(p), error: (code: string) => error({ code }) };
}
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

it('loads Apple pricing and requests the exact non-consumable without granting ownership', async () => {
  const { api, store, setOwned } = setup();
  await store.start();
  expect(store.getSnapshot().price).toBe('£14.99');
  await store.buy();
  expect(api.requestPurchase).toHaveBeenCalledWith({ type: 'in-app', request: {
    apple: { sku: LIFETIME_PRODUCT_ID, andDangerouslyFinishTransactionAutomatically: false },
  } });
  expect(setOwned).not.toHaveBeenCalledWith(true);
});

it('verifies ownership before finishing; duplicate callbacks do not finish twice', async () => {
  const { api, store, setOwned, update } = setup();
  await store.start();
  api.currentEntitlementIOS.mockResolvedValue(purchase());
  update(purchase()); update(purchase());
  await flush();
  expect(setOwned).toHaveBeenLastCalledWith(true);
  expect(api.finishTransaction).toHaveBeenCalledTimes(1);
  expect(api.finishTransaction).toHaveBeenCalledWith({ purchase: purchase(), isConsumable: false });
  expect(store.getSnapshot().busy).toBe(false);
});

it.each([
  ['missing entitlement', null, true],
  ['wrong product', purchase({ productId: 'another-product' }), true],
  ['pending payment', purchase({ purchaseState: 'pending' }), true],
  ['refunded entitlement', purchase({ revocationDateIOS: 123 }), true],
  ['unverified transaction', purchase(), false],
])('does not grant or finish a %s', async (_label, entitlement, verified) => {
  const { api, store, setOwned, update } = setup();
  await store.start();
  api.currentEntitlementIOS.mockResolvedValue(entitlement);
  api.isTransactionVerifiedIOS.mockResolvedValue(verified);
  update(purchase());
  await flush();
  expect(setOwned).not.toHaveBeenCalledWith(true);
  expect(api.finishTransaction).not.toHaveBeenCalled();
});

it('cancellation and deferred payment do not unlock premium', async () => {
  const { store, setOwned, error } = setup();
  await store.start(); await store.buy();
  error('user-cancelled');
  expect(store.getSnapshot()).toMatchObject({ busy: false, message: null });
  await store.buy(); error('deferred-payment');
  expect(store.getSnapshot().message).toContain('Waiting for Apple approval');
  expect(setOwned).not.toHaveBeenCalledWith(true);
});

it('restores verified ownership and recovers it on a fresh launch', async () => {
  const { api, store, setOwned } = setup();
  await store.start();
  api.currentEntitlementIOS.mockResolvedValue(purchase());
  await store.restore();
  expect(api.restorePurchases).toHaveBeenCalledTimes(1);
  expect(setOwned).toHaveBeenLastCalledWith(true);
  const nextLaunch = new LifetimePurchases(api as unknown as typeof IAP, setOwned);
  await nextLaunch.start();
  expect(setOwned).toHaveBeenLastCalledWith(true);
});

it('revokes ownership after a refund and preserves it when recovery throws a network error', async () => {
  const { api, store, setOwned } = setup();
  api.currentEntitlementIOS.mockResolvedValue(purchase());
  await store.start();
  api.currentEntitlementIOS.mockRejectedValueOnce(new Error('offline'));
  await expect(store.refresh()).rejects.toThrow('offline');
  expect(setOwned).toHaveBeenLastCalledWith(true);
  api.currentEntitlementIOS.mockResolvedValue(null);
  await store.refresh();
  expect(setOwned).toHaveBeenLastCalledWith(false);
});

it('does not submit a purchase while products are unavailable', async () => {
  const { api, store } = setup();
  api.fetchProducts.mockResolvedValue([]);
  await store.start(); await store.buy();
  expect(api.requestPurchase).not.toHaveBeenCalled();
  expect(store.getSnapshot().price).toBeNull();
});
