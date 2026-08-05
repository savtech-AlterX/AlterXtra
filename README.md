# Regrown

A social app for climate good news: people share **before-and-after** photos of what they did — beach and park
cleanups, restored habitats, tree planting, renewable energy projects, community wins — and others can like,
comment, and follow along.

Built with [Expo](https://docs.expo.dev/versions/v57.0.0/) (SDK 57), [expo-router](https://docs.expo.dev/versions/v57.0.0/sdk/router/),
and [Supabase](https://supabase.com/) (Postgres database, auth, and file storage).

## 1. Set up your Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor → New query**, paste in the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `profiles`, `posts`, `likes`,
   `comments`, and `follows` tables (with row-level security policies) and the `post-photos` / `avatars`
   storage buckets.
3. Open **Project Settings → API** and copy your **Project URL** and **anon public key**.
4. By default Supabase requires email confirmation for new sign-ups. For local testing you can turn this off
   under **Authentication → Providers → Email → Confirm email**, or leave it on and confirm via the email
   Supabase sends.

## 2. Configure the app

Copy `.env.example` to `.env` and fill in the values from step 1.3:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run it

```bash
npm install
npm run start   # then press i / a / w, or scan the QR code with Expo Go
```

## Project structure

```
app/                  expo-router screens
  (auth)/              welcome, sign-in, sign-up
  (tabs)/              feed, create post, my profile
  post/[id]            post detail, likes, comments
  profile/[id]         another user's profile
  profile/edit         edit your own profile
src/
  components/          Screen, Button, Card, PostCard, BeforeAfterSlider, ...
  lib/                 supabase.ts client, posts.ts / profiles.ts data access
  store/               AuthContext (Supabase session), shared types
  theme/                light/dark nature-toned palette + typography
supabase/
  schema.sql           database schema, RLS policies, storage buckets
```

## Data model

- **profiles** — one row per user (`id` = `auth.users.id`), created automatically on sign-up via a Postgres
  trigger, seeded from the username chosen at sign-up.
- **posts** — before/after photo URLs, a `category` (cleanup, habitat restoration, reforestation, wildlife,
  renewable energy, community, other), caption, and optional location text.
- **likes**, **comments**, **follows** — standard join tables, all readable by anyone and writable only by
  their own author (enforced by row-level security).

## Known gaps / next steps

- **App icon and splash art** still say "AlterXtra" — the image assets under `assets/` need to be replaced
  with Regrown branding.
- **Push notifications** (e.g. "someone liked your post") aren't wired up yet — would need a Supabase Edge
  Function or database webhook plus `expo-notifications`.
- **Feed** is a simple reverse-chronological list of all posts; there's no "following only" feed, search, or
  map view yet.
- **Account deletion** isn't self-serve in the app yet (see `PRIVACY_POLICY.md`).
