import { db } from "@/db";
import { jobs, candidates, clients, placements, applications, branches } from "@/db/schema";
import { sql, and, eq } from "drizzle-orm";
import Link from "next/link";
import {
  Briefcase, MapPin, IndianRupee, Clock, Building2, Users, Sparkles, ArrowRight,
  Globe, Award, TrendingUp, ShieldCheck, Handshake, CheckCircle2, Search,
} from "lucide-react";
import { PublicHeader, PublicFooter, Logo } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getCompanySettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let session = null;
  let settings = null;
  let stats = { candidates: 0, jobs: 0, clients: 0, placed: 0, branches: 0 };
  let featured: any[] = [];
  let urgent: any[] = [];
  let latest: any[] = [];
  let branches_list: any[] = [];

  // Run critical, resilient data fetches. If DB is unreachable, fall back to safe defaults.
  try {
    session = await getSession();
    settings = await getCompanySettings();

    try {
      const [candidatesN] = await db.select({ c: sql<number>`count(*)` }).from(candidates);
      const [jobsN] = await db.select({ c: sql<number>`count(*)` }).from(jobs).where(eq(jobs.isActive, true));
      const [clientsN] = await db.select({ c: sql<number>`count(*)` }).from(clients);
      const [placed] = await db.select({ c: sql<number>`count(*)` }).from(placements);
      const [branchesN] = await db.select({ c: sql<number>`count(*)` }).from(branches);
      stats = {
        candidates: Number(candidatesN?.c ?? 0),
        jobs: Number(jobsN?.c ?? 0),
        clients: Number(clientsN?.c ?? 0),
        placed: Number(placed?.c ?? 0),
        branches: Number(branchesN?.c ?? 0),
      };
    } catch (err) {
      // If aggregate queries fail, continue with zeroed stats.
      // eslint-disable-next-line no-console
      console.warn("HomePage: aggregate DB queries failed, using zeroed stats:", (err as any)?.message ?? String(err));
    }

    try {
      featured = await db.select().from(jobs).where(and(eq(jobs.isActive, true), eq(jobs.isFeatured, true))).limit(6);
    } catch (err) {
      featured = [];
      // eslint-disable-next-line no-console
      console.warn("HomePage: featured jobs query failed:", (err as any)?.message ?? String(err));
    }

    try {
      urgent = await db.select().from(jobs).where(and(eq(jobs.isActive, true), eq(jobs.isUrgent, true))).limit(6);
    } catch (err) {
      urgent = [];
      // eslint-disable-next-line no-console
      console.warn("HomePage: urgent jobs query failed:", (err as any)?.message ?? String(err));
    }

    try {
      latest = await db.select().from(jobs).where(eq(jobs.isActive, true)).orderBy(jobs.postedAt).limit(8);
    } catch (err) {
      latest = [];
      // eslint-disable-next-line no-console
      console.warn("HomePage: latest jobs query failed:", (err as any)?.message ?? String(err));
    }

    try {
      branches_list = await db.select().from(branches).limit(6);
    } catch (err) {
      branches_list = [];
      // eslint-disable-next-line no-console
      console.warn("HomePage: branches query failed:", (err as any)?.message ?? String(err));
    }
  } catch (err) {
    // Top-level DB connectivity failed. Ensure we still have settings (which has its own fallback)
    // and minimal defaults so the page can render.
    // eslint-disable-next-line no-console
    console.warn("HomePage: DB access failed, rendering with safe defaults:", (err as any)?.message ?? String(err));
    if (!settings) settings = await getCompanySettings();
    session = await getSession();
  }

  let industries: { name: string; count: number; icon: string }[] = [];
  try {
    const industryRows = await db.select({
      name: sql<string>`coalesce(${clients.industry}, 'Other')`,
      count: sql<number>`count(${jobs.id})`,
    }).from(jobs).leftJoin(clients, eq(jobs.clientId, clients.id))
      .where(eq(jobs.isActive, true)).groupBy(clients.industry).orderBy(sql`count(${jobs.id}) desc`).limit(8);
    industries = industryRows.map((row) => ({ name: row.name, count: Number(row.count), icon: "▦" }));
  } catch (err) {
    industries = [];
    // eslint-disable-next-line no-console
    console.warn("HomePage: industries query failed, using empty list:", (err as any)?.message ?? String(err));
  }

  const processSteps = [
    { icon: Search, title: "Requirement", desc: "Share your requirement with us." },
    { icon: Users, title: "Sourcing", desc: "We source the best talent." },
    { icon: CheckCircle2, title: "Screening", desc: "Rigorous screening & assessment." },
    { icon: Handshake, title: "Placement", desc: "Seamless onboarding & joining." },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader session={session} />

      {/* HERO */}
      <section className="relative overflow-hidden brand-gradient cinematic-noise text-white min-h-[760px] flex items-center">
        <div className="absolute inset-0 cinematic-grid" />
        <div className="cinematic-orb absolute -top-28 right-[8%] h-80 w-80 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="cinematic-orb cinematic-orb-slow absolute bottom-4 left-[3%] h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute left-[8%] top-36 h-px w-36 bg-gradient-to-r from-amber-400/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto w-full px-4 md:px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-center">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>By Azaadi Global Services Pvt. Ltd.</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Find Your Dream Career With <span className="text-amber-400">OBE BILLA</span> INTERNATIONAL
            </h1>
            <p className="mt-5 text-base md:text-lg text-slate-200 max-w-2xl">
              India's trusted recruitment partner — connecting top talent with world-class employers across industries. End-to-end manpower, staffing & overseas recruitment.
            </p>

          {/* Search box */}
          <form action="/jobs" method="GET" className="mt-8 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-3 md:p-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input name="q" placeholder="Job title, keyword..." className="bg-transparent outline-none text-sm flex-1 text-slate-900" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input name="location" placeholder="Location, country..." className="bg-transparent outline-none text-sm flex-1 text-slate-900" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input placeholder="Experience..." className="bg-transparent outline-none text-sm flex-1 text-slate-900" />
              </div>
              <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-md">
                Search Jobs <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link href="/register?type=candidate" className="text-xs px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium">
                Register as Candidate →
              </Link>
              <Link href="/register?type=client" className="text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium">
                Hire Manpower →
              </Link>
              <span className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">{stats.jobs} active opportunities available</span>
            </div>
          </form>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 max-w-4xl">
            {[
              { label: "Candidates", value: stats.candidates.toLocaleString(), icon: Users },
              { label: "Active Jobs", value: stats.jobs, icon: Briefcase },
              { label: "Happy Clients", value: stats.clients, icon: Building2 },
              { label: "Placements", value: stats.placed, icon: Handshake },
              { label: "Branches", value: stats.branches, icon: MapPin },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-2 text-amber-300 mb-1"><s.icon className="w-4 h-4" /><span className="text-xs font-medium text-slate-300 uppercase tracking-wider">{s.label}</span></div>
                <div className="text-2xl md:text-3xl font-bold">{s.value}</div>
              </div>
            ))}
          </div>
          </div>

          <aside className="hidden lg:block glass-panel rounded-3xl p-5 rotate-[1.5deg] hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><div className="text-[10px] font-bold uppercase tracking-[.22em] text-amber-300">Live Operations</div><div className="font-semibold mt-1">Recruitment Network</div></div><span className="flex h-3 w-3"><span className="absolute h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-60"/><span className="relative h-3 w-3 rounded-full bg-emerald-400"/></span></div>
            <div className="space-y-3 py-5">{[
              {label:'Active opportunities',value:stats.jobs,icon:Briefcase},
              {label:'Registered talent',value:stats.candidates,icon:Users},
              {label:'Employer network',value:stats.clients,icon:Building2},
              {label:'Confirmed placements',value:stats.placed,icon:Handshake},
            ].map(item => <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-white/[.07] border border-white/10 p-3"><div className="h-10 w-10 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center"><item.icon className="w-5 h-5"/></div><div className="flex-1"><div className="text-xs text-slate-300">{item.label}</div><div className="text-xl font-bold">{Number(item.value).toLocaleString('en-IN')}</div></div></div>)}</div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs text-amber-100">All figures are synchronized with PostgreSQL.</div>
          </aside>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">Why Choose Us</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Built for serious recruitment</h2>
            <p className="text-slate-600 mt-3">One platform for candidate sourcing, ATS pipeline, client CRM, billing & placement — all fully connected.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: "Trusted Partner", desc: "Verified by Azaadi Global. Enterprise-grade security and compliance.", color: "bg-blue-50 text-blue-600" },
              { icon: TrendingUp, title: "Structured Matching", desc: "Database-backed skill, experience and requirement comparison for every application.", color: "bg-emerald-50 text-emerald-600" },
              { icon: Globe, title: "Global Reach", desc: "Overseas recruitment across UAE, GCC, SE Asia and beyond.", color: "bg-purple-50 text-purple-600" },
              { icon: Award, title: "Quality Assured", desc: "Rigorous screening, document verification and replacement policy.", color: "bg-amber-50 text-amber-600" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-5 card-hover">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{f.title}</h3>
                <p className="text-sm text-slate-600 mt-1.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Featured Jobs</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">Handpicked opportunities</h2>
            </div>
            <Link href="/jobs" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                <div className="bg-white border border-slate-200 rounded-xl p-5 card-hover h-full">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {job.isUrgent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold uppercase">Urgent</span>}
                      {job.isOverseas && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-semibold uppercase">Overseas</span>}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-2">{job.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{job.designation}</p>
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" />{job.location}, {job.country}</div>
                    {job.salaryMin && <div className="flex items-center gap-2"><IndianRupee className="w-3.5 h-3.5 text-slate-400" />{Number(job.salaryMin).toLocaleString("en-IN")} - {Number(job.salaryMax || 0).toLocaleString("en-IN")} / {job.salaryType}</div>}
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" />{job.experienceMin}+ yrs • {job.vacancy} vacancies</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(job.skills || []).slice(0, 3).map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* URGENT HIRING */}
      {urgent.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-amber-50 via-white to-orange-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
                  Urgent Hiring
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">Immediate joiners needed</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {urgent.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                  <div className="bg-white border border-red-100 rounded-xl p-5 card-hover shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-600 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Immediate joining
                    </div>
                    <h3 className="font-bold text-slate-900">{job.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" />{job.location}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-600">{job.vacancy} vacancies</span>
                      <span className="font-semibold text-brand-600">Apply now →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Industries We Serve</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Explore by category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {industries.map((i) => (
              <Link key={i.name} href="/jobs" className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-300 hover:bg-brand-50/30 transition card-hover">
                <div className="text-3xl mb-2">{i.icon}</div>
                <h3 className="font-semibold text-slate-900 text-sm">{i.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{i.count} open positions</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Our Process</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">From requirement to joining</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {processSteps.map((s, i) => (
              <div key={s.title} className="relative bg-white border border-slate-200 rounded-xl p-5 card-hover">
                <div className="absolute -top-3 -left-2 w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-md">{i + 1}</div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRANCHES */}
      <section className="py-16 bg-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Our Presence</div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Branches across India</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches_list.map((b) => (
              <div key={b.id} className="bg-white/5 border border-white/10 backdrop-blur rounded-xl p-5 hover:bg-white/10 transition">
                <div className="flex items-center gap-2 text-amber-400 mb-2"><MapPin className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider">{b.code}</span></div>
                <h3 className="font-bold text-lg">{b.name}</h3>
                <p className="text-sm text-slate-300 mt-1">{b.address}</p>
                <p className="text-xs text-slate-400 mt-2">{b.email} • {b.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="brand-gradient rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold leading-tight">Ready to take the next step?</h2>
                <p className="mt-3 text-slate-200">Create your account and manage the complete recruitment journey in one secure platform.</p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link href="/register?type=candidate"><button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg">I'm a Candidate</button></Link>
                <Link href="/register?type=client"><button className="bg-white text-brand-700 hover:bg-slate-100 px-6 py-3 rounded-lg font-semibold">I'm an Employer</button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
