"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, MessageSquare, Paperclip, User, Clock, Briefcase } from "lucide-react";
import { 
  createTaskAction, 
  updateTaskStatusAction, 
  updateTaskAssigneeAction,
  deleteTaskAction,
  createSubTaskAction,
  toggleSubTaskAction,
  deleteSubTaskAction,
  addCommentAction,
  addAttachmentAction,
  deleteAttachmentAction,
  updateTaskTitleAction,
  updateSubTaskTitleAction
} from "../actions";
import type { Project, Task, SubTask, Comment, Attachment } from "@prisma/client";

const TEAM_MEMBERS = ["Mahmoud Hassan", "Ahmed El-Tamawy", "Mohamed Khaled", "Unassigned"];

type TaskWithRelations = Task & {
  subTasks: SubTask[];
  comments: Comment[];
  attachments: Attachment[];
};
type ProjectWithTasks = Project & { tasks: TaskWithRelations[] };

export function ClientProjectBoard({ project }: { project: ProjectWithTasks }) {
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);

  const pendingTasks = project.tasks.filter((t) => t.status === "PENDING");
  const inProgressTasks = project.tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = project.tasks.filter((t) => t.status === "DONE");

  const totalTasks = project.tasks.length;
  const completedTasks = doneTasks.length;
  const projectProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Re-find active task if project data updates (after a server action)
  const currentActiveTask = activeTask ? project.tasks.find((t) => t.id === activeTask.id) : null;

  return (
    <div className="space-y-8">
      {/* Project Header & Progress */}
      <div className="bg-obsidian border border-fg/10 rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-platinum mb-2">{project.title}</h1>
            {project.description && <p className="text-slate">{project.description}</p>}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan">{projectProgress}%</div>
            <div className="text-xs text-slate uppercase tracking-wider">Overall Progress</div>
          </div>
        </div>
        <div className="w-full bg-void rounded-full h-3 overflow-hidden">
          <div 
            className="bg-cyan h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${projectProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kanban Board (3 columns) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* PENDING COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-fg/10 pb-2">
              <h3 className="font-bold text-platinum flex items-center gap-2">
                <Circle className="w-4 h-4 text-slate" /> Pending
              </h3>
              <span className="bg-void text-slate text-xs px-2 py-1 rounded-full">{pendingTasks.length}</span>
            </div>
            
            <form action={(data) => createTaskAction(project.id, data)} className="bg-obsidian border border-fg/10 border-dashed rounded-xl p-4">
              <input 
                name="title" 
                required 
                placeholder="New Task..." 
                className="w-full bg-transparent text-platinum placeholder-slate/50 outline-none text-sm mb-3"
              />
              <select name="assignee" className="w-full bg-void text-slate text-xs border border-fg/10 rounded-lg p-2 mb-3 outline-none">
                {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <button type="submit" className="w-full bg-cyan/10 text-cyan hover:bg-cyan hover:text-void text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Plus className="w-3 h-3" /> Add Task
              </button>
            </form>

            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => setActiveTask(task)} />
            ))}
          </div>

          {/* IN PROGRESS COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-fg/10 pb-2">
              <h3 className="font-bold text-platinum flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> In Progress
              </h3>
              <span className="bg-void text-slate text-xs px-2 py-1 rounded-full">{inProgressTasks.length}</span>
            </div>
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => setActiveTask(task)} />
            ))}
          </div>

          {/* DONE COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-fg/10 pb-2">
              <h3 className="font-bold text-platinum flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Done
              </h3>
              <span className="bg-void text-slate text-xs px-2 py-1 rounded-full">{doneTasks.length}</span>
            </div>
            {doneTasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => setActiveTask(task)} />
            ))}
          </div>

        </div>

        {/* Task Details Sidebar (Right Panel) */}
        <div className="lg:col-span-1">
          {currentActiveTask ? (
            <div className="bg-obsidian border border-fg/10 rounded-2xl p-6 sticky top-6">
              <div className="flex justify-between items-start mb-4">
                <input 
                  defaultValue={currentActiveTask.title}
                  onBlur={(e) => updateTaskTitleAction(currentActiveTask.id, project.id, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  className="text-xl font-bold text-platinum bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan rounded px-1 w-full mr-2"
                />
                <button 
                  onClick={() => {
                    deleteTaskAction(currentActiveTask.id, project.id);
                    setActiveTask(null);
                  }}
                  className="text-slate hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status & Assignee Controls */}
              <div className="space-y-3 mb-6 border-b border-fg/10 pb-6">
                <div>
                  <label className="block text-xs text-slate mb-1">Status</label>
                  <select 
                    value={currentActiveTask.status}
                    onChange={(e) => updateTaskStatusAction(currentActiveTask.id, project.id, e.target.value)}
                    className="w-full bg-void text-platinum text-sm border border-fg/10 rounded-lg p-2 outline-none focus:border-cyan"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate mb-1">Assignee</label>
                  <select 
                    value={currentActiveTask.assignee}
                    onChange={(e) => updateTaskAssigneeAction(currentActiveTask.id, project.id, e.target.value)}
                    className="w-full bg-void text-platinum text-sm border border-fg/10 rounded-lg p-2 outline-none focus:border-cyan"
                  >
                    {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Subtasks */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-platinum mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Subtasks
                </h3>
                
                {/* Progress bar for subtasks */}
                {currentActiveTask.subTasks.length > 0 && (() => {
                  const subTotal = currentActiveTask.subTasks.length;
                  const subDone = currentActiveTask.subTasks.filter((s) => s.isCompleted).length;
                  const subProg = Math.round((subDone / subTotal) * 100);
                  return (
                    <div className="w-full bg-void rounded-full h-1.5 mb-3 overflow-hidden">
                      <div className="bg-cyan h-1.5 rounded-full transition-all" style={{ width: `${subProg}%` }} />
                    </div>
                  );
                })()}

                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
                  {currentActiveTask.subTasks.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2 group">
                      <input 
                        type="checkbox" 
                        checked={sub.isCompleted}
                        onChange={(e) => toggleSubTaskAction(sub.id, project.id, e.target.checked)}
                        className="accent-cyan w-4 h-4"
                      />
                      <input 
                        defaultValue={sub.title}
                        onBlur={(e) => updateSubTaskTitleAction(sub.id, project.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        className={`text-sm flex-1 bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan rounded px-1 ${sub.isCompleted ? 'text-slate line-through' : 'text-platinum'}`}
                      />
                      <button onClick={() => deleteSubTaskAction(sub.id, project.id)} className="opacity-0 group-hover:opacity-100 text-slate hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <form action={(data) => createSubTaskAction(currentActiveTask.id, project.id, data)} className="flex gap-2">
                  <input name="title" placeholder="Add subtask..." required className="flex-1 bg-void border border-fg/10 rounded-lg px-3 py-1.5 text-sm text-platinum outline-none focus:border-cyan" />
                  <button type="submit" className="bg-fg/10 text-platinum hover:bg-cyan hover:text-void px-3 rounded-lg"><Plus className="w-4 h-4" /></button>
                </form>
              </div>

              {/* Attachments (Links) */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-platinum mb-3 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" /> Links & Attachments
                </h3>
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {currentActiveTask.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between bg-void p-2 rounded-lg group">
                      <a href={att.url} target="_blank" rel="noreferrer" className="text-cyan text-xs truncate max-w-[200px] hover:underline">
                        {att.name}
                      </a>
                      <button onClick={() => deleteAttachmentAction(att.id, project.id)} className="opacity-0 group-hover:opacity-100 text-slate hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <form action={(data) => addAttachmentAction(currentActiveTask.id, project.id, data)} className="space-y-2">
                  <input name="name" placeholder="Link Name (e.g. Design Doc)" required className="w-full bg-void border border-fg/10 rounded-lg px-3 py-1.5 text-sm text-platinum outline-none focus:border-cyan" />
                  <input name="url" type="url" placeholder="https://..." required className="w-full bg-void border border-fg/10 rounded-lg px-3 py-1.5 text-sm text-platinum outline-none focus:border-cyan" />
                  <button type="submit" className="w-full bg-fg/10 text-platinum hover:bg-cyan hover:text-void text-xs font-bold py-1.5 rounded-lg">Add Link</button>
                </form>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-bold text-sm text-platinum mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Comments
                </h3>
                <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                  {currentActiveTask.comments.map((comment) => (
                    <div key={comment.id} className="bg-void p-3 rounded-xl border border-fg/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-cyan">{comment.author}</span>
                        <span className="text-[10px] text-slate">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-platinum whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
                <form action={(data) => addCommentAction(currentActiveTask.id, project.id, "Admin User", data)} className="space-y-2">
                  <textarea name="content" rows={2} placeholder="Add a comment..." required className="w-full bg-void border border-fg/10 rounded-lg px-3 py-2 text-sm text-platinum outline-none focus:border-cyan resize-none" />
                  <button type="submit" className="w-full bg-cyan/10 text-cyan hover:bg-cyan hover:text-void text-xs font-bold py-1.5 rounded-lg">Post Comment</button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-obsidian border border-fg/10 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center h-full text-slate">
              <Briefcase className="w-10 h-10 mb-3 opacity-20" />
              <p>Select a task to view its details, subtasks, and comments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Component for Task Cards in the Kanban Board
function TaskCard({ task, onClick }: { task: TaskWithRelations, onClick: () => void }) {
  const subTotal = task.subTasks.length;
  const subDone = task.subTasks.filter((s) => s.isCompleted).length;
  const subProg = subTotal === 0 ? 0 : Math.round((subDone / subTotal) * 100);

  return (
    <div 
      onClick={onClick}
      className="bg-obsidian border border-fg/10 rounded-xl p-4 cursor-pointer hover:border-cyan/50 transition-colors group"
    >
      <h4 className="font-bold text-platinum text-sm mb-2 group-hover:text-cyan transition-colors">{task.title}</h4>
      
      <div className="flex items-center gap-1.5 text-xs text-slate mb-3 bg-void w-fit px-2 py-1 rounded-md">
        <User className="w-3 h-3" />
        {task.assignee}
      </div>

      <div className="flex items-center justify-between text-xs text-slate">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {subDone}/{subTotal}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {task.comments.length}</span>
          <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {task.attachments.length}</span>
        </div>
      </div>
      
      {subTotal > 0 && (
        <div className="w-full bg-void rounded-full h-1 mt-3 overflow-hidden">
          <div className="bg-cyan h-1 rounded-full transition-all" style={{ width: `${subProg}%` }} />
        </div>
      )}
    </div>
  );
}
