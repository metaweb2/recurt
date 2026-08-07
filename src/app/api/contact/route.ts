import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

function origin(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return req.nextUrl.origin;
  return `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
}

export async function POST(req: NextRequest) {
  const base = origin(req);
  try {
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const subject = String(form.get("subject") || "Website enquiry").trim();
    const message = String(form.get("message") || "").trim();
    if (!name || !email || !message) throw new Error("Required fields are missing");
    const result = await sendEmail({
      to: process.env.CONTACT_EMAIL || "contact@obebilla.com",
      subject: `[Website] ${subject}`,
      html: `<h3>New enquiry from ${name}</h3><p>Email: ${email}</p><p>Phone: ${phone}</p><p>${message.replace(/</g, "&lt;")}</p>`,
    });
    return NextResponse.redirect(new URL(`/contact?sent=${result.ok ? "1" : "queued"}`, base), 303);
  } catch {
    return NextResponse.redirect(new URL("/contact?error=Please%20complete%20all%20required%20fields", base), 303);
  }
}
