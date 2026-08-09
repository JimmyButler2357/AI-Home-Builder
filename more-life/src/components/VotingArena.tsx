"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_ALT,
  CATEGORY_LABELS,
  type Category,
  type Pool,
} from "@/lib/categories";

type PairItem = { id: string; image_url: string };
type Pair = {
  token: string;
  category: Category;
  pool: Pool;
  variant: "life" | "beauty";
  left: PairItem;
  right: PairItem;
};

type PendingVote = { token: string; choice: "left" | "right" | "tie"; response_ms: number };

const QUEUE_KEY = "ml_vote_queue";
const TOTAL_KEY = "ml_total_votes";
const BG_ASKED_KEY = "ml_bg_asked";
const SESSION_KEY = "ml_session_votes";
const INTERSTITIAL_EVERY = 10;
const BACKGROUND_AFTER = 20;

/* ---------- background vote sender: optimistic UI, queue + retry ---------- */

function loadQueue(): PendingVote[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as PendingVote[];
  } catch {
    return [];
  }
}
function saveQueue(q: PendingVote[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-200)));
  } catch {
    /* storage full/blocked: queue lives in memory only */
  }
}

class VoteSender {
  private queue: PendingVote[] = [];
  private sending = false;
  private backoff = 0;

  init() {
    this.queue = loadQueue();
    this.pump();
  }
  push(v: PendingVote) {
    this.queue.push(v);
    saveQueue(this.queue);
    this.pump();
  }
  private async pump() {
    if (this.sending) return;
    this.sending = true;
    while (this.queue.length > 0) {
      const v = this.queue[0];
      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
          keepalive: true,
        });
        if (res.ok || (res.status >= 400 && res.status < 500)) {
          // Delivered (or permanently unacceptable) — drop it either way.
          this.queue.shift();
          saveQueue(this.queue);
          this.backoff = 0;
          continue;
        }
        throw new Error(`status ${res.status}`);
      } catch {
        this.backoff = Math.min((this.backoff || 1000) * 2, 30_000);
        await new Promise((r) => setTimeout(r, this.backoff));
      }
    }
    this.sending = false;
  }
}

/* ------------------------------- component ------------------------------- */

export default function VotingArena() {
  const [started, setStarted] = useState(false);
  const [sessionVotes, setSessionVotes] = useState(() =>
    typeof window === "undefined" ? 0 : Number(sessionStorage.getItem(SESSION_KEY) ?? 0),
  );
  const [category, setCategory] = useState<Category | "surprise">("surprise");
  const [pool, setPool] = useState<Pool>("curated");
  const [current, setCurrent] = useState<Pair | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<"left" | "right" | "tie" | null>(null);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showBackgroundQ, setShowBackgroundQ] = useState(false);

  const buffer = useRef<Pair[]>([]);
  const fetching = useRef(false);
  const shownAt = useRef(0);
  const sender = useRef<VoteSender | null>(null);
  const settings = useRef({ category: "surprise" as Category | "surprise", pool: "curated" as Pool });

  useEffect(() => {
    settings.current = { category, pool };
  }, [category, pool]);

  useEffect(() => {
    sender.current = new VoteSender();
    sender.current.init();
  }, []);

  const preload = (p: Pair) =>
    new Promise<Pair>((resolve) => {
      let remaining = 2;
      const done = () => (--remaining <= 0 ? resolve(p) : undefined);
      for (const url of [p.left.image_url, p.right.image_url]) {
        const img = new Image();
        img.onload = done;
        img.onerror = done; // show the pair anyway; a broken img is visible
        img.src = url;
      }
    });

  const fetchPair = useCallback(async (): Promise<Pair | null> => {
    const { category: cat, pool: p } = settings.current;
    const exclude = [
      ...buffer.current.map((b) => `${b.left.id}:${b.right.id}`),
    ].join(",");
    const params = new URLSearchParams({ category: cat, pool: p });
    if (exclude) params.set("exclude", exclude);
    const res = await fetch(`/api/pair?${params}`);
    if (!res.ok) return null;
    return preload((await res.json()) as Pair);
  }, []);

  // Keep 2 pairs prefetched so the next pair is always instant (<200ms perceived).
  const topUp = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      while (buffer.current.length < 2) {
        const p = await fetchPair();
        if (!p) {
          if (buffer.current.length === 0)
            setError("Not enough images in this category yet — try another.");
          break;
        }
        setError(null);
        buffer.current.push(p);
        setCurrent((cur) => {
          if (cur) return cur;
          const next = buffer.current.shift()!;
          shownAt.current = performance.now();
          return next;
        });
      }
    } finally {
      fetching.current = false;
    }
  }, [fetchPair]);

  const start = () => {
    setStarted(true);
    void topUp();
  };

  // Changing category/pool invalidates the buffer.
  const changeSettings = (cat: Category | "surprise", p: Pool) => {
    setCategory(cat);
    setPool(p);
    buffer.current = [];
    setCurrent(null);
    setError(null);
    if (started) setTimeout(() => void topUp(), 0);
  };

  const advance = useCallback(() => {
    const next = buffer.current.shift() ?? null;
    setCurrent(next);
    if (next) shownAt.current = performance.now();
    void topUp();
  }, [topUp]);

  const vote = useCallback(
    (choice: "left" | "right" | "tie") => {
      if (!current || chosen) return;
      const response_ms = Math.round(performance.now() - shownAt.current);
      sender.current?.push({ token: current.token, choice, response_ms });

      const total = Number(localStorage.getItem(TOTAL_KEY) ?? 0) + 1;
      localStorage.setItem(TOTAL_KEY, String(total));
      const session = sessionVotes + 1;
      sessionStorage.setItem(SESSION_KEY, String(session));
      setSessionVotes(session);
      setChosen(choice);

      if (session % INTERSTITIAL_EVERY === 0) {
        setShowInterstitial(true);
        setTimeout(() => setShowInterstitial(false), 6000);
      }
      if (total >= BACKGROUND_AFTER && !localStorage.getItem(BG_ASKED_KEY)) {
        setShowBackgroundQ(true);
      }

      // Brief confirmation, then the (already preloaded) next pair.
      setTimeout(() => {
        setChosen(null);
        advance();
      }, 220);
    },
    [current, chosen, sessionVotes, advance],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started || showBackgroundQ) return;
      if (e.key === "ArrowLeft") vote("left");
      else if (e.key === "ArrowRight") vote("right");
      else if (e.key === " ") {
        e.preventDefault();
        vote("tie");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, vote, showBackgroundQ]);

  const answerBackground = async (answer: "yes" | "no" | "skip") => {
    localStorage.setItem(BG_ASKED_KEY, "1");
    setShowBackgroundQ(false);
    try {
      await fetch("/api/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
    } catch {
      /* optional data; never retry-nag */
    }
  };

  /* ------------------------------ rendering ------------------------------ */

  if (!started) {
    return (
      <div className="mx-auto max-w-xl px-6 pt-[18vh] text-center">
        <h1 className="prompt text-4xl sm:text-5xl">Which has more life?</h1>
        <p className="mt-6 text-muted leading-relaxed">
          You&rsquo;ll see two images at a time. Choose the one that feels like it has
          more life — not which is fancier, newer, or more expensive. There are no
          right answers; this is an experiment in whether people quietly agree.
        </p>
        <button
          onClick={start}
          className="mt-10 rounded-full bg-foreground px-8 py-3 text-background text-lg hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Start
        </button>
        <p className="mt-4 text-xs text-muted">
          No signup. Use ← / → keys or tap. Space for &ldquo;can&rsquo;t tell.&rdquo;
        </p>
      </div>
    );
  }

  const prompt =
    current?.variant === "beauty" ? "Which is more beautiful?" : "Which has more life?";
  const alt = current ? CATEGORY_ALT[current.category] : "";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* settings row — deliberately quiet */}
      <div className="flex items-center justify-between pt-4 text-xs text-muted">
        <label className="flex items-center gap-2">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(e) => changeSettings(e.target.value as Category | "surprise", pool)}
            className="bg-transparent border border-line rounded px-2 py-1 focus-visible:outline focus-visible:outline-1 focus-visible:outline-foreground"
          >
            <option value="surprise">Surprise me</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeSettings(category, pool === "curated" ? "community" : "curated")}
            className="hover:text-foreground underline-offset-2 hover:underline"
            title="The curated set is the research corpus; community images are visitor uploads."
          >
            {pool === "curated" ? "curated set" : "community set"}
          </button>
          <span aria-live="polite">{sessionVotes} votes this session</span>
        </div>
      </div>

      <h1 className="prompt text-center text-2xl sm:text-3xl mt-6 mb-6" aria-live="polite">
        {prompt}
      </h1>

      {error && (
        <p className="text-center text-muted my-16">
          {error}{" "}
          <button className="underline" onClick={() => changeSettings("surprise", "curated")}>
            Back to the curated set
          </button>
        </p>
      )}

      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {(["left", "right"] as const).map((side) => {
            const item = current?.[side];
            return (
              <button
                key={side}
                onClick={() => vote(side)}
                disabled={!current}
                aria-label={`${alt} — ${side} image. Choose this one.`}
                className={`relative aspect-[4/3] w-full bg-surface overflow-hidden cursor-pointer
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground
                  ${chosen === side ? "vote-chosen" : ""}`}
              >
                {item ? (
                  /* Uniform presentation: same box, same fit, same background,
                     no captions, titles, or any identifying text (LOCKED). */
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={alt}
                    className="absolute inset-0 h-full w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <span className="absolute inset-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {!error && (
        <div className="text-center mt-4">
          <button
            onClick={() => vote("tie")}
            disabled={!current}
            className="text-sm text-muted hover:text-foreground underline underline-offset-2 focus-visible:outline focus-visible:outline-1"
          >
            Can&rsquo;t tell
          </button>
        </div>
      )}

      {/* every-10-votes nudge: non-blocking, auto-dismisses */}
      {showInterstitial && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background rounded-full px-5 py-2.5 text-sm flex items-center gap-4 shadow-none">
          <Link href="/leaderboard" className="underline underline-offset-2">
            See the leaderboard
          </Link>
          <button onClick={() => setShowInterstitial(false)}>Keep going</button>
        </div>
      )}

      {/* one-time optional background question (after 20th vote) */}
      {showBackgroundQ && (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-background px-6 py-5">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm">
              One optional question: do you work in architecture, design, or a related field?
            </p>
            <div className="mt-3 flex justify-center gap-3">
              {(["yes", "no", "skip"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => answerBackground(a)}
                  className="rounded-full border border-line px-5 py-1.5 text-sm hover:bg-surface capitalize"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
