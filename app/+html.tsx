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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes ax-sweep { 0% { transform: translateX(-140%) skewX(-22deg); opacity: 0; } 12% { opacity: .7; } 55% { opacity: .24; } 100% { transform: translateX(340%) skewX(-22deg); opacity: 0; } }
          @keyframes ax-pulse { 0%, 100% { box-shadow: 0 0 5px #2457ff, 0 0 12px #2457ff33; opacity: .65; } 50% { box-shadow: 0 0 9px #4770ff, 0 0 20px #2457ff88; opacity: 1; } }
          body { margin: 0; background: #000; display: flex; flex-direction: column; }
          #root { flex: 1; height: auto; min-height: 0; }
          .alterx-launch { position: relative; isolation: isolate; flex-shrink: 0; display: grid; grid-template-columns: 1fr 1fr;
            gap: 0; padding: 0 max(20px, env(safe-area-inset-right)) 0 max(20px, env(safe-area-inset-left));
            background: #02040b; border-bottom: 1px solid #2457ff; color: #fff;
            font-family: 'Manrope', Arial, Helvetica, sans-serif; overflow: hidden; }
          .alterx-launch:before { content: ''; position: absolute; z-index: -1; inset: 0; pointer-events: none;
            background: linear-gradient(110deg, transparent 0%, #2457ff08 27%, #2457ff20 50%, #2457ff05 71%, transparent 100%); }
          .alterx-launch:after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 22%; pointer-events: none;
            background: linear-gradient(90deg, transparent, #6686ff2b, transparent); animation: ax-sweep 7s ease-in-out infinite; }
          .alterx-launch p { position: relative; margin: 0; padding: 18px 22px 19px 25px; line-height: 1.2; font-size: 15px; font-weight: 800; letter-spacing: -.035em; }
          .alterx-launch p:before { content: ''; position: absolute; left: 4px; top: 19px; width: 5px; height: 5px; border-radius: 50%; background: #4770ff; animation: ax-pulse 2.8s ease-in-out infinite; }
          .alterx-launch strong { display: block; color: #7894ff; font-size: 9px; font-weight: 700;
            letter-spacing: .25em; margin-bottom: 5px; text-transform: uppercase; }
          .alterx-launch p span { display: block; margin-top: 5px; color: #a0aac4; font-size: 9px; letter-spacing: .11em; text-transform: uppercase; }
          .alterx-launch p + p { border-left: 1px solid #2457ff66; }
          .alterx-launch p + p:before { animation-delay: 1.2s; }
          @media (max-width: 420px) {
            .alterx-launch { padding-left: 14px; padding-right: 14px; }
            .alterx-launch p { padding: 12px 7px 13px 17px; font-size: 10px; }
            .alterx-launch p:before { left: 2px; top: 17px; width: 4px; height: 4px; }
            .alterx-launch strong { font-size: 8px; letter-spacing: .16em; }
            .alterx-launch p span { font-size: 8px; letter-spacing: .04em; }
          }
          @media (prefers-reduced-motion: reduce) { .alterx-launch:after, .alterx-launch p:before { animation: none; } }
        ` }} />
      </head>
      <body>
        <aside className="alterx-launch" aria-label="AlterX launch announcements">
          <p><strong>ALTER X / 001</strong>The next version of you.<span>App Store launch approaching</span></p>
          <p><strong>ALTER-XTRA / 002</strong>Unlock your next level.<span>Premium edition · Coming soon</span></p>
        </aside>
        {children}
      </body>
    </html>
  );
}
