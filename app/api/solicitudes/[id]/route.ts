import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const solicitud = await prisma.solicitudStock.findUnique({
    where: { id: parseInt(id) },
    include: { orden: true },
  });
  if (!solicitud) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(solicitud);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.solicitudStock.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
