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
            gap: 20px; padding: 14px max(20px, env(safe-area-inset-right)) 14px max(20px, env(safe-area-inset-left));
            background: linear-gradient(90deg, #030407 0%, #050914 52%, #030407 100%);
            border-bottom: 1px solid #2457ff; color: #fff;
            font-family: 'ChakraPetch-Medium', system-ui, sans-serif; }
          .alterx-launch p { margin: 0; line-height: 1.45; font-size: 12px; }
          .alterx-launch strong { display: block; color: #6f91ff; font-size: 11px;
            letter-spacing: .18em; margin-bottom: 5px; text-shadow: 0 0 14px #2457ff55; }
          .alterx-launch p span { display: block; margin-top: 5px; color: #8fa3b8; font-size: 10px; letter-spacing: .04em; }
          .alterx-launch p + p { border-left: 1px solid #2457ff66; padding-left: 20px; }
          @media (max-width: 420px) {
            .alterx-launch { gap: 12px; padding: 10px 12px; }
            .alterx-launch p { font-size: 10px; }
            .alterx-launch strong { font-size: 10px; letter-spacing: .09em; }
            .alterx-launch p + p { padding-left: 12px; }
          }
        ` }} />
      </head>
      <body>
        <aside className="alterx-launch" aria-label="Coming soon">
          <p><strong>ALTER X · THE FIRST STEP</strong>You don’t have to feel ready. You just have to begin.<span>App Store review in progress.</span></p>
          <p><strong>ALTER-XTRA · THE NEXT LEVEL</strong>Don’t just set the goal. Become the person who gets there.<span>Premium is on its way.</span></p>
        </aside>
        {children}
      </body>
    </html>
  );
}
