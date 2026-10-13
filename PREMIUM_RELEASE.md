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

## Build 10: visible purchase controls

- The localized price, electric-blue BUY ALTER-XTRA button, restore action, and pricing retry are now at the top of the premium page, before the banner, themes, and benefits.
- Purchase remains disabled until Apple supplies a product price. No guessed price or local entitlement bypass is used.
- Fixed retry so a failed ownership lookup does not block reloading the product catalog.
- TypeScript and 14 purchase/entitlement tests passed; static web export passed.
- Native iPhone layout, the actual price, Apple payment sheet, and restoration remain to be verified on TestFlight build 10. The screenshot from build 9 showed Price unavailable; Apple product ID, pricing/localization, availability, and paid agreement must be checked in App Store Connect.
