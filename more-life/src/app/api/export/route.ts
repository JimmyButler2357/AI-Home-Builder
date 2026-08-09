import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvField(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * GET /api/export — anonymized vote data as CSV (part of the /method page).
 * voter is an opaque salted hash; no PII exists anywhere in the system.
 */
export async function GET() {
  const encoder = new TextEncoder();
  const header =
    "vote_id,created_at,category,pool,item_a_id,item_b_id,winner_id,is_tie," +
    "question_variant,position_of_winner,response_ms,voter,flagged\n";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(header));
      try {
        let lastId = 0;
        for (;;) {
          const rows = await sql<Record<string, unknown>[]>`
            select id, created_at, category, pool, item_a_id, item_b_id,
                   winner_id, question_variant, position_of_winner,
                   response_ms, voter_hash, flagged
            from votes where id > ${lastId} order by id limit 5000`;
          if (rows.length === 0) break;
          const chunk = rows
            .map((r) =>
              [
                r.id,
                (r.created_at as Date).toISOString(),
                r.category,
                r.pool,
                r.item_a_id,
                r.item_b_id,
                r.winner_id,
                r.winner_id === null ? 1 : 0,
                r.question_variant,
                r.position_of_winner,
                r.response_ms,
                r.voter_hash,
                r.flagged ? 1 : 0,
              ]
                .map(csvField)
                .join(","),
            )
            .join("\n");
          controller.enqueue(encoder.encode(chunk + "\n"));
          lastId = rows[rows.length - 1].id as number;
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="more-life-votes.csv"',
      "Cache-Control": "no-store",
    },
  });
}
