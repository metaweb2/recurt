import { PublicHeader, PublicFooter, Logo } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getCompanySettings } from "@/lib/settings";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const session = await getSession();
  const params = await searchParams;
  const s = await getCompanySettings();
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader session={session} />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Get in touch</h1>
          <p className="text-slate-600 mt-3">Have a query about a job or want to hire manpower? We're here to help.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {[
              { icon: MapPin, label: "Visit Us", value: s.address },
              { icon: Phone, label: "Call Us", value: s.phone },
              { icon: Mail, label: "Email Us", value: s.email },
              { icon: Clock, label: "Working Hours", value: "Mon - Sat, 10:00 AM - 7:00 PM" },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-5 card-hover">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0"><c.icon className="w-5 h-5" /></div>
                  <div><div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.label}</div><div className="font-semibold text-slate-900 mt-0.5">{c.value}</div></div>
                </div>
              </div>
            ))}
          </div>

          <form action="/api/contact" method="POST" className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Send a message</h2>
            {params.sent && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Thank you. Your message has been received and logged successfully.</div>}
            {params.error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name *</label><input name="name" required className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></div>
              <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Email *</label><input name="email" required type="email" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></div>
              <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Phone</label><input name="phone" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></div>
              <div><label className="block text-xs font-medium text-slate-700 mb-1.5">Subject</label><input name="subject" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></div>
              <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-700 mb-1.5">Message *</label><textarea name="message" required rows={5} className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></div>
            </div>
            <button type="submit" className="mt-5 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2">Send Message <Send className="w-4 h-4" /></button>
          </form>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
