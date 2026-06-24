"use server";

import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createProjectAction(formData: FormData) {
  await assertAuthenticated();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title) return;

  await prisma.project.create({
    data: {
      title,
      description,
    },
  });

  revalidatePath("/admin/projects");
}

export async function deleteProjectAction(id: string) {
  await assertAuthenticated();
  await prisma.project.delete({
    where: { id },
  });
  revalidatePath("/admin/projects");
}

export async function createTaskAction(projectId: string, formData: FormData) {
  await assertAuthenticated();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const assignee = formData.get("assignee") as string;

  if (!title) return;

  await prisma.task.create({
    data: {
      title,
      description,
      assignee: assignee || "Unassigned",
      projectId,
    },
  });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
}

export async function updateTaskStatusAction(id: string, projectId: string, status: string) {
  await assertAuthenticated();
  await prisma.task.update({
    where: { id },
    data: { status },
  });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
}

export async function updateTaskAssigneeAction(id: string, projectId: string, assignee: string) {
  await assertAuthenticated();
  await prisma.task.update({
    where: { id },
    data: { assignee },
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function updateTaskTitleAction(id: string, projectId: string, title: string) {
  await assertAuthenticated();
  if (!title) return;
  await prisma.task.update({
    where: { id },
    data: { title },
  });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
}

export async function deleteTaskAction(id: string, projectId: string) {
  await assertAuthenticated();
  await prisma.task.delete({
    where: { id },
  });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
}

export async function createSubTaskAction(taskId: string, projectId: string, formData: FormData) {
  await assertAuthenticated();
  const title = formData.get("title") as string;

  if (!title) return;

  await prisma.subTask.create({
    data: {
      title,
      taskId,
    },
  });

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function toggleSubTaskAction(id: string, projectId: string, isCompleted: boolean) {
  await assertAuthenticated();
  await prisma.subTask.update({
    where: { id },
    data: { isCompleted },
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function updateSubTaskTitleAction(id: string, projectId: string, title: string) {
  await assertAuthenticated();
  if (!title) return;
  await prisma.subTask.update({
    where: { id },
    data: { title },
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function deleteSubTaskAction(id: string, projectId: string) {
  await assertAuthenticated();
  await prisma.subTask.delete({
    where: { id },
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function addCommentAction(taskId: string, projectId: string, author: string, formData: FormData) {
  await assertAuthenticated();
  const content = formData.get("content") as string;

  if (!content) return;

  await prisma.comment.create({
    data: {
      content,
      author,
      taskId,
    },
  });

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function addAttachmentAction(taskId: string, projectId: string, formData: FormData) {
  await assertAuthenticated();
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;

  if (!name || !url) return;

  await prisma.attachment.create({
    data: {
      name,
      url,
      taskId,
    },
  });

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function deleteAttachmentAction(id: string, projectId: string) {
  await assertAuthenticated();
  await prisma.attachment.delete({
    where: { id },
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function seedProjectsAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAuthenticated();
  } catch {
    return { success: false, error: "Not authenticated. Please log in and try again." };
  }

  try {
    const { launchProjectData } = await import("@/data/seedProjects");

    const existing = await prisma.project.findFirst({ where: { title: launchProjectData.title } });
    const project = existing ?? await prisma.project.create({
      data: { title: launchProjectData.title, description: launchProjectData.description },
    });

    for (const taskData of launchProjectData.tasks) {
      const task =
        (await prisma.task.findFirst({ where: { title: taskData.title, projectId: project.id } })) ??
        (await prisma.task.create({
          data: { title: taskData.title, status: taskData.status, assignee: taskData.assignee, projectId: project.id },
        }));

      for (const subTitle of taskData.subTasks) {
        const exists = await prisma.subTask.findFirst({ where: { title: subTitle, taskId: task.id } });
        if (!exists) await prisma.subTask.create({ data: { title: subTitle, taskId: task.id } });
      }
    }

    revalidatePath("/admin/projects");
    return { success: true };
  } catch (e) {
    console.error("[seedProjectsAction] failed:", e);
    return { success: false, error: e instanceof Error ? e.message : "Seeding failed. Check server logs." };
  }
}
