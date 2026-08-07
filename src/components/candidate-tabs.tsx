"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Badge, StatusBadge, EmptyState, toast, Briefcase, Calendar, FileCheck, Bell, FileText, UserCircle, LayoutDashboard, CheckCircle2, Award } from "@/components/ui";
import { PortalAction } from "@/components/portal-actions";

export default function CandidateTabs({ candidate, applications, documents, interviews, savedJobs }: { candidate: any; applications: any[]; documents: any[]; interviews: any[]; savedJobs: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = (nextTab: string) => router.push(nextTab === "overview" ? "/candidate" : `/candidate?tab=${nextTab}`);
  const profileFields = [
    { name: "fullName", label: "Full Name", required: true }, { name: "mobile", label: "Mobile" },
    { name: "whatsapp", label: "WhatsApp" }, { name: "city", label: "City" }, { name: "state", label: "State" },
    { name: "qualification", label: "Qualification" }, { name: "totalExperience", label: "Experience (years)", type: "number" as const },
    { name: "currentCompany", label: "Current Company" }, { name: "currentDesignation", label: "Current Designation" },
    { name: "preferredLocation", label: "Preferred Location" }, { name: "preferredIndustry", label: "Preferred Industry" },
  ];
  const profileInitial = {
    fullName: candidate.fullName, mobile: candidate.mobile || "", whatsapp: candidate.whatsapp || "", city: candidate.city || "",
    state: candidate.state || "", qualification: candidate.qualification || "", totalExperience: candidate.totalExperience || 0,
    currentCompany: candidate.currentCompany || "", currentDesignation: candidate.currentDesignation || "",
    preferredLocation: candidate.preferredLocation || "", preferredIndustry: candidate.preferredIndustry || "",
  };

  const stats = [
    { label: "Applications", value: applications.length, icon: FileText, color: "brand" as const },
    { label: "Shortlisted", value: applications.filter((a: any) => a.status === "shortlisted").length, icon: CheckCircle2, color: "emerald" as const },
    { label: "Interviews", value: applications.filter((a: any) => String(a.status).includes("interview")).length, icon: Calendar, color: "amber" as const },
    { label: "Profile", value: `${candidate.profileCompletion || 0}%`, icon: Award, color: "purple" as const },
  ];

  return (
    <div className="animate-fade-up">
      {tab === "overview" && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, {candidate.fullName.split(" ")[0]}</h2>
            <p className="text-slate-600 mt-1">Here's your recruitment dashboard.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {stats.map((s) => (
              <Card key={s.label} className="p-4 md:p-5 card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1.5 truncate">{s.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    s.color === "brand" ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white" :
                    s.color === "emerald" ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white" :
                    s.color === "amber" ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white" :
                    "bg-gradient-to-br from-purple-500 to-purple-700 text-white"
                  }`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-5">
              <h3 className="font-bold text-slate-900 mb-4">Recent Applications</h3>
              {applications.length === 0 ? (
                <EmptyState icon={FileText} title="No applications yet" description="Start applying to jobs to track them here." action={<Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>} />
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app: any) => (
                    <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0"><Briefcase className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate">{app.jobTitle}</div>
                        <div className="text-xs text-slate-500">{app.companyName} • {app.jobLocation}</div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                  {applications.length > 5 && (
                    <button onClick={() => setTab("applications")} className="text-sm text-brand-600 font-semibold mt-2">View all applications →</button>
                  )}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-slate-900 mb-4">Profile Completion</h3>
              <div className="text-center py-4">
                <div className="relative inline-flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-100" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-brand-600" strokeDasharray={`${(candidate.profileCompletion || 0) * 3.52} 352`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-2xl font-bold text-slate-900">{candidate.profileCompletion || 0}%</div>
                </div>
                <p className="text-sm text-slate-600 mt-3">Complete your profile to get matched with more jobs.</p>
                <Button className="w-full mt-4" onClick={() => setTab("profile")}>Update Profile</Button>
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "profile" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-5">My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label><input className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50" value={candidate.fullName} readOnly /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label><input className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50" value={candidate.email || ""} readOnly /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Mobile</label><input className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50" value={candidate.mobile || ""} readOnly /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Location</label><input className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50" value={`${candidate.city || ""}, ${candidate.state || ""}`} readOnly /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Qualification</label><input className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50" value={candidate.qualification || ""} readOnly /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Experience</label><input className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50" value={`${candidate.totalExperience || 0} years`} readOnly /></div>
          </div>
          <div className="mt-5"><PortalAction action="profile.update" title="Edit Candidate Profile" label="Edit Profile" fields={profileFields} initialData={profileInitial} /></div>
        </Card>
      )}

      {tab === "applications" && (
        <Card className="p-5">
          <h2 className="text-xl font-bold text-slate-900 mb-5">My Applications</h2>
          {applications.length === 0 ? (
            <EmptyState icon={FileText} title="No applications" description="Start applying to jobs." action={<Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 uppercase border-b border-slate-200">
                  <tr><th className="text-left py-3 px-2">Job</th><th className="text-left py-3 px-2">Company</th><th className="text-left py-3 px-2">Match</th><th className="text-left py-3 px-2">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium text-slate-900">{app.jobTitle}</td>
                      <td className="py-3 px-2 text-slate-600">{app.companyName}</td>
                      <td className="py-3 px-2"><Badge className="bg-blue-50 text-blue-700 ring-blue-200">{app.matchScore}%</Badge></td>
                      <td className="py-3 px-2"><StatusBadge status={app.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "documents" && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-xl font-bold text-slate-900">My Documents</h2><PortalAction action="document.add" title="Add Document" label="Add Document" fields={[
            { name: "type", label: "Document Type", type: "select", required: true, options: ["Resume","Aadhaar","PAN","Passport","Driving Licence","Education Certificate","Experience Certificate","Salary Slip","Address Proof","Photograph","Other"].map(value => ({label:value,value})) },
            { name: "fileName", label: "File Name", required: true }, { name: "fileUrl", label: "Secure File URL" },
          ]} /></div>
          {documents.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{documents.map(document => <div key={document.id} className="rounded-xl border border-slate-200 p-4 flex items-center gap-3"><FileCheck className="w-6 h-6 text-brand-600" /><div className="flex-1 min-w-0"><div className="text-sm font-semibold text-slate-900 truncate">{document.fileName}</div><div className="text-xs text-slate-500">{document.type}</div></div><StatusBadge status={document.status || "pending"} /></div>)}</div> : <EmptyState icon={FileCheck} title="No documents uploaded" description="Add your resume and verification documents." />}
        </Card>
      )}

      {tab === "interviews" && (
        <Card className="p-5">
          <h2 className="text-xl font-bold text-slate-900 mb-5">Interviews</h2>
          {interviews.length ? <div className="space-y-3">{interviews.map(interview => <div key={interview.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{interview.jobTitle || "Job Interview"}</h3><p className="text-sm text-slate-600 mt-1">{interview.round} • {interview.interviewer}</p><p className="text-xs text-slate-500 mt-1">{interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString("en-IN") : "Schedule pending"} • {interview.location || "Online"}</p></div>{interview.result && <StatusBadge status={interview.result} />}</div>{interview.meetingLink && <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="inline-flex mt-3 text-sm font-semibold text-brand-600">Open meeting link →</a>}</div>)}</div> : <EmptyState icon={Calendar} title="No interviews scheduled" description="Scheduled interviews will appear here from the database." />}
        </Card>
      )}

      {tab === "saved" && (
        <Card className="p-5">
          <h2 className="text-xl font-bold text-slate-900 mb-5">Saved Jobs</h2>
          {savedJobs.length ? <div className="space-y-3">{savedJobs.map(job => <button key={job.id} onClick={() => router.push(`/jobs/${job.jobId}`)} className="w-full text-left rounded-xl border border-slate-200 p-4 hover:border-brand-300"><div className="font-semibold text-slate-900">{job.title}</div><div className="text-xs text-slate-500 mt-1">{job.location || "Location not specified"} • {job.jobType || "Job"}</div></button>)}</div> : <EmptyState icon={Briefcase} title="No saved jobs" description="Save jobs to review them later." action={<Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>} />}
        </Card>
      )}
    </div>
  );
}
