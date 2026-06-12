"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Plus, Trash2, LifeBuoy, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { createTicketAction, deleteTicketAction, updateTicketStatusAction } from "./actions";
import type { Ticket } from "@prisma/client";

export function ClientSupportManager({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const newTicket = {
      title: formData.get("title") as string,
      clientName: formData.get("clientName") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as string,
      status: "OPEN"
    };

    await createTicketAction(newTicket);
    window.location.reload();
  }

  async function handleUpdateStatus(id: string, status: string) {
    await updateTicketStatusAction(id, status);
    setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    await deleteTicketAction(id);
    setTickets(tickets.filter(t => t.id !== id));
  }

  const openTickets = tickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const urgentTickets = tickets.filter(t => t.priority === "URGENT" && t.status !== "RESOLVED" && t.status !== "CLOSED").length;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-obsidian border-fg/10 border-l-4 border-l-cyan">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan/10 rounded-xl text-cyan">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate text-sm font-bold uppercase">Active Tickets</p>
              <h3 className="text-2xl font-bold text-platinum">{openTickets}</h3>
            </div>
          </div>
        </Card>
        <Card className={`p-6 bg-obsidian border-fg/10 border-l-4 ${urgentTickets > 0 ? 'border-l-red-500' : 'border-l-fg/20'}`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${urgentTickets > 0 ? 'bg-red-500/10 text-red-500' : 'bg-fg/10 text-slate'}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate text-sm font-bold uppercase">Urgent Items</p>
              <h3 className={`text-2xl font-bold ${urgentTickets > 0 ? 'text-red-400' : 'text-platinum'}`}>{urgentTickets}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-obsidian border-fg/10 flex items-center justify-center cursor-pointer hover:bg-fg/5 transition-colors" onClick={() => setAdding(!adding)}>
          <div className="text-center">
            <div className="mx-auto w-10 h-10 bg-amethyst/10 rounded-full flex items-center justify-center text-amethyst mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-platinum font-bold">New Ticket</p>
          </div>
        </Card>
      </div>

      {adding && (
        <Card className="p-6 mb-8 border-amethyst/30 bg-obsidian">
          <h3 className="text-lg font-bold text-platinum mb-4 border-b border-fg/10 pb-2 flex items-center">
            <LifeBuoy className="w-5 h-5 mr-2 text-amethyst" /> Create Ticket
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate uppercase">Ticket Title</label>
                <input name="title" required placeholder="e.g. Server down, Update logo" className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-amethyst outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate uppercase">Client Name</label>
                <input name="clientName" required className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-amethyst outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate uppercase">Description</label>
                <textarea name="description" required rows={3} className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-amethyst outline-none resize-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate uppercase">Priority</label>
                <select name="priority" className="w-full px-4 py-2 bg-void border border-fg/10 rounded-lg text-platinum focus:border-amethyst outline-none">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM" selected>Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-slate hover:bg-fg/5">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-amethyst text-void font-bold rounded-lg hover:bg-amethyst/90 disabled:opacity-50">
                {loading ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {tickets.length === 0 ? (
          <div className="text-center p-12 border border-fg/10 rounded-xl bg-obsidian">
            <CheckCircle className="w-12 h-12 text-green-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-platinum mb-2">Inbox Zero</h3>
            <p className="text-slate">No active support tickets right now.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className={`p-5 border-fg/10 bg-obsidian group ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'opacity-70' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-bold text-platinum text-lg">{ticket.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      ticket.priority === 'URGENT' ? 'bg-red-500/10 text-red-400' :
                      ticket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400' :
                      ticket.priority === 'LOW' ? 'bg-slate/10 text-slate' :
                      'bg-cyan/10 text-cyan'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="text-xs text-slate font-medium mb-3">Client: <span className="text-platinum">{ticket.clientName}</span></div>
                  <p className="text-sm text-slate whitespace-pre-wrap">{ticket.description}</p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start min-w-[150px] gap-4">
                  <select 
                    value={ticket.status} 
                    onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer w-full text-center ${
                      ticket.status === 'OPEN' ? 'bg-amethyst/10 text-amethyst border border-amethyst/20' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-cyan/10 text-cyan border border-cyan/20' :
                      'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}
                  >
                    <option value="OPEN" className="bg-void text-platinum">OPEN</option>
                    <option value="IN_PROGRESS" className="bg-void text-platinum">IN PROGRESS</option>
                    <option value="RESOLVED" className="bg-void text-platinum">RESOLVED</option>
                    <option value="CLOSED" className="bg-void text-platinum">CLOSED</option>
                  </select>
                  
                  <div className="flex items-center text-xs text-slate/50">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>

                  <button 
                    onClick={() => handleDelete(ticket.id)}
                    className="p-2 text-slate hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
