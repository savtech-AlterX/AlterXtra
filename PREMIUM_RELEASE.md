# Alter-Xtra purchase release

ALTER X IS AN ARTWORK

Alter-Xtra is a one-time, non-consumable Apple purchase. Coming soon applies to mascots, not premium.

## Store configuration

- App bundle: `com.alterxtra.app`.
- Product ID: `alterxtra_lifetime` (from the existing purchase patch; confirm against App Store Connect before building).
- Product type: Non-Consumable. Price is loaded from Apple, including local currency.
- Apple paid-app agreement, banking and tax setup must be active.
- Submit the in-app purchase with the first build that supports it.

## Build and device verification

Build 9 uses native `expo-iap` and a new update runtime `1.0.0-premium-1`; old installed builds cannot receive this purchase code as a JavaScript-only update.
Codemagic installs dependencies and regenerates the native project, including the In-App Purchase capability.

Install the new build through TestFlight. Confirm localized pricing, complete a sandbox purchase, verify all themes and limits unlock, restart and confirm ownership returns. Reinstall and use Restore Purchases. Cancel a purchase and verify premium stays locked. Check refund/revocation in StoreKit testing. The development preview switch is hidden and disabled in release builds.

## Validation

- TypeScript check passed.
- 84 tests passed across 9 suites with `TZ=UTC npm test -- --runInBand`.
- Static web export and iOS prebuild passed. Existing widget App Groups and backgroundColor warnings remain.
- Apple payment sheets and native signed iOS compilation require the new device build; neither is proven by the web preview or mocked tests.
