import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ClientProjectBoard } from "./ClientProjectBoard";

export const dynamic = "force-dynamic";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        include: {
          subTasks: true,
          comments: {
            orderBy: { createdAt: "desc" },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto">
      <ClientProjectBoard project={project} />
    </div>
  );
}
