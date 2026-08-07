import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, candidates, clients } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { hashPassword, signToken, setSessionCookie, createSession, logAudit } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  type: z.enum(["candidate", "client"]),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existing.length > 0) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const passwordHash = await hashPassword(data.password);
    const [user] = await db.insert(users).values({
      email: data.email, passwordHash, fullName: data.fullName, phone: data.phone, role: data.type,
    }).returning();

    if (data.type === "candidate") {
      const countRes = await db.select({ c: sql<number>`count(*)` }).from(candidates);
      const n = (countRes[0]?.c ?? 0) + 1;
      await db.insert(candidates).values({
        candidateId: `OBE-CAN-${String(n).padStart(6, "0")}`,
        userId: user.id, fullName: data.fullName, email: data.email, mobile: data.phone,
      });
    } else if (data.type === "client" && data.companyName) {
      await db.insert(clients).values({
        userId: user.id, companyName: data.companyName, email: data.email, mobile: data.phone, contactPerson: data.fullName,
      });
    }

    const session = { id: user.id, email: user.email, fullName: user.fullName, role: user.role, branchId: null };
    const token = await signToken(session);
    await createSession(user.id, token);
    await setSessionCookie(token);
    await logAudit({ userId: user.id, action: "register", entityType: "user", entityId: user.id });
    return NextResponse.json({ user: session }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Registration failed" }, { status: 400 });
  }
}
