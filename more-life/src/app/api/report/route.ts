import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getVoterHash } from "@/lib/voter";

export const dynamic = "force-dynamic";

/** POST /api/report { item_id } — report a community item (once per voter). */
export async function POST(req: NextRequest) {
  let itemId: unknown;
  try {
    itemId = ((await req.json()) as { item_id?: unknown }).item_id;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof itemId !== "string" || !/^[0-9a-f-]{36}$/.test(itemId)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const voterHash = await getVoterHash();
  const inserted = await sql<{ item_id: string }[]>`
    insert into reports (item_id, voter_hash)
    values (${itemId}, ${voterHash})
    on conflict do nothing
    returning item_id`;
  if (inserted.length > 0) {
    await sql`update items set report_count = report_count + 1 where id = ${itemId}`;
  }
  return NextResponse.json({ ok: true });
}
