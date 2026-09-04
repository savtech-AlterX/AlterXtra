# AlterX marketing website

The public landing page for AlterX (alterxtra.app), separate from the Expo
app in the rest of this repo. Built with Next.js 16 (App Router) + Tailwind.

## Setup

```
npm install
cp .env.example .env.local   # then fill in whichever values you have
npm run dev
```

Nothing in `.env.local` is required to run the site — every integration
below no-ops until its env var is set.

## Wiring up each checklist item

- **Google Search Console** — create the property at
  [search.google.com/search-console](https://search.google.com/search-console),
  verify via the "HTML tag" method, and put the `content` value into
  `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. Submit `/sitemap.xml` (already
  generated at `app/sitemap.ts`) once verified.
- **Page speed** — run `npm run build && npm start` then
  `npx lighthouse http://localhost:3000 --view` (or PageSpeed Insights
  against the deployed URL) after any content change. Core Web Vitals are
  also streamed into GA4 automatically once `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  is set (see `components/Analytics.tsx`).
- **Image compression** — already handled: every image on the site goes
  through `next/image`, which resizes and re-encodes to AVIF/WebP per
  request (configured in `next.config.ts`). Just keep using `<Image>` for
  anything new instead of a raw `<img>`.
- **GA4** — create a GA4 property, copy the Measurement ID
  (`G-XXXXXXXXXX`) from Admin → Data Streams, set
  `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- **Email capture** — the form on the homepage posts to
  `/api/subscribe` (`app/api/subscribe/route.ts`), which forwards to
  `EMAIL_CAPTURE_WEBHOOK_URL`. Point that at a Zapier/Make webhook or your
  email provider's "add subscriber" webhook. Left unset, signups are
  accepted and logged server-side but not forwarded anywhere — fine for
  local testing, not for production.
- **Collect reviews** — `components/ReviewsSection.tsx` starts with an
  empty `REVIEWS` array on purpose. Only add real quotes there, ideally
  ones you can back up (a screenshot of the store review, or the reviewer's
  permission) — fabricated testimonials are an FTC Endorsement Guides
  violation, not just bad practice. `NEXT_PUBLIC_APP_STORE_URL` /
  `NEXT_PUBLIC_PLAY_STORE_URL` add "rate us" links once the app is listed.
- **Heatmap tool (Microsoft Clarity)** — create a project at
  [clarity.microsoft.com](https://clarity.microsoft.com), copy the project
  ID, set `NEXT_PUBLIC_CLARITY_PROJECT_ID`.

Not wired up (not requested): ad conversion tracking and an A/B testing
platform. If you start running ads or want experiments, PostHog covers both
in one SDK and is the easiest next addition.

## Deploying

Any Next.js host works; the path of least resistance is
[Vercel](https://vercel.com/new) — import this `website/` directory as the
project root, add the env vars from `.env.example` in the dashboard, and
deploy. Point `NEXT_PUBLIC_SITE_URL` at the final domain once you have one.

## Privacy

This site's own data collection (GA4, Clarity, email signups) is disclosed
at `/privacy`. That's intentionally separate from — and more permissive
than — the AlterX **app**'s privacy policy at the repo root
(`../PRIVACY_POLICY.md`), which stays local-only with no analytics. Don't
merge the two documents; they describe different products.
