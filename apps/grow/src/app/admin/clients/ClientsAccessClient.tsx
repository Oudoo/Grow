"use client";

import { useState, useTransition } from "react";
import { saveClientAccessAction } from "./actions";
import { ChevronDown, ChevronUp, Loader2, Check, Globe } from "lucide-react";

type ProductDef = { key: string; label: string };
type ClientRow = {
  id: string;
  name: string;
  slug: string;
  tools: string[];
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  subdomain: string;
  isActive: boolean;
};

export function ClientsAccessClient({ clients, products }: { clients: ClientRow[]; products: ProductDef[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [savedId, setSavedId] = useState<string | null>(null);

  function handleSave(clientId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveClientAccessAction(clientId, fd);
      setSavedId(clientId);
      setTimeout(() => setSavedId(null), 2000);
    });
  }

  return (
    <div className="space-y-3">
      {clients.map((c) => {
        const open = openId === c.id;
        return (
          <div key={c.id} className="bg-obsidian border border-fg/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : c.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-fg/5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-bold text-platinum truncate">{c.name}</span>
                <span className="text-xs font-data text-slate/70 truncate">{c.slug}</span>
                {c.tools.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-cyan/10 text-cyan rounded-full">{c.tools.length} tool{c.tools.length > 1 ? "s" : ""}</span>
                )}
                {c.subdomain && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate"><Globe className="w-3 h-3" />{c.subdomain}.growcdx.com</span>
                )}
              </div>
              {open ? <ChevronUp className="w-4 h-4 text-slate" /> : <ChevronDown className="w-4 h-4 text-slate" />}
            </button>

            {open && (
              <form onSubmit={(e) => handleSave(c.id, e)} className="px-5 pb-5 space-y-5 border-t border-fg/5 pt-5">
                <div>
                  <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-2">Purchased tools</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {products.map((p) => (
                      <label key={p.key} className="flex items-center gap-2 px-3 py-2 bg-void border border-fg/10 rounded-lg cursor-pointer hover:border-cyan/30 transition-colors">
                        <input type="checkbox" name={`tool_${p.key}`} defaultChecked={c.tools.includes(p.key)} className="accent-cyan" />
                        <span className="text-sm text-slate">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Brand name</label>
                    <input name="brandName" defaultValue={c.brandName} placeholder={c.name} className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Subdomain</label>
                    <div className="flex items-center">
                      <input name="subdomain" defaultValue={c.subdomain} placeholder={c.slug} className="w-full bg-void border border-fg/10 rounded-l-xl px-4 py-2 text-platinum focus:border-cyan outline-none font-data text-sm" />
                      <span className="px-3 py-2 bg-fg/5 border border-l-0 border-fg/10 rounded-r-xl text-slate text-sm font-data">.growcdx.com</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Logo URL</label>
                    <input name="logoUrl" defaultValue={c.logoUrl} placeholder="https://…/logo.svg" className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Primary</label>
                      <input name="primaryColor" defaultValue={c.primaryColor} placeholder="#4F46E5" className="w-full bg-void border border-fg/10 rounded-xl px-3 py-2 text-platinum focus:border-cyan outline-none font-data text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Accent</label>
                      <input name="accentColor" defaultValue={c.accentColor} placeholder="#06B6D4" className="w-full bg-void border border-fg/10 rounded-xl px-3 py-2 text-platinum focus:border-cyan outline-none font-data text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Status</label>
                    <select name="isActive" defaultValue={String(c.isActive)} className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none">
                      <option value="true">Active</option>
                      <option value="false">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button type="submit" disabled={pending} className="px-6 py-2 bg-cyan text-void font-bold rounded-xl hover:bg-cyan/90 disabled:opacity-50 flex items-center gap-2">
                    {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : savedId === c.id ? <Check className="w-4 h-4" /> : null}
                    {savedId === c.id ? "Saved" : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
