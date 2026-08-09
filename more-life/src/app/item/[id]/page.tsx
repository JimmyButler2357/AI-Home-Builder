import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { CATEGORY_LABELS, type Category } from "@/lib/categories";
import ReportButton from "@/components/ReportButton";

export const dynamic = "force-dynamic";

type Item = {
  id: string;
  category: Category;
  image_url: string;
  title: string | null;
  attribution: string;
  source_url: string;
  license: string;
  rating: number;
  vote_count: number;
  win_count: number;
  loss_count: number;
  tie_count: number;
  pool: "curated" | "community";
  approved: boolean;
};

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 280;
  const h = 48;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(max - min, 8);
  const d = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${((i / (points.length - 1)) * w).toFixed(1)},${(
          h - ((p - min) / span) * h
        ).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[280px] h-12" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const [item] = await sql<Item[]>`select * from items where id = ${id} and approved`;
  if (!item) notFound();

  const history = await sql<{ r: number }[]>`
    select case when item_a_id = ${id} then rating_a_after else rating_b_after end as r
    from votes
    where (item_a_id = ${id} or item_b_id = ${id}) and rating_a_after is not null
    order by id desc limit 100`;
  const ratings = [1500, ...history.map((h) => h.r).reverse()];

  const rivals = await sql<
    { opponent: string; title: string | null; wins: number; losses: number; ties: number }[]
  >`
    with h2h as (
      select case when item_a_id = ${id} then item_b_id else item_a_id end as opponent,
             case when winner_id = ${id} then 1 else 0 end as win,
             case when winner_id is null then 1 else 0 end as tie
      from votes where item_a_id = ${id} or item_b_id = ${id}
    )
    select opponent, i.title,
           sum(win)::int as wins,
           sum(case when win = 0 and tie = 0 then 1 else 0 end)::int as losses,
           sum(tie)::int as ties
    from h2h join items i on i.id = h2h.opponent
    group by opponent, i.title
    order by count(*) desc limit 5`;

  return (
    <main className="mx-auto max-w-3xl px-6 pt-10">
      <Link href={`/leaderboard?category=${item.category}&pool=${item.pool}`} className="text-sm text-muted hover:text-foreground">
        ← {CATEGORY_LABELS[item.category]} leaderboard
      </Link>

      <div className="mt-6 bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image_url} alt={item.title ?? "Item"} className="w-full max-h-[70vh] object-contain" />
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="text-sm leading-relaxed">
          {item.title && <h1 className="prompt text-2xl">{item.title}</h1>}
          <p className="text-muted mt-1">
            {item.attribution}
            {item.license && <> · {item.license}</>}
            {item.source_url && (
              <>
                {" · "}
                <a href={item.source_url} className="underline underline-offset-2" rel="noopener noreferrer">
                  source
                </a>
              </>
            )}
          </p>
          <p className="text-muted mt-1 capitalize">{item.pool} pool</p>
        </div>
        <div className="text-sm text-right">
          <div className="text-3xl prompt">{Math.round(item.rating)}</div>
          <p className="text-muted mt-1">
            {item.vote_count} votes · {item.win_count}W {item.loss_count}L {item.tie_count}T
            {item.vote_count < 20 && <> · provisional</>}
          </p>
        </div>
      </div>

      {ratings.length > 2 && (
        <div className="mt-8">
          <h2 className="text-sm text-muted mb-2">Rating history (last {ratings.length - 1} votes)</h2>
          <Sparkline points={ratings} />
        </div>
      )}

      {rivals.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm text-muted mb-2">Most-faced opponents</h2>
          <ul className="text-sm space-y-1">
            {rivals.map((r) => (
              <li key={r.opponent}>
                <Link href={`/item/${r.opponent}`} className="underline underline-offset-2">
                  {r.title ?? "Untitled item"}
                </Link>{" "}
                <span className="text-muted">
                  {r.wins}W {r.losses}L {r.ties}T
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.pool === "community" && (
        <div className="mt-10">
          <ReportButton itemId={item.id} />
        </div>
      )}
    </main>
  );
}
