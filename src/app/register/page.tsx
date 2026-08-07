"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Button, Input } from "@/components/ui";
import { useAuth } from "@/components/ui";
import { UserCircle, Building2, Mail, Lock, Phone, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [type, setType] = useState<"candidate" | "client">("candidate");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", companyName: "" });
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast.success(`Welcome, ${data.user.fullName || data.user.email}!`);
      const target = data.user.role === "candidate" ? "/candidate" : "/client";
      window.location.href = target;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex brand-gradient text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight">Join <span className="text-amber-400">OBE BILLA</span> today</h1>
          <p className="mt-4 text-slate-200 text-lg">Create your account in under a minute. Find jobs or hire manpower — all on one platform.</p>
          <div className="mt-8 space-y-3">
            {[
              "Create a professional profile & resume",
              "Apply to published jobs instantly",
              "Track applications & interviews live",
              "Get matched to roles by AI",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-slate-200">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">✓</div>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-slate-400">© Azaadi Global Services Pvt. Ltd.</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6"><Logo /></div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Create your account</h2>
          <p className="text-sm text-slate-500 mt-1">Already registered? <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in</Link></p>

          <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
            <button onClick={() => setType("candidate")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${type === "candidate" ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"}`}>
              <UserCircle className="w-4 h-4" /> Candidate
            </button>
            <button onClick={() => setType("client")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${type === "client" ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"}`}>
              <Building2 className="w-4 h-4" /> Employer
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {type === "client" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Company Name *</label>
                <Input required value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Acme Pvt. Ltd." />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name *</label>
              <Input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder={type === "candidate" ? "Rahul Kumar" : "Rajiv Menon"} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email *</label>
              <Input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone</label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98xxxxxxxx" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Password *</label>
              <Input type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 6 characters" />
            </div>

            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input type="checkbox" required className="mt-0.5 rounded" />
              <span>I agree to the <a href="/terms" className="text-brand-600 font-medium">Terms</a> and <a href="/privacy" className="text-brand-600 font-medium">Privacy Policy</a>.</span>
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
