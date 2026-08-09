/**
 * Curated-seed manifest builder. Queries the Wikimedia Commons API for the
 * source categories in seed/sources.json and writes/merges seed/items.json
 * with full attribution and license metadata. Run it anywhere with normal
 * internet access, review the manifest by hand (composition is where the
 * experiment is won or lost — see the spec), then `npm run seed:import`.
 *
 *   npm run seed:build                       # target 150 per category
 *   npm run seed:build -- --per-category=80
 *
 * Only free licenses are accepted (public domain, CC0, CC BY, CC BY-SA).
 * Merges into the existing manifest by seed_key, so hand-edits to other
 * entries survive re-runs.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "more-life-seed-builder/1.0 (research seeding script)";
const LICENSE_OK = /public domain|\bpd\b|cc0|cc[ -]by(?:[ -]sa)?(?:[ -]\d\.\d)?$/i;
const MIN_WIDTH = 700;
const DISPLAY_WIDTH = 1200;
const THUMB_WIDTH = 480;

type ApiPage = {
  title: string;
  imageinfo?: {
    url: string;
    thumburl?: string;
    descriptionurl: string;
    width: number;
    height: number;
    mime: string;
    extmetadata?: Record<string, { value: string } | undefined>;
  }[];
};

type SeedItem = {
  seed_key: string;
  category: string;
  image_url: string;
  thumb_url: string;
  title: string;
  attribution: string;
  source_url: string;
  license: string;
};

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function fetchCategory(commonsCat: string, want: number): Promise<ApiPage[]> {
  const pages: ApiPage[] = [];
  let cont: string | undefined;
  while (pages.length < want) {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      generator: "categorymembers",
      gcmtitle: `Category:${commonsCat}`,
      gcmtype: "file",
      gcmlimit: "50",
      prop: "imageinfo",
      iiprop: "url|extmetadata|size|mime",
      iiurlwidth: String(DISPLAY_WIDTH),
    });
    if (cont) params.set("gcmcontinue", cont);
    const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`Commons API ${res.status} for ${commonsCat}`);
    const data = (await res.json()) as {
      query?: { pages?: Record<string, ApiPage> };
      continue?: { gcmcontinue?: string };
    };
    pages.push(...Object.values(data.query?.pages ?? {}));
    cont = data.continue?.gcmcontinue;
    if (!cont) break;
    await new Promise((r) => setTimeout(r, 250)); // be polite to the API
  }
  return pages;
}

function toSeedItem(page: ApiPage, category: string): SeedItem | null {
  const info = page.imageinfo?.[0];
  if (!info) return null;
  if (!/^image\/(jpeg|png)$/.test(info.mime)) return null;
  if (info.width < MIN_WIDTH) return null;

  const meta = info.extmetadata ?? {};
  const licenseName = stripHtml(meta.LicenseShortName?.value ?? "");
  if (!LICENSE_OK.test(licenseName)) return null;

  const artist = stripHtml(meta.Artist?.value ?? "");
  const credit = stripHtml(meta.Credit?.value ?? "");
  const attribution = artist || credit;
  if (!attribution) return null; // attribution is mandatory for every curated item

  const name = page.title.replace(/^File:/, "");
  const filePath = (w: number) =>
    `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=${w}`;

  return {
    seed_key: `commons:${page.title}`,
    category,
    image_url: info.thumburl ?? filePath(DISPLAY_WIDTH),
    thumb_url: filePath(THUMB_WIDTH),
    title: name.replace(/\.[a-z]+$/i, "").replace(/[_-]+/g, " "),
    attribution,
    source_url: info.descriptionurl,
    license: licenseName,
  };
}

async function main() {
  const perCategory = Number(
    process.argv.find((a) => a.startsWith("--per-category="))?.split("=")[1] ?? 150,
  );
  const sourcesPath = path.join("seed", "sources.json");
  const manifestPath = path.join("seed", "items.json");

  const sources = JSON.parse(readFileSync(sourcesPath, "utf8")) as Record<string, string[] | string>;
  const existing: SeedItem[] = existsSync(manifestPath)
    ? ((JSON.parse(readFileSync(manifestPath, "utf8")) as { items?: SeedItem[] }).items ?? [])
    : [];
  const byKey = new Map(existing.map((i) => [i.seed_key, i]));

  for (const [category, cats] of Object.entries(sources)) {
    if (!Array.isArray(cats)) continue; // skip $note
    const have = () => [...byKey.values()].filter((i) => i.category === category).length;
    const perSource = Math.ceil(perCategory / cats.length) + 10;
    for (const commonsCat of cats) {
      if (have() >= perCategory) break;
      try {
        const pages = await fetchCategory(commonsCat, perSource * 3);
        let added = 0;
        for (const page of pages) {
          if (added >= perSource || have() >= perCategory) break;
          const item = toSeedItem(page, category);
          if (item && !byKey.has(item.seed_key)) {
            byKey.set(item.seed_key, item);
            added++;
          }
        }
        console.log(`${category} ← "${commonsCat}": +${added} (total ${have()})`);
      } catch (err) {
        console.warn(`${category} ← "${commonsCat}": skipped (${(err as Error).message})`);
      }
    }
  }

  const items = [...byKey.values()];
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        $note:
          "Curated seed manifest. Generated by scripts/build-seed.ts from seed/sources.json, then hand-reviewed. Review composition before importing: span cultures and eras within each category, and cull images with strong photographic confounds (dramatic light, heavy staging, people, weather).",
        items,
      },
      null,
      2,
    ),
  );
  console.log(`\nwrote ${items.length} items to ${manifestPath}`);
  for (const [category] of Object.entries(sources).filter(([, v]) => Array.isArray(v))) {
    console.log(`  ${category}: ${items.filter((i) => i.category === category).length}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
