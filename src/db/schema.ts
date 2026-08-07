import {
  pgTable, text, varchar, integer, numeric, boolean, timestamp, jsonb, uuid, pgEnum, index, uniqueIndex, date,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// -------- ENUMS --------
export const roleEnum = pgEnum("role", [
  "super_admin", "admin", "branch_manager", "hr_manager", "recruiter",
  "sales_executive", "accountant", "interviewer", "client", "candidate",
]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const docStatusEnum = pgEnum("doc_status", ["pending", "verified", "rejected", "expired"]);
export const appStatusEnum = pgEnum("app_status", [
  "new_application", "screening", "recruiter_contacted", "shortlisted",
  "interview_scheduled", "interview_completed", "selected", "offer_sent",
  "offer_accepted", "documents_pending", "documents_verified",
  "joining_scheduled", "joined", "placement_confirmed", "rejected", "withdrawn",
]);
export const offerStatusEnum = pgEnum("offer_status", ["generated", "sent", "viewed", "accepted", "rejected"]);
export const payStatusEnum = pgEnum("pay_status", ["pending", "partial", "paid", "refunded"]);
export const commStatusEnum = pgEnum("comm_status", ["pending", "approved", "paid"]);
export const interviewResultEnum = pgEnum("interview_result", ["selected", "rejected", "hold", "next_round", "no_show", "rescheduled"]);
export const overseasStatusEnum = pgEnum("overseas_status", ["selected", "document_verification", "medical", "visa_processing", "visa_approved", "ticket", "travel", "joined"]);

// -------- CORE --------
export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 128 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  avatar: text("avatar"),
  role: roleEnum("role").notNull().default("candidate"),
  branchId: uuid("branch_id").references(() => branches.id),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  uniqueIndex("users_email_idx").on(t.email),
  index("users_role_idx").on(t.role),
  index("users_branch_idx").on(t.branchId),
]);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 512 }).notNull().unique(),
  device: varchar("device", { length: 256 }),
  ip: varchar("ip", { length: 64 }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [index("session_token_idx").on(t.token)]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entity_type", { length: 64 }),
  entityId: varchar("entity_id", { length: 128 }),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  ip: varchar("ip", { length: 64 }),
  device: varchar("device", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [index("audit_entity_idx").on(t.entityType, t.entityId), index("audit_user_idx").on(t.userId)]);

// -------- CANDIDATES --------
export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: varchar("candidate_id", { length: 32 }).notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id").references(() => branches.id),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  profilePhoto: text("profile_photo"),
  dob: date("dob"),
  gender: genderEnum("gender"),
  mobile: varchar("mobile", { length: 32 }),
  whatsapp: varchar("whatsapp", { length: 32 }),
  email: varchar("email", { length: 160 }),
  address: text("address"),
  city: varchar("city", { length: 80 }),
  state: varchar("state", { length: 80 }),
  country: varchar("country", { length: 80 }).default("India"),
  pincode: varchar("pincode", { length: 16 }),
  qualification: varchar("qualification", { length: 128 }),
  totalExperience: integer("total_experience"),
  currentCompany: varchar("current_company", { length: 160 }),
  currentDesignation: varchar("current_designation", { length: 160 }),
  currentSalary: numeric("current_salary", { precision: 14, scale: 2 }),
  expectedSalary: numeric("expected_salary", { precision: 14, scale: 2 }),
  noticePeriod: varchar("notice_period", { length: 64 }),
  preferredLocation: varchar("preferred_location", { length: 160 }),
  preferredIndustry: varchar("preferred_industry", { length: 160 }),
  preferredJob: varchar("preferred_job", { length: 160 }),
  languages: jsonb("languages").$type<string[]>().default([]),
  resumeUrl: text("resume_url"),
  profileCompletion: integer("profile_completion").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  uniqueIndex("cand_id_idx").on(t.candidateId),
  index("cand_email_idx").on(t.email),
  index("cand_user_idx").on(t.userId),
]);

export const candidateEducation = pgTable("candidate_education", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  degree: varchar("degree", { length: 128 }),
  institution: varchar("institution", { length: 200 }),
  year: integer("year"),
  percentage: numeric("percentage", { precision: 5, scale: 2 }),
});

export const candidateExperience = pgTable("candidate_experience", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  company: varchar("company", { length: 200 }),
  designation: varchar("designation", { length: 160 }),
  fromYear: integer("from_year"),
  toYear: integer("to_year"),
  description: text("description"),
});

export const candidateSkills = pgTable("candidate_skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  skill: varchar("skill", { length: 128 }).notNull(),
});

export const candidateDocuments = pgTable("candidate_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 64 }).notNull(),
  fileName: varchar("file_name", { length: 256 }),
  fileUrl: text("file_url").notNull(),
  status: docStatusEnum("status").default("pending"),
  uploadedBy: uuid("uploaded_by"),
  verifiedBy: uuid("verified_by"),
  uploadDate: timestamp("upload_date").defaultNow(),
  verificationDate: timestamp("verification_date"),
  expiryDate: date("expiry_date"),
  remarks: text("remarks"),
});

// -------- CLIENTS --------
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id").references(() => branches.id),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  logo: text("logo"),
  industry: varchar("industry", { length: 128 }),
  website: varchar("website", { length: 200 }),
  gst: varchar("gst", { length: 32 }),
  regNumber: varchar("reg_number", { length: 64 }),
  address: text("address"),
  contactPerson: varchar("contact_person", { length: 160 }),
  contactDesignation: varchar("contact_designation", { length: 128 }),
  mobile: varchar("mobile", { length: 32 }),
  email: varchar("email", { length: 160 }),
  agreement: text("agreement"),
  paymentTerms: text("payment_terms"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [index("client_email_idx").on(t.email)]);

// -------- JOBS --------
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: varchar("job_id", { length: 32 }).notNull().unique(),
  branchId: uuid("branch_id").references(() => branches.id),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  requirementId: varchar("requirement_id", { length: 32 }),
  title: varchar("title", { length: 200 }).notNull(),
  department: varchar("department", { length: 128 }),
  designation: varchar("designation", { length: 128 }),
  location: varchar("location", { length: 160 }),
  country: varchar("country", { length: 80 }).default("India"),
  state: varchar("state", { length: 80 }),
  city: varchar("city", { length: 80 }),
  salaryMin: numeric("salary_min", { precision: 14, scale: 2 }),
  salaryMax: numeric("salary_max", { precision: 14, scale: 2 }),
  salaryType: varchar("salary_type", { length: 32 }).default("Monthly"),
  experienceMin: integer("experience_min").default(0),
  experienceMax: integer("experience_max"),
  vacancy: integer("vacancy").default(1),
  qualification: varchar("qualification", { length: 128 }),
  jobType: varchar("job_type", { length: 32 }).default("Full Time"),
  employmentType: varchar("employment_type", { length: 32 }),
  workMode: varchar("work_mode", { length: 32 }),
  shift: varchar("shift", { length: 64 }),
  benefits: text("benefits"),
  accommodation: text("accommodation"),
  food: text("food"),
  transportation: text("transportation"),
  description: text("description"),
  responsibilities: text("responsibilities"),
  requirements: text("requirements"),
  skills: jsonb("skills").$type<string[]>().default([]),
  applicationDeadline: date("application_deadline"),
  isFeatured: boolean("is_featured").default(false),
  isUrgent: boolean("is_urgent").default(false),
  isOverseas: boolean("is_overseas").default(false),
  isActive: boolean("is_active").default(true),
  postedBy: uuid("posted_by"),
  postedAt: timestamp("posted_at").defaultNow(),
}, (t) => [
  uniqueIndex("job_id_idx").on(t.jobId),
  index("job_client_idx").on(t.clientId),
  index("job_active_idx").on(t.isActive),
]);

export const jobSkills = pgTable("job_skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  skill: varchar("skill", { length: 128 }).notNull(),
});

export const manpowerRequirements = pgTable("manpower_requirements", {
  id: uuid("id").primaryKey().defaultRandom(),
  requirementId: varchar("requirement_id", { length: 32 }).notNull().unique(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id").references(() => branches.id),
  position: varchar("position", { length: 160 }),
  department: varchar("department", { length: 128 }),
  vacancy: integer("vacancy").default(1),
  salaryMin: numeric("salary_min", { precision: 14, scale: 2 }),
  salaryMax: numeric("salary_max", { precision: 14, scale: 2 }),
  experienceMin: integer("experience_min"),
  experienceMax: integer("experience_max"),
  qualification: varchar("qualification", { length: 128 }),
  skills: jsonb("skills").$type<string[]>().default([]),
  location: varchar("location", { length: 160 }),
  gender: genderEnum("gender"),
  ageMax: integer("age_max"),
  shift: varchar("shift", { length: 64 }),
  joiningDate: date("joining_date"),
  benefits: text("benefits"),
  specialRequirements: text("special_requirements"),
  status: varchar("status", { length: 32 }).default("open"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [uniqueIndex("req_id_idx").on(t.requirementId)]);

// -------- APPLICATIONS / ATS PIPELINE --------
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  requirementId: uuid("requirement_id").references(() => manpowerRequirements.id),
  recruiterId: uuid("recruiter_id").references(() => users.id),
  status: appStatusEnum("status").default("new_application"),
  matchScore: integer("match_score").default(0),
  notes: text("notes"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("app_candidate_idx").on(t.candidateId),
  index("app_job_idx").on(t.jobId),
  index("app_status_idx").on(t.status),
]);

export const savedJobs = pgTable("saved_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }).notNull(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [uniqueIndex("saved_job_candidate_job_idx").on(t.candidateId, t.jobId)]);

export const applicationStatusHistory = pgTable("application_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  fromStatus: appStatusEnum("from_status"),
  toStatus: appStatusEnum("to_status").notNull(),
  changedBy: uuid("changed_by"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------- INTERVIEWS --------
export const interviews = pgTable("interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  round: varchar("round", { length: 64 }),
  interviewer: varchar("interviewer", { length: 160 }),
  scheduledAt: timestamp("scheduled_at"),
  location: varchar("location", { length: 200 }),
  meetingLink: text("meeting_link"),
  result: interviewResultEnum("result"),
  score: integer("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------- OFFERS & PLACEMENTS --------
export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 64 }).default("offer_letter"),
  documentUrl: text("document_url"),
  offeredSalary: numeric("offered_salary", { precision: 14, scale: 2 }),
  status: offerStatusEnum("status").default("generated"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const placements = pgTable("placements", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id),
  candidateId: uuid("candidate_id").references(() => candidates.id),
  clientId: uuid("client_id").references(() => clients.id),
  jobId: uuid("job_id").references(() => jobs.id),
  designation: varchar("designation", { length: 128 }),
  joiningDate: date("joining_date"),
  salary: numeric("salary", { precision: 14, scale: 2 }),
  recruiterId: uuid("recruiter_id").references(() => users.id),
  placementFee: numeric("placement_fee", { precision: 14, scale: 2 }),
  replacementPeriod: integer("replacement_period"),
  status: varchar("status", { length: 32 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const replacementCases = pgTable("replacement_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  placementId: uuid("placement_id").references(() => placements.id),
  reason: text("reason"),
  replacementCandidateId: uuid("replacement_candidate_id").references(() => candidates.id),
  status: varchar("status", { length: 32 }).default("requested"),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------- FINANCE --------
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNo: varchar("invoice_no", { length: 64 }).notNull().unique(),
  clientId: uuid("client_id").references(() => clients.id),
  placementId: uuid("placement_id").references(() => placements.id),
  branchId: uuid("branch_id").references(() => branches.id),
  issuedDate: date("issued_date"),
  dueDate: date("due_date"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0"),
  gstPercent: numeric("gst_percent", { precision: 5, scale: 2 }).default("18"),
  discount: numeric("discount", { precision: 14, scale: 2 }).default("0"),
  total: numeric("total", { precision: 14, scale: 2 }).default("0"),
  paid: numeric("paid", { precision: 14, scale: 2 }).default("0"),
  status: payStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 256 }),
  qty: integer("qty").default(1),
  rate: numeric("rate", { precision: 14, scale: 2 }),
  amount: numeric("amount", { precision: 14, scale: 2 }),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  amount: numeric("amount", { precision: 14, scale: 2 }),
  method: varchar("method", { length: 32 }),
  reference: varchar("reference", { length: 128 }),
  paidAt: timestamp("paid_at").defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  placementId: uuid("placement_id").references(() => placements.id),
  recruiterId: uuid("recruiter_id").references(() => users.id),
  placementFee: numeric("placement_fee", { precision: 14, scale: 2 }),
  percent: numeric("percent", { precision: 5, scale: 2 }),
  amount: numeric("amount", { precision: 14, scale: 2 }),
  status: commStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------- COMMUNICATIONS --------
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  title: varchar("title", { length: 200 }),
  message: text("message"),
  type: varchar("type", { length: 64 }),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [index("notif_user_idx").on(t.userId)]);

export const emailLogs = pgTable("email_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  to: varchar("to", { length: 200 }),
  subject: varchar("subject", { length: 256 }),
  body: text("body"),
  status: varchar("status", { length: 32 }),
  provider: varchar("provider", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const whatsappLogs = pgTable("whatsapp_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  to: varchar("to", { length: 32 }),
  body: text("body"),
  status: varchar("status", { length: 32 }),
  provider: varchar("provider", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------- SETTINGS & MASTER --------
export const settings = pgTable("settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const masterData = pgTable("master_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: varchar("category", { length: 64 }).notNull(),
  code: varchar("code", { length: 64 }),
  label: varchar("label", { length: 128 }).notNull(),
  isActive: boolean("is_active").default(true),
}, (t) => [index("master_cat_idx").on(t.category)]);

// -------- RELATIONS --------
export const usersRelations = relations(users, ({ one }) => ({
  branch: one(branches, { fields: [users.branchId], references: [branches.id] }),
}));
export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  user: one(users, { fields: [candidates.userId], references: [users.id] }),
  branch: one(branches, { fields: [candidates.branchId], references: [branches.id] }),
  education: many(candidateEducation),
  experience: many(candidateExperience),
  skills: many(candidateSkills),
  documents: many(candidateDocuments),
}));
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(clients, { fields: [jobs.clientId], references: [clients.id] }),
  skills: many(jobSkills),
}));
export const applicationsRelations = relations(applications, ({ one, many }) => ({
  candidate: one(candidates, { fields: [applications.candidateId], references: [candidates.id] }),
  job: one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
  recruiter: one(users, { fields: [applications.recruiterId], references: [users.id] }),
  history: many(applicationStatusHistory),
  interviews: many(interviews),
  offers: many(offers),
}));
