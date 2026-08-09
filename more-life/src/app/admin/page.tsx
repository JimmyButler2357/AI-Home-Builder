import { sql } from "@/lib/db";
import { adminConfigured, isAdmin } from "@/lib/admin";
import { approveItem, clearReports, login, rejectItem } from "./actions";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  category: string;
  image_url: string;
  title: string | null;
  attribution: string;
  source_url: string;
  license: string;
  pool: string;
  report_count: number;
  created_at: Date;
};

function ItemCard({ item, reported }: { item: Row; reported?: boolean }) {
  return (
    <li className="border border-line rounded p-4 flex gap-4">
      <div className="w-40 shrink-0 aspect-[4/3] bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image_url} alt="" className="h-full w-full object-contain" />
      </div>
      <div className="text-sm flex-1">
        <p className="font-medium">{item.title ?? "Untitled"} <span className="text-muted">· {item.category} · {item.pool}</span></p>
        <p className="text-muted mt-1">
          {item.attribution} · {item.license} ·{" "}
          <a href={item.source_url} className="underline" rel="noopener noreferrer">source</a>
        </p>
        {reported && <p className="mt-1 text-red-700">{item.report_count} report(s)</p>}
        <div className="mt-3 flex gap-2">
          {!reported && (
            <form action={approveItem}>
              <input type="hidden" name="id" value={item.id} />
              <button className="rounded border border-line px-3 py-1 hover:bg-surface">Approve</button>
            </form>
          )}
          {reported && (
            <form action={clearReports}>
              <input type="hidden" name="id" value={item.id} />
              <button className="rounded border border-line px-3 py-1 hover:bg-surface">Dismiss reports</button>
            </form>
          )}
          <form action={rejectItem}>
            <input type="hidden" name="id" value={item.id} />
            <button className="rounded border border-red-700 text-red-700 px-3 py-1 hover:bg-surface">
              {item.pool === "community" ? "Reject & delete" : "Unapprove"}
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

export default async function AdminPage() {
  if (!adminConfigured()) {
    return <main className="mx-auto max-w-xl px-6 pt-16">Set ADMIN_PASSWORD and APP_SECRET to enable the admin screen.</main>;
  }
  if (!(await isAdmin())) {
    return (
      <main className="mx-auto max-w-xs px-6 pt-24">
        <h1 className="prompt text-2xl">Admin</h1>
        <form action={login} className="mt-6 space-y-3">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border border-line rounded px-3 py-2 bg-transparent"
          />
          <button className="rounded-full bg-foreground text-background px-6 py-2">Sign in</button>
        </form>
      </main>
    );
  }

  const pending = await sql<Row[]>`
    select id, category, image_url, title, attribution, source_url, license, pool, report_count, created_at
    from items where not approved and pool = 'community' order by created_at asc limit 100`;
  const reported = await sql<Row[]>`
    select id, category, image_url, title, attribution, source_url, license, pool, report_count, created_at
    from items where approved and report_count > 0 order by report_count desc limit 100`;

  return (
    <main className="mx-auto max-w-3xl px-6 pt-10 pb-16">
      <h1 className="prompt text-3xl">Review queue</h1>

      <h2 className="prompt text-xl mt-8">Pending uploads ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="text-muted text-sm mt-2">Nothing waiting.</p>
      ) : (
        <ul className="mt-4 space-y-4">{pending.map((i) => <ItemCard key={i.id} item={i} />)}</ul>
      )}

      <h2 className="prompt text-xl mt-10">Reported items ({reported.length})</h2>
      {reported.length === 0 ? (
        <p className="text-muted text-sm mt-2">No open reports.</p>
      ) : (
        <ul className="mt-4 space-y-4">{reported.map((i) => <ItemCard key={i.id} item={i} reported />)}</ul>
      )}
    </main>
  );
}
