import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buscar = searchParams.get("buscar") ?? "";
  const tipo = searchParams.get("tipo") ?? "";
  const pagina = parseInt(searchParams.get("pagina") ?? "1");
  const porPagina = 50;

  const where = {
    AND: [
      buscar ? {
        OR: [
          { codigo: { contains: buscar } },
          { descripcion: { contains: buscar } },
        ],
      } : {},
      tipo ? { tipoMaterial: tipo } : {},
    ],
  };

  const [piezas, total] = await Promise.all([
    prisma.pieza.findMany({
      where,
      orderBy: { codigo: "asc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.pieza.count({ where }),
  ]);

  return NextResponse.json({ piezas, total, pagina, porPagina });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  try {
    const pieza = await prisma.pieza.create({ data });
    return NextResponse.json(pieza, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Error al crear pieza", detail: String(e) }, { status: 400 });
  }
}
