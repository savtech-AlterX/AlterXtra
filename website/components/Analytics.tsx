"use client";

import Script from "next/script";
import { useReportWebVitals } from "next/web-vitals";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Reports Core Web Vitals (LCP, CLS, INP, etc.) into GA4 as events, so page
// speed regressions show up next to the rest of the site's analytics instead
// of needing a separate manual Lighthouse run to notice them.
function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_rating: metric.rating,
    });
  });
  return null;
}

/**
 * No-ops entirely when the relevant env var isn't set, so a fresh checkout
 * never ships a broken/empty tracking script — see .env.example for how to
 * turn each of these on.
 */
export function Analytics() {
  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
              window.gtag = gtag;
            `}
          </Script>
          <WebVitalsReporter />
        </>
      )}
      {CLARITY_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}
    </>
  );
}
