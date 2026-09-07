import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Privacy Notice — AlterX",
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@alterxtra.app";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-6">
      <h1 className="font-display text-3xl text-glow-strong glow-text">Website Privacy Notice</h1>
      <p className="text-text-muted text-sm">Last updated September 2026</p>

      <p className="text-text-secondary leading-relaxed">
        This notice covers only <strong>this marketing website</strong> (alterxtra.app) — the pages you&apos;re
        reading right now. It is separate from the <strong>AlterX mobile app&apos;s privacy policy</strong>,
        which is far more restrictive: the app itself stores everything on-device and does not use analytics,
        ads, or tracking of any kind. See the app&apos;s privacy policy inside Settings → Privacy Policy for
        that.
      </p>

      <h2 className="font-display text-xl text-glow-strong mt-4">What this website collects</h2>
      <p className="text-text-secondary leading-relaxed">
        Unlike the app, this website uses standard web analytics to understand traffic and improve the site:
      </p>
      <ul className="list-disc list-inside text-text-secondary leading-relaxed space-y-1">
        <li>
          <strong>Google Analytics (GA4)</strong> — page views, referrers, approximate location, device type,
          and Core Web Vitals performance metrics. Governed by Google&apos;s privacy policy.
        </li>
        <li>
          <strong>Microsoft Clarity</strong> — anonymized heatmaps and session recordings of how visitors use
          this site (mouse movement, scrolling, clicks). Governed by Microsoft&apos;s privacy policy.
        </li>
        <li>
          <strong>Email signup</strong> — if you enter your email to get notified about Alter-Xtra, we store it
          with our email provider solely to send you that notification. You can unsubscribe at any time.
        </li>
      </ul>

      <p className="text-text-secondary leading-relaxed">
        We do not sell this data. Neither GA4 nor Clarity is loaded if the site owner hasn&apos;t configured
        them, and neither reads anything about the AlterX app installed on your device — the site and the app
        do not share any data with each other.
      </p>

      <p className="text-text-secondary leading-relaxed">
        Questions about this notice? Contact{" "}
        <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <Link href="/" className="text-glow underline underline-offset-4 text-sm mt-4">
        ← Back home
      </Link>
    </div>
  );
}
