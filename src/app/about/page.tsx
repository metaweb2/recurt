import { PublicHeader, PublicFooter } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { Award, Users, Building2, Globe, ShieldCheck, Briefcase, Handshake, TrendingUp, Target, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { candidates, clients, placements } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function AboutPage() {
  const session = await getSession();
  const [[candidateCount], [placementCount], [clientCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(candidates),
    db.select({ count: sql<number>`count(*)` }).from(placements),
    db.select({ count: sql<number>`count(*)` }).from(clients),
  ]);
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader session={session} />

      <section className="brand-gradient text-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">About Us</div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Building careers, powering businesses</h1>
          <p className="mt-4 text-slate-200 text-lg">OBE BILLA INTERNATIONAL, a flagship of Azaadi Global Services Pvt. Ltd., is a trusted recruitment and manpower consultancy serving candidates and employers across India and the globe.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Our Story</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Connecting talent with opportunity</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">Our mission is to make recruitment transparent, fast and fair across manufacturing, IT, healthcare, construction, hospitality and other workforce sectors.</p>
            <p className="text-slate-600 mt-3 leading-relaxed">Our platform combines experienced recruiters with modern technology — an ATS that automates the hiring pipeline, AI-powered candidate matching, and secure document management.</p>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center p-4 rounded-xl bg-brand-50"><div className="text-2xl font-bold text-brand-700">{Number(candidateCount?.count ?? 0).toLocaleString("en-IN")}</div><div className="text-xs text-slate-600 mt-1">Candidates</div></div>
              <div className="text-center p-4 rounded-xl bg-amber-50"><div className="text-2xl font-bold text-amber-700">{Number(placementCount?.count ?? 0).toLocaleString("en-IN")}</div><div className="text-xs text-slate-600 mt-1">Placements</div></div>
              <div className="text-center p-4 rounded-xl bg-emerald-50"><div className="text-2xl font-bold text-emerald-700">{Number(clientCount?.count ?? 0).toLocaleString("en-IN")}</div><div className="text-xs text-slate-600 mt-1">Clients</div></div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <Award className="w-12 h-12 text-amber-400" />
                  <h3 className="text-2xl font-bold mt-4">Our Mission</h3>
                  <p className="mt-2 text-slate-200">To connect every candidate with the right career and every employer with the right talent — ethically, efficiently and globally.</p>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-white/20">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold">AG</div>
                  <div><div className="text-sm font-semibold">Azaadi Global</div><div className="text-xs text-slate-300">Services Pvt. Ltd.</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">What We Offer</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Our Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Briefcase, title: "Permanent Recruitment", desc: "End-to-end hiring for mid & senior roles across industries." },
              { icon: Users, title: "Contract Staffing", desc: "Flexible workforce solutions — hire for projects & seasons." },
              { icon: Globe, title: "Overseas Recruitment", desc: "Manpower deployment to UAE, GCC, SE Asia, Europe & beyond." },
              { icon: Handshake, title: "Executive Search", desc: "Confidential head-hunting for leadership & CXO positions." },
              { icon: Target, title: "RPO Services", desc: "Full recruitment process outsourcing with dedicated teams." },
              { icon: Zap, title: "Payroll & Compliance", desc: "End-to-end payroll, statutory compliance & workforce admin." },
            ].map((s: string) => (
              <div key={s.title} className="bg-white border border-slate-200 rounded-xl p-6 card-hover">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3"><s.icon className="w-6 h-6" /></div>
                <h3 className="font-bold text-slate-900 text-lg">{s.title}</h3>
                <p className="text-sm text-slate-600 mt-1.5">{s.desc}</p>
                <Link href="/contact" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 mt-3 hover:text-brand-700">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Why OBE BILLA</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Built for serious recruitment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, title: "Enterprise-grade security", desc: "SOC2-ready architecture, role-based access, audit logs, encrypted documents." },
              { icon: TrendingUp, title: "AI-powered matching", desc: "Automatically score and rank candidates against job requirements." },
              { icon: Building2, title: "Complete client portal", desc: "Post requirements, shortlist candidates, track interviews — all online." },
              { icon: Globe, title: "Global manpower pipeline", desc: "Overseas recruitment with visa, medical, ticketing tracking." },
              { icon: CheckCircle2, title: "Quality assurance", desc: "Document verification, replacement guarantee, transparent SLAs." },
              { icon: Award, title: "Industry expertise", desc: "Specialized teams for IT, manufacturing, healthcare, construction, hospitality." },
            ].map((s: string) => (
              <div key={s.title} className="flex gap-4 bg-white border border-slate-200 rounded-xl p-5">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0"><s.icon className="w-6 h-6" /></div>
                <div><h3 className="font-bold text-slate-900">{s.title}</h3><p className="text-sm text-slate-600 mt-1">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
