import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orden = await prisma.orden.findUnique({
    where: { id: parseInt(id) },
    include: {
      detalles: { include: { pieza: true }, orderBy: { pieza: { codigo: "asc" } } },
      hojasDeRuta: { orderBy: { generadoEn: "desc" } },
    },
  });
  if (!orden) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(orden);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { detalles, ...data } = await req.json();

  const orden = await prisma.orden.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      detalles: detalles
        ? {
            deleteMany: {},
            create: detalles.map((d: { piezaId: number; cantidad: number }) => ({
              piezaId: d.piezaId,
              cantidad: d.cantidad,
            })),
          }
        : undefined,
    },
    include: { detalles: { include: { pieza: true } } },
  });
  return NextResponse.json(orden);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.orden.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
