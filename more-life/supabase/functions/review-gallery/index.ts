// Temporary curation tool: serves the curated seed candidates as a simple
// phone-friendly gallery so the seed set can be reviewed before launch.
// Read-only; images hotlink Wikimedia thumbnails. Remove after curation.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type Item = {
  id: string;
  category: string;
  thumb_url: string | null;
  image_url: string;
  title: string | null;
  attribution: string;
  license: string;
  source_url: string;
};

const CATEGORIES = ["facades", "interiors", "streets", "mugs", "chairs", "textiles", "doors"];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const cat = url.searchParams.get("cat") ?? "facades";
  if (!CATEGORIES.includes(cat)) {
    return new Response("bad category", { status: 400 });
  }

  const base = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const res = await fetch(
    `${base}/rest/v1/items?select=id,category,thumb_url,image_url,title,attribution,license,source_url` +
      `&category=eq.${cat}&pool=eq.curated&order=title.asc.nullslast`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) return new Response(`db error: ${await res.text()}`, { status: 500 });
  const items = (await res.json()) as Item[];

  const nav = CATEGORIES.map(
    (c) =>
      `<a href="?cat=${c}" style="padding:.35em .8em;border-radius:999px;text-decoration:none;` +
      `${c === cat ? "background:#1c1917;color:#faf9f7" : "color:#1c1917;border:1px solid #d6d3ce"}">${c}</a>`,
  ).join(" ");

  const cards = items
    .map(
      (it, i) => `
  <figure style="margin:0;break-inside:avoid">
    <img src="${esc(it.thumb_url ?? it.image_url)}" loading="lazy"
         style="width:100%;border-radius:6px;background:#eee" alt="">
    <figcaption style="font-size:12px;color:#666;padding:.25em 0 1em">
      <b>#${i + 1}</b> ${esc(it.title ?? "")}<br>
      ${esc(it.attribution)} · ${esc(it.license)} ·
      <a href="${esc(it.source_url)}">source</a>
    </figcaption>
  </figure>`,
    )
    .join("");

  const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>More Life — seed review: ${cat}</title>
<body style="font-family:system-ui;margin:0;background:#faf9f7;color:#1c1917">
<div style="padding:16px;max-width:1100px;margin:0 auto">
  <h1 style="font-family:Georgia,serif;font-weight:400">Seed review — ${cat} (${items.length})</h1>
  <p style="font-size:14px;color:#666">Curated-pool candidates with attribution and license.
  To cull, reply in chat with the category and numbers, e.g. “${cat} 12, 31, 58”.</p>
  <p style="display:flex;flex-wrap:wrap;gap:6px;font-size:14px">${nav}</p>
  <div style="columns:2;column-gap:10px" class="grid">${cards}</div>
  <style>@media(min-width:700px){.grid{columns:4}}</style>
</div>
</body>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
});
