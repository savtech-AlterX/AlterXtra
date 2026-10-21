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
            gap: 0; padding: 0 max(20px, env(safe-area-inset-right)) 0 max(20px, env(safe-area-inset-left));
            background: #030407; border-bottom: 1px solid #2457ff; color: #fff;
            font-family: 'ChakraPetch-Medium', system-ui, sans-serif; }
          .alterx-launch p { margin: 0; padding: 17px 22px 18px; line-height: 1.45; font-size: 13px; }
          .alterx-launch strong { display: block; color: #7894ff; font-size: 10px;
            letter-spacing: .24em; margin-bottom: 6px; }
          .alterx-launch p span { display: block; margin-top: 4px; color: #8b94a8; font-size: 10px; letter-spacing: .06em; }
          .alterx-launch p + p { border-left: 1px solid #2457ff55; }
          @media (max-width: 420px) {
            .alterx-launch p { padding: 13px 12px 14px; font-size: 11px; }
            .alterx-launch strong { font-size: 9px; letter-spacing: .13em; }
            .alterx-launch p span { font-size: 9px; }
          }
        ` }} />
      </head>
      <body>
        <aside className="alterx-launch" aria-label="AlterX launch announcements">
          <p><strong>ALTER X</strong>Coming to the App Store<span>Currently in review</span></p>
          <p><strong>ALTER-XTRA</strong>Premium unlock<span>Coming soon</span></p>
        </aside>
        {children}
      </body>
    </html>
  );
}
