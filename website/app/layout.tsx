import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@/components/Analytics";

const chakraPetch = localFont({
  variable: "--font-chakra-petch",
  display: "swap",
  src: [
    { path: "./fonts/ChakraPetch-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ChakraPetch-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/ChakraPetch-SemiBold.ttf", weight: "600", style: "normal" },
  ],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alterxtra.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AlterX — Become who you're building toward",
  description:
    "AlterX is a private, on-device identity-transformation app: track habits, journal, rewrite limiting beliefs, and record messages to your future self.",
  openGraph: {
    title: "AlterX — Become who you're building toward",
    description:
      "A private, on-device identity-transformation app: habits, journaling, belief work, and messages to your future self.",
    url: siteUrl,
    siteName: "AlterX",
    images: ["/wordmark.png"],
  },
  icons: {
    icon: "/icon.png",
  },
  // Fill in via NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION once you've created the
  // property in Google Search Console (Settings > Ownership verification >
  // HTML tag). Unset renders nothing rather than a broken empty tag.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${chakraPetch.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
