import { PublicHeader, PublicFooter } from "@/components/ui";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Briefcase } from "lucide-react";

export async function PublicInfoPage({ eyebrow, title, description, sections, cta = true }: {
  eyebrow: string; title: string; description: string;
  sections: { title: string; description: string; items?: string[] }[]; cta?: boolean;
}) {
  const session = await getSession();
  return <div className="min-h-screen bg-white"><PublicHeader session={session} />
    <section className="brand-gradient text-white py-16 md:py-24"><div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">{eyebrow}</div>
      <h1 className="text-4xl md:text-5xl font-bold mt-2">{title}</h1><p className="text-slate-200 text-lg mt-4 max-w-3xl mx-auto">{description}</p>
    </div></section>
    <section className="py-14"><div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {sections.map(section => <article key={section.title} className="rounded-xl border border-slate-200 bg-white p-6 card-hover">
        <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4"><Briefcase className="w-5 h-5" /></div>
        <h2 className="text-lg font-bold text-slate-900">{section.title}</h2><p className="text-sm text-slate-600 mt-2 leading-relaxed">{section.description}</p>
        {section.items && <ul className="mt-4 space-y-2">{section.items.map(item => <li key={item} className="flex gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{item}</li>)}</ul>}
      </article>)}
    </div></section>
    {cta && <section className="max-w-5xl mx-auto px-4 md:px-6 pb-16"><div className="rounded-2xl brand-gradient p-8 text-white flex flex-col md:flex-row items-center justify-between gap-5"><div><h2 className="text-2xl font-bold">Ready to get started?</h2><p className="text-slate-200 mt-1">Talk to our recruitment experts today.</p></div><Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold hover:bg-amber-600">Contact Us <ArrowRight className="w-4 h-4" /></Link></div></section>}
    <PublicFooter />
  </div>;
}
