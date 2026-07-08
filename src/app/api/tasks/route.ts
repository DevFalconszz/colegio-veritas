import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;

  const include = {
    assignedTo: { select: { id: true, name: true, area: true } },
    lockedBy: { select: { id: true, name: true } },
    comments: {
      include: { user: { select: { id: true, name: true, area: true } } },
      orderBy: { createdAt: "asc" as const },
    },
  };

  if (user.role === "ADMIN") {
    const tasks = await prisma.task.findMany({
      include,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  }

  const tasks = await prisma.task.findMany({
    where: { area: user.area },
    include,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Apenas admin pode criar tarefas" }, { status: 403 });

  const { title, description, area } = await req.json();

  if (!title || !area) {
    return NextResponse.json({ error: "Título e área são obrigatórios" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: { title, description, area },
    include: {
      assignedTo: { select: { id: true, name: true, area: true } },
      lockedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
