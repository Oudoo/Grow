"use client";

import { useState, useTransition } from "react";
import {
  createAdminUserAction,
  updateAdminUserAction,
  toggleAdminUserActiveAction,
  deleteAdminUserAction,
  seedSuperAdminAction,
} from "./actions";
import { Shield, UserPlus, Pencil, Trash2, PowerOff, Power, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  VIEWER: "Viewer",
};

const PERM_LABELS: Record<string, string> = {
  crm: "CRM",
  finance: "Finance Hub",
  products: "Content Management",
  projects: "Project Management",
  support: "Help Desk",
  analytics: "Analytics",
  iam: "IAM Portal",
};

export function IamClient({ users: initial, allPermissions }: { users: UserRow[]; allPermissions: string[] }) {
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [seeding, startSeed] = useTransition();

  function handleSeedSuperAdmin() {
    startSeed(async () => {
      await seedSuperAdminAction();
      window.location.reload();
    });
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createAdminUserAction(fd);
      setShowCreate(false);
      window.location.reload();
    });
  }

  function handleUpdate(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateAdminUserAction(id, fd);
      setEditingId(null);
      window.location.reload();
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleAdminUserActiveAction(id, !current);
      setUsers((u) => u.map((x) => (x.id === id ? { ...x, isActive: !current } : x)));
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteAdminUserAction(id);
      setUsers((u) => u.filter((x) => x.id !== id));
    });
  }

  const superAdminExists = users.some((u) => u.email === "admin@grow.agency");

  return (
    <div className="space-y-8">
      {/* Quick actions bar */}
      <div className="flex flex-wrap gap-3">
        {!superAdminExists && (
          <button
            onClick={handleSeedSuperAdmin}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-amethyst/10 text-amethyst border border-amethyst/30 rounded-xl hover:bg-amethyst hover:text-void font-bold transition-colors disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            {seeding ? "Creating…" : "Create Super Admin (admin@grow.agency)"}
          </button>
        )}
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan/10 text-cyan border border-cyan/20 rounded-xl hover:bg-cyan hover:text-void font-bold transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          New Account
          {showCreate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-obsidian border border-cyan/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-platinum mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan" /> Create New Admin Account
          </h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <UserFormFields allPermissions={allPermissions} />
            <div className="flex justify-end gap-3 pt-4 border-t border-fg/10">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-slate hover:text-platinum">Cancel</button>
              <button type="submit" disabled={pending} className="px-6 py-2 bg-cyan text-void font-bold rounded-xl hover:bg-cyan/90 disabled:opacity-50 flex items-center gap-2">
                {pending && <Loader2 className="w-4 h-4 animate-spin" />} Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      {users.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-fg/10 rounded-2xl text-slate">
          No admin accounts yet. Create one above or seed the Super Admin account.
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`bg-obsidian border rounded-2xl overflow-hidden transition-colors ${user.isActive ? "border-fg/10" : "border-red-500/20 opacity-70"}`}
            >
              {editingId === user.id ? (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-platinum mb-5 flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-cyan" /> Editing: {user.email}
                  </h3>
                  <form onSubmit={(e) => handleUpdate(user.id, e)} className="space-y-5">
                    <UserFormFields allPermissions={allPermissions} user={user} />
                    <div className="flex justify-end gap-3 pt-4 border-t border-fg/10">
                      <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 text-slate hover:text-platinum">Cancel</button>
                      <button type="submit" disabled={pending} className="px-6 py-2 bg-cyan text-void font-bold rounded-xl hover:bg-cyan/90 disabled:opacity-50 flex items-center gap-2">
                        {pending && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-platinum truncate">{user.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        user.role === "SUPER_ADMIN" ? "bg-amethyst/20 text-amethyst" :
                        user.role === "ADMIN" ? "bg-cyan/20 text-cyan" : "bg-slate/20 text-slate"
                      }`}>{ROLE_LABELS[user.role] ?? user.role}</span>
                      {!user.isActive && <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-bold">Inactive</span>}
                    </div>
                    <p className="text-sm text-slate truncate">{user.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.permissions.map((p) => (
                        <span key={p} className="text-[10px] px-1.5 py-0.5 bg-fg/5 text-slate rounded">
                          {PERM_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(user.id, user.isActive)}
                      title={user.isActive ? "Deactivate" : "Activate"}
                      className={`p-2 rounded-lg transition-colors ${user.isActive ? "text-slate hover:text-red-400 hover:bg-red-500/10" : "text-slate hover:text-green-400 hover:bg-green-500/10"}`}
                    >
                      {user.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingId(user.id)}
                      className="p-2 rounded-lg text-slate hover:text-cyan hover:bg-cyan/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 rounded-lg text-slate hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserFormFields({ allPermissions, user }: { allPermissions: string[]; user?: UserRow }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Full Name</label>
          <input name="name" defaultValue={user?.name ?? ""} required className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none" />
        </div>
        {!user && (
          <div>
            <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Email</label>
            <input name="email" type="email" required className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none" />
          </div>
        )}
        <div>
          <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">{user ? "New Password (leave blank to keep)" : "Password"}</label>
          <input name="password" type="password" minLength={user ? 0 : 8} required={!user} className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Role</label>
          <select name="role" defaultValue={user?.role ?? "VIEWER"} className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none">
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        {user && (
          <div>
            <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-1">Status</label>
            <select name="isActive" defaultValue={String(user.isActive)} className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <label className="text-xs font-bold text-slate uppercase tracking-wider block mb-3">Section Permissions</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {allPermissions.map((p) => (
            <label key={p} className="flex items-center gap-2 px-3 py-2 bg-void border border-fg/10 rounded-lg cursor-pointer hover:border-cyan/30 transition-colors">
              <input
                type="checkbox"
                name={`perm_${p}`}
                defaultChecked={user ? user.permissions.includes(p) : true}
                className="accent-cyan"
              />
              <span className="text-sm text-slate capitalize">{PERM_LABELS[p] ?? p}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
