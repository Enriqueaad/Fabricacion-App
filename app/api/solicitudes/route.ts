import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const solicitudes = await prisma.solicitudStock.findMany({
    orderBy: { generadaEn: "desc" },
    take: 100,
    include: {
      orden: {
        select: { codigo: true, cliente: true, proyecto: true },
      },
    },
  });
  return NextResponse.json(solicitudes);
}
