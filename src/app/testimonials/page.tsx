import { PublicHeader, PublicFooter, EmptyState, Award } from "@/components/ui";
import { getSession } from "@/lib/auth";

export default async function TestimonialsPage() {
  const session = await getSession();
  return <div className="min-h-screen bg-slate-50"><PublicHeader session={session} />
    <section className="brand-gradient py-16 text-white"><div className="max-w-4xl mx-auto px-4 text-center"><div className="text-xs font-bold uppercase tracking-wider text-amber-400">Client & Candidate Voice</div><h1 className="text-4xl font-bold mt-2">Testimonials</h1><p className="text-slate-200 mt-3">Only reviewed and approved testimonials are published here.</p></div></section>
    <main className="max-w-5xl mx-auto px-4 py-14"><div className="rounded-xl border border-slate-200 bg-white"><EmptyState icon={Award} title="No published testimonials yet" description="Approved testimonials will appear here after administrative review." /></div></main>
    <PublicFooter />
  </div>;
}
