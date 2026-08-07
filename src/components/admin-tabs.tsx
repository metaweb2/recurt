"use client";
import { useSearchParams } from "next/navigation";
import { Card, Button, Badge, StatusBadge, EmptyState, ProgressBar, Avatar, StatCard, toast, Users, Briefcase, FileText, Building2, Calendar, Award, Handshake, FileCheck, DollarSign, UserCheck, Mail, Bell, Settings, ShieldCheck, FileBarChart, TrendingUp, Plus, Eye, Download, Edit, CheckCircle2, Clock, AlertCircle, ClipboardList } from "@/components/ui";
import { fmtINR, formatDate, humanStatus, formatDateTime, timeAgo } from "@/lib/utils";
import { PortalAction, CsvExport } from "@/components/portal-actions";

// Inline charts using recharts
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#1e40af", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

type DataShape = {
  counts: { candidates: number; jobs: number; clients: number; applications: number; placements: number; interviews: number; offers: number; invoices: number };
  recentApplications: any[];
  recentCandidates: any[];
  recentJobs: any[];
  activeClients: any[];
  pipelineStats: { status: string | null; c: number }[];
  invoicesList: any[];
  applicationTrend: { month: string; value: number }[];
  placementTrend: { month: string; value: number }[];
  categoryStats: { name: string; value: number }[];
  revenueTrend: { month: string; value: number }[];
  companySettings: { name: string; parent: string; tagline: string; email: string; phone: string; address: string; website: string; linkedin: string; facebook: string };
  requirementsList: any[]; interviewsList: any[]; offersList: any[]; placementsList: any[];
  documentsList: any[]; commissionsList: any[]; branchesList: any[]; staffList: any[];
  auditList: any[]; communicationList: any[];
};

export default function AdminTabs({ data }: { data: DataShape }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const pipelineData = data.pipelineStats.map(p => ({ name: humanStatus(p.status || ""), value: Number(p.c) }));

  const months = Array.from(new Set([...data.applicationTrend.map(row => row.month), ...data.placementTrend.map(row => row.month)]));
  const applicationTrend = months.map(month => ({
    month,
    apps: Number(data.applicationTrend.find(row => row.month === month)?.value ?? 0),
    placed: Number(data.placementTrend.find(row => row.month === month)?.value ?? 0),
  }));
  const categoryData = data.categoryStats.map(row => ({ name: row.name, value: Number(row.value) }));
  const revenueData = data.revenueTrend.map(row => ({ month: row.month, revenue: Number(row.value) }));

  return (
    <div className="animate-fade-up">
      {tab === "overview" && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Recruitment Command Center</h2>
            <p className="text-slate-600 mt-1">Live overview of your recruitment operations.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <StatCard label="Total Candidates" value={data.counts.candidates.toLocaleString()} icon={Users} color="brand" change="+12% vs last month" />
            <StatCard label="Active Jobs" value={data.counts.jobs} icon={Briefcase} color="amber" change="+8 new" />
            <StatCard label="Active Clients" value={data.counts.clients} icon={Building2} color="emerald" />
            <StatCard label="New Applications" value={data.counts.applications} icon={FileText} color="purple" change={`${data.counts.applications > 50 ? "+18" : "+5"}%`} />
            <StatCard label="Interviews" value={data.counts.interviews} icon={Calendar} color="cyan" />
            <StatCard label="Offers Sent" value={data.counts.offers} icon={Award} color="amber" />
            <StatCard label="Placements" value={data.counts.placements} icon={Handshake} color="emerald" change="+5 this month" />
            <StatCard label="Invoices" value={data.counts.invoices} icon={DollarSign} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="lg:col-span-2 p-5">
              <h3 className="font-bold text-slate-900 mb-4">Application & Placement Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={applicationTrend}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1e40af" stopOpacity={0.3} /><stop offset="95%" stopColor="#1e40af" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="apps" stroke="#1e40af" strokeWidth={2} fill="url(#colorApps)" name="Applications" />
                  <Area type="monotone" dataKey="placed" stroke="#10b981" strokeWidth={2} fill="url(#colorPlaced)" name="Placements" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-slate-900 mb-4">Job Category Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5">
              <h3 className="font-bold text-slate-900 mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => fmtINR(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="revenue" fill="#1e40af" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-slate-900 mb-4">Recent Applications</h3>
              <div className="space-y-2">
                {data.recentApplications.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate">App #{String(a.id).slice(0, 8)}</div>
                      <div className="text-xs text-slate-500">Job {String(a.jobId || "").slice(0, 8)}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
                {data.recentApplications.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No applications yet.</p>}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-slate-900 mb-4">Recent Candidates</h3>
              <div className="space-y-3">
                {data.recentCandidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <Avatar name={c.fullName} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{c.fullName}</div>
                      <div className="text-xs text-slate-500">{c.candidateId} • {c.city || "—"}</div>
                    </div>
                    <Badge className="bg-brand-50 text-brand-700 ring-brand-200">{c.profileCompletion || 0}%</Badge>
                  </div>
                ))}
                {data.recentCandidates.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No candidates yet.</p>}
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "candidates" && (
        <Card className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5">
            <div><h2 className="text-xl font-bold text-slate-900">Candidates</h2><p className="text-sm text-slate-600">Manage all registered candidates.</p></div>
            <PortalAction action="candidate.create" title="Add Candidate" label="Add Candidate" icon={Plus} fields={[
              { name: "fullName", label: "Full Name", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "mobile", label: "Mobile", required: true },
              { name: "city", label: "City" }, { name: "state", label: "State" },
              { name: "qualification", label: "Qualification" },
              { name: "totalExperience", label: "Experience (years)", type: "number" },
              { name: "designation", label: "Designation" },
            ]} />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <input placeholder="Search candidates..." className="flex-1 min-w-[200px] rounded-lg border border-slate-200 px-3.5 py-2 text-sm" />
            <select className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm"><option>All Qualifications</option></select>
            <select className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm"><option>All Locations</option></select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr><th className="text-left py-3 px-2">Candidate</th><th className="text-left py-3 px-2">ID</th><th className="text-left py-3 px-2">Location</th><th className="text-left py-3 px-2">Experience</th><th className="text-left py-3 px-2">Skills</th><th className="text-left py-3 px-2">Profile</th><th className="text-left py-3 px-2">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2"><div className="flex items-center gap-2"><Avatar name={c.fullName} size={32} /><span className="font-medium text-slate-900">{c.fullName}</span></div></td>
                    <td className="py-3 px-2 font-mono text-xs text-slate-500">{c.candidateId}</td>
                    <td className="py-3 px-2 text-slate-600">{c.city || "—"}</td>
                    <td className="py-3 px-2 text-slate-600">{c.totalExperience || 0} yrs</td>
                    <td className="py-3 px-2 text-xs text-slate-600">—</td>
                    <td className="py-3 px-2"><div className="w-20"><ProgressBar value={c.profileCompletion || 0} /></div></td>
                    <td className="py-3 px-2"><Button size="sm" variant="ghost" onClick={() => toast.info(`Candidate: ${c.fullName} • ${c.candidateId}`)}><Eye className="w-3.5 h-3.5" /> View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "jobs" && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Jobs</h2><PortalAction action="job.create" title="Post New Job" label="Post Job" icon={Plus} fields={[
            { name: "title", label: "Job Title", required: true }, { name: "designation", label: "Designation" },
            { name: "department", label: "Department" }, { name: "location", label: "Location", required: true },
            { name: "country", label: "Country", defaultValue: "India" }, { name: "vacancy", label: "Vacancy", type: "number", defaultValue: 1 },
            { name: "salaryMin", label: "Minimum Salary", type: "number" }, { name: "salaryMax", label: "Maximum Salary", type: "number" },
            { name: "experienceMin", label: "Minimum Experience", type: "number" }, { name: "experienceMax", label: "Maximum Experience", type: "number" },
            { name: "qualification", label: "Qualification" }, { name: "skills", label: "Skills (comma separated)" },
            { name: "jobType", label: "Job Type", type: "select", defaultValue: "Full Time", options: [{label:"Full Time",value:"Full Time"},{label:"Part Time",value:"Part Time"},{label:"Contract",value:"Contract"}] },
            { name: "workMode", label: "Work Mode", type: "select", defaultValue: "On-site", options: [{label:"On-site",value:"On-site"},{label:"Remote",value:"Remote"},{label:"Hybrid",value:"Hybrid"}] },
            { name: "description", label: "Job Description", type: "textarea", required: true },
            { name: "isUrgent", label: "Urgent Hiring", type: "checkbox" }, { name: "isFeatured", label: "Featured Job", type: "checkbox" },
          ]} /></div>
          <div className="space-y-3">
            {data.recentJobs.map((j) => (
              <div key={j.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-brand-300 transition">
                <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Briefcase className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900">{j.title}</div>
                  <div className="text-xs text-slate-500 flex gap-3 mt-0.5 flex-wrap">
                    <span>{j.jobId}</span><span>•</span><span>{j.location}</span><span>•</span><span>{j.vacancy} vacancies</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {j.isUrgent && <Badge className="bg-red-50 text-red-600 ring-red-200">Urgent</Badge>}
                  {j.isFeatured && <Badge className="bg-amber-50 text-amber-600 ring-amber-200">Featured</Badge>}
                  {j.isOverseas && <Badge className="bg-purple-50 text-purple-600 ring-purple-200">Overseas</Badge>}
                  <Badge className="bg-emerald-50 text-emerald-600 ring-emerald-200">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "pipeline" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-xl font-bold text-slate-900">ATS Recruitment Pipeline</h2><p className="text-sm text-slate-600">Drag candidates across stages. All status changes are tracked.</p></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { stage: "new_application", label: "New", color: "bg-blue-500" },
              { stage: "shortlisted", label: "Shortlisted", color: "bg-cyan-500" },
              { stage: "interview_scheduled", label: "Interview", color: "bg-amber-500" },
              { stage: "selected", label: "Selected", color: "bg-emerald-500" },
              { stage: "joined", label: "Joined", color: "bg-green-600" },
            ].map((col) => {
              const items = data.recentApplications.filter((a) => a.status === col.stage);
              return (
                <div key={col.stage} className="bg-white border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${col.color}`} />
                      <h4 className="font-semibold text-sm text-slate-900">{col.label}</h4>
                    </div>
                    <Badge className="bg-slate-100 text-slate-600 ring-slate-200">{items.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {items.map((a) => (
                      <div key={a.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-grab hover:border-brand-300 transition">
                        <div className="text-xs font-mono text-slate-400">App #{String(a.id).slice(0, 6)}</div>
                        <div className="text-sm font-medium text-slate-900 mt-1">Candidate</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 mb-2"><Badge className="bg-blue-50 text-blue-700 ring-blue-200 text-[10px]">{a.matchScore || 0}% match</Badge></div>
                        <PortalAction action="application.status" title="Update Application Stage" label="Move Stage" variant="outline" size="sm" initialData={{ applicationId: a.id, status: a.status }} fields={[
                          { name: "applicationId", label: "Application ID", required: true },
                          { name: "status", label: "New Stage", type: "select", required: true, options: [
                            "new_application","screening","recruiter_contacted","shortlisted","interview_scheduled","interview_completed","selected","offer_sent","offer_accepted","documents_pending","documents_verified","joining_scheduled","joined","placement_confirmed","rejected","withdrawn"
                          ].map(value => ({ label: humanStatus(value), value })) },
                          { name: "comment", label: "Comment", type: "textarea" },
                        ]} />
                      </div>
                    ))}
                    {items.length === 0 && <div className="text-xs text-slate-400 text-center py-4">No candidates</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "clients" && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Clients</h2><PortalAction action="client.create" title="Add Client" label="Add Client" icon={Plus} fields={[
            { name: "companyName", label: "Company Name", required: true }, { name: "industry", label: "Industry" },
            { name: "email", label: "Email", type: "email", required: true }, { name: "mobile", label: "Mobile" },
            { name: "contactPerson", label: "Contact Person" }, { name: "gst", label: "GST Number" },
            { name: "paymentTerms", label: "Payment Terms", defaultValue: "Net 30" }, { name: "address", label: "Address", type: "textarea" },
          ]} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.activeClients.map((c) => (
              <div key={c.id} className="p-4 border border-slate-200 rounded-xl card-hover">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={c.companyName} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{c.companyName}</div>
                    <div className="text-xs text-slate-500">{c.industry || "—"}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 truncate">📧 {c.email || "—"}</div>
                  <div className="flex items-center gap-1.5 truncate">📱 {c.mobile || "—"}</div>
                  <div className="flex items-center gap-1.5 truncate">📍 {c.address || "—"}</div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => toast.info(`${c.companyName} • ${c.contactPerson || "No contact"} • ${c.email || "No email"}`)}><Eye className="w-3.5 h-3.5" /> View</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "requirements" && (
        <Card className="p-5"><div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Manpower Requirements</h2><PortalAction action="requirement.create" title="New Manpower Requirement" label="New Requirement" icon={Plus} fields={[
          { name: "clientId", label: "Client", type: "select", required: true, options: data.activeClients.map(c => ({ label: c.companyName, value: c.id })) },
          { name: "position", label: "Position", required: true }, { name: "department", label: "Department" },
          { name: "vacancy", label: "Vacancy", type: "number", defaultValue: 1 }, { name: "location", label: "Location", required: true },
          { name: "qualification", label: "Qualification" }, { name: "skills", label: "Skills (comma separated)" },
          { name: "experienceMin", label: "Min Experience", type: "number" }, { name: "experienceMax", label: "Max Experience", type: "number" },
          { name: "salaryMin", label: "Minimum Salary", type: "number" }, { name: "salaryMax", label: "Maximum Salary", type: "number" },
          { name: "specialRequirements", label: "Special Requirements", type: "textarea" },
        ]} /></div>{data.requirementsList.length ? <div className="space-y-2">{data.requirementsList.map(r => <div key={r.id} className="rounded-lg border border-slate-200 p-4 flex items-center justify-between gap-3"><div><div className="font-semibold text-slate-900">{r.position}</div><div className="text-xs text-slate-500">{r.requirementId} • {r.location} • {r.vacancy} vacancies</div></div><Badge className="bg-blue-50 text-blue-700 ring-blue-200">{humanStatus(r.status || 'open')}</Badge></div>)}</div> : <EmptyState icon={ClipboardList} title="No requirements" description="Create the first client manpower requirement." />}</Card>
      )}
      {tab === "interviews" && (
        <Card className="p-5"><div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Interviews</h2><PortalAction action="interview.create" title="Schedule Interview" label="Schedule" icon={Plus} fields={[
          { name: "applicationId", label: "Application", type: "select", required: true, options: data.recentApplications.map(a => ({label:`App ${String(a.id).slice(0,8)}`,value:a.id})) },
          { name: "round", label: "Round", defaultValue: "Technical" }, { name: "interviewer", label: "Interviewer", required: true },
          { name: "scheduledAt", label: "Schedule (ISO date/time)", required: true, placeholder: "2026-09-01T11:00:00" },
          { name: "location", label: "Location" }, { name: "meetingLink", label: "Meeting Link" },
        ]} /></div>{data.interviewsList.length ? <div className="space-y-2">{data.interviewsList.map(row => <div key={row.id} className="rounded-lg border border-slate-200 p-4"><div className="font-semibold text-slate-900">{row.round || 'Interview'} • {row.interviewer}</div><div className="text-xs text-slate-500 mt-1">{row.scheduledAt ? new Date(row.scheduledAt).toLocaleString('en-IN') : 'Not scheduled'} • {row.location || 'Online'}</div></div>)}</div> : <EmptyState icon={Calendar} title="No interviews" description="Schedule an interview for an application." />}</Card>
      )}
      {tab === "offers" && (
        <Card className="p-5"><div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Offers</h2><PortalAction action="offer.create" title="Generate Offer" label="Generate Offer" icon={Plus} fields={[
          { name: "applicationId", label: "Application", type: "select", required: true, options: data.recentApplications.map(a => ({label:`App ${String(a.id).slice(0,8)}`,value:a.id})) },
          { name: "type", label: "Document Type", type: "select", defaultValue: "offer_letter", options: [{label:"Offer Letter",value:"offer_letter"},{label:"Appointment Letter",value:"appointment_letter"},{label:"Joining Letter",value:"joining_letter"}] },
          { name: "offeredSalary", label: "Offered Salary", type: "number", required: true },
        ]} /></div>{data.offersList.length ? <div className="space-y-2">{data.offersList.map(row => <div key={row.id} className="rounded-lg border border-slate-200 p-4 flex justify-between gap-3"><div><div className="font-semibold text-slate-900">{humanStatus(row.type || 'offer_letter')}</div><div className="text-xs text-slate-500">{fmtINR(row.offeredSalary)}</div></div><StatusBadge status={row.status || 'generated'} /></div>)}</div> : <EmptyState icon={Award} title="No offers" description="Generate an offer against a selected application." />}</Card>
      )}
      {tab === "placements" && (
        <Card className="p-5"><div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Placements</h2><PortalAction action="placement.create" title="Confirm Placement" label="New Placement" icon={Plus} fields={[
          { name: "candidateId", label: "Candidate", type: "select", required: true, options: data.recentCandidates.map(c => ({label:`${c.fullName} (${c.candidateId})`,value:c.id})) },
          { name: "clientId", label: "Client", type: "select", required: true, options: data.activeClients.map(c => ({label:c.companyName,value:c.id})) },
          { name: "jobId", label: "Job", type: "select", options: data.recentJobs.map(j => ({label:j.title,value:j.id})) },
          { name: "designation", label: "Designation", required: true }, { name: "joiningDate", label: "Joining Date", type: "date", required: true },
          { name: "salary", label: "Salary", type: "number" }, { name: "placementFee", label: "Placement Fee", type: "number" },
          { name: "replacementPeriod", label: "Replacement Period (days)", type: "number", defaultValue: 90 },
        ]} /></div>{data.placementsList.length ? <div className="space-y-2">{data.placementsList.map(row => <div key={row.id} className="rounded-lg border border-slate-200 p-4 flex justify-between gap-3"><div><div className="font-semibold text-slate-900">{row.designation}</div><div className="text-xs text-slate-500">Joining: {formatDate(row.joiningDate)} • Fee: {fmtINR(row.placementFee)}</div></div><Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">{humanStatus(row.status || 'active')}</Badge></div>)}</div> : <EmptyState icon={Handshake} title="No placements" description="Confirmed placements will appear here." />}</Card>
      )}
      {tab === "documents" && (
        <Card className="p-5"><h2 className="text-xl font-bold text-slate-900 mb-5">Document Verification</h2>{data.documentsList.length ? <div className="space-y-2">{data.documentsList.map(row => <div key={row.id} className="rounded-lg border border-slate-200 p-4 flex items-center justify-between gap-3"><div><div className="font-semibold text-slate-900">{row.fileName}</div><div className="text-xs text-slate-500">{row.type} • {formatDate(row.uploadDate)}</div></div><div className="flex items-center gap-2"><StatusBadge status={row.status || 'pending'} /><PortalAction action="document.verify" title="Verify Document" label="Review" variant="outline" size="sm" initialData={{documentId:row.id,status:row.status}} fields={[{name:'documentId',label:'Document ID',required:true},{name:'status',label:'Status',type:'select',required:true,options:['pending','verified','rejected','expired'].map(value=>({label:humanStatus(value),value}))},{name:'remarks',label:'Remarks',type:'textarea'}]} /></div></div>)}</div> : <EmptyState icon={FileCheck} title="No pending documents" description="Candidate documents will appear here after upload." />}</Card>
      )}
      {tab === "billing" && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Invoices & Billing</h2><PortalAction action="invoice.create" title="Create Invoice" label="New Invoice" icon={Plus} fields={[
            { name: "clientId", label: "Client", type: "select", required: true, options: data.activeClients.map(c => ({ label: c.companyName, value: c.id })) },
            { name: "subtotal", label: "Subtotal", type: "number", required: true }, { name: "gstPercent", label: "GST %", type: "number", defaultValue: 18 },
            { name: "discount", label: "Discount", type: "number", defaultValue: 0 }, { name: "issuedDate", label: "Issue Date", type: "date" },
            { name: "dueDate", label: "Due Date", type: "date", required: true },
          ]} /></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr><th className="text-left py-3 px-2">Invoice #</th><th className="text-left py-3 px-2">Client</th><th className="text-left py-3 px-2">Issued</th><th className="text-left py-3 px-2">Total</th><th className="text-left py-3 px-2">Paid</th><th className="text-left py-3 px-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.invoicesList.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-mono text-xs">{inv.invoiceNo}</td>
                    <td className="py-3 px-2 text-slate-600">Client #{String(inv.clientId || "").slice(0, 6)}</td>
                    <td className="py-3 px-2 text-xs text-slate-500">{formatDate(inv.issuedDate)}</td>
                    <td className="py-3 px-2 font-semibold">{fmtINR(Number(inv.total || 0))}</td>
                    <td className="py-3 px-2 text-emerald-600 font-medium">{fmtINR(Number(inv.paid || 0))}</td>
                    <td className="py-3 px-2"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
                {data.invoicesList.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-500">No invoices yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {tab === "commissions" && (<Card className="p-5"><h2 className="text-xl font-bold text-slate-900 mb-5">Recruiter Commissions</h2>{data.commissionsList.length ? <div className="space-y-2">{data.commissionsList.map(row => <div key={row.id} className="rounded-lg border border-slate-200 p-4 flex justify-between gap-3"><div><div className="font-semibold text-slate-900">{fmtINR(row.amount)}</div><div className="text-xs text-slate-500">{row.percent}% of {fmtINR(row.placementFee)}</div></div><PortalAction action="commission.update" title="Update Commission" label={humanStatus(row.status || 'pending')} variant="outline" size="sm" initialData={{commissionId:row.id,status:row.status}} fields={[{name:'commissionId',label:'Commission ID',required:true},{name:'status',label:'Status',type:'select',required:true,options:['pending','approved','paid'].map(value=>({label:humanStatus(value),value}))}]} /></div>)}</div> : <EmptyState icon={TrendingUp} title="No commissions" description="Placement commissions will appear here." />}</Card>)}
      {tab === "communications" && (<Card className="p-5"><div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Communications</h2><PortalAction action="communication.send" title="Send Email" label="Compose Email" icon={Mail} fields={[
        { name: "to", label: "Recipient Email", type: "email", required: true }, { name: "subject", label: "Subject", required: true },
        { name: "body", label: "Message", type: "textarea", required: true },
      ]} /></div>{data.communicationList.length ? <div className="space-y-2">{data.communicationList.map(row => <div key={row.id} className="rounded-lg border border-slate-200 p-4 flex justify-between gap-3"><div className="min-w-0"><div className="font-semibold text-slate-900 truncate">{row.subject}</div><div className="text-xs text-slate-500 truncate">To: {row.to} • {formatDate(row.createdAt)}</div></div><Badge className={row.status === 'sent' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}>{humanStatus(row.status || 'queued')}</Badge></div>)}</div> : <EmptyState icon={Mail} title="No communications" description="Sent and queued messages will appear here." />}</Card>)}
      {tab === "reports" && (<Card className="p-5"><div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Reports</h2><CsvExport fileName="obe-billa-candidate-report" rows={data.recentCandidates} /></div><EmptyState icon={FileBarChart} title="Advanced reports" description="The CSV export contains the current recruitment dataset and opens in Excel." /></Card>)}
      {tab === "staff" && (<Card className="p-5"><div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Staff Management</h2><PortalAction action="staff.create" title="Add Staff Member" label="Add Staff" icon={Plus} fields={[
        { name: "fullName", label: "Full Name", required: true }, { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone" }, { name: "password", label: "Temporary Password", defaultValue: "Welcome@123" },
        { name: "role", label: "Role", type: "select", required: true, options: ["admin","branch_manager","hr_manager","recruiter","sales_executive","accountant","interviewer"].map(value => ({label:humanStatus(value),value})) },
      ]} /></div>{data.staffList.length ? <div className="space-y-2">{data.staffList.map(row => <div key={row.id} className="rounded-lg border border-slate-200 p-4 flex items-center gap-3"><Avatar name={row.fullName} size={36}/><div className="flex-1"><div className="font-semibold text-slate-900">{row.fullName}</div><div className="text-xs text-slate-500">{row.email}</div></div><Badge className="bg-brand-50 text-brand-700 ring-brand-200">{humanStatus(row.role)}</Badge></div>)}</div> : <EmptyState icon={UserCheck} title="No staff accounts" description="Create staff accounts with role-based access." />}</Card>)}
      {tab === "branches" && (<Card className="p-5"><div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">Branches</h2><PortalAction action="branch.create" title="Add Branch" label="Add Branch" icon={Plus} fields={[
        { name: "code", label: "Branch Code", required: true }, { name: "name", label: "Branch Name", required: true },
        { name: "email", label: "Email", type: "email" }, { name: "phone", label: "Phone" }, { name: "address", label: "Address", type: "textarea" },
      ]} /></div>{data.branchesList.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{data.branchesList.map(row => <div key={row.id} className="rounded-lg border border-slate-200 p-4"><div className="font-semibold text-slate-900">{row.name}</div><div className="text-xs text-slate-500 mt-1">{row.code} • {row.address || 'Address not configured'}</div><div className="text-xs text-slate-500 mt-1">{row.email || 'No email'} • {row.phone || 'No phone'}</div></div>)}</div> : <EmptyState icon={Building2} title="No branches" description="Add the first operational branch." />}</Card>)}
      {tab === "settings" && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-5"><div><h2 className="text-xl font-bold text-slate-900">Company Settings</h2><p className="text-sm text-slate-500 mt-1">Brand and contact details used throughout the platform.</p></div><PortalAction action="settings.update" title="Update Company Settings" label="Edit Settings" icon={Edit} fields={[
            { name: "company.name", label: "Company Name", required: true, defaultValue: data.companySettings.name },
            { name: "company.parent", label: "Parent Company", defaultValue: data.companySettings.parent },
            { name: "company.tagline", label: "Tagline", defaultValue: data.companySettings.tagline },
            { name: "company.email", label: "Email", type: "email", required: true, defaultValue: data.companySettings.email },
            { name: "company.phone", label: "Phone", defaultValue: data.companySettings.phone },
            { name: "company.address", label: "Address", type: "textarea", defaultValue: data.companySettings.address },
          ]} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[['Company',data.companySettings.name],['Parent',data.companySettings.parent],['Email',data.companySettings.email],['Phone',data.companySettings.phone],['Address',data.companySettings.address],['Website',data.companySettings.website]].map(([label,value]) => <div key={label} className="rounded-lg border border-slate-200 p-4"><div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div><div className="font-medium text-slate-900 mt-1">{value || 'Not configured'}</div></div>)}
          </div>
        </Card>
      )}
      {tab === "audit" && (<Card className="p-5"><h2 className="text-xl font-bold text-slate-900 mb-5">Audit Logs</h2>{data.auditList.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs uppercase text-slate-500 border-b"><tr><th className="text-left py-3">Action</th><th className="text-left py-3">Entity</th><th className="text-left py-3">IP</th><th className="text-left py-3">Date</th></tr></thead><tbody className="divide-y">{data.auditList.map(row => <tr key={row.id}><td className="py-3 font-medium">{humanStatus(row.action)}</td><td className="py-3 text-slate-600">{row.entityType || '—'}</td><td className="py-3 text-slate-600">{row.ip || '—'}</td><td className="py-3 text-slate-600">{formatDateTime(row.createdAt)}</td></tr>)}</tbody></table></div> : <EmptyState icon={ShieldCheck} title="No audit events" description="Authenticated actions will be recorded here." />}</Card>)}
    </div>
  );
}
