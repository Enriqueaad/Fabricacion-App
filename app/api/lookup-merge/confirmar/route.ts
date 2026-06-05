import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generarSolicitudStock } from "@/lib/solicitud-stock-engine";
import type { PiezaMerge } from "@/lib/excel-lookup-merge";

interface OrdenData {
  codigo: string;
  cliente: string;
  proyecto: string;
  conjunto?: string;
  subConjunto?: string;
  colorMelamina?: string;
  espesorGeneral?: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { ordenData: OrdenData; piezas: PiezaMerge[] };
  const { ordenData, piezas } = body;

  if (!ordenData?.codigo || !ordenData?.cliente || !ordenData?.proyecto) {
    return NextResponse.json({ error: "Faltan datos obligatorios de la orden" }, { status: 400 });
  }
  if (!piezas || piezas.length === 0) {
    return NextResponse.json({ error: "No hay piezas para procesar" }, { status: 400 });
  }

  const piezasCorte = piezas.filter((p) => p.destino === "corte");
  const piezasStock = piezas.filter((p) => p.destino === "stock");

  // 1. Upsert todas las piezas al catálogo
  let insertadas = 0;
  let actualizadas = 0;
  const piezaIds: Map<string, number> = new Map();

  for (const p of piezasCorte) {
    const datos = {
      codigo: p.codProg,
      descripcion: p.descripcion,
      tipoMaterial: p.tipo || "MEL",
      color: p.colorMel,
      espesor: p.espesorMel,
      largo: p.largo,
      ancho: p.ancho,
      veta: p.veta,
      ranura: p.ranura,
      mecanizado: p.mecanizado,
      perforado: p.perforado,
      codigoTablero: p.codSAP,
    };

    const existe = await prisma.pieza.findUnique({ where: { codigo: datos.codigo } });
    if (existe) {
      await prisma.pieza.update({ where: { codigo: datos.codigo }, data: datos });
      piezaIds.set(datos.codigo, existe.id);
      actualizadas++;
    } else {
      const nueva = await prisma.pieza.create({ data: datos });
      piezaIds.set(datos.codigo, nueva.id);
      insertadas++;
    }
  }

  // 2. Crear Orden con DetalleOrden (solo piezas corte)
  const orden = await prisma.orden.create({
    data: {
      codigo: ordenData.codigo,
      cliente: ordenData.cliente,
      proyecto: ordenData.proyecto,
      conjunto: ordenData.conjunto ?? null,
      subConjunto: ordenData.subConjunto ?? null,
      colorMelamina: ordenData.colorMelamina ?? null,
      espesorGeneral: ordenData.espesorGeneral ?? null,
      estado: "BORRADOR",
      detalles: {
        create: piezasCorte.map((p) => ({
          piezaId: piezaIds.get(p.codProg)!,
          cantidad: p.cantidad,
        })),
      },
    },
  });

  // 3. Crear SolicitudStock si hay piezas stock
  let solicitudStockId: number | null = null;
  if (piezasStock.length > 0) {
    const datos = generarSolicitudStock(ordenData, piezasStock);
    const solicitud = await prisma.solicitudStock.create({
      data: {
        ordenId: orden.id,
        snapshotData: JSON.stringify(datos),
        totalPiezas: piezasStock.length,
      },
    });
    solicitudStockId = solicitud.id;
  }

  return NextResponse.json({
    ordenId: orden.id,
    solicitudStockId,
    piezasInsertadas: insertadas,
    piezasActualizadas: actualizadas,
  });
}
