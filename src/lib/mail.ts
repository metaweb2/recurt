/**
 * Mail / Notification abstraction.
 *
 * The actual API integration is configurable via environment variables.
 * Once the provider credentials are set, calls to sendEmail / sendWhatsApp
 * will dispatch to the configured API. Until then they log to email_logs /
 * whatsapp_logs so the UI can show realistic history.
 *
 * Env:
 *   MAIL_PROVIDER       = "smtp" | "sendgrid" | "resend" | "log"
 *   MAIL_API_KEY        = provider API key
 *   MAIL_FROM           = sender address
 *   MAIL_API_URL        = optional override
 *   WHATSAPP_PROVIDER   = "twilio" | "meta" | "log"
 *   WHATSAPP_API_KEY    = provider API key
 *   WHATSAPP_API_URL    = optional override
 */
import { db } from "@/db";
import { emailLogs, whatsappLogs } from "@/db/schema";

type SendResult = { ok: boolean; provider: string; messageId?: string; error?: string };

async function postJson(url: string, apiKey: string, body: unknown) {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!r.ok) throw new Error(json?.error?.message ?? text ?? `HTTP ${r.status}`);
  return json;
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  templateKey?: string;
}): Promise<SendResult> {
  const provider = (process.env.MAIL_PROVIDER || "log").toLowerCase();
  const apiKey = process.env.MAIL_API_KEY || "";
  const from = process.env.MAIL_FROM || "no-reply@obebilla.com";
  const apiUrl = process.env.MAIL_API_URL || "";
  const toArr = Array.isArray(opts.to) ? opts.to : [opts.to];

  let result: SendResult = { ok: true, provider };

  try {
    if (provider === "sendgrid" && apiKey && apiUrl) {
      const res = await postJson(apiUrl, apiKey, {
        personalizations: [{ to: toArr.map((e) => ({ email: e })) }],
        from: { email: from },
        subject: opts.subject,
        content: [
          { type: "text/html", value: opts.html },
          ...(opts.text ? [{ type: "text/plain", value: opts.text }] : []),
        ],
      });
      result.messageId = res?.["message-id"] || res?.id;
    } else if (provider === "resend" && apiKey) {
      const res = await postJson("https://api.resend.com/emails", apiKey, {
        from, to: toArr, subject: opts.subject, html: opts.html, text: opts.text,
      });
      result.messageId = res?.id;
    } else {
      // log mode
      result.provider = "log";
    }
  } catch (e: unknown) {
    result = { ok: false, provider, error: (e as Error).message };
  }

  await db.insert(emailLogs).values({
    to: toArr.join(", "),
    subject: opts.subject,
    body: opts.html,
    status: result.ok ? "sent" : "failed",
    provider: result.provider,
  });

  return result;
}

export async function sendWhatsApp(opts: {
  to: string;
  body: string;
  templateKey?: string;
}): Promise<SendResult> {
  const provider = (process.env.WHATSAPP_PROVIDER || "log").toLowerCase();
  const apiKey = process.env.WHATSAPP_API_KEY || "";
  const apiUrl = process.env.WHATSAPP_API_URL || "";

  let result: SendResult = { ok: true, provider };
  try {
    if ((provider === "twilio" || provider === "meta") && apiKey && apiUrl) {
      await postJson(apiUrl, apiKey, { to: opts.to, body: opts.body });
    } else {
      result.provider = "log";
    }
  } catch (e: unknown) {
    result = { ok: false, provider, error: (e as Error).message };
  }
  await db.insert(whatsappLogs).values({
    to: opts.to, body: opts.body, status: result.ok ? "sent" : "failed", provider: result.provider,
  });
  return result;
}

// Notification templates (editable via settings later).
export const templates = {
  registration: (name: string) => ({
    subject: "Welcome to OBE Billa International",
    html: `<p>Hi ${name}, welcome aboard! Your account has been created successfully.</p>`,
  }),
  application: (name: string, job: string) => ({
    subject: `Application received for ${job}`,
    html: `<p>Hi ${name}, your application for <b>${job}</b> has been received.</p>`,
  }),
  shortlist: (name: string, job: string) => ({
    subject: `You are shortlisted for ${job}`,
    html: `<p>Hi ${name}, great news — you are shortlisted for <b>${job}</b>.</p>`,
  }),
  interview: (name: string, when: string) => ({
    subject: `Interview scheduled — ${when}`,
    html: `<p>Hi ${name}, your interview is scheduled for <b>${when}</b>.</p>`,
  }),
  offer: (name: string) => ({
    subject: "Your offer letter is ready",
    html: `<p>Hi ${name}, please login to review and accept your offer letter.</p>`,
  }),
  joining: (name: string, when: string) => ({
    subject: `Joining confirmation — ${when}`,
    html: `<p>Hi ${name}, welcome! Your joining is confirmed on <b>${when}</b>.</p>`,
  }),
  documentReminder: (name: string) => ({
    subject: "Pending documents",
    html: `<p>Hi ${name}, please upload your pending documents at the earliest.</p>`,
  }),
  paymentReminder: (company: string, invNo: string) => ({
    subject: `Invoice ${invNo} - Payment Reminder`,
    html: `<p>Dear ${company}, invoice <b>${invNo}</b> is due. Kindly arrange payment.</p>`,
  }),
};
