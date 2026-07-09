import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@veritas.com" },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin já existe" });
    }

    const hashedPassword = await hash("admin123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Administrador",
        email: "admin@veritas.com",
        password: hashedPassword,
        role: "ADMIN",
        area: "TI",
      },
    });

    await prisma.task.createMany({
      data: [
        { title: "Organizar cronograma de matrículas", area: "SECRETARIA", status: "A_FAZER" },
        { title: "Atualizar planilha de vendas", area: "COMERCIAL", status: "A_FAZER" },
        { title: "Configurar novos computadores do laboratório", area: "TI", status: "A_FAZER" },
        { title: "Revisar relatório de despesas mensais", area: "FINANCEIRO", status: "FAZENDO" },
        { title: "Preparar contratos de rematrícula 2026", area: "SECRETARIA", status: "FAZENDO" },
        { title: "Atualizar sistema de boletos", area: "TI", status: "CONCLUIDA" },
      ],
    });

    return NextResponse.json({
      message: "Banco populado com sucesso!",
      admin: { email: "admin@veritas.com", password: "admin123" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao popular banco" }, { status: 500 });
  }
}