import UploadForm from "@/components/UploadForm";

export const metadata = { title: "Contribute — Which has more life?" };

export default function ContributePage() {
  return (
    <main className="mx-auto max-w-xl px-6 pt-10 pb-16">
      <h1 className="prompt text-3xl">Contribute an image</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Community uploads go into a separate pool with its own leaderboard — they are
        never mixed with the curated research set. Submissions are reviewed before they
        appear. Please only upload images of made objects and places (buildings, rooms,
        streets, mugs, chairs, textiles, doors) that you have the right to share, with
        honest attribution.
      </p>
      <UploadForm />
    </main>
  );
}
