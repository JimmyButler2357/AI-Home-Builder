import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isCategory } from "@/lib/categories";
import { putImage, uploadsEnabled } from "@/lib/storage";
import { getVoterHash } from "@/lib/voter";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * POST /api/upload (multipart) — community pool submission.
 * Required: image file, category, attribution, source_url, license.
 * Held unapproved until reviewed in /admin. The uploader's voter_hash is
 * stored so their own uploads never appear in their own voting queue.
 */
export async function POST(req: NextRequest) {
  if (!uploadsEnabled()) {
    return NextResponse.json(
      { error: "uploads_disabled", message: "Uploads are not configured on this deployment." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_form" }, { status: 400 });
  }

  const file = form.get("image");
  const category = String(form.get("category") ?? "");
  const attribution = String(form.get("attribution") ?? "").trim();
  const sourceUrl = String(form.get("source_url") ?? "").trim();
  const license = String(form.get("license") ?? "").trim();
  const title = String(form.get("title") ?? "").trim() || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_image" }, { status: 400 });
  }
  if (!isCategory(category)) {
    return NextResponse.json({ error: "bad_category" }, { status: 400 });
  }
  if (!attribution || !sourceUrl || !license) {
    return NextResponse.json(
      { error: "missing_fields", message: "Attribution, source, and license are required." },
      { status: 400 },
    );
  }
  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "bad_type", message: "JPEG, PNG, or WebP only." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large", message: "8 MB max." }, { status: 400 });
  }

  const voterHash = await getVoterHash();
  const buf = Buffer.from(await file.arrayBuffer());
  const key = `${category}/${randomUUID()}.${ext}`;

  try {
    const url = await putImage(key, buf, file.type);
    const [item] = await sql<{ id: string }[]>`
      insert into items (category, image_url, title, attribution, source_url,
                         license, pool, approved, uploader_hash)
      values (${category}, ${url}, ${title}, ${attribution}, ${sourceUrl},
              ${license}, 'community', false, ${voterHash})
      returning id`;
    return NextResponse.json({ ok: true, id: item.id });
  } catch (err) {
    console.error("[upload] failed:", err);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
