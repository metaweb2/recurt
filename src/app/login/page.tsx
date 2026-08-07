import Link from "next/link";
import { Logo } from "@/components/ui";
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { db } from "@/db";
import { candidates, jobs, clients, placements } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string; error?: string }> }) {
  const params = await searchParams;
  const redirect = typeof params.redirect === "string" ? params.redirect : "";
  const error = typeof params.error === "string" ? params.error : "";
  const [[candidateCount], [jobCount], [clientCount], [placementCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(candidates),
    db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(clients).where(eq(clients.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(placements),
  ]);
  const stats = [
    { label: "Registered Candidates", value: Number(candidateCount?.count ?? 0).toLocaleString("en-IN") },
    { label: "Active Jobs", value: Number(jobCount?.count ?? 0).toLocaleString("en-IN") },
    { label: "Active Clients", value: Number(clientCount?.count ?? 0).toLocaleString("en-IN") },
    { label: "Confirmed Placements", value: Number(placementCount?.count ?? 0).toLocaleString("en-IN") },
  ];

  return <div className="min-h-screen grid lg:grid-cols-2">
    <div className="hidden lg:flex brand-gradient text-white p-12 flex-col justify-between relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="relative"><Logo className="[&_div:last-child_div:first-child]:text-white [&_div:last-child_div:last-child]:text-amber-300" /></div>
      <div className="relative"><h1 className="text-4xl font-bold leading-tight">Welcome to <span className="text-amber-400">OBE BILLA</span></h1>
        <p className="mt-4 text-slate-200 text-lg">Secure access to recruitment, staffing and applicant tracking operations.</p>
        <div className="mt-8 grid grid-cols-2 gap-3">{stats.map(stat => <div key={stat.label} className="bg-white/10 border border-white/20 rounded-xl p-4"><div className="text-2xl font-bold text-amber-300">{stat.value}</div><div className="text-xs text-slate-300 mt-1 uppercase tracking-wider">{stat.label}</div></div>)}</div>
      </div>
      <div className="relative text-xs text-slate-400">© Azaadi Global Services Pvt. Ltd.</div>
    </div>
    <div className="flex items-center justify-center p-6 md:p-12 bg-slate-50"><div className="w-full max-w-md">
      <div className="lg:hidden mb-6"><Logo /></div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Sign in to your account</h2>
      <p className="text-sm text-slate-500 mt-1">Candidate or employer? <Link href="/register" className="text-brand-600 font-semibold">Create an account</Link></p>
      {error && <div role="alert" className="mt-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{error}</span></div>}
      <form action="/api/auth/browser-login" method="POST" className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={redirect} />
        <div><label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1.5">Email address *</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="email" name="email" autoComplete="email" type="email" required className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm" /></div></div>
        <div><label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1.5">Password *</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="password" name="password" autoComplete="current-password" type="password" required className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm" /></div></div>
        <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">Sign In <ArrowRight className="w-4 h-4" /></button>
      </form>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4"><div className="flex gap-3"><ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" /><div><h3 className="text-sm font-semibold text-slate-900">Authorized access only</h3><p className="text-xs text-slate-500 mt-1">Staff accounts are created by administrators. Candidate and employer accounts can be registered online.</p></div></div></div>
    </div></div>
  </div>;
}
