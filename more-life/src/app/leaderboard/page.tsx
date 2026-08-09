import Link from "next/link";
import { sql } from "@/lib/db";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  isCategory,
  isPool,
  type Category,
  type Pool,
} from "@/lib/categories";

export const dynamic = "force-dynamic";

const PROVISIONAL_BELOW = 20;

type ItemRow = {
  id: string;
  image_url: string;
  thumb_url: string | null;
  title: string | null;
  rating: number;
  vote_count: number;
};

async function stats(pool: Pool) {
  const [totals] = await sql<{ items: number; votes: number }[]>`
    select
      (select count(*)::int from items where approved and pool = ${pool}) as items,
      (select count(*)::int from votes where pool = ${pool}) as votes`;
  // Majority-agreement estimate over pairs voted on 2+ times (excludes ties).
  const [agree] = await sql<{ agreement: number | null; pairs: number }[]>`
    with pv as (
      select least(item_a_id, item_b_id) as lo, greatest(item_a_id, item_b_id) as hi,
             (winner_id = least(item_a_id, item_b_id))::int as w
      from votes where winner_id is not null and pool = ${pool} and not flagged
    ), agg as (
      select count(*)::int as n, sum(w)::int as k from pv group by lo, hi having count(*) >= 2
    )
    select sum(greatest(k, n - k))::float / nullif(sum(n), 0) as agreement,
           count(*)::int as pairs
    from agg`;
  return { ...totals, agreement: agree?.agreement ?? null, pairs: agree?.pairs ?? 0 };
}

export default async function Leaderboard({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; pool?: string }>;
}) {
  const sp = await searchParams;
  const category: Category = sp.category && isCategory(sp.category) ? sp.category : "facades";
  const pool: Pool = sp.pool && isPool(sp.pool) ? sp.pool : "curated";

  const [items, s] = await Promise.all([
    sql<ItemRow[]>`
      select id, image_url, thumb_url, title, rating, vote_count from items
      where approved and pool = ${pool} and category = ${category}
      order by rating desc
      limit 200`,
    stats(pool),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 pt-10">
      <h1 className="prompt text-3xl">Leaderboard</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/leaderboard?category=${c}&pool=${pool}`}
            className={`rounded-full border px-3 py-1 ${
              c === category
                ? "border-foreground bg-foreground text-background"
                : "border-line text-muted hover:text-foreground"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
        <span className="mx-2 text-line">|</span>
        {(["curated", "community"] as const).map((p) => (
          <Link
            key={p}
            href={`/leaderboard?category=${category}&pool=${p}`}
            className={`rounded-full border px-3 py-1 capitalize ${
              p === pool
                ? "border-foreground bg-foreground text-background"
                : "border-line text-muted hover:text-foreground"
            }`}
          >
            {p}
          </Link>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted">
        {s.votes.toLocaleString()} votes · {s.items.toLocaleString()} items
        {s.agreement !== null && s.pairs >= 20 && (
          <> · {Math.round(s.agreement * 100)}% majority agreement on repeated pairs</>
        )}
        {pool === "community" && (
          <> · community uploads are not moderated for photographic quality</>
        )}
      </p>

      {items.length === 0 ? (
        <p className="mt-16 text-muted">No rated items in this category yet.</p>
      ) : (
        <ol className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item, i) => {
            const provisional = item.vote_count < PROVISIONAL_BELOW;
            return (
              <li key={item.id} className={provisional ? "opacity-55" : ""}>
                <Link href={`/item/${item.id}`} className="block group">
                  <div className="aspect-[4/3] bg-surface overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumb_url ?? item.image_url}
                      alt={item.title ?? "Item"}
                      loading="lazy"
                      className="h-full w-full object-contain group-hover:opacity-90"
                    />
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between text-xs">
                    <span className="text-muted">#{i + 1}</span>
                    <span>
                      {Math.round(item.rating)}
                      <span className="text-muted"> · {item.vote_count} votes</span>
                      {provisional && <span className="text-muted"> · provisional</span>}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
