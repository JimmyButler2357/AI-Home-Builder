import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Which has more life?",
  description:
    "A perception experiment: two images, one question. Testing Christopher Alexander's claim that people agree about which things have more life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-muted flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/" className="hover:text-foreground">Vote</Link>
          <Link href="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
          <Link href="/method" className="hover:text-foreground">Method &amp; data</Link>
          <Link href="/contribute" className="hover:text-foreground">Contribute an image</Link>
        </footer>
      </body>
    </html>
  );
}
