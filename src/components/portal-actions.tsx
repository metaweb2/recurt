"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Download, CheckCircle2 } from "lucide-react";
import { Button, Input, Textarea, Select, toast } from "@/components/ui";

export type ActionField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean;
};

export function PortalAction({
  action, title, label, fields, variant = "primary", size = "md", icon: Icon,
  initialData = {}, onSuccess,
}: {
  action: string; title: string; label: string; fields: ActionField[];
  variant?: string; size?: string; icon?: any; initialData?: Record<string, unknown>;
  onSuccess?: (result: any) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const defaults = useMemo(() => Object.fromEntries(fields.map(f => [f.name, initialData[f.name] ?? f.defaultValue ?? (f.type === "checkbox" ? false : "")])), [fields, initialData]);
  const [form, setForm] = useState<Record<string, any>>(defaults);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/portal/actions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, data: form }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Operation failed");
      toast.success(`${title} completed successfully`);
      setOpen(false);
      setForm(defaults);
      onSuccess?.(payload.result);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)}>
        {Icon && <Icon className="w-4 h-4" />}{label}
      </Button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/55 p-0 md:p-4" role="dialog" aria-modal="true">
          <div className="w-full md:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-white shadow-2xl animate-fade-up">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div><h3 className="font-bold text-slate-900">{title}</h3><p className="text-xs text-slate-500 mt-0.5">Fields marked * are required</p></div>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(field => (
                <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  {field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 pt-6">
                      <input type="checkbox" checked={Boolean(form[field.name])} onChange={e => setForm({ ...form, [field.name]: e.target.checked })} />{field.label}
                    </label>
                  ) : (
                    <>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">{field.label}{field.required && <span className="text-red-500"> *</span>}</label>
                      {field.type === "textarea" ? (
                        <Textarea rows={4} required={field.required} value={form[field.name] ?? ""} placeholder={field.placeholder} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, [field.name]: e.target.value })} />
                      ) : field.type === "select" ? (
                        <Select required={field.required} value={form[field.name] ?? ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, [field.name]: e.target.value })}>
                          <option value="">Select {field.label}</option>
                          {field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </Select>
                      ) : (
                        <Input type={field.type || "text"} required={field.required} value={form[field.name] ?? ""} placeholder={field.placeholder} onChange={e => setForm({ ...form, [field.name]: e.target.value })} />
                      )}
                    </>
                  )}
                </div>
              ))}
              <div className="md:col-span-2 flex justify-end gap-2 border-t border-slate-100 pt-4 mt-1">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4" /> Save</>}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function CsvExport({ fileName, rows, label = "Export CSV" }: { fileName: string; rows: Record<string, unknown>[]; label?: string }) {
  const download = () => {
    if (!rows.length) return toast.error("No data to export");
    const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(","), ...rows.map(row => headers.map(h => escape(row[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = href; anchor.download = `${fileName}.csv`; anchor.click();
    URL.revokeObjectURL(href);
    toast.success("CSV downloaded");
  };
  return <Button type="button" variant="outline" onClick={download}><Download className="w-4 h-4" />{label}</Button>;
}
