"use client";

import { useTransition } from "react";
import { updateSubmissionAction, updateSubmissionDealValueAction, updateSubmissionFollowUpAction } from "./actions";

export function StatusSelect({ id, defaultValue, className }: { id: string, defaultValue: string, className: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <select 
      name="status" 
      defaultValue={defaultValue}
      onChange={(e) => startTransition(() => updateSubmissionAction(id, "status", e.target.value))}
      className={`${className} ${isPending ? 'opacity-50' : ''}`}
    >
      <option value="new">New</option>
      <option value="reviewed">Reviewed</option>
      <option value="in-progress">In Progress</option>
      <option value="closed">Closed</option>
    </select>
  );
}

export function CalledSelect({ id, defaultValue, className }: { id: string, defaultValue: string, className: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <select 
      name="called" 
      defaultValue={defaultValue}
      onChange={(e) => startTransition(() => updateSubmissionAction(id, "called", e.target.value))}
      className={`${className} ${isPending ? 'opacity-50' : ''}`}
    >
      <option value="no">❌ Not Called</option>
      <option value="yes-answered">✅ Called — Answered</option>
      <option value="yes-no-answer">📞 Called — No Answer</option>
      <option value="scheduled">📅 Meeting Scheduled</option>
    </select>
  );
}

export function NotesInput({ id, defaultValue, className }: { id: string, defaultValue: string | null, className: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <input
      name="notes"
      defaultValue={defaultValue || ""}
      placeholder="Add a note..."
      onBlur={(e) => startTransition(() => updateSubmissionAction(id, "notes", e.target.value))}
      className={`${className} ${isPending ? 'opacity-50' : ''}`}
    />
  );
}

export function PrioritySelect({ id, defaultValue, className }: { id: string, defaultValue: string, className: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <select 
      name="priority" 
      defaultValue={defaultValue}
      onChange={(e) => startTransition(() => updateSubmissionAction(id, "priority", e.target.value))}
      className={`${className} ${isPending ? 'opacity-50' : ''}`}
    >
      <option value="HOT">🔥 Hot</option>
      <option value="WARM">☀️ Warm</option>
      <option value="MEDIUM">⭐ Medium</option>
      <option value="COLD">❄️ Cold</option>
    </select>
  );
}

export function SourceSelect({ id, defaultValue, className }: { id: string, defaultValue: string, className: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <select 
      name="source" 
      defaultValue={defaultValue}
      onChange={(e) => startTransition(() => updateSubmissionAction(id, "source", e.target.value))}
      className={`${className} ${isPending ? 'opacity-50' : ''}`}
    >
      <option value="Website">Website</option>
      <option value="WhatsApp">WhatsApp</option>
      <option value="Referral">Referral</option>
      <option value="LinkedIn">LinkedIn</option>
      <option value="Direct">Direct</option>
    </select>
  );
}

export function DealValueInput({ id, defaultValue, className }: { id: string, defaultValue: number, className: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className={`relative ${isPending ? 'opacity-50' : ''}`}>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate/50 text-xs">$</span>
      <input
        type="number"
        name="dealValue"
        defaultValue={defaultValue || 0}
        placeholder="Value"
        onBlur={(e) => startTransition(() => updateSubmissionDealValueAction(id, parseInt(e.target.value) || 0))}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className={`${className} pl-6`}
      />
    </div>
  );
}

export function NextFollowUpInput({ id, defaultValue, className }: { id: string, defaultValue: Date | null, className: string }) {
  const [isPending, startTransition] = useTransition();
  
  // Format Date for input type="date"
  const formattedDate = defaultValue ? new Date(defaultValue).toISOString().split('T')[0] : "";

  return (
    <input
      type="date"
      name="nextFollowUp"
      defaultValue={formattedDate}
      onChange={(e) => {
        const dateVal = e.target.value ? new Date(e.target.value) : null;
        startTransition(() => updateSubmissionFollowUpAction(id, dateVal));
      }}
      className={`${className} ${isPending ? 'opacity-50' : ''}`}
    />
  );
}
