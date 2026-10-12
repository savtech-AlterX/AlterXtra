import * as IAP from 'expo-iap';
import { LifetimePurchases } from './lifetimePurchases';
import { setPurchasedAlterXtra } from './entitlements';

export const purchases = new LifetimePurchases(IAP, setPurchasedAlterXtra);
