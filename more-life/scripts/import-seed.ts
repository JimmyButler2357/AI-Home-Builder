/**
 * Idempotent curated-seed importer.
 *
 *   npm run seed:import                 # import seed/items.json
 *   npm run seed:import -- --verify     # HEAD-check every image URL, skip dead ones
 *   npm run seed:import -- --file=path  # alternate manifest
 *
 * Items are keyed by `seed_key`; re-running updates metadata (title,
 * attribution, license, urls) but never touches ratings or vote counts.
 * Every curated item must carry attribution, source_url, and license —
 * entries missing any of them are rejected.
 */
import { readFileSync } from "fs";
import path from "path";
import postgres from "postgres";

const CATEGORIES = ["facades", "interiors", "streets", "mugs", "chairs", "textiles", "doors"];

type SeedItem = {
  seed_key: string;
  category: string;
  image_url: string;
  thumb_url?: string;
  title?: string;
  attribution: string;
  source_url: string;
  license: string;
};

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const args = process.argv.slice(2);
  const verify = args.includes("--verify");
  const fileArg = args.find((a) => a.startsWith("--file="));
  const file = fileArg ? fileArg.slice(7) : path.join("seed", "items.json");

  const manifest = JSON.parse(readFileSync(file, "utf8")) as { items: SeedItem[] };
  const items = manifest.items ?? [];
  console.log(`${items.length} manifest entries in ${file}`);

  const sql = postgres(url, { max: 4 });
  let imported = 0;
  let rejected = 0;
  let skipped = 0;

  for (const item of items) {
    const problems: string[] = [];
    if (!item.seed_key) problems.push("missing seed_key");
    if (!CATEGORIES.includes(item.category)) problems.push(`bad category "${item.category}"`);
    if (!item.image_url) problems.push("missing image_url");
    if (!item.attribution) problems.push("missing attribution");
    if (!item.source_url) problems.push("missing source_url");
    if (!item.license) problems.push("missing license");
    if (problems.length) {
      console.warn(`reject ${item.seed_key ?? "(no key)"}: ${problems.join(", ")}`);
      rejected++;
      continue;
    }
    if (verify && !(await verifyUrl(item.image_url))) {
      console.warn(`skip   ${item.seed_key}: image URL unreachable`);
      skipped++;
      continue;
    }
    await sql`
      insert into items (seed_key, category, image_url, thumb_url, title,
                         attribution, source_url, license, pool, approved)
      values (${item.seed_key}, ${item.category}, ${item.image_url},
              ${item.thumb_url ?? null}, ${item.title ?? null},
              ${item.attribution}, ${item.source_url}, ${item.license},
              'curated', true)
      on conflict (seed_key) do update set
        category = excluded.category,
        image_url = excluded.image_url,
        thumb_url = excluded.thumb_url,
        title = excluded.title,
        attribution = excluded.attribution,
        source_url = excluded.source_url,
        license = excluded.license`;
    imported++;
  }

  console.log(`done: ${imported} imported/updated, ${rejected} rejected, ${skipped} unreachable`);
  const counts = await sql<{ category: string; n: number }[]>`
    select category, count(*)::int as n from items
    where pool = 'curated' and approved group by category order by category`;
  for (const c of counts) console.log(`  ${c.category}: ${c.n}`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
