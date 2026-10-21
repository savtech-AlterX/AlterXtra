import { ScrollViewStyleReset } from 'expo-router/html';
import React, { type PropsWithChildren } from 'react';

// Expo's HTML document is rendered only for the website, never on iOS/Android.
export default function WebDocument({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; background: #000; display: flex; flex-direction: column; }
          #root { flex: 1; height: auto; min-height: 0; }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
