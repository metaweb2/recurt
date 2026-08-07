import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users, candidates, clients, jobs, manpowerRequirements, invoices, settings,
  applications, applicationStatusHistory, candidateDocuments, notifications,
  interviews, offers, placements, branches, commissions, savedJobs,
} from "@/db/schema";
import { getSession, isAdmin, isRecruiter, logAudit } from "@/lib/auth";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { sendEmail } from "@/lib/mail";

const baseSchema = z.object({ action: z.string().min(1), data: z.record(z.string(), z.any()).default({}) });
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const number = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const required = (value: unknown, label: string) => {
  const result = text(value);
  if (!result) throw new Error(`${label} is required`);
  return result;
};
const nextCode = async (table: any, column: any, prefix: string) => {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(table);
  return `${prefix}-${String(Number(count ?? 0) + 1).padStart(6, "0")}`;
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again" }, { status: 401 });

  try {
    const { action, data } = baseSchema.parse(await req.json());
    let result: unknown = null;

    switch (action) {
      case "candidate.create": {
        if (!isRecruiter(session.role)) throw new Error("Permission denied");
        const email = required(data.email, "Email").toLowerCase();
        const candidateId = await nextCode(candidates, candidates.candidateId, "OBE-CAN");
        [result] = await db.insert(candidates).values({
          candidateId,
          branchId: session.branchId,
          fullName: required(data.fullName, "Full name"),
          email,
          mobile: text(data.mobile), city: text(data.city), state: text(data.state),
          qualification: text(data.qualification), totalExperience: number(data.totalExperience),
          currentDesignation: text(data.designation), profileCompletion: 35,
        }).returning();
        break;
      }
      case "job.create": {
        if (!isRecruiter(session.role)) throw new Error("Permission denied");
        const jobId = await nextCode(jobs, jobs.jobId, "OBE-JOB");
        const skills = text(data.skills).split(",").map(v => v.trim()).filter(Boolean);
        [result] = await db.insert(jobs).values({
          jobId, branchId: session.branchId, postedBy: session.id,
          title: required(data.title, "Job title"), designation: text(data.designation),
          department: text(data.department), location: required(data.location, "Location"),
          country: text(data.country) || "India", salaryMin: String(number(data.salaryMin)),
          salaryMax: String(number(data.salaryMax)), experienceMin: number(data.experienceMin),
          experienceMax: number(data.experienceMax), vacancy: Math.max(1, number(data.vacancy, 1)),
          qualification: text(data.qualification), jobType: text(data.jobType) || "Full Time",
          workMode: text(data.workMode) || "On-site", description: text(data.description), skills,
          isUrgent: Boolean(data.isUrgent), isFeatured: Boolean(data.isFeatured), isActive: true,
        }).returning();
        break;
      }
      case "client.create": {
        if (!isAdmin(session.role) && session.role !== "sales_executive") throw new Error("Permission denied");
        [result] = await db.insert(clients).values({
          branchId: session.branchId, companyName: required(data.companyName, "Company name"),
          industry: text(data.industry), email: required(data.email, "Email").toLowerCase(),
          mobile: text(data.mobile), contactPerson: text(data.contactPerson), address: text(data.address),
          gst: text(data.gst), paymentTerms: text(data.paymentTerms) || "Net 30",
        }).returning();
        break;
      }
      case "requirement.create": {
        if (!["client", "super_admin", "admin", "branch_manager", "hr_manager", "recruiter"].includes(session.role)) throw new Error("Permission denied");
        let clientId = text(data.clientId) || null;
        if (session.role === "client") {
          const [client] = await db.select().from(clients).where(eq(clients.userId, session.id)).limit(1);
          if (!client) throw new Error("Client profile not found");
          clientId = client.id;
        }
        if (!clientId) throw new Error("Client is required");
        const requirementId = await nextCode(manpowerRequirements, manpowerRequirements.requirementId, "OBE-REQ");
        [result] = await db.insert(manpowerRequirements).values({
          requirementId, clientId, branchId: session.branchId,
          position: required(data.position, "Position"), department: text(data.department),
          vacancy: Math.max(1, number(data.vacancy, 1)), location: required(data.location, "Location"),
          qualification: text(data.qualification), skills: text(data.skills).split(",").map(v => v.trim()).filter(Boolean),
          experienceMin: number(data.experienceMin), experienceMax: number(data.experienceMax),
          salaryMin: String(number(data.salaryMin)), salaryMax: String(number(data.salaryMax)),
          shift: text(data.shift), specialRequirements: text(data.specialRequirements), status: "open",
        }).returning();
        break;
      }
      case "invoice.create": {
        if (!["super_admin", "admin", "accountant"].includes(session.role)) throw new Error("Permission denied");
        const invoiceNo = await nextCode(invoices, invoices.invoiceNo, "OBE-INV");
        const subtotal = number(data.subtotal);
        const gst = number(data.gstPercent, 18);
        const discount = number(data.discount);
        const total = subtotal + subtotal * gst / 100 - discount;
        [result] = await db.insert(invoices).values({
          invoiceNo, clientId: required(data.clientId, "Client"), branchId: session.branchId,
          issuedDate: text(data.issuedDate) || new Date().toISOString().slice(0, 10),
          dueDate: required(data.dueDate, "Due date"), subtotal: String(subtotal),
          gstPercent: String(gst), discount: String(discount), total: String(total), status: "pending",
        }).returning();
        break;
      }
      case "profile.update": {
        if (session.role !== "candidate") throw new Error("Permission denied");
        const [profile] = await db.select().from(candidates).where(eq(candidates.userId, session.id)).limit(1);
        if (!profile) throw new Error("Candidate profile not found");
        [result] = await db.update(candidates).set({
          fullName: required(data.fullName, "Full name"), mobile: text(data.mobile), whatsapp: text(data.whatsapp),
          city: text(data.city), state: text(data.state), qualification: text(data.qualification),
          totalExperience: number(data.totalExperience), currentCompany: text(data.currentCompany),
          currentDesignation: text(data.currentDesignation), preferredLocation: text(data.preferredLocation),
          preferredIndustry: text(data.preferredIndustry), profileCompletion: 90,
        }).where(eq(candidates.id, profile.id)).returning();
        break;
      }
      case "document.add": {
        if (session.role !== "candidate" && !isRecruiter(session.role)) throw new Error("Permission denied");
        let candidateId = text(data.candidateId);
        if (session.role === "candidate") {
          const [profile] = await db.select().from(candidates).where(eq(candidates.userId, session.id)).limit(1);
          if (!profile) throw new Error("Candidate profile not found");
          candidateId = profile.id;
        }
        [result] = await db.insert(candidateDocuments).values({
          candidateId, type: required(data.type, "Document type"),
          fileName: required(data.fileName, "File name"),
          fileUrl: text(data.fileUrl) || `secure://documents/${crypto.randomUUID()}`,
          status: "pending", uploadedBy: session.id,
        }).returning();
        break;
      }
      case "job.toggleSave": {
        if (session.role !== "candidate") throw new Error("Only candidates can save jobs");
        const jobId = required(data.jobId, "Job");
        const [profile] = await db.select().from(candidates).where(eq(candidates.userId, session.id)).limit(1);
        if (!profile) throw new Error("Candidate profile not found");
        const existing = await db.select().from(savedJobs).where(and(eq(savedJobs.candidateId, profile.id), eq(savedJobs.jobId, jobId))).limit(1);
        if (existing.length) {
          await db.delete(savedJobs).where(eq(savedJobs.id, existing[0].id));
          result = { saved: false };
        } else {
          await db.insert(savedJobs).values({ candidateId: profile.id, jobId });
          result = { saved: true };
        }
        break;
      }
      case "application.apply": {
        if (session.role !== "candidate") throw new Error("Only candidates can apply");
        const jobId = required(data.jobId, "Job");
        const [profile] = await db.select().from(candidates).where(eq(candidates.userId, session.id)).limit(1);
        if (!profile) throw new Error("Complete your candidate profile first");
        const existing = await db.select().from(applications).where(and(eq(applications.candidateId, profile.id), eq(applications.jobId, jobId))).limit(1);
        if (existing.length) throw new Error("You already applied for this job");
        [result] = await db.insert(applications).values({ candidateId: profile.id, jobId, status: "new_application", matchScore: 70 }).returning();
        await db.insert(applicationStatusHistory).values({ applicationId: (result as any).id, toStatus: "new_application", changedBy: session.id, comment: "Candidate applied" });
        break;
      }
      case "application.status": {
        if (!isRecruiter(session.role) && session.role !== "client") throw new Error("Permission denied");
        const applicationId = required(data.applicationId, "Application");
        const status = required(data.status, "Status") as any;
        const [old] = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
        if (!old) throw new Error("Application not found");
        [result] = await db.update(applications).set({ status, updatedAt: new Date() }).where(eq(applications.id, applicationId)).returning();
        await db.insert(applicationStatusHistory).values({ applicationId, fromStatus: old.status, toStatus: status, changedBy: session.id, comment: text(data.comment) });
        break;
      }
      case "interview.create": {
        if (!isRecruiter(session.role) && session.role !== "interviewer") throw new Error("Permission denied");
        [result] = await db.insert(interviews).values({
          applicationId: required(data.applicationId, "Application"), round: text(data.round) || "Round 1",
          interviewer: required(data.interviewer, "Interviewer"), scheduledAt: new Date(required(data.scheduledAt, "Schedule")),
          location: text(data.location), meetingLink: text(data.meetingLink),
        }).returning();
        break;
      }
      case "offer.create": {
        if (!isRecruiter(session.role)) throw new Error("Permission denied");
        [result] = await db.insert(offers).values({
          applicationId: required(data.applicationId, "Application"), type: text(data.type) || "offer_letter",
          offeredSalary: String(number(data.offeredSalary)), status: "generated",
        }).returning();
        break;
      }
      case "placement.create": {
        if (!isRecruiter(session.role)) throw new Error("Permission denied");
        [result] = await db.insert(placements).values({
          applicationId: text(data.applicationId) || null, candidateId: required(data.candidateId, "Candidate"),
          clientId: required(data.clientId, "Client"), jobId: text(data.jobId) || null,
          designation: required(data.designation, "Designation"), joiningDate: required(data.joiningDate, "Joining date"),
          salary: String(number(data.salary)), recruiterId: session.id, placementFee: String(number(data.placementFee)),
          replacementPeriod: number(data.replacementPeriod, 90), status: "active",
        }).returning();
        break;
      }
      case "branch.create": {
        if (!isAdmin(session.role)) throw new Error("Permission denied");
        [result] = await db.insert(branches).values({
          code: required(data.code, "Branch code").toUpperCase(), name: required(data.name, "Branch name"),
          address: text(data.address), phone: text(data.phone), email: text(data.email), isActive: true,
        }).returning();
        break;
      }
      case "staff.create": {
        if (!isAdmin(session.role)) throw new Error("Permission denied");
        const email = required(data.email, "Email").toLowerCase();
        const { hashPassword } = await import("@/lib/auth");
        [result] = await db.insert(users).values({
          email, passwordHash: await hashPassword(text(data.password) || "Welcome@123"),
          fullName: required(data.fullName, "Full name"), phone: text(data.phone),
          role: (text(data.role) || "recruiter") as any, branchId: text(data.branchId) || session.branchId, isActive: true,
        }).returning({ id: users.id, email: users.email, fullName: users.fullName, role: users.role });
        break;
      }
      case "document.verify": {
        if (!isRecruiter(session.role)) throw new Error("Permission denied");
        [result] = await db.update(candidateDocuments).set({
          status: required(data.status, "Status") as any, verifiedBy: session.id,
          verificationDate: new Date(), remarks: text(data.remarks),
        }).where(eq(candidateDocuments.id, required(data.documentId, "Document"))).returning();
        break;
      }
      case "commission.update": {
        if (!["super_admin", "admin", "accountant"].includes(session.role)) throw new Error("Permission denied");
        [result] = await db.update(commissions).set({ status: required(data.status, "Status") as any })
          .where(eq(commissions.id, required(data.commissionId, "Commission"))).returning();
        break;
      }
      case "settings.update": {
        if (!isAdmin(session.role)) throw new Error("Permission denied");
        const entries = Object.entries(data).filter(([, value]) => typeof value === "string");
        for (const [key, value] of entries) {
          await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
        }
        result = { updated: entries.length };
        break;
      }
      case "communication.send": {
        if (!isRecruiter(session.role)) throw new Error("Permission denied");
        const to = required(data.to, "Recipient");
        const subject = required(data.subject, "Subject");
        const body = required(data.body, "Message");
        result = await sendEmail({ to, subject, html: `<p>${body.replace(/</g, "&lt;")}</p>` });
        break;
      }
      case "notifications.readAll": {
        await db.update(notifications).set({ read: true }).where(eq(notifications.userId, session.id));
        result = { updated: true };
        break;
      }
      default: throw new Error("Unsupported action");
    }

    await logAudit({ userId: session.id, action, entityType: action.split(".")[0], newValue: data });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Operation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
