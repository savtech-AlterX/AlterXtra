import { useEffect } from 'react';
import { AppState } from 'react-native';
import { purchases } from '../lib/purchases';

export function PurchasesBootstrap() {
  useEffect(() => {
    void purchases.start();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void purchases.retry();
    });
    return () => { subscription.remove(); purchases.stop(); };
  }, []);
  return null;
}
