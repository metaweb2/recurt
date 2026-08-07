"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Button, Badge, StatusBadge, EmptyState, ProgressBar, toast, FileText, Briefcase, Calendar, UserCheck, DollarSign, Plus, Eye, Download } from "@/components/ui";
import { fmtINR, formatDate, humanStatus } from "@/lib/utils";
import { PortalAction } from "@/components/portal-actions";

export default function ClientTabs({ client, requirements, candidates, interviews: interviewList, invoices, placements, stats }: { client: any; requirements: any[]; candidates: any[]; interviews: any[]; invoices: any[]; placements: any[]; stats: { candidatesReceived: number; shortlisted: number; interviews: number; selected: number; placements: number } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = (nextTab: string) => router.push(nextTab === "overview" ? "/client" : `/client?tab=${nextTab}`);
  const shortlisted = stats.shortlisted;
  const interviews = stats.interviews;
  const requirementFields = [
    { name: "position", label: "Position", required: true }, { name: "department", label: "Department" },
    { name: "vacancy", label: "Vacancy", type: "number" as const, defaultValue: 1 }, { name: "location", label: "Location", required: true },
    { name: "qualification", label: "Qualification" }, { name: "skills", label: "Skills (comma separated)" },
    { name: "experienceMin", label: "Minimum Experience", type: "number" as const }, { name: "experienceMax", label: "Maximum Experience", type: "number" as const },
    { name: "salaryMin", label: "Minimum Salary", type: "number" as const }, { name: "salaryMax", label: "Maximum Salary", type: "number" as const },
    { name: "shift", label: "Shift" }, { name: "specialRequirements", label: "Special Requirements", type: "textarea" as const },
  ];

  const statCards = [
    { label: "Requirements", value: requirements.length, icon: FileText, color: "from-blue-500 to-blue-700" },
    { label: "Candidates Received", value: stats.candidatesReceived, icon: Briefcase, color: "from-emerald-500 to-emerald-700" },
    { label: "Shortlisted", value: shortlisted, icon: UserCheck, color: "from-purple-500 to-purple-700" },
    { label: "Interviews", value: interviews, icon: Calendar, color: "from-amber-500 to-amber-600" },
    { label: "Joined", value: stats.placements, icon: DollarSign, color: "from-cyan-500 to-cyan-600" },
  ];

  return (
    <div className="animate-fade-up">
      {tab === "overview" && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome, {client.companyName}</h2>
            <p className="text-slate-600 mt-1">Manage your manpower requirements and track candidates.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {statCards.map((s) => (
              <Card key={s.label} className="p-4 card-hover">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} text-white flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Active Requirements</h3>
                <PortalAction action="requirement.create" title="New Manpower Requirement" label="New" icon={Plus} size="sm" fields={requirementFields} />
              </div>
              {requirements.length === 0 ? (
                <EmptyState icon={FileText} title="No requirements" description="Post your first manpower requirement." action={<PortalAction action="requirement.create" title="New Manpower Requirement" label="Post Requirement" icon={Plus} fields={requirementFields} />} />
              ) : (
                <div className="space-y-3">
                  {requirements.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-brand-300 transition">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0"><Briefcase className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate">{r.position}</div>
                        <div className="text-xs text-slate-500">{r.department} • {r.vacancy} vacancies • {r.location}</div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">{humanStatus(r.status || "open")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-slate-900 mb-4">Recruitment Funnel</h3>
              <div className="space-y-3">
                {[
                  { label: "Received", value: stats.candidatesReceived, color: "bg-blue-500" },
                  { label: "Shortlisted", value: shortlisted, color: "bg-purple-500" },
                  { label: "Interviewed", value: interviews, color: "bg-amber-500" },
                  { label: "Joined", value: stats.placements, color: "bg-emerald-500" },
                ].map((stage) => {
                  const pct = stats.candidatesReceived > 0 ? (stage.value / stats.candidatesReceived) * 100 : 0;
                  return (
                    <div key={stage.label}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700">{stage.label}</span>
                        <span className="text-slate-900">{stage.value}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stage.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "requirements" && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">Manpower Requirements</h2>
            <PortalAction action="requirement.create" title="New Manpower Requirement" label="New Requirement" icon={Plus} fields={requirementFields} />
          </div>
          {requirements.length === 0 ? (
            <EmptyState icon={FileText} title="No requirements" description="Post your first manpower requirement." action={<PortalAction action="requirement.create" title="New Manpower Requirement" label="Post Requirement" icon={Plus} fields={requirementFields} />} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 uppercase border-b border-slate-200">
                  <tr><th className="text-left py-3 px-2">ID</th><th className="text-left py-3 px-2">Position</th><th className="text-left py-3 px-2">Vacancy</th><th className="text-left py-3 px-2">Status</th><th className="text-left py-3 px-2">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requirements.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 font-mono text-xs text-slate-500">{r.requirementId}</td>
                      <td className="py-3 px-2 font-medium text-slate-900">{r.position}</td>
                      <td className="py-3 px-2 text-slate-600">{r.vacancy}</td>
                      <td className="py-3 px-2"><Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">{humanStatus(r.status || "open")}</Badge></td>
                      <td className="py-3 px-2"><Button size="sm" variant="ghost" onClick={() => toast.info(`${r.requirementId}: ${r.position} • ${r.vacancy} vacancies • ${r.location}`)}><Eye className="w-3.5 h-3.5" /> View</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "candidates" && (
        <Card className="p-5"><h2 className="text-xl font-bold text-slate-900 mb-5">Candidates Pipeline</h2>
          {candidates.length ? <div className="space-y-3">{candidates.map(row => <div key={row.applicationId} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3"><div><div className="font-semibold text-slate-900">{row.candidateName}</div><div className="text-xs text-slate-500 mt-1">{row.candidateCode} • {row.jobTitle} • {row.matchScore || 0}% match</div></div><StatusBadge status={row.status || 'new_application'} /></div>)}</div> : <EmptyState icon={Briefcase} title="No candidates received" description="Candidates submitted against your jobs will appear here." />}
        </Card>
      )}

      {tab === "interviews" && (
        <Card className="p-5"><h2 className="text-xl font-bold text-slate-900 mb-5">Interview Schedule</h2>
          {interviewList.length ? <div className="space-y-3">{interviewList.map(row => <div key={row.id} className="rounded-xl border border-slate-200 p-4"><div className="font-semibold text-slate-900">{row.jobTitle} • {row.round}</div><div className="text-xs text-slate-500 mt-1">{row.interviewer} • {row.scheduledAt ? new Date(row.scheduledAt).toLocaleString('en-IN') : 'Not scheduled'}</div>{row.result && <div className="mt-2"><StatusBadge status={row.result} /></div>}</div>)}</div> : <EmptyState icon={Calendar} title="No interviews scheduled" description="Recruiter-scheduled interviews will appear here." />}
        </Card>
      )}

      {tab === "joined" && (
        <Card className="p-5"><h2 className="text-xl font-bold text-slate-900 mb-5">Joined Employees</h2>
          {placements.length ? <div className="space-y-3">{placements.map(row => <div key={row.id} className="rounded-xl border border-slate-200 p-4 flex justify-between gap-3"><div><div className="font-semibold text-slate-900">{row.designation}</div><div className="text-xs text-slate-500 mt-1">Joined: {formatDate(row.joiningDate)} • Salary: {fmtINR(row.salary)}</div></div><Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">{humanStatus(row.status || 'active')}</Badge></div>)}</div> : <EmptyState icon={UserCheck} title="No joined employees" description="Confirmed placements will appear here." />}
        </Card>
      )}

      {tab === "billing" && (
        <Card className="p-5"><h2 className="text-xl font-bold text-slate-900 mb-5">Invoices & Payments</h2>
          {invoices.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs uppercase text-slate-500 border-b"><tr><th className="text-left py-3">Invoice</th><th className="text-left py-3">Due</th><th className="text-left py-3">Total</th><th className="text-left py-3">Status</th></tr></thead><tbody className="divide-y">{invoices.map(row => <tr key={row.id}><td className="py-3 font-mono text-xs">{row.invoiceNo}</td><td className="py-3">{formatDate(row.dueDate)}</td><td className="py-3 font-semibold">{fmtINR(row.total)}</td><td className="py-3"><StatusBadge status={row.status || 'pending'} /></td></tr>)}</tbody></table></div> : <EmptyState icon={DollarSign} title="No invoices" description="Issued invoices and payment status will appear here." />}
        </Card>
      )}
    </div>
  );
}
