import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, sessions, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "obe-billa-dev-secret-change-in-prod-min-32-chars");
const ISSUER = "obe-billa";
const ACCESS_TTL = 60 * 60 * 8; // 8h
const COOKIE = "obe_session";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  branchId: string | null;
};

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function signToken(user: SessionUser) {
  return new SignJWT({ sub: user.id, email: user.email, name: user.fullName, role: user.role, branchId: user.branchId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(`${ACCESS_TTL}s`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: ISSUER });
    if (!payload.sub) return null;
    return {
      id: payload.sub as string,
      email: (payload.email as string) ?? "",
      fullName: (payload.name as string) ?? "",
      role: (payload.role as string) ?? "candidate",
      branchId: (payload.branchId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, token: string) {
  const hs = await headers();
  const device = hs.get("user-agent") ?? "unknown";
  const ip = hs.get("x-forwarded-for") ?? hs.get("x-real-ip") ?? "unknown";
  const expiresAt = new Date(Date.now() + ACCESS_TTL * 1000);
  try {
    await db.insert(sessions).values({ userId, token, device, ip, expiresAt });
  } catch (e) {
    // If DB is not reachable (dev fallback), ignore session persistence
    // but allow authentication flow to continue using JWT cookie.
    // eslint-disable-next-line no-console
    const msg = (e as any)?.message ?? String(e);
    console.warn("createSession: failed to persist session, continuing without DB:", msg);
  }
}

export async function setSessionCookie(token: string) {
  const cs = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  cs.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: ACCESS_TTL,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cs = await cookies();
  const token = cs.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth() {
  const s = await getSession();
  if (!s) throw new Error("Unauthorized");
  return s;
}

export async function clearSession() {
  const cs = await cookies();
  cs.delete(COOKIE);
}

export async function logAudit(opts: {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  const hs = await headers();
  const ip = hs.get("x-forwarded-for") ?? hs.get("x-real-ip") ?? "";
  const device = hs.get("user-agent") ?? "";
  await db.insert(auditLogs).values({
    userId: opts.userId ?? null,
    action: opts.action,
    entityType: opts.entityType,
    entityId: opts.entityId,
    oldValue: (opts.oldValue as never) ?? undefined,
    newValue: (opts.newValue as never) ?? undefined,
    ip,
    device,
  });
}

export function isAdmin(role: string) {
  return ["super_admin", "admin", "branch_manager", "hr_manager"].includes(role);
}
export function isRecruiter(role: string) {
  return ["recruiter", "hr_manager", "admin", "super_admin"].includes(role);
}

// Unused import guard for 'users' and 'eq' if ever needed
export { users, eq };
