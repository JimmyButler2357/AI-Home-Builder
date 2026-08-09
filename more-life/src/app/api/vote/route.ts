import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { eloUpdate } from "@/lib/elo";
import { verifyPair } from "@/lib/sign";
import { getUserAgentClass, getVoterHash } from "@/lib/voter";

export const dynamic = "force-dynamic";

// Rate limiting: log-and-flag past the soft ceiling, reject only egregious floods.
const SOFT_LIMIT_PER_MIN = 60;
const HARD_LIMIT_PER_MIN = 240;

type Body = {
  token?: string;
  choice?: "left" | "right" | "tie";
  response_ms?: number;
};

/**
 * POST /api/vote  { token, choice, response_ms }
 * Records the vote and applies the Elo update atomically. Idempotent per pair
 * token (background retries never double-count). Every vote is recorded —
 * ties, fast clicks, and over-limit votes included (the latter flagged);
 * filtering happens at analysis time.
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { token, choice } = body;
  if (!token || !choice || !["left", "right", "tie"].includes(choice)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const pair = verifyPair(token);
  if (!pair) {
    return NextResponse.json({ error: "bad_token" }, { status: 400 });
  }

  const voterHash = await getVoterHash();
  const uaClass = await getUserAgentClass();
  const responseMs =
    typeof body.response_ms === "number" && body.response_ms >= 0
      ? Math.min(Math.round(body.response_ms), 3_600_000)
      : null;

  const [{ n: recentCount }] = await sql<{ n: number }[]>`
    select count(*)::int as n from votes
    where voter_hash = ${voterHash} and created_at > now() - interval '1 minute'`;
  if (recentCount >= HARD_LIMIT_PER_MIN) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const flagged = recentCount >= SOFT_LIMIT_PER_MIN;
  if (flagged) {
    console.warn(`[rate-limit] voter ${voterHash.slice(0, 12)}… over ${SOFT_LIMIT_PER_MIN}/min; vote flagged`);
  }

  const winnerId = choice === "tie" ? null : choice === "left" ? pair.a : pair.b;
  const positionOfWinner = choice === "tie" ? null : choice;
  const scoreA = choice === "tie" ? 0.5 : choice === "left" ? 1 : 0;

  try {
    const inserted = await sql.begin(async (tx) => {
      // Lock in stable order to avoid deadlocks between concurrent votes.
      const rows = await tx<
        { id: string; rating: number; vote_count: number }[]
      >`select id, rating, vote_count from items
        where id in (${pair.a}, ${pair.b}) order by id for update`;
      if (rows.length !== 2) throw new Error("items_missing");
      const a = rows.find((r) => r.id === pair.a)!;
      const b = rows.find((r) => r.id === pair.b)!;

      const next = eloUpdate(a.rating, b.rating, a.vote_count, b.vote_count, scoreA);

      const vote = await tx<{ id: number }[]>`
        insert into votes (
          item_a_id, item_b_id, winner_id, voter_hash, question_variant,
          position_of_winner, response_ms, category, pool,
          rating_a_after, rating_b_after, flagged, client_nonce
        ) values (
          ${pair.a}, ${pair.b}, ${winnerId}, ${voterHash}, ${pair.variant},
          ${positionOfWinner}, ${responseMs}, ${pair.category}, ${pair.pool},
          ${next.ratingA}, ${next.ratingB}, ${flagged}, ${pair.nonce}
        )
        on conflict (client_nonce) do nothing
        returning id`;
      // Duplicate delivery of the same token: already counted, change nothing.
      if (vote.length === 0) return false;

      await tx`update items set
          rating = ${next.ratingA},
          vote_count = vote_count + 1,
          win_count = win_count + ${scoreA === 1 ? 1 : 0},
          loss_count = loss_count + ${scoreA === 0 ? 1 : 0},
          tie_count = tie_count + ${scoreA === 0.5 ? 1 : 0}
        where id = ${pair.a}`;
      await tx`update items set
          rating = ${next.ratingB},
          vote_count = vote_count + 1,
          win_count = win_count + ${scoreA === 0 ? 1 : 0},
          loss_count = loss_count + ${scoreA === 1 ? 1 : 0},
          tie_count = tie_count + ${scoreA === 0.5 ? 1 : 0}
        where id = ${pair.b}`;

      await tx`insert into voters (voter_hash, vote_count, user_agent_class)
        values (${voterHash}, 1, ${uaClass})
        on conflict (voter_hash) do update set vote_count = voters.vote_count + 1`;
      return true;
    });

    return NextResponse.json({ ok: true, duplicate: !inserted });
  } catch (err) {
    console.error("[vote] failed:", err);
    return NextResponse.json({ error: "vote_failed" }, { status: 500 });
  }
}
