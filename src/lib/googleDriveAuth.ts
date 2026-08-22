import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Authorization Code + PKCE, not the older implicit grant — no client
// secret involved, which matters here since there's nowhere safe on-device
// to keep one. Google's OAuth endpoints don't publish a discovery document
// at a fixed well-known URL for installed apps, so these are hardcoded
// rather than fetched via useAutoDiscovery.
const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// appdata is the same hidden-per-app folder concept as iCloud's app
// container — invisible in the user's actual Drive UI, exists only for this
// app's own backups.
const SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];

type GoogleDriveClientIds = {
  ios?: string;
  android?: string;
};

// Populated from app.json's extra.googleDriveClientId once a Google Cloud
// OAuth client has actually been created — see the Settings screen's cloud
// backup section for what happens when it hasn't (the button explains
// itself instead of pretending to work).
export function getGoogleDriveClientId(): string | null {
  const extra = Constants.expoConfig?.extra as { googleDriveClientId?: GoogleDriveClientIds } | undefined;
  const ids = extra?.googleDriveClientId;
  if (!ids) return null;
  if (Platform.OS === 'ios') return ids.ios || null;
  if (Platform.OS === 'android') return ids.android || null;
  return null;
}

/**
 * Drives the Google sign-in flow and hands back a Drive-scoped access
 * token. Call `signIn()` from a user gesture (a button press) — the
 * underlying `promptAsync()` opens a system browser sheet and can't be
 * triggered from an effect.
 */
export function useGoogleDriveAuth() {
  const clientId = getGoogleDriveClientId();
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'alterxtra', path: 'oauthredirect' });
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    { clientId: clientId ?? '', scopes: SCOPES, redirectUri },
    DISCOVERY
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!response) return;
    if (response.type !== 'success') {
      if (response.type === 'error') setError(response.error?.message ?? 'Google sign-in failed.');
      return;
    }
    setExchanging(true);
    setError(null);
    AuthSession.exchangeCodeAsync(
      {
        clientId: clientId ?? '',
        code: response.params.code,
        redirectUri,
        extraParams: { code_verifier: request?.codeVerifier ?? '' },
      },
      DISCOVERY
    )
      .then((token) => setAccessToken(token.accessToken))
      .catch((e) => setError(e instanceof Error ? e.message : 'Google sign-in failed.'))
      .finally(() => setExchanging(false));
    // request/redirectUri/clientId are stable for the lifetime of this hook;
    // only a new response should re-trigger the exchange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return {
    available: !!clientId,
    ready: !!request,
    accessToken,
    exchanging,
    error,
    signIn: () => promptAsync(),
  };
}
