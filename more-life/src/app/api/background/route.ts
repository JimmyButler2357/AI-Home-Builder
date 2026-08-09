import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getVoterHash } from "@/lib/voter";

export const dynamic = "force-dynamic";

/**
 * POST /api/background { answer: "yes" | "no" | "skip" }
 * One-time, optional self-report: does the voter work in architecture/design?
 * Asked once after the 20th vote; never overwrites an existing answer.
 */
export async function POST(req: NextRequest) {
  let answer: unknown;
  try {
    answer = ((await req.json()) as { answer?: unknown }).answer;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (answer !== "yes" && answer !== "no" && answer !== "skip") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const voterHash = await getVoterHash();
  await sql`
    insert into voters (voter_hash, self_reported_background)
    values (${voterHash}, ${answer})
    on conflict (voter_hash) do update
      set self_reported_background = excluded.self_reported_background
      where voters.self_reported_background is null`;
  return NextResponse.json({ ok: true });
}
