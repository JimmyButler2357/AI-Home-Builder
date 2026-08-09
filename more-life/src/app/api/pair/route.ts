import { NextRequest, NextResponse } from "next/server";
import { getVoterHash } from "@/lib/voter";
import { selectPair } from "@/lib/pairing";
import { isCategory, isPool, type Category, type Pool } from "@/lib/categories";

export const dynamic = "force-dynamic";

/**
 * GET /api/pair?category=mugs|surprise&pool=curated&exclude=idA:idB,idC:idD
 * `exclude` lets the client avoid re-serving pairs it has already buffered.
 */
export async function GET(req: NextRequest) {
  const voterHash = await getVoterHash();
  const params = req.nextUrl.searchParams;

  const rawCat = params.get("category") ?? "surprise";
  const category: Category | null = isCategory(rawCat) ? rawCat : null;

  const rawPool = params.get("pool") ?? "curated";
  const pool: Pool = isPool(rawPool) ? rawPool : "curated";

  const exclude = new Set<string>();
  for (const part of (params.get("exclude") ?? "").split(",")) {
    const [x, y] = part.split(":");
    if (x && y) exclude.add(x < y ? `${x}|${y}` : `${y}|${x}`);
  }

  const pair = await selectPair(voterHash, category, pool, exclude);
  if (!pair) {
    return NextResponse.json(
      { error: "not_enough_items", message: "Not enough items in this category yet." },
      { status: 404 },
    );
  }
  return NextResponse.json(pair, { headers: { "Cache-Control": "no-store" } });
}
