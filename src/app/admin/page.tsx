import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";
import { db } from "@/db";
import { candidates, clients, jobs, applications, placements, invoices, commissions, interviews, offers, branches, manpowerRequirements, users, candidateDocuments, auditLogs, emailLogs } from "@/db/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard-client";
import {
  LayoutDashboard, Users, Briefcase, FileText, Building2, ClipboardList, Handshake, Calendar,
  Award, FileCheck, DollarSign, UserCheck, Mail, Bell, Settings, ShieldCheck, FileBarChart,
  Globe, TrendingUp,
} from "@/components/ui";
import AdminTabs from "@/components/admin-tabs";
import { getCompanySettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!isAdmin(user.role) && user.role !== "recruiter") redirect("/login");

  const [
    [candCount], [jobCount], [clientCount], [appCount], [placementCount],
    [interviewCount], [offerCount], [invoiceCount],
    recentApplications, recentCandidates, recentJobs, activeClients, pipelineStats, invoicesList,
    applicationTrend, placementTrend, categoryStats, revenueTrend,
    requirementsList, interviewsList, offersList, placementsList, documentsList,
    commissionsList, branchesList, staffList, auditList, communicationList,
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(candidates),
    db.select({ c: sql<number>`count(*)` }).from(jobs).where(eq(jobs.isActive, true)),
    db.select({ c: sql<number>`count(*)` }).from(clients).where(eq(clients.isActive, true)),
    db.select({ c: sql<number>`count(*)` }).from(applications),
    db.select({ c: sql<number>`count(*)` }).from(placements),
    db.select({ c: sql<number>`count(*)` }).from(interviews),
    db.select({ c: sql<number>`count(*)` }).from(offers),
    db.select({ c: sql<number>`count(*)` }).from(invoices),
    db.select().from(applications).orderBy(desc(applications.appliedAt)).limit(10),
    db.select().from(candidates).orderBy(desc(candidates.createdAt)).limit(5),
    db.select().from(jobs).orderBy(desc(jobs.postedAt)).limit(5),
    db.select().from(clients).where(eq(clients.isActive, true)).limit(5),
    db.select({ status: applications.status, c: sql<number>`count(*)` }).from(applications).groupBy(applications.status),
    db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(10),
    db.select({ month: sql<string>`to_char(date_trunc('month', ${applications.appliedAt}), 'Mon YYYY')`, value: sql<number>`count(*)`, sort: sql<Date>`date_trunc('month', ${applications.appliedAt})` }).from(applications).groupBy(sql`date_trunc('month', ${applications.appliedAt})`).orderBy(sql`date_trunc('month', ${applications.appliedAt})`).limit(12),
    db.select({ month: sql<string>`to_char(date_trunc('month', ${placements.createdAt}), 'Mon YYYY')`, value: sql<number>`count(*)`, sort: sql<Date>`date_trunc('month', ${placements.createdAt})` }).from(placements).groupBy(sql`date_trunc('month', ${placements.createdAt})`).orderBy(sql`date_trunc('month', ${placements.createdAt})`).limit(12),
    db.select({ name: sql<string>`coalesce(${jobs.department}, 'Other')`, value: sql<number>`count(*)` }).from(jobs).where(eq(jobs.isActive, true)).groupBy(jobs.department).orderBy(sql`count(*) desc`).limit(8),
    db.select({ month: sql<string>`to_char(date_trunc('month', ${invoices.createdAt}), 'Mon YYYY')`, value: sql<number>`coalesce(sum(${invoices.total}), 0)`, sort: sql<Date>`date_trunc('month', ${invoices.createdAt})` }).from(invoices).groupBy(sql`date_trunc('month', ${invoices.createdAt})`).orderBy(sql`date_trunc('month', ${invoices.createdAt})`).limit(12),
    db.select().from(manpowerRequirements).orderBy(desc(manpowerRequirements.createdAt)).limit(50),
    db.select().from(interviews).orderBy(desc(interviews.scheduledAt)).limit(50),
    db.select().from(offers).orderBy(desc(offers.createdAt)).limit(50),
    db.select().from(placements).orderBy(desc(placements.createdAt)).limit(50),
    db.select().from(candidateDocuments).orderBy(desc(candidateDocuments.uploadDate)).limit(50),
    db.select().from(commissions).orderBy(desc(commissions.createdAt)).limit(50),
    db.select().from(branches).orderBy(branches.name),
    db.select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, role: users.role, isActive: users.isActive, createdAt: users.createdAt }).from(users).where(sql`${users.role} not in ('candidate','client')`).orderBy(desc(users.createdAt)).limit(100),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100),
    db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(100),
  ]);

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, group: "" },
    { href: "/admin?tab=candidates", label: "Candidates", icon: Users, group: "Recruitment" },
    { href: "/admin?tab=jobs", label: "Jobs", icon: Briefcase, group: "Recruitment" },
    { href: "/admin?tab=pipeline", label: "ATS Pipeline", icon: FileText, group: "Recruitment" },
    { href: "/admin?tab=clients", label: "Clients", icon: Building2, group: "Recruitment" },
    { href: "/admin?tab=requirements", label: "Requirements", icon: ClipboardList, group: "Recruitment" },
    { href: "/admin?tab=interviews", label: "Interviews", icon: Calendar, group: "Engagement" },
    { href: "/admin?tab=offers", label: "Offers", icon: Award, group: "Engagement" },
    { href: "/admin?tab=placements", label: "Placements", icon: Handshake, group: "Engagement" },
    { href: "/admin?tab=documents", label: "Documents", icon: FileCheck, group: "Engagement" },
    { href: "/admin?tab=billing", label: "Billing", icon: DollarSign, group: "Finance" },
    { href: "/admin?tab=commissions", label: "Commissions", icon: TrendingUp, group: "Finance" },
    { href: "/admin?tab=communications", label: "Communications", icon: Mail, group: "System" },
    { href: "/admin?tab=reports", label: "Reports", icon: FileBarChart, group: "System" },
    { href: "/admin?tab=staff", label: "Staff", icon: UserCheck, group: "System" },
    { href: "/admin?tab=branches", label: "Branches", icon: Globe, group: "System" },
    { href: "/admin?tab=settings", label: "Settings", icon: Settings, group: "System" },
    { href: "/admin?tab=audit", label: "Audit Logs", icon: ShieldCheck, group: "System" },
  ];
  const bottomNav = [
    { href: "/admin", label: "Home", icon: LayoutDashboard },
    { href: "/admin?tab=pipeline", label: "Pipeline", icon: FileText },
    { href: "/admin?tab=candidates", label: "Candidates", icon: Users },
    { href: "/admin?tab=billing", label: "Billing", icon: DollarSign },
    { href: "/admin?tab=settings", label: "Settings", icon: Settings },
  ];

  const companySettings = await getCompanySettings();
  const data = {
    counts: {
      candidates: Number(candCount?.c ?? 0),
      jobs: Number(jobCount?.c ?? 0),
      clients: Number(clientCount?.c ?? 0),
      applications: Number(appCount?.c ?? 0),
      placements: Number(placementCount?.c ?? 0),
      interviews: Number(interviewCount?.c ?? 0),
      offers: Number(offerCount?.c ?? 0),
      invoices: Number(invoiceCount?.c ?? 0),
    },
    recentApplications, recentCandidates, recentJobs, activeClients, pipelineStats, invoicesList,
    applicationTrend, placementTrend, categoryStats, revenueTrend, companySettings,
    requirementsList, interviewsList, offersList, placementsList, documentsList,
    commissionsList, branchesList, staffList, auditList, communicationList,
  };

  return (
    <DashboardClient user={user} title="Admin Console" nav={nav} bottomNav={bottomNav}>
      <AdminTabs data={data} />
    </DashboardClient>
  );
}
