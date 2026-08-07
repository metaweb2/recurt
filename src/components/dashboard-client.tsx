"use client";
import { useRouter } from "next/navigation";
import { DashboardShell, type SessionUser } from "@/components/ui";
import type { ReactNode } from "react";

export function DashboardClient({
  user, title, nav, bottomNav, children,
}: {
  user: SessionUser; title: string;
  nav: { href: string; label: string; icon: any; group?: string }[];
  bottomNav: { href: string; label: string; icon: any }[];
  children: ReactNode;
}) {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };
  return (
    <DashboardShell user={user} title={title} nav={nav} onLogout={handleLogout} bottomNav={bottomNav}>
      {children}
    </DashboardShell>
  );
}
