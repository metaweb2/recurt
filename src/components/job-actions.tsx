"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function JobActions({ jobId, signedIn, candidate }: { jobId: string; signedIn: boolean; candidate: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const apply = async () => {
    if (!signedIn) return router.push(`/login?redirect=/jobs/${jobId}`);
    if (!candidate) return toast.error("Please sign in with a candidate account to apply");
    setLoading(true);
    try {
      const response = await fetch("/api/portal/actions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "application.apply", data: { jobId } }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not apply");
      toast.success("Application submitted successfully");
      router.push("/candidate?tab=applications");
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not apply"); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!signedIn) return router.push(`/login?redirect=/jobs/${jobId}`);
    if (!candidate) return toast.error("Please sign in with a candidate account");
    const response = await fetch("/api/portal/actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "job.toggleSave", data: { jobId } }) });
    const payload = await response.json();
    if (!response.ok) return toast.error(payload.error || "Could not save job");
    setSaved(Boolean(payload.result?.saved));
    toast.success(payload.result?.saved ? "Job saved" : "Job removed from saved jobs");
    router.refresh();
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: "OBE BILLA Job", url });
      else { await navigator.clipboard.writeText(url); toast.success("Job link copied"); }
    } catch { /* user cancelled native share */ }
  };

  return (
    <>
      <button type="button" onClick={apply} disabled={loading} className="block w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-center py-3 rounded-lg font-semibold shadow-md mb-2">
        {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Applying...</span> : "Apply Now"}
      </button>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button type="button" onClick={save} className="py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-1.5"><Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />{saved ? "Saved" : "Save"}</button>
        <button type="button" onClick={share} className="py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-1.5"><Share2 className="w-4 h-4" />Share</button>
      </div>
    </>
  );
}
