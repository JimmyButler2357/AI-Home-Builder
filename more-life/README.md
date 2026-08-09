# More Life — "Which has more life?"

A public pairwise-comparison experiment testing Christopher Alexander's claim
that people agree — far more than chance — about which of two things has more
*life*. Two images, one click, Elo ratings, honest methodology. Data quality
first, engagement second, polish third.

Part of the [Mirror of Self ecosystem](../docs/sub-projects/mirror-of-self-ecosystem.md).

## Stack

Next.js (App Router) + TypeScript + Tailwind, plain Postgres via
[`postgres`](https://github.com/porsager/postgres) (works with Supabase, Neon,
or any Postgres), deployable on Vercel.

## Quick start (local)

```bash
npm install
cp .env.example .env.local        # fill in DATABASE_URL, APP_SECRET, ADMIN_PASSWORD
npm run db:migrate                # applies db/migrations/*.sql (idempotent)
npm run seed:dev                  # placeholder images so you can try the loop
npm run dev
```

Visit http://localhost:3000, vote, then check `/leaderboard`, `/method`,
`/contribute`, `/admin`.

`npm run seed:dev -- --reset` removes the placeholder items again.

## Seeding the real curated set

The curated pool is the scientific corpus — composition matters more than
volume (target 120–200 per category).

1. `npm run seed:build` — queries the Wikimedia Commons API using the source
   categories in `seed/sources.json` and writes `seed/items.json` with
   attribution, source URL, and license for every entry (free licenses only:
   PD / CC0 / CC BY / CC BY-SA). Needs normal internet access.
2. **Hand-review the manifest.** Cull images with strong photographic
   confounds (dramatic light, staging, people, weather), and make sure each
   category spans cultures, eras, humble and celebrated. `mugs`, `chairs`,
   `textiles` should skew toward neutral-background object photography — they
   are the control channel.
3. `npm run seed:import -- --verify` — idempotent upsert keyed by `seed_key`;
   re-runs update metadata but never touch ratings. Entries missing
   attribution/source/license are rejected; `--verify` HEAD-checks image URLs.

## How the research constraints are implemented

- **Within-category pairs only** — pair selection never crosses categories
  (`src/lib/pairing.ts`).
- **Elo** with K = 32/16/8 decay (`src/lib/elo.ts`), ties = 0.5. Applied
  atomically with row locks in `/api/vote`.
- **Informative pairs** — first item weighted toward low vote count, partner
  within ~150 rating points (window widens only if needed), no pair repeats
  within a voter's last 50 votes, mild randomness throughout.
- **Position randomization** — left/right shuffled server-side per pair;
  `item_a` = left as displayed, plus explicit `position_of_winner`.
- **No anchoring** — the voting screen never shows ratings, titles, origins,
  captions, or differing frames; alt text is generic per category.
- **Everything is recorded** — ties, response times, over-rate-limit votes
  (flagged, not dropped). Filtering happens at analysis time.
- **Question variant** — ~20% of pairs ask "Which is more beautiful?" instead;
  stored per vote.
- **Background question** — one-time, skippable, after the 20th vote.
- **Pools never mix** — curated vs community are separated in pairing,
  ratings, and leaderboards. Uploaders never see their own uploads.
- **Anonymous** — voters are a salted hash of a random first-party cookie.
  No accounts, no PII, no third-party requests of any kind.
- **Integrity of the write path** — votes reference an HMAC-signed pair token
  issued by `/api/pair`, so only server-served pairs can be voted on, and
  retries are idempotent. Optimistic UI with a persistent retry queue; the
  next pair is prefetched and its images preloaded.

## Deploying

1. Create a Postgres database (Supabase/Neon). Run `npm run db:migrate` with
   `DATABASE_URL` pointed at it (for Supabase's transaction pooler, also set
   `DATABASE_NO_PREPARE=1`).
2. Import the seed (above).
3. Deploy to Vercel with env vars from `.env.example`. For community uploads
   in production, create a public Supabase Storage bucket and set the three
   `SUPABASE_*` vars; otherwise uploads are disabled.

## Endpoints

| Path | What |
| --- | --- |
| `/` | Voting |
| `/leaderboard` | Per-category leaderboards, curated/community toggle |
| `/item/:id` | Attribution, license, record, rating history |
| `/method` | Methodology, limitations, CSV export link |
| `/contribute` | Community uploads (reviewed before appearing) |
| `/admin` | Review queue (password-protected) |
| `/api/export` | Full anonymized vote table as CSV |
