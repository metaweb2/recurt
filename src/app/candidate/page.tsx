import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { candidates, applications, jobs, clients, candidateDocuments, interviews, savedJobs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard-client";
import { LayoutDashboard, FileText, UserCircle, FileCheck, Briefcase, Calendar, Bell } from "@/components/ui";
import CandidateTabs from "@/components/candidate-tabs";

export const dynamic = "force-dynamic";

export default async function CandidateDashboard() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "candidate") redirect("/admin");

  const [cand] = await db.select().from(candidates).where(eq(candidates.userId, user.id)).limit(1);
  if (!cand) redirect("/login");

  const apps = await db
    .select({
      id: applications.id,
      status: applications.status,
      matchScore: applications.matchScore,
      appliedAt: applications.appliedAt,
      jobTitle: jobs.title,
      jobLocation: jobs.location,
      companyName: clients.companyName,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .leftJoin(clients, eq(jobs.clientId, clients.id))
    .where(eq(applications.candidateId, cand.id));

  const [documents, interviewList, savedJobList] = await Promise.all([
    db.select().from(candidateDocuments).where(eq(candidateDocuments.candidateId, cand.id)).orderBy(candidateDocuments.uploadDate),
    db.select({ id: interviews.id, round: interviews.round, interviewer: interviews.interviewer, scheduledAt: interviews.scheduledAt, location: interviews.location, meetingLink: interviews.meetingLink, result: interviews.result, jobTitle: jobs.title })
      .from(interviews).innerJoin(applications, eq(interviews.applicationId, applications.id))
      .leftJoin(jobs, eq(applications.jobId, jobs.id)).where(eq(applications.candidateId, cand.id)),
    db.select({ id: savedJobs.id, jobId: jobs.id, title: jobs.title, location: jobs.location, jobType: jobs.jobType, savedAt: savedJobs.createdAt })
      .from(savedJobs).innerJoin(jobs, eq(savedJobs.jobId, jobs.id)).where(eq(savedJobs.candidateId, cand.id)),
  ]);

  const nav = [
    { href: "/candidate", label: "Dashboard", icon: LayoutDashboard },
    { href: "/candidate?tab=profile", label: "My Profile", icon: UserCircle },
    { href: "/candidate?tab=applications", label: "Applications", icon: FileText },
    { href: "/candidate?tab=documents", label: "Documents", icon: FileCheck },
    { href: "/candidate?tab=saved", label: "Saved Jobs", icon: Briefcase },
    { href: "/candidate?tab=interviews", label: "Interviews", icon: Calendar },
  ];
  const bottomNav = [
    { href: "/candidate", label: "Home", icon: LayoutDashboard },
    { href: "/candidate?tab=applications", label: "Jobs", icon: FileText },
    { href: "/candidate?tab=profile", label: "Profile", icon: UserCircle },
    { href: "/candidate?tab=documents", label: "Docs", icon: FileCheck },
    { href: "/candidate?tab=interviews", label: "Alerts", icon: Bell },
  ];

  return (
    <DashboardClient user={user} title="Candidate Portal" nav={nav} bottomNav={bottomNav}>
      <CandidateTabs candidate={cand} applications={apps} documents={documents} interviews={interviewList} savedJobs={savedJobList} />
    </DashboardClient>
  );
}
