import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "OBE BILLA INTERNATIONAL | Manpower Recruitment & ATS by Azaadi Global Services",
    template: "%s | OBE BILLA INTERNATIONAL",
  },
  description:
    "OBE BILLA INTERNATIONAL — a complete recruitment, job consultancy, staffing & applicant tracking platform by Azaadi Global Services Pvt. Ltd. Find jobs, hire manpower, manage overseas recruitment and end-to-end staffing.",
  keywords: ["recruitment", "job consultancy", "ATS", "staffing", "manpower", "overseas recruitment", "OBE BILLA", "Azaadi Global"],
  authors: [{ name: "Azaadi Global Services Pvt. Ltd." }],
  openGraph: { title: "OBE BILLA INTERNATIONAL", description: "Connecting Talent to Opportunity — Globally", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5, themeColor: "#1e3a8a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="OBE BILLA" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
