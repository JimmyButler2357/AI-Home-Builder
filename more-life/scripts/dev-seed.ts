/**
 * Dev-only seed: generates deterministic abstract SVG placeholders into
 * public/dev-seed and imports them as curated items so the full voting →
 * Elo → leaderboard pipeline can be exercised without network access.
 * These are placeholders, not research data.
 *
 *   npm run seed:dev                  # 16 items per category
 *   npm run seed:dev -- --per=24
 *   npm run seed:dev -- --reset      # remove all dev items
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import postgres from "postgres";

const CATEGORIES = ["facades", "interiors", "streets", "mugs", "chairs", "textiles", "doors"];

// Small deterministic PRNG so re-runs produce identical images.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSvg(category: string, index: number): string {
  const rnd = mulberry32(CATEGORIES.indexOf(category) * 1000 + index);
  const hue = Math.floor(rnd() * 360);
  const cells = 3 + Math.floor(rnd() * 6);
  const w = 800;
  const h = 600;
  const cw = w / cells;
  const ch = h / cells;
  let shapes = "";
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const l = 35 + Math.floor(rnd() * 50);
      const s = 10 + Math.floor(rnd() * 40);
      if (rnd() < 0.5) {
        shapes += `<rect x="${x * cw}" y="${y * ch}" width="${cw}" height="${ch}" fill="hsl(${hue},${s}%,${l}%)"/>`;
      } else {
        shapes += `<circle cx="${x * cw + cw / 2}" cy="${y * ch + ch / 2}" r="${(Math.min(cw, ch) / 2) * (0.4 + rnd() * 0.6)}" fill="hsl(${(hue + 30) % 360},${s}%,${l}%)"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="hsl(${hue},15%,88%)"/>${shapes}</svg>`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 2 });

  if (process.argv.includes("--reset")) {
    const gone = await sql`delete from items where seed_key like 'dev:%' returning id`;
    console.log(`removed ${gone.length} dev items`);
    await sql.end();
    return;
  }

  const per = Number(process.argv.find((a) => a.startsWith("--per="))?.split("=")[1] ?? 16);
  const dir = path.join(process.cwd(), "public", "dev-seed");
  mkdirSync(dir, { recursive: true });

  let n = 0;
  for (const category of CATEGORIES) {
    for (let i = 0; i < per; i++) {
      const file = `${category}-${i}.svg`;
      writeFileSync(path.join(dir, file), makeSvg(category, i));
      await sql`
        insert into items (seed_key, category, image_url, title, attribution,
                           source_url, license, pool, approved)
        values (${`dev:${category}-${i}`}, ${category}, ${`/dev-seed/${file}`},
                ${`Dev placeholder ${category} ${i}`}, ${"Generated placeholder"},
                ${"https://example.invalid/dev-seed"}, ${"CC0"}, 'curated', true)
        on conflict (seed_key) do update set image_url = excluded.image_url`;
      n++;
    }
  }
  console.log(`generated + imported ${n} dev items (${per} per category)`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
