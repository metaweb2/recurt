import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { clients, manpowerRequirements, applications, jobs, placements, interviews, candidates, invoices } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard-client";
import { LayoutDashboard, Briefcase, FileText, UserCheck, Calendar, DollarSign, Settings, Bell } from "@/components/ui";
import ClientTabs from "@/components/client-tabs";

export const dynamic = "force-dynamic";

export default async function ClientDashboard() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "client") redirect("/admin");

  const [client] = await db.select().from(clients).where(eq(clients.userId, user.id)).limit(1);
  if (!client) redirect("/login");

  const [reqs] = await Promise.all([
    db.select().from(manpowerRequirements).where(eq(manpowerRequirements.clientId, client.id)),
  ]);

  const candsReceived = await db
    .select({ count: sql<number>`count(*)` })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(jobs.clientId, client.id));

  const [placed, statusCounts, interviewRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(placements).where(eq(placements.clientId, client.id)),
    db.select({ status: applications.status, count: sql<number>`count(*)` }).from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id)).where(eq(jobs.clientId, client.id)).groupBy(applications.status),
    db.select({ count: sql<number>`count(*)` }).from(interviews)
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .innerJoin(jobs, eq(applications.jobId, jobs.id)).where(eq(jobs.clientId, client.id)),
  ]);
  const countStatus = (statuses: string[]) => statusCounts.filter(row => row.status && statuses.includes(row.status)).reduce((sum, row) => sum + Number(row.count), 0);
  const [candidateList, interviewList, invoiceList, placementList] = await Promise.all([
    db.select({ applicationId: applications.id, status: applications.status, matchScore: applications.matchScore, candidateName: candidates.fullName, candidateCode: candidates.candidateId, jobTitle: jobs.title })
      .from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id)).innerJoin(candidates, eq(applications.candidateId, candidates.id)).where(eq(jobs.clientId, client.id)),
    db.select({ id: interviews.id, round: interviews.round, interviewer: interviews.interviewer, scheduledAt: interviews.scheduledAt, result: interviews.result, jobTitle: jobs.title })
      .from(interviews).innerJoin(applications, eq(interviews.applicationId, applications.id)).innerJoin(jobs, eq(applications.jobId, jobs.id)).where(eq(jobs.clientId, client.id)),
    db.select().from(invoices).where(eq(invoices.clientId, client.id)).orderBy(invoices.createdAt),
    db.select().from(placements).where(eq(placements.clientId, client.id)).orderBy(placements.createdAt),
  ]);

  const nav = [
    { href: "/client", label: "Dashboard", icon: LayoutDashboard },
    { href: "/client?tab=requirements", label: "Requirements", icon: FileText },
    { href: "/client?tab=candidates", label: "Candidates", icon: Briefcase },
    { href: "/client?tab=interviews", label: "Interviews", icon: Calendar },
    { href: "/client?tab=joined", label: "Joined", icon: UserCheck },
    { href: "/client?tab=billing", label: "Billing", icon: DollarSign },
  ];
  const bottomNav = [
    { href: "/client", label: "Home", icon: LayoutDashboard },
    { href: "/client?tab=requirements", label: "Reqs", icon: FileText },
    { href: "/client?tab=candidates", label: "Cands", icon: Briefcase },
    { href: "/client?tab=interviews", label: "Interview", icon: Calendar },
    { href: "/client?tab=billing", label: "Billing", icon: DollarSign },
  ];

  return (
    <DashboardClient user={user} title="Client Portal" nav={nav} bottomNav={bottomNav}>
      <ClientTabs
        client={client}
        requirements={reqs}
        candidates={candidateList}
        interviews={interviewList}
        invoices={invoiceList}
        placements={placementList}
        stats={{
          candidatesReceived: Number(candsReceived[0]?.count ?? 0),
          shortlisted: countStatus(["shortlisted"]),
          interviews: Number(interviewRows[0]?.count ?? 0),
          selected: countStatus(["selected", "offer_sent", "offer_accepted", "documents_pending", "documents_verified", "joining_scheduled"]),
          placements: Number(placed[0]?.count ?? 0),
        }}
      />
    </DashboardClient>
  );
}
