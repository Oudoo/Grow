import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { ClientProjectBoard } from "./ClientProjectBoard";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/access";
import { pickerOptions } from "@/lib/directory";

export const dynamic = "force-dynamic";

export default async function ProjectDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  // `?task=<id>` — set by the deep link in notification emails so following one
  // opens the task that was mentioned, not just the board it lives on.
  searchParams: Promise<{ task?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, session.access, "projects", "view")) redirect("/admin");

  const { id } = await params;
  const { task: initialTaskId } = await searchParams;

  const [project, directory] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            subTasks: true,
            comments: { orderBy: { createdAt: "desc" } },
            attachments: { orderBy: { createdAt: "desc" } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    // Owner picker + mention candidates come from IAM, so anyone with a Grow
    // account that can open this module is selectable here.
    pickerOptions("projects", "view"),
  ]);

  if (!project) notFound();

  return (
    <div className="p-10 max-w-[1600px] mx-auto">
      <ClientProjectBoard
        project={project}
        directory={directory}
        currentUserId={session.uid}
        initialTaskId={initialTaskId ?? null}
      />
    </div>
  );
}
