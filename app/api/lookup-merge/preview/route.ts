import { NextRequest, NextResponse } from "next/server";
import { procesarDesdeBuffer, type FiltrosMerge } from "@/lib/excel-lookup-merge";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
  }

  let filtros: FiltrosMerge | undefined;
  const filtrosRaw = formData.get("filtros");
  if (filtrosRaw) {
    try { filtros = JSON.parse(String(filtrosRaw)); } catch { /* ignorar */ }
  }

  const buffer = await file.arrayBuffer();
  const resultado = await procesarDesdeBuffer(buffer, filtros);

  if (resultado.errores.length > 0 && resultado.piezas.length === 0) {
    return NextResponse.json({ error: resultado.errores[0], errores: resultado.errores }, { status: 400 });
  }

  return NextResponse.json(resultado);
}
