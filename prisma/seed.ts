import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@veritas.com" },
  });

  if (existingAdmin) {
    console.log("Admin já existe no banco.");
    return;
  }

  const { hash } = await import("bcryptjs");
  const hashedPassword = await hash("admin123", 10);

  await prisma.user.create({
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
      { title: "Organizar cronograma de matrículas", description: "Definir datas e horários para matrículas 2026", area: "SECRETARIA", status: "A_FAZER" },
      { title: "Atualizar planilha de vendas", description: "Inserir dados do último mês", area: "COMERCIAL", status: "A_FAZER" },
      { title: "Configurar novos computadores", description: "Laboratório de informática - 10 unidades", area: "TI", status: "A_FAZER" },
      { title: "Revisar relatório de despesas", description: "Relatório mensal de despesas operacionais", area: "FINANCEIRO", status: "FAZENDO" },
      { title: "Preparar contratos de rematrícula", description: "Contratos para o ano letivo de 2026", area: "SECRETARIA", status: "FAZENDO" },
      { title: "Atualizar sistema de boletos", description: "Nova integração com banco", area: "TI", status: "CONCLUIDA" },
    ],
  });

  console.log("Banco populado com sucesso!");
  console.log("Admin: admin@veritas.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
