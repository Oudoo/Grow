"use client";

import { useTransition } from "react";
import { saveTenantConfigAction } from "./actions";
import { Save, Loader2 } from "lucide-react";

type Config = {
  companyName: string;
  tagline: string | null;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  fontHeading: string;
  fontBody: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  isDemo: boolean;
} | null;

export function WhitelabelClient({ config }: { config: Config }) {
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      await saveTenantConfigAction(fd);
    });
  }

  const c = config;

  return (
    <form onSubmit={handleSubmit} className="bg-obsidian border border-fg/10 rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-bold text-platinum border-b border-fg/10 pb-4">Tenant / Brand Settings</h2>

      {/* Deal status */}
      <div>
        <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-2">Deal Status</label>
        <select name="isDemo" defaultValue={String(c?.isDemo ?? true)} className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none">
          <option value="true">Demo / Prospect</option>
          <option value="false">Finalized Implementation</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Company Name" name="companyName" defaultValue={c?.companyName ?? "Grow"} required />
        <Field label="Tagline" name="tagline" defaultValue={c?.tagline ?? ""} />
        <Field label="Primary Color" name="primaryColor" type="color" defaultValue={c?.primaryColor ?? "#00E5FF"} />
        <Field label="Secondary Color" name="secondaryColor" type="color" defaultValue={c?.secondaryColor ?? "#8B5CF6"} />
        <Field label="Logo URL" name="logoUrl" defaultValue={c?.logoUrl ?? ""} placeholder="https://..." />
        <Field label="Heading Font" name="fontHeading" defaultValue={c?.fontHeading ?? "Plus Jakarta Sans"} />
        <Field label="Body Font" name="fontBody" defaultValue={c?.fontBody ?? "Inter"} />
        <Field label="Contact Email" name="contactEmail" type="email" defaultValue={c?.contactEmail ?? ""} />
        <Field label="Contact Phone" name="contactPhone" defaultValue={c?.contactPhone ?? ""} />
      </div>

      <div>
        <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Address</label>
        <textarea name="address" rows={2} defaultValue={c?.address ?? ""} className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none resize-none" />
      </div>

      {/* Live preview chips */}
      <div className="pt-4 border-t border-fg/10">
        <p className="text-xs text-slate uppercase tracking-wider mb-3">Brand Preview</p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-fg/10" style={{ background: c?.primaryColor ?? "#00E5FF" }} />
          <div className="w-10 h-10 rounded-full border-2 border-fg/10" style={{ background: c?.secondaryColor ?? "#8B5CF6" }} />
          <span className="text-platinum font-bold text-lg" style={{ fontFamily: c?.fontHeading ?? "Plus Jakarta Sans" }}>
            {c?.companyName ?? "Grow"}
          </span>
          {c?.isDemo && (
            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full font-bold">Demo</span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="flex items-center gap-2 px-6 py-2 bg-cyan text-void font-bold rounded-xl hover:bg-cyan/90 disabled:opacity-50">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Configuration
        </button>
      </div>
    </form>
  );
}

function Field({
  label, name, defaultValue, type = "text", required, placeholder,
}: {
  label: string; name: string; defaultValue?: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none"
      />
    </div>
  );
}
