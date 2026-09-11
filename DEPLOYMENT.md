# Deployment

Building and submitting to the stores needs real network access to Expo's
and the stores' own servers, which this repo's sandboxed sessions don't
have — this is a runbook for doing it yourself (or handing it to a session
that does have that access), not something a session can complete alone.

## One-time setup

### iOS

`eas.json` expects a local App Store Connect API key at
`credentials/ios/AuthKey_M8939JB9HT.p8` (that whole `credentials/` folder
is gitignored — never commit it). If you don't have that file:

1. App Store Connect → Users and Access → Integrations → Keys → generate
   a new key with **App Manager** access.
2. Download the `.p8` file (Apple only lets you download it once) and
   place it at `credentials/ios/AuthKey_<KEY_ID>.p8`.
3. Update `ascApiKeyId` in `eas.json` if the key ID differs from
   `M8939JB9HT`.

Recommended instead of managing that file by hand: run `eas credentials`
and let Expo store the signing certificate/provisioning profile on their
servers (`credentialsSource: "remote"`), so any machine or session with an
Expo login can build without needing the local file at all. The ASC API
key above is still needed either way — that's for *submitting*, not
signing.

### Android

`eas.json` expects a Play Console service account key at
`credentials/android/play-store-service-account.json` (same
`credentials/` folder, same rule — never commit it):

1. [Play Console](https://play.google.com/console) → Setup → API access →
   create a service account (this walks you to Google Cloud Console to
   create it, then back to Play Console to grant it access).
2. Grant it **Release manager** permission (enough to upload builds to
   the `internal` track this config submits to).
3. Generate a JSON key for that service account and save it at
   `credentials/android/play-store-service-account.json`.

Android builds don't need a local signing key the way iOS does — EAS
manages that certificate on its own servers by default.

## Building and submitting

From a machine or session with real network access:

```
npx eas-cli login
npx eas-cli build --platform ios --profile production
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform ios --latest
npx eas-cli submit --platform android --latest
```

iOS builds land in TestFlight; Android builds land on the Play Console's
`internal` track (change `submit.production.android.track` in `eas.json`
to `alpha`, `beta`, or `production` once you're ready to widen who sees
it). Each build takes roughly 15–20 minutes in Expo's cloud; store
processing after submit is another 5–15 minutes for TestFlight, and can
take longer for Play Console's review on tracks other than internal.
