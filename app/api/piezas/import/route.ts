import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { importarPiezasDesdeBuffer, PiezaImportada } from "@/lib/excel-import";

// Extrae solo los campos que existen en el modelo Pieza
function aDatosPieza(p: PiezaImportada) {
  return {
    codigo: p.codigo,
    descripcion: p.descripcion,
    tipoMaterial: p.tipoMaterial,
    color: p.color,
    espesor: p.espesor,
    largo: p.largo,
    ancho: p.ancho,
    veta: p.veta,
    ranura: p.ranura,
    mecanizado: p.mecanizado,
    perforado: p.perforado,
    rawData: p.rawData,
  };
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const resultado = await importarPiezasDesdeBuffer(buffer);
  const { piezas, errores, hojaUsada, encabezadosDetectados } = resultado;

  if (piezas.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron piezas", errores, hojaUsada, encabezadosDetectados },
      { status: 400 }
    );
  }

  // Preview: devolver primeras filas sin guardar
  const preview = formData.get("preview") === "true";
  if (preview) {
    return NextResponse.json({
      preview: piezas.slice(0, 8),
      total: piezas.length,
      errores,
      hojaUsada,
      encabezadosDetectados,
    });
  }

  // Upsert masivo
  let insertadas = 0;
  let actualizadas = 0;

  for (const pieza of piezas) {
    const datos = aDatosPieza(pieza);
    const existe = await prisma.pieza.findUnique({ where: { codigo: datos.codigo } });
    if (existe) {
      await prisma.pieza.update({ where: { codigo: datos.codigo }, data: datos });
      actualizadas++;
    } else {
      await prisma.pieza.create({ data: datos });
      insertadas++;
    }
  }

  return NextResponse.json({
    insertadas,
    actualizadas,
    errores,
    total: piezas.length,
    hojaUsada,
  });
}
