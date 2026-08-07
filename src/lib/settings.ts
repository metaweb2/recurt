import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

export type CompanySettings = {
  name: string; parent: string; tagline: string; email: string; phone: string;
  address: string; website: string; linkedin: string; facebook: string;
};

export const getCompanySettings = cache(async (): Promise<CompanySettings> => {
  const rows = await db.select().from(settings).where(eq(settings.key, "company.name"))
    .union(db.select().from(settings).where(eq(settings.key, "company.parent")))
    .union(db.select().from(settings).where(eq(settings.key, "company.tagline")))
    .union(db.select().from(settings).where(eq(settings.key, "company.email")))
    .union(db.select().from(settings).where(eq(settings.key, "company.phone")))
    .union(db.select().from(settings).where(eq(settings.key, "company.address")))
    .union(db.select().from(settings).where(eq(settings.key, "company.website")))
    .union(db.select().from(settings).where(eq(settings.key, "company.linkedin")))
    .union(db.select().from(settings).where(eq(settings.key, "company.facebook")));
  const m: Record<string, string> = {};
  for (const r of rows) m[r.key] = (r.value as string) || "";
  return {
    name: m["company.name"] || "OBE BILLA INTERNATIONAL",
    parent: m["company.parent"] || "Azaadi Global Services Pvt. Ltd.",
    tagline: m["company.tagline"] || "Connecting Talent to Opportunity — Globally",
    email: m["company.email"] || "contact@obebilla.com",
    phone: m["company.phone"] || "+91 33 4000 0001",
    address: m["company.address"] || "Kolkata, India",
    website: m["company.website"] || "https://obebilla.com",
    linkedin: m["company.linkedin"] || "",
    facebook: m["company.facebook"] || "",
  };
});
