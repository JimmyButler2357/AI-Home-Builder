import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Community-upload storage.
 *  - Production: Supabase Storage (set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *    SUPABASE_STORAGE_BUCKET) — originals live in object storage, served from
 *    the bucket's public URL.
 *  - Dev fallback: files under public/uploads (not durable on serverless).
 */
export function uploadsEnabled(): boolean {
  return (
    supabaseConfigured() ||
    process.env.NODE_ENV !== "production" ||
    // explicit opt-in for self-hosted deployments with a persistent disk
    process.env.ALLOW_LOCAL_UPLOADS === "1"
  );
}

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_STORAGE_BUCKET,
  );
}

export async function putImage(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  if (supabaseConfigured()) {
    const base = process.env.SUPABASE_URL!.replace(/\/$/, "");
    const bucket = process.env.SUPABASE_STORAGE_BUCKET!;
    const res = await fetch(`${base}/storage/v1/object/${bucket}/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": contentType,
        "x-upsert": "false",
      },
      body: new Uint8Array(data),
    });
    if (!res.ok) {
      throw new Error(`storage upload failed: ${res.status} ${await res.text()}`);
    }
    return `${base}/storage/v1/object/public/${bucket}/${key}`;
  }

  const dir = path.join(process.cwd(), "public", "uploads", path.dirname(key));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", key), data);
  return `/uploads/${key}`;
}
