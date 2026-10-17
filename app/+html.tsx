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
          .alterx-launch { flex-shrink: 0; display: grid; grid-template-columns: 1fr 1fr;
            gap: 20px; padding: 12px max(20px, env(safe-area-inset-right)) 12px max(20px, env(safe-area-inset-left));
            background: #000; border-bottom: 1px solid #2457ff;
            color: #fff; font-family: 'ChakraPetch-Medium', system-ui, sans-serif; }
          .alterx-launch p { margin: 0; line-height: 1.4; font-size: 12px; }
          .alterx-launch strong { display: block; color: #5275ff; font-size: 14px;
            letter-spacing: .12em; text-shadow: 0 0 14px #2457ff66; }
          .alterx-launch p + p { border-left: 1px solid #2457ff66; padding-left: 20px; }
          @media (max-width: 420px) {
            .alterx-launch { gap: 12px; padding: 10px 12px; }
            .alterx-launch p { font-size: 11px; }
            .alterx-launch strong { font-size: 12px; letter-spacing: .07em; }
            .alterx-launch p + p { padding-left: 12px; }
          }
        ` }} />
      </head>
      <body>
        <aside className="alterx-launch" aria-label="Coming soon">
          <p><strong>ALTER X</strong>Coming soon to the App Store</p>
          <p><strong>ALTER-XTRA</strong>Premium — coming soon</p>
        </aside>
        {children}
      </body>
    </html>
  );
}
