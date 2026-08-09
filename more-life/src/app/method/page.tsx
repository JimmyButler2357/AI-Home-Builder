import Link from "next/link";

export const metadata = { title: "Method — Which has more life?" };

export default function MethodPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pt-10 pb-16 leading-relaxed">
      <h1 className="prompt text-3xl">Method</h1>

      <section className="mt-8 space-y-4 text-[15px]">
        <h2 className="prompt text-xl">The question</h2>
        <p>
          The architect Christopher Alexander claimed that when people are asked which of
          two things has more <em>life</em> — not which is prettier, not which they would
          buy — their answers agree with each other far more than chance would predict,
          across cultures, training, and kinds of objects. He tested this informally with
          small groups (he called it the &ldquo;Mirror of the Self&rdquo; test). This site
          tests it at scale.
        </p>
        <p>
          Visitors see two images from the same category and click the one with more life.
          On roughly 20% of pairs we instead ask &ldquo;which is more beautiful?&rdquo; —
          Alexander claimed these are different questions with different agreement rates,
          and the gap between them is one of the things we want to measure. A
          &ldquo;can&rsquo;t tell&rdquo; option records a tie; ties are data too.
        </p>

        <h2 className="prompt text-xl pt-4">The rating system</h2>
        <p>
          Items are ranked with Elo, the chess rating system. Every item starts at 1500.
          When it wins a comparison its rating rises and the loser&rsquo;s falls, by an
          amount that shrinks as an item accumulates votes (K = 32 below 30 votes, 16 to
          100 votes, 8 after). Pairs are chosen to be close in rating, because close
          matches are the informative ones, and under-sampled items are prioritized.
          Items with fewer than 20 votes are marked provisional.
        </p>
        <p>
          Safeguards: left/right position is randomized independently on every pair; no
          ratings, titles, or origins are ever shown on the voting screen; response times
          and click positions are recorded so side bias and reflexive clicking can be
          detected and filtered during analysis. Curated (research) and community
          (uploaded) images are never mixed in pairs, ratings, or leaderboards.
        </p>

        <h2 className="prompt text-xl pt-4">Known limitations</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Self-selected audience.</strong> Visitors to a site like this are not
            a representative sample of anyone.
          </li>
          <li>
            <strong>Photographs are not places.</strong> A photo is an impoverished
            substitute for standing in a building, holding a mug, walking a street.
            Alexander&rsquo;s question is about embodied experience; we are measuring its
            shadow.
          </li>
          <li>
            <strong>Photography is a confound.</strong> Lighting, lens, framing, and
            image quality all influence judgments. We curate for even, comparable
            photography, but the confound cannot be fully removed — the object categories
            (mugs, chairs, textiles) with standardized product photography are the
            cleanest channel.
          </li>
          <li>
            <strong>Anchoring and ordering effects.</strong> We randomize what we can,
            but a voting stream is not a controlled lab session.
          </li>
        </ul>

        <h2 className="prompt text-xl pt-4">The data</h2>
        <p>
          Every vote is anonymous. The only identifier is a salted hash of a random
          first-party cookie — no accounts, no personal information, no third-party
          tracking. The full vote table (including ties and votes flagged by rate
          limiting, which you should filter as you see fit) is public:
        </p>
        <p>
          <a href="/api/export" className="underline underline-offset-2">
            Download all votes as CSV
          </a>
        </p>
        <p className="text-muted text-sm">
          Columns: vote id, timestamp, category, pool, both item ids, winner id (empty =
          tie), question variant, position of winner, response time in ms, anonymous
          voter id, flagged.
        </p>

        <p className="pt-4">
          <Link href="/" className="underline underline-offset-2">
            Back to voting
          </Link>
        </p>
      </section>
    </main>
  );
}
