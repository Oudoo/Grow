import { redirect } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/access";
import { SETTING_KEYS } from "@/lib/config-types";
import {
  getTaskPriorities, getTaskStatuses, isCustomised,
  priorityUsage, statusUsage,
} from "@/lib/settings";
import { OptionListEditor } from "./OptionListEditor";
import {
  resetPrioritiesAction, resetStatusesAction,
  savePrioritiesAction, saveStatusesAction,
} from "./actions";

export const dynamic = "force-dynamic";

/**
 * System configuration.
 *
 * The point of this page is that option lists stop being code. Adding a task
 * status like "Blocked" or "Requires client approval" used to need an edit to
 * lib/projects.ts and a deploy; now it is an admin action that takes effect
 * immediately.
 *
 * Usage counts come from the database so the editor can refuse to remove an
 * option that tasks still hold — otherwise those tasks would match no column
 * and disappear from the board while still existing.
 */
export default async function ConfigurationPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  // manage, not view: there is nothing to read here that is not an editor.
  if (!can(session.role, session.access, "settings", "manage")) redirect("/admin");

  const [statuses, priorities, sUsage, pUsage, sCustom, pCustom] = await Promise.all([
    getTaskStatuses(),
    getTaskPriorities(),
    statusUsage(),
    priorityUsage(),
    isCustomised(SETTING_KEYS.taskStatuses),
    isCustomised(SETTING_KEYS.taskPriorities),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-platinum mb-2 flex items-center gap-3">
          <SlidersHorizontal className="w-8 h-8 text-cyan" />
          Configuration
        </h1>
        <p className="text-slate">
          Change the options the team picks from, without a developer. Saves take
          effect immediately, everywhere.
        </p>
      </div>

      <div className="space-y-6">
        <OptionListEditor
          title="Task statuses"
          description="The columns on every project board, in this order. Mark a status “Complete” to make tasks in it stop counting as overdue and record a completion date — that flag drives behaviour, not just colour."
          initial={statuses}
          usage={Object.fromEntries(sUsage)}
          showComplete
          customised={sCustom}
          onSave={saveStatusesAction}
          onReset={resetStatusesAction}
          addLabel="Add status"
        />

        <OptionListEditor
          title="Task priorities"
          description="Highest urgency first — this order is how the board and My Work sort tasks."
          initial={priorities}
          usage={Object.fromEntries(pUsage)}
          customised={pCustom}
          onSave={savePrioritiesAction}
          onReset={resetPrioritiesAction}
          addLabel="Add priority"
        />
      </div>

      <p className="mt-8 text-xs text-slate/70 leading-relaxed">
        Internal ids (shown in grey) are what gets stored on each task. They are
        generated from the name when an option is created and then fixed —
        renaming an option changes its label everywhere but keeps existing tasks
        attached to it. An option in use cannot be removed until those tasks are
        moved.
      </p>
    </div>
  );
}
