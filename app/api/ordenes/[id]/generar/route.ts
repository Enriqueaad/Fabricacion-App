import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generarHojaDeRuta } from "@/lib/hoja-de-ruta-engine";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const orden = await prisma.orden.findUnique({
    where: { id: parseInt(id) },
    include: { detalles: { include: { pieza: true } } },
  });

  if (!orden) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

  const datos = generarHojaDeRuta(orden);

  const hoja = await prisma.hojaDeRuta.create({
    data: {
      ordenId: orden.id,
      snapshotData: JSON.stringify(datos),
      totalPaginas: datos.paginas.length,
    },
  });

  return NextResponse.json({ hoja, datos });
}
