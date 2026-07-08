import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;
  const body = await req.json();
  const { status, assignedToId } = body;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });

  if (user.role !== "ADMIN") {
    if (task.area !== user.area) {
      return NextResponse.json({ error: "Você não tem permissão para esta tarefa" }, { status: 403 });
    }
  }

  const updateData: any = {};

  if (status) {
    updateData.status = status;

    if (status === "FAZENDO" && !task.lockedById) {
      updateData.lockedById = user.id;
      updateData.assignedToId = user.id;
    }

    if (status === "A_FAZER") {
      updateData.lockedById = null;
      updateData.assignedToId = assignedToId || null;
    }

    if (status === "CONCLUIDA") {
      updateData.lockedById = null;
    }
  }

  if (assignedToId !== undefined && user.role === "ADMIN") {
    updateData.assignedToId = assignedToId || null;
    if (!assignedToId) {
      updateData.lockedById = null;
    }
  }

  const updated = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      assignedTo: { select: { id: true, name: true, area: true } },
      lockedBy: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true, area: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Apenas admin pode excluir tarefas" }, { status: 403 });

  const { id } = await params;
  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
