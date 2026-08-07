import Link from "next/link";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { eq, and, like, or, sql } from "drizzle-orm";
import { PublicHeader, PublicFooter } from "@/components/ui";
import { Briefcase, MapPin, IndianRupee, Clock, Search, Building2, Filter } from "lucide-react";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ q?: string; location?: string; industry?: string; type?: string }> }) {
  const sp = await searchParams;
  const session = await getSession();
  let list: any[] = [];
  try {
    const conditions = [eq(jobs.isActive, true)];
    if (sp.q) conditions.push(or(like(jobs.title, `%${sp.q}%`), like(jobs.description, `%${sp.q}%`))!);
    if (sp.location) conditions.push(or(like(jobs.location, `%${sp.location}%`), like(jobs.country, `%${sp.location}%`))!);
    if (sp.type) conditions.push(eq(jobs.jobType, sp.type));
    list = await db.select().from(jobs).where(and(...conditions)).orderBy(jobs.postedAt).limit(100);
  } catch (err) {
    // DB may be unreachable; render the page with an empty list instead of crashing.
    // eslint-disable-next-line no-console
    console.warn("JobsPage: DB query failed, using empty list:", (err as any)?.message ?? String(err));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader session={session} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Browse Jobs</h1>
          <p className="text-slate-600 mt-1">Explore {list.length} open positions across industries.</p>
        </div>

        {/* Filters */}
        <form action="/jobs" method="GET" className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input name="q" defaultValue={sp.q} placeholder="Keyword" className="bg-transparent outline-none text-sm flex-1" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400" />
              <input name="location" defaultValue={sp.location} placeholder="Location" className="bg-transparent outline-none text-sm flex-1" />
            </div>
            <select name="industry" defaultValue={sp.industry} className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm">
              <option value="">All Industries</option>
              <option>IT / Software</option><option>Manufacturing</option><option>Construction</option><option>Healthcare</option>
            </select>
            <select name="type" defaultValue={sp.type} className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm">
              <option value="">All Types</option>
              <option>Full Time</option><option>Part Time</option><option>Contract</option>
            </select>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg text-sm font-semibold">Apply Filters</button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar filters on desktop */}
          <aside className="hidden lg:block">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sticky top-20">
              <div className="flex items-center gap-2 font-semibold text-slate-900 mb-3"><Filter className="w-4 h-4" /> Quick Filters</div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Job Type</div>
                  {["Full Time", "Part Time", "Contract"].map(t => (
                    <Link key={t} href={`/jobs?type=${encodeURIComponent(t)}`} className="block py-1.5 text-slate-600 hover:text-brand-600">{t}</Link>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Experience</div>
                  {["0-1 years", "2-4 years", "5-8 years", "10+ years"].map(t => (
                    <div key={t} className="py-1.5 text-slate-600">{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Job list */}
          <div className="lg:col-span-3 space-y-3">
            {list.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="font-semibold text-slate-900">No jobs found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your filters.</p>
              </div>
            ) : list.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="bg-white border border-slate-200 hover:border-brand-300 rounded-xl p-4 md:p-5 transition card-hover">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base md:text-lg">{job.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5"><Building2 className="w-3 h-3" />{job.designation}</p>
                        </div>
                        <div className="flex gap-1.5">
                          {job.isUrgent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold uppercase">Urgent</span>}
                          {job.isFeatured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold uppercase">Featured</span>}
                          {job.isOverseas && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-semibold uppercase">Overseas</span>}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{job.location}, {job.country}</div>
                        {job.salaryMin && <div className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-slate-400" />{Number(job.salaryMin).toLocaleString("en-IN")} - {Number(job.salaryMax || 0).toLocaleString("en-IN")}</div>}
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />{job.experienceMin}+ yrs exp</div>
                        <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" />{job.vacancy} vacancy</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(job.skills || []).slice(0, 5).map((s: string) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
