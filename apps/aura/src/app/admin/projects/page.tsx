import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Briefcase, ChevronRight, Calendar, CheckCircle2 } from "lucide-react";
import { createProjectAction } from "./actions";
import { SeedProjectsButton } from "./SeedProjectsButton";
import type { Project, Task } from "@prisma/client";

export const dynamic = "force-dynamic";

type ProjectWithTasks = Project & { tasks: Task[] };

export default async function ProjectsDashboard() {
  let projects: ProjectWithTasks[] = [];
  try {
    projects = await prisma.project.findMany({
      include: {
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Projects DB query failed:", e);
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-2 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-cyan" />
            Project Management
          </h1>
          <p className="text-slate">Manage your team&apos;s projects, tasks, and progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Create Project Form */}
        <div className="col-span-1 bg-obsidian border border-fg/10 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-bold text-platinum mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan" />
            New Project
          </h2>
          <form action={createProjectAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate mb-1 uppercase tracking-wider">Project Title</label>
              <input 
                name="title" 
                required 
                className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none transition-colors"
                placeholder="e.g. Q3 Marketing Campaign"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate mb-1 uppercase tracking-wider">Description</label>
              <textarea 
                name="description" 
                rows={3}
                className="w-full bg-void border border-fg/10 rounded-xl px-4 py-2 text-platinum focus:border-cyan outline-none transition-colors resize-none"
                placeholder="Brief project description..."
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-cyan/10 text-cyan hover:bg-cyan hover:text-void font-bold py-2 rounded-xl transition-colors"
            >
              Create Project
            </button>
          </form>
        </div>

        {/* Project List */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 border border-fg/5 border-dashed rounded-2xl text-slate space-y-4">
              <p>No projects found. Create one above or seed the default launch checklist.</p>
              <SeedProjectsButton />
            </div>
          ) : (
            projects.map((project) => {
              const totalTasks = project.tasks?.length || 0;
              const completedTasks = project.tasks?.filter((t) => t.status === "DONE").length || 0;
              const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

              return (
                <Link 
                  href={`/admin/projects/${project.id}`} 
                  key={project.id}
                  className="block bg-obsidian border border-fg/10 rounded-2xl p-6 hover:border-cyan/50 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-platinum group-hover:text-cyan transition-colors">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-slate mt-1 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate group-hover:text-cyan transition-colors" />
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate mb-4">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan" />
                      {completedTasks} / {totalTasks} Tasks
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-void rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-cyan h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
