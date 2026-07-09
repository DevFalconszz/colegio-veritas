import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Comentário vazio" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });

  if (user.role !== "ADMIN" && task.area !== user.area) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  }

  const comment = await prisma.comment.create({
    data: { content: content.trim(), taskId: id, userId: user.id },
    include: { user: { select: { id: true, name: true, area: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
