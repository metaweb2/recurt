import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmtINR = (n: number | string | null | undefined) => {
  const v = Number(n ?? 0);
  if (!isFinite(v)) return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
};

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((s: string) => s[0]?.toUpperCase() ?? "").join("") || "?";

export const formatDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateTime = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const timeAgo = (d: string | Date) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  const s = Math.floor((Date.now() - dt.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const statusColor = (s: string) => {
  const map: Record<string, string> = {
    new_application: "bg-blue-100 text-blue-700 ring-blue-200",
    screening: "bg-indigo-100 text-indigo-700 ring-indigo-200",
    recruiter_contacted: "bg-purple-100 text-purple-700 ring-purple-200",
    shortlisted: "bg-cyan-100 text-cyan-700 ring-cyan-200",
    interview_scheduled: "bg-amber-100 text-amber-700 ring-amber-200",
    interview_completed: "bg-orange-100 text-orange-700 ring-orange-200",
    selected: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    offer_sent: "bg-teal-100 text-teal-700 ring-teal-200",
    offer_accepted: "bg-green-100 text-green-700 ring-green-200",
    documents_pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
    documents_verified: "bg-lime-100 text-lime-700 ring-lime-200",
    joining_scheduled: "bg-pink-100 text-pink-700 ring-pink-200",
    joined: "bg-green-200 text-green-800 ring-green-300",
    placement_confirmed: "bg-emerald-200 text-emerald-800 ring-emerald-300",
    rejected: "bg-red-100 text-red-700 ring-red-200",
    withdrawn: "bg-gray-100 text-gray-600 ring-gray-200",
    pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
    verified: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    expired: "bg-gray-100 text-gray-600 ring-gray-200",
    paid: "bg-green-100 text-green-700 ring-green-200",
    approved: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    active: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    open: "bg-blue-100 text-blue-700 ring-blue-200",
    closed: "bg-gray-100 text-gray-600 ring-gray-200",
  };
  return map[s] ?? "bg-slate-100 text-slate-700 ring-slate-200";
};

export const humanStatus = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const generateId = (prefix: string, n: number) => `${prefix}-${String(n).padStart(6, "0")}`;
