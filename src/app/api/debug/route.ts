import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export async function GET() {
  const errors: string[] = [];

  try {
    const url = process.env.DATABASE_URL || "N/A";
    errors.push(`DATABASE_URL exists: ${url.startsWith("postgresql")}`);
    errors.push(`DATABASE_URL prefix: ${url.substring(0, 35)}...`);

    const adapter = new PrismaPg({ connectionString: url });
    const prisma = new PrismaClient({ adapter });
    await prisma.$connect();
    errors.push("Prisma connected OK");

    const userCount = await prisma.user.count();
    errors.push(`User count: ${userCount}`);

    await prisma.$disconnect();
  } catch (e: any) {
    errors.push(`ERROR: ${e?.message || String(e)}`);
    errors.push(`CODE: ${e?.code || "N/A"}`);
  }

  return NextResponse.json({ diagnostics: errors });
}