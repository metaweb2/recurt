"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Briefcase, Building2, Users, LayoutDashboard, FileText, UserCircle, Bell, Settings, Search,
  Menu, X, LogOut, Home, FileCheck, Mail, ChevronDown, Calendar, Handshake, DollarSign,
  FileBarChart, ShieldCheck, Globe, Award, UserCheck, ClipboardList, GraduationCap, MapPin,
  IndianRupee, TrendingUp, CheckCircle2, Clock, AlertCircle, ArrowRight, Sparkles,
  Phone, Pin, Link2, Share2, Globe2, Send, Plus, Eye, Download, Edit, Trash2,
} from "lucide-react";
import { cn, statusColor, humanStatus, fmtINR, formatDate, timeAgo, initials } from "@/lib/utils";

// ============ AUTH CLIENT ============
export type SessionUser = { id: string; email: string; fullName: string; role: string; branchId: string | null } | null;

let cachedSession: SessionUser = undefined as unknown as SessionUser;
let sessionPromise: Promise<SessionUser> | null = null;
const listeners = new Set<(u: SessionUser) => void>();

export async function fetchSession(): Promise<SessionUser> {
  if (cachedSession !== undefined) return cachedSession;
  if (!sessionPromise) {
    sessionPromise = fetch("/api/auth/session").then(r => r.json()).then(d => {
      cachedSession = d.user ?? null;
      listeners.forEach(l => l(cachedSession));
      return cachedSession;
    }).catch(() => { cachedSession = null; return null; });
  }
  return sessionPromise;
}

export async function refreshSession(): Promise<SessionUser> {
  sessionPromise = null;
  cachedSession = undefined as unknown as SessionUser;
  return fetchSession();
}

export function useSession() {
  const [user, setUser] = useState<SessionUser>(undefined as unknown as SessionUser);
  useEffect(() => {
    fetchSession().then(setUser);
    const l = (u: SessionUser) => setUser(u);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return user;
}

export function useAuth() {
  const user = useSession();
  const router = useRouter();
  const login = useCallback(async (email: string, password: string) => {
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Login failed");
    await refreshSession();
    return data.user;
  }, []);
  const register = useCallback(async (payload: Record<string, string>) => {
    const r = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Registration failed");
    await refreshSession();
    return data.user;
  }, []);
  const logout = useCallback(async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    await refreshSession();
    router.push("/");
  }, [router]);
  return { user, login, register, logout };
}

// ============ UI PRIMITIVES ============
export function Button({ className, variant = "primary", size = "md", ...props }: any) {
  const variants: Record<string, string> = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-sm",
    accent: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
    ghost: "hover:bg-slate-100 text-slate-700",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };
  return (
    <button className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
      variants[variant], sizes[size], className,
    )} {...props} />
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={cn(statusColor(status))}>{humanStatus(status)}</Badge>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("premium-card rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.055)]", className)}>{children}</div>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100", props.className)} />;
}
export function Select(props: any) {
  return <select {...props} className={cn("w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100", props.className)} />;
}
export function Textarea(props: any) {
  return <textarea {...props} className={cn("w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100", props.className)} />;
}
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <label className={cn("block text-xs font-medium text-slate-700 mb-1.5", className)}>{children}</label>;
}
export function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return <div><Label>{label}{required && <span className="text-red-500"> *</span>}</Label>{children}</div>;
}

export function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover" />;
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.4 }} className="rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold">
      {initials(name)}
    </div>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-md">
          <svg viewBox="0 0 32 32" className="w-6 h-6"><path d="M8 24 L16 6 L24 24 M11.5 18 H20.5" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white" />
      </div>
      <div className="leading-tight">
        <div className="font-bold text-slate-900 text-[15px] tracking-tight">OBE BILLA</div>
        <div className="text-[10px] text-slate-500 font-medium tracking-wide">INTERNATIONAL</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const p = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all" style={{ width: `${p}%` }} />
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, change, color = "brand" }: { icon: any; label: string; value: string | number; change?: string; color?: "brand" | "amber" | "emerald" | "red" | "purple" | "cyan" }) {
  const colors: Record<string, string> = {
    brand: "from-brand-500 to-brand-700 text-white",
    amber: "from-amber-500 to-amber-600 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    red: "from-red-500 to-red-600 text-white",
    purple: "from-purple-500 to-purple-700 text-white",
    cyan: "from-cyan-500 to-cyan-600 text-white",
  };
  return (
    <Card className="p-4 md:p-5 card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1.5 truncate">{value}</p>
          {change && <p className="text-xs text-emerald-600 font-medium mt-1">{change}</p>}
        </div>
        <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

// ============ PUBLIC SITE ============
export function PublicHeader({ session }: { session: SessionUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/jobs", label: "Jobs" },
    { href: "/services", label: "Services" },
    { href: "/overseas", label: "Overseas" },
    { href: "/employers", label: "Employers" },
    { href: "/contact", label: "Contact" },
  ];
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0"><Logo /></Link>
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={cn("px-3.5 py-2 rounded-lg text-sm font-medium transition",
                pathname === l.href ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <Link href={session.role === "candidate" ? "/candidate" : session.role === "client" ? "/client" : "/admin"}>
              <Button size="sm"><UserCircle className="w-4 h-4" /> Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/register"><Button variant="accent" size="sm">Register</Button></Link>
            </>
          )}
        </div>
        <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white animate-fade-up">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={cn("block px-3 py-2.5 rounded-lg text-sm font-medium",
                  pathname === l.href ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50")}>
                {l.label}
              </Link>
            ))}
            <div className="pt-2 flex gap-2">
              {session ? (
                <Link href={session.role === "candidate" ? "/candidate" : session.role === "client" ? "/client" : "/admin"}
                  className="flex-1"><Button size="sm" className="w-full">Dashboard</Button></Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full">Sign In</Button></Link>
                  <Link href="/register" className="flex-1"><Button variant="accent" size="sm" className="w-full">Register</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-brand-800 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-6 h-6"><path d="M8 24 L16 6 L24 24 M11.5 18 H20.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </div>
            <div>
              <div className="font-bold text-white text-lg">OBE BILLA</div>
              <div className="text-[10px] text-amber-400 tracking-wide">INTERNATIONAL</div>
            </div>
          </div>
          <p className="text-sm text-slate-400">A complete recruitment, consultancy & staffing platform by Azaadi Global Services Pvt. Ltd.</p>
          <div className="flex gap-2 mt-4">
            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"><Link2 className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"><Share2 className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"><Globe2 className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"><Send className="w-4 h-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">For Candidates</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/jobs" className="hover:text-white">Browse Jobs</Link></li>
            <li><Link href="/register?type=candidate" className="hover:text-white">Register</Link></li>
            <li><Link href="/overseas" className="hover:text-white">Overseas Jobs</Link></li>
            <li><Link href="/career" className="hover:text-white">Career Guidance</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">For Employers</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/employers" className="hover:text-white">Hire Manpower</Link></li>
            <li><Link href="/services" className="hover:text-white">Our Services</Link></li>
            <li><Link href="/services#staffing" className="hover:text-white">Staffing Solutions</Link></li>
            <li><Link href="/register?type=client" className="hover:text-white">Post Requirement</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" /> Salt Lake, Kolkata, India</li>
            <li className="flex gap-2"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" /> +91 33 4000 0001</li>
            <li className="flex gap-2"><Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" /> contact@obebilla.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} OBE BILLA INTERNATIONAL. By Azaadi Global Services Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============ MOBILE BOTTOM NAV ============
export function MobileBottomNav({ items, active }: { items: { href: string; label: string; icon: any }[]; active: string }) {
  const router = useRouter();
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg safe-area-inset-bottom">
      <div className="grid grid-cols-5 gap-1 px-2 py-1.5">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = active === item.href;
          return (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={cn("flex flex-col items-center justify-center py-1.5 rounded-lg transition",
                isActive ? "text-brand-600" : "text-slate-500")}>
              <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ DASHBOARD SHELL ============
export function DashboardShell({
  user, title, nav, onLogout, children, bottomNav,
}: {
  user: SessionUser; title: string;
  nav: { href: string; label: string; icon: any; group?: string }[];
  onLogout: () => void; children: ReactNode;
  bottomNav: { href: string; label: string; icon: any }[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");
  const currentHref = activeTab ? `${pathname}?tab=${activeTab}` : pathname;
  const isActiveHref = (href: string) => href === currentHref;
  const [open, setOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const router = useRouter();
  const submitGlobalSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (globalQuery.trim()) router.push(`/jobs?q=${encodeURIComponent(globalQuery.trim())}`);
  };
  const readNotifications = async () => {
    const response = await fetch("/api/portal/actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "notifications.readAll", data: {} }) });
    if (response.ok) toast.success("All notifications marked as read");
    else toast.error("Could not update notifications");
  };
  const groups = Array.from(new Set(nav.map(n => n.group || "")));
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="h-14 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <Logo />
            <div className="hidden md:block h-8 w-px bg-slate-200 mx-2" />
            <h1 className="hidden md:block text-sm font-semibold text-slate-700">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <form onSubmit={submitGlobalSearch} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input value={globalQuery} onChange={e => setGlobalQuery(e.target.value)} placeholder="Search jobs..." className="bg-transparent outline-none text-sm w-56" />
            </form>
            <button type="button" onClick={readNotifications} title="Mark notifications as read" className="relative p-2 rounded-lg hover:bg-slate-100"><Bell className="w-5 h-5 text-slate-600" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" /></button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Avatar name={user?.fullName || ""} size={32} />
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">{user?.fullName}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{humanStatus(user?.role || "")}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="p-3 space-y-1">
            {groups.map((g) => (
              <div key={g || "_main"} className="pt-2 first:pt-0">
                {g && <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{g}</div>}
                {nav.filter(n => (n.group || "") === g).map((item) => {
                  const Icon = item.icon;
                  const active = isActiveHref(item.href);
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                        active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50")}>
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
            <div className="pt-3 mt-3 border-t border-slate-100">
              <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* Sidebar (mobile drawer) */}
        {open && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="relative w-72 bg-white h-full overflow-y-auto animate-fade-up">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <Logo />
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
              </div>
              <nav className="p-3 space-y-1">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveHref(item.href);
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                        active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50")}>
                      <Icon className="w-4 h-4" />{item.label}
                    </Link>
                  );
                })}
                <button onClick={() => { setOpen(false); onLogout(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      <MobileBottomNav items={bottomNav} active={currentHref} />
    </div>
  );
}

// Re-exports for convenience
export {
  Briefcase, Building2, Users, LayoutDashboard, FileText, UserCircle, Bell, Settings, Search,
  Home, FileCheck, Mail, Calendar, Handshake, DollarSign, FileBarChart, ShieldCheck, Globe,
  Award, UserCheck, ClipboardList, GraduationCap, MapPin, IndianRupee, TrendingUp,
  CheckCircle2, Clock, AlertCircle, ArrowRight, Sparkles, Phone, Plus, Eye, Download, Edit, Trash2,
};
export { Link };
export { toast };
