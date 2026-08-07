import { PublicHeader, PublicFooter, EmptyState } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { placements } from "@/db/schema";
import { sql } from "drizzle-orm";
import { Handshake } from "lucide-react";

export default async function SuccessStoriesPage() {
  const session = await getSession();
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(placements);
  const count = Number(row?.count ?? 0);
  return <div className="min-h-screen bg-slate-50"><PublicHeader session={session} />
    <section className="brand-gradient py-16 text-white"><div className="max-w-4xl mx-auto px-4 text-center"><div className="text-xs font-bold uppercase tracking-wider text-amber-400">Verified Outcomes</div><h1 className="text-4xl font-bold mt-2">Success Stories</h1><p className="text-slate-200 mt-3">Published outcomes are based on confirmed placement records.</p></div></section>
    <main className="max-w-5xl mx-auto px-4 py-14"><div className="rounded-xl border border-slate-200 bg-white">{count > 0 ? <div className="p-10 text-center"><div className="text-5xl font-bold text-brand-700">{count.toLocaleString("en-IN")}</div><p className="text-slate-600 mt-2">Confirmed placements recorded in the platform</p></div> : <EmptyState icon={Handshake} title="No confirmed placements published yet" description="Placement outcomes will be shown after confirmation and publication approval." />}</div></main>
    <PublicFooter />
  </div>;
}
