import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const ordenes = await prisma.orden.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { detalles: true, hojasDeRuta: true } },
    },
  });
  return NextResponse.json(ordenes);
}

export async function POST(req: NextRequest) {
  const { detalles, ...ordenData } = await req.json();

  try {
    const orden = await prisma.orden.create({
      data: {
        ...ordenData,
        detalles: detalles
          ? {
              create: detalles.map((d: { piezaId: number; cantidad: number }) => ({
                piezaId: d.piezaId,
                cantidad: d.cantidad,
              })),
            }
          : undefined,
      },
      include: { detalles: { include: { pieza: true } } },
    });
    return NextResponse.json(orden, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Error al crear orden", detail: String(e) }, { status: 400 });
  }
}
