"use client";

import { useState, useTransition } from "react";
import { seedProjectsAction } from "./actions";

export function SeedProjectsButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await seedProjectsAction();
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error ?? "Seeding failed. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={pending}
        className="px-6 py-2 bg-cyan/10 text-cyan border border-cyan/20 hover:bg-cyan hover:text-void font-bold rounded-xl transition-colors disabled:opacity-50"
      >
        {pending ? "Seeding…" : "Seed Default Project"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
