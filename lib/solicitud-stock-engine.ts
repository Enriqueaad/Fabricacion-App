import type { PiezaMerge } from "@/lib/excel-lookup-merge";

export interface FilaStock {
  codProg: string;
  descripcion: string;
  largo: number | null;
  ancho: number | null;
  cantidad: number;
  colorMel: string | null;
  espesorMel: number | null;
}

export interface DatosSolicitudStock {
  ordenCodigo: string;
  cliente: string;
  proyecto: string;
  conjunto: string;
  fecha: string;
  totalPiezas: number;
  piezas: FilaStock[];
}

export function generarSolicitudStock(
  ordenData: { codigo: string; cliente: string; proyecto: string; conjunto?: string },
  piezasStock: PiezaMerge[]
): DatosSolicitudStock {
  const piezas: FilaStock[] = piezasStock.map((p) => ({
    codProg: p.codProg,
    descripcion: p.descripcion,
    largo: p.largo,
    ancho: p.ancho,
    cantidad: p.cantidad,
    colorMel: p.colorMel,
    espesorMel: p.espesorMel,
  }));

  return {
    ordenCodigo: ordenData.codigo,
    cliente: ordenData.cliente,
    proyecto: ordenData.proyecto,
    conjunto: ordenData.conjunto ?? "",
    fecha: new Date().toLocaleDateString("es-CL"),
    totalPiezas: piezas.length,
    piezas,
  };
}
