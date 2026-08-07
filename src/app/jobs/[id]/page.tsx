import Link from "next/link";
import { db } from "@/db";
import { jobs, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/ui";
import { Briefcase, MapPin, IndianRupee, Clock, Building2, UserCircle, Calendar, Share2, Heart, Award, GraduationCap, ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { JobActions } from "@/components/job-actions";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!job) notFound();
  const client = job.clientId ? await db.select().from(clients).where(eq(clients.id, job.clientId)).then(r => r[0]) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader session={session} />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-600 mb-4">← Back to jobs</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {job.isUrgent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold uppercase">Urgent</span>}
                    {job.isFeatured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold uppercase">Featured</span>}
                    {job.isOverseas && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-semibold uppercase">Overseas</span>}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{job.title}</h1>
                  <p className="text-slate-600 mt-1 flex items-center gap-2"><Building2 className="w-4 h-4" />{job.designation} • {job.department}</p>
                  {client && <p className="text-sm text-slate-500 mt-1">{client.companyName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 py-5 border-y border-slate-100">
                <div><div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />Location</div><div className="font-semibold text-sm mt-0.5">{job.location}, {job.country}</div></div>
                {job.salaryMin && <div><div className="text-xs text-slate-500 flex items-center gap-1"><IndianRupee className="w-3 h-3" />Salary</div><div className="font-semibold text-sm mt-0.5">{Number(job.salaryMin).toLocaleString("en-IN")} - {Number(job.salaryMax || 0).toLocaleString("en-IN")} / {job.salaryType}</div></div>}
                <div><div className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />Experience</div><div className="font-semibold text-sm mt-0.5">{job.experienceMin}{job.experienceMax ? ` - ${job.experienceMax}` : "+"} years</div></div>
                <div><div className="text-xs text-slate-500 flex items-center gap-1"><Briefcase className="w-3 h-3" />Vacancy</div><div className="font-semibold text-sm mt-0.5">{job.vacancy} positions</div></div>
              </div>

              {job.description && (
                <div className="mt-5">
                  <h2 className="font-bold text-slate-900 text-lg mb-2">About the role</h2>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
              )}
              {job.responsibilities && (
                <div className="mt-5">
                  <h2 className="font-bold text-slate-900 text-lg mb-2">Responsibilities</h2>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
                </div>
              )}
              {job.requirements && (
                <div className="mt-5">
                  <h2 className="font-bold text-slate-900 text-lg mb-2">Requirements</h2>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                </div>
              )}
              {(job.skills || []).length > 0 && (
                <div className="mt-5">
                  <h2 className="font-bold text-slate-900 text-lg mb-2">Required skills</h2>
                  <div className="flex flex-wrap gap-2">{(job.skills || []).map((s) => <span key={s} className="text-xs px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-medium">{s}</span>)}</div>
                </div>
              )}
            </div>

            {job.benefits && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-3">Benefits & Perks</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.benefits}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-20">
              <JobActions jobId={job.id} signedIn={Boolean(session)} candidate={session?.role === "candidate"} />
              <div className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                <div>Job ID: <span className="font-mono text-slate-700">{job.jobId}</span></div>
                <div>Posted: <span className="text-slate-700">{formatDate(job.postedAt)}</span></div>
                {job.applicationDeadline && <div>Deadline: <span className="text-slate-700">{formatDate(job.applicationDeadline)}</span></div>}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-slate-900 mb-3">Job Summary</h3>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500 flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />Qualification</dt><dd className="font-medium text-slate-900">{job.qualification || "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Job Type</dt><dd className="font-medium text-slate-900">{job.jobType}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Work Mode</dt><dd className="font-medium text-slate-900">{job.workMode || "On-site"}</dd></div>
                {job.shift && <div className="flex justify-between"><dt className="text-slate-500">Shift</dt><dd className="font-medium text-slate-900">{job.shift}</dd></div>}
                {job.accommodation && <div className="flex justify-between items-start"><dt className="text-slate-500">Accommodation</dt><dd className="font-medium text-slate-900 text-right max-w-[60%]">{job.accommodation}</dd></div>}
                {job.food && <div className="flex justify-between items-start"><dt className="text-slate-500">Food</dt><dd className="font-medium text-slate-900 text-right max-w-[60%]">{job.food}</dd></div>}
                {job.transportation && <div className="flex justify-between items-start"><dt className="text-slate-500">Transport</dt><dd className="font-medium text-slate-900 text-right max-w-[60%]">{job.transportation}</dd></div>}
              </dl>
            </div>

            {client && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-bold text-slate-900 mb-3">About the company</h3>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
                  <div><div className="font-semibold text-slate-900">{client.companyName}</div><div className="text-xs text-slate-500">{client.industry}</div></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
