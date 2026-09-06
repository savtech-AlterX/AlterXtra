# Security

## Canary token — do not remove `.env.production`

`.env.production` at the repo root is a **decoy**, not a real secrets file.
Every value in it is fake. It exists to catch anyone who clones or gains
access to this repo and starts poking through it for credentials.

The file's "rotate immediately" link points at
`/api/canary/<token>` on the AlterX marketing website
(`website/app/api/canary/[token]/route.ts`). Nobody legitimate ever has a
reason to open that link — it's not referenced anywhere else in the app or
website. If it gets hit, that route logs the requester's IP, user agent,
and timestamp, and forwards them to whatever webhook
`CANARY_ALERT_WEBHOOK_URL` is set to in the website's deployment (see
`website/.env.example`).

**If you get a canary alert:**
1. Check who currently has access to this repo (collaborators, forks,
   deploy keys, any place `.env.production` could have been copied to).
2. Rotate anything that's actually real and sensitive — Expo/EAS token,
   Google OAuth credentials, App Store Connect API keys — as a precaution,
   even though the ones in the decoy file are fake.
3. Treat the IP/timestamp in the alert as a lead, not proof of who it was —
   it could be an automated scanner, not a person.

**Do not:**
- Delete or "clean up" `.env.production` thinking it's an accidental commit.
- Add real secrets to it — its only job is to look real to someone who
  shouldn't be there.
- Change its filename or the canary link without updating both this doc
  and the route above to match.

If you set up additional decoys elsewhere in the repo, give each one its
own token in the URL (generate with `python3 -c "import secrets;
print(secrets.token_hex(16))"` or similar) so an alert tells you which bait
was hit.
