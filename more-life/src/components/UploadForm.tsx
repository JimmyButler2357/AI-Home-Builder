"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";

const LICENSES = [
  "Own work — CC BY 4.0",
  "Own work — CC0",
  "CC0 / Public domain",
  "CC BY 4.0",
  "CC BY-SA 4.0",
  "Other (state in attribution)",
];

export default function UploadForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: new FormData(form) });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setMessage(data.message ?? "Upload failed.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("done");
    } catch {
      setMessage("Network error — please try again.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p className="mt-8 text-[15px]">
        Thank you. Your image is in the review queue and will appear in the community
        pool once approved.{" "}
        <button className="underline underline-offset-2" onClick={() => setStatus("idle")}>
          Upload another
        </button>
      </p>
    );
  }

  const field = "mt-1 w-full border border-line rounded px-3 py-2 bg-transparent text-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground";

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 text-sm">
      <label className="block">
        Image (JPEG, PNG, or WebP; 8 MB max)
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required className={field} />
      </label>
      <label className="block">
        Category
        <select name="category" required className={field}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Title <span className="text-muted">(shown only on the leaderboard, never during voting)</span>
        <input type="text" name="title" maxLength={200} className={field} />
      </label>
      <label className="block">
        Attribution (photographer / creator) *
        <input type="text" name="attribution" maxLength={300} required className={field} />
      </label>
      <label className="block">
        Source URL *
        <input type="url" name="source_url" maxLength={500} required className={field} placeholder="https://…" />
      </label>
      <label className="block">
        License *
        <select name="license" required className={field}>
          {LICENSES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </label>
      {status === "error" && <p className="text-red-700">{message}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-foreground text-background px-6 py-2 disabled:opacity-50"
      >
        {status === "sending" ? "Uploading…" : "Submit for review"}
      </button>
    </form>
  );
}
