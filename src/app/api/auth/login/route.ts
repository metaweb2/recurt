import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, candidates, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signToken, setSessionCookie, createSession, logAudit } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    // Dev/admin fallback: if ADMIN_EMAIL and ADMIN_PASSWORD set in env, allow login without DB
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (ADMIN_EMAIL && ADMIN_PASSWORD && email === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const userId = process.env.ADMIN_ID ?? "00000000-0000-4000-8000-000000000000";
      const session = { id: userId, email: ADMIN_EMAIL, fullName: process.env.ADMIN_NAME ?? "Admin", role: process.env.ADMIN_ROLE ?? "admin", branchId: null };
      const token = await signToken(session);
      await createSession(userId, token);
      await setSessionCookie(token);
      try { await logAudit({ userId, action: "login (admin-fallback)" }); } catch {};
      return NextResponse.json({ user: session });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const valid = await (await import("bcryptjs")).compare(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (!user.isActive) return NextResponse.json({ error: "Account disabled" }, { status: 403 });

    const session = {
      id: user.id, email: user.email, fullName: user.fullName,
      role: user.role, branchId: user.branchId,
    };
    const token = await signToken(session);
    await createSession(user.id, token);
    await setSessionCookie(token);
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));
    await logAudit({ userId: user.id, action: "login" });
    return NextResponse.json({ user: session });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Login failed" }, { status: 400 });
  }
}
