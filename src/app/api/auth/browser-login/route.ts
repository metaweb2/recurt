import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken, createSession, logAudit } from "@/lib/auth";

const ACCESS_TTL = 60 * 60 * 8;

function requestOrigin(req: NextRequest) {
  const browserOrigin = req.headers.get("origin");
  if (browserOrigin) {
    try {
      const parsed = new URL(browserOrigin);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.origin;
    } catch { /* fall through to proxy host */ }
  }
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host) {
    const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    return `${local ? "http" : "https"}://${host}`;
  }
  return req.nextUrl.origin;
}

function safeRedirect(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export async function POST(req: NextRequest) {
  const origin = requestOrigin(req);
  try {
    const form = await req.formData();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return NextResponse.redirect(new URL("/login?error=Please%20enter%20email%20and%20password", origin), 303);
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.redirect(new URL("/login?error=Invalid%20email%20or%20password", origin), 303);
    }
    if (!user.isActive) {
      return NextResponse.redirect(new URL("/login?error=Your%20account%20is%20disabled", origin), 303);
    }

    const session = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
    };
    const token = await signToken(session);
    await createSession(user.id, token);
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));
    await logAudit({ userId: user.id, action: "login", entityType: "user", entityId: user.id });

    const defaultTarget = user.role === "candidate" ? "/candidate" : user.role === "client" ? "/client" : "/admin";
    const target = safeRedirect(form.get("redirect"), defaultTarget);
    const response = NextResponse.redirect(new URL(target, origin), 303);
    response.cookies.set("obe_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: forwardedSecure(req),
      path: "/",
      maxAge: ACCESS_TTL,
    });
    return response;
  } catch (error) {
    console.error("Browser login failed", error);
    return NextResponse.redirect(new URL("/login?error=Login%20service%20is%20temporarily%20unavailable", origin), 303);
  }
}

function forwardedSecure(req: NextRequest) {
  const browserOrigin = req.headers.get("origin");
  if (browserOrigin) {
    try { return new URL(browserOrigin).protocol === "https:"; } catch { /* use host fallback */ }
  }
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  if (host && !host.startsWith("localhost") && !host.startsWith("127.0.0.1")) return true;
  return req.nextUrl.protocol === "https:";
}
