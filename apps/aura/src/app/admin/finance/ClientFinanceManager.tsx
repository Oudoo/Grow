"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Plus, Trash2, CreditCard, DollarSign, Calendar, Clock } from "lucide-react";
import { createInvoiceAction, deleteInvoiceAction, updateInvoiceStatusAction } from "./actions";
import { InvoicePdfGenerator } from "@/components/InvoicePdfGenerator";
import type { Invoice } from "@prisma/client";

export function ClientFinanceManager({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const dueDateStr = formData.get("dueDate") as string;
    const newInvoice = {
      clientName: formData.get("clientName") as string,
      amount: parseFloat(formData.get("amount") as string),
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      status: "DRAFT"
    };

    await createInvoiceAction(newInvoice);
    
    // For simplicity, reload window or rely on optimistic update. 
    // We'll just do a hard reload to get fresh IDs for now, or we can just fetch via server action.
    window.location.reload();
  }

  async function handleUpdateStatus(id: string, status: string) {
    await updateInvoiceStatusAction(id, status);
    setInvoices(invoices.map(i => i.id === id ? { ...i, status } : i));
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    await deleteInvoiceAction(id);
    setInvoices(invoices.filter(i => i.id !== id));
  }

  const totalRevenue = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === "SENT").reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-obsidian border-fg/10 border-l-4 border-l-amethyst">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amethyst/10 rounded-xl text-amethyst">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate text-sm font-bold uppercase">Total Collected</p>
              <h3 className="text-2xl font-bold text-platinum">${totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-obsidian border-fg/10 border-l-4 border-l-cyan">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan/10 rounded-xl text-cyan">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate text-sm font-bold uppercase">Pending (Sent)</p>
              <h3 className="text-2xl font-bold text-platinum">${pendingRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-obsidian border-fg/10 flex items-center justify-center cursor-pointer hover:bg-fg/5 transition-colors" onClick={() => setAdding(!adding)}>
          <div className="text-center">
            <div className="mx-auto w-10 h-10 bg-cyan/10 rounded-full flex items-center justify-center text-cyan mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-platinum font-bold">Create Invoice</p>
          </div>
        </Card>
      </div>

      {adding && (
        <Card className="p-6 mb-8 border-cyan/30 bg-obsidian">
          <h3 className="text-lg font-bold text-platinum mb-4 border-b border-fg/10 pb-2 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-cyan" /> New Invoice
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate uppercase">Client Name</label>
                <input name="clientName" required className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-cyan outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate uppercase">Amount ($)</label>
                <input name="amount" type="number" step="0.01" required className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-cyan outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate uppercase">Due Date</label>
                <input name="dueDate" type="date" className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-slate focus:border-cyan outline-none" />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-slate hover:bg-fg/5">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-cyan text-void font-bold rounded-lg hover:bg-cyan/90 disabled:opacity-50">
                {loading ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="bg-obsidian border border-fg/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-void border-b border-fg/10 text-slate text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Invoice</th>
              <th className="px-6 py-4 font-bold">Client</th>
              <th className="px-6 py-4 font-bold">Amount</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fg/5">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate">No invoices found.</td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-fg/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-platinum flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-slate/50" />
                      {invoice.invoiceNo}
                    </div>
                    {invoice.dueDate && (
                      <div className="text-xs text-slate mt-1 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-platinum">{invoice.clientName}</td>
                  <td className="px-6 py-4 font-bold text-cyan">${invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={invoice.status} 
                      onChange={(e) => handleUpdateStatus(invoice.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1 rounded-full outline-none appearance-none cursor-pointer ${
                        invoice.status === 'PAID' ? 'bg-green-500/10 text-green-400' :
                        invoice.status === 'SENT' ? 'bg-cyan/10 text-cyan' :
                        invoice.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400' :
                        'bg-slate/10 text-slate'
                      }`}
                    >
                      <option value="DRAFT" className="bg-void text-platinum">DRAFT</option>
                      <option value="SENT" className="bg-void text-platinum">SENT</option>
                      <option value="PAID" className="bg-void text-platinum">PAID</option>
                      <option value="OVERDUE" className="bg-void text-platinum">OVERDUE</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end space-x-1">
                    <InvoicePdfGenerator invoice={invoice} />
                    <button 
                      onClick={() => handleDelete(invoice.id)}
                      className="p-2 text-slate hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
