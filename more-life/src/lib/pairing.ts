import { randomUUID } from "crypto";
import { sql } from "./db";
import { CATEGORIES, type Category, type Pool } from "./categories";
import { signPair } from "./sign";

export type PairItem = { id: string; image_url: string };
export type ServedPair = {
  token: string;
  category: Category;
  pool: Pool;
  variant: "life" | "beauty";
  left: PairItem;
  right: PairItem;
};

const BEAUTY_SHARE = 0.2; // ~20% of pairs ask "more beautiful" instead of "more life"
const RECENT_PAIR_WINDOW = 50; // never repeat a pair within a voter's last 50 votes
const RATING_WINDOWS = [150, 300, 600, Infinity]; // widen until a partner exists

type Row = { id: string; image_url: string; rating: number; vote_count: number };

function pairKey(x: string, y: string): string {
  return x < y ? `${x}|${y}` : `${y}|${x}`;
}

/**
 * Pair selection (LOCKED rationale):
 *  - first item weighted toward low vote count (under-sampled items need data)
 *  - second item from the same category & pool with a close rating (<~150,
 *    widening only when no candidate exists) — close pairs are the informative ones
 *  - no pair repeats within the voter's recent window
 *  - the voter's own uploads never appear in their queue
 *  - left/right position randomized independently per pair
 */
export async function selectPair(
  voterHash: string,
  category: Category | null,
  pool: Pool,
  excludeKeys: Set<string>,
): Promise<ServedPair | null> {
  const recent = await sql<{ item_a_id: string; item_b_id: string }[]>`
    select item_a_id, item_b_id from votes
    where voter_hash = ${voterHash}
    order by id desc limit ${RECENT_PAIR_WINDOW}`;
  const seen = new Set(excludeKeys);
  for (const r of recent) seen.add(pairKey(r.item_a_id, r.item_b_id));

  // Try the requested (or a random) category first, then fall back to any
  // category that has enough items — never mixing categories within a pair.
  const order: Category[] = category
    ? [category]
    : [...CATEGORIES].sort(() => Math.random() - 0.5);

  for (const cat of order) {
    const pair = await selectWithinCategory(voterHash, cat, pool, seen);
    if (pair) return pair;
  }
  return null;
}

async function selectWithinCategory(
  voterHash: string,
  category: Category,
  pool: Pool,
  seen: Set<string>,
): Promise<ServedPair | null> {
  // First item: sample among the least-voted items, with mild randomness.
  const anchors = await sql<Row[]>`
    select id, image_url, rating, vote_count from items
    where pool = ${pool} and category = ${category} and approved
      and (uploader_hash is null or uploader_hash <> ${voterHash})
    order by vote_count asc, random()
    limit 12`;
  if (anchors.length < 2) return null;

  // Weighted draw favoring the front of the vote_count-ordered list.
  const tryOrder: Row[] = [];
  const remaining = [...anchors];
  while (remaining.length && tryOrder.length < 4) {
    const i = Math.floor(Math.pow(Math.random(), 2) * remaining.length);
    tryOrder.push(remaining.splice(i, 1)[0]);
  }

  for (const a of tryOrder) {
    for (const window of RATING_WINDOWS) {
      const candidates = await sql<Row[]>`
        select id, image_url, rating, vote_count from items
        where pool = ${pool} and category = ${category} and approved
          and id <> ${a.id}
          and (uploader_hash is null or uploader_hash <> ${voterHash})
          and abs(rating - ${a.rating}) < ${window === Infinity ? 1e9 : window}
        order by random()
        limit 8`;
      const b = candidates.find((c) => !seen.has(pairKey(a.id, c.id)));
      if (b) return serve(a, b, category, pool);
    }
  }
  return null;
}

function serve(a: Row, b: Row, category: Category, pool: Pool): ServedPair {
  // Independent left/right randomization on every pair (side bias is real).
  const [left, right] = Math.random() < 0.5 ? [a, b] : [b, a];
  const variant: "life" | "beauty" = Math.random() < BEAUTY_SHARE ? "beauty" : "life";
  const token = signPair({
    a: left.id,
    b: right.id,
    category,
    pool,
    variant,
    nonce: randomUUID(),
    iat: Math.floor(Date.now() / 1000),
  });
  return {
    token,
    category,
    pool,
    variant,
    left: { id: left.id, image_url: left.image_url },
    right: { id: right.id, image_url: right.image_url },
  };
}
