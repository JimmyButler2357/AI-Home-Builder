-- More Life: initial schema
-- Categories, pools, and research-integrity fields are LOCKED by the spec.

create extension if not exists pgcrypto;

create table if not exists items (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in
                  ('facades','interiors','streets','mugs','chairs','textiles','doors')),
  image_url     text not null,
  thumb_url     text,
  title         text,
  attribution   text not null default '',
  source_url    text not null default '',
  license       text not null default '',
  rating        double precision not null default 1500,
  vote_count    integer not null default 0,
  win_count     integer not null default 0,
  loss_count    integer not null default 0,
  tie_count     integer not null default 0,
  pool          text not null default 'curated' check (pool in ('curated','community')),
  approved      boolean not null default false,
  -- stable key for idempotent seed imports (e.g. "commons:File:X.jpg", "dev:mugs-3")
  seed_key      text unique,
  -- voter_hash of the uploader, so their own uploads never enter their queue
  uploader_hash text,
  report_count  integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists items_queue_idx
  on items (pool, category, approved, vote_count);
create index if not exists items_rating_idx
  on items (pool, category, approved, rating);

create table if not exists voters (
  voter_hash               text primary key,
  first_seen               timestamptz not null default now(),
  vote_count               integer not null default 0,
  self_reported_background text check (self_reported_background in ('yes','no','skip')),
  user_agent_class         text check (user_agent_class in ('mobile','desktop'))
);

-- item_a = shown on the left, item_b = shown on the right (server randomizes
-- position per pair, so a/b assignment is itself randomized).
-- Every vote is recorded, including ties and flagged (rate-limited) ones;
-- filtering happens at analysis time, never at collection time.
create table if not exists votes (
  id                 bigint generated always as identity primary key,
  item_a_id          uuid not null references items(id) on delete cascade,
  item_b_id          uuid not null references items(id) on delete cascade,
  winner_id          uuid references items(id) on delete cascade, -- null = tie ("can't tell")
  voter_hash         text not null,
  question_variant   text not null check (question_variant in ('life','beauty')),
  position_of_winner text check (position_of_winner in ('left','right')),
  response_ms        integer,
  category           text not null,
  pool               text not null default 'curated',
  rating_a_after     double precision,
  rating_b_after     double precision,
  flagged            boolean not null default false, -- over rate limit; kept, filtered in analysis
  client_nonce       text unique,                    -- idempotency key for background retries
  created_at         timestamptz not null default now()
);

create index if not exists votes_voter_idx  on votes (voter_hash, id desc);
create index if not exists votes_item_a_idx on votes (item_a_id);
create index if not exists votes_item_b_idx on votes (item_b_id);
create index if not exists votes_recent_idx on votes (voter_hash, created_at desc);

create table if not exists reports (
  item_id    uuid not null references items(id) on delete cascade,
  voter_hash text not null,
  created_at timestamptz not null default now(),
  primary key (item_id, voter_hash)
);
