import * as XLSX from "xlsx";
import { norm, buscarColumna, aBooleano, aNumero } from "@/lib/excel-utils";

export interface PiezaImportada {
  codigo: string;
  descripcion: string;
  tipoMaterial: string;
  color: string | null;
  espesor: number | null;
  largo: number | null;
  ancho: number | null;
  veta: string | null;
  ranura: boolean;
  mecanizado: boolean;
  perforado: boolean;
  // Contexto de proyecto (de la hoja BASE)
  proyecto: string | null;
  conjunto: string | null;
  subConjunto: string | null;
  cantidadFabricar: number | null;
  rawData: string;
}

export interface ResultadoImport {
  piezas: PiezaImportada[];
  errores: string[];
  hojaUsada: string;
  totalFilas: number;
  encabezadosDetectados: Record<string, number>;
}

// Nombres de encabezado esperados en la hoja BASE (fila de encabezados)
// Se busca por coincidencia EXACTA (trim, mayúsculas) tomando la primera columna que calce.
const HEADERS = {
  proyecto: ["CONSTRUCTORA/PROYETO", "CONSTRUCTORA/PROYECTO", "PROYECTO"],
  conjunto: ["CONJUNTO"],
  subConjunto: ["SUB-CONJUNTO", "SUBCONJUNTO"],
  cantidadFabricar: ["FABRICAR"],
  tipoMaterial: ["TIPO"],
  color: ["COLOR MEL"],
  espesor: ["ESPESOR MEL"],
  largo: ["LARGO"],
  ancho: ["ANCHO"],
  cantBase: ["CANT BASE"],
  veta: ["VETA"],
  descripcion: ["DESCRIP PIEZA", "PIEZA"],
  codigo: ["COD PROG"],
  ranura: ["RANURA"],
  mecanizado: ["MECANIZADO"],
  perforado: ["PERFORADO"],
};


export async function importarPiezasDesdeBuffer(
  buffer: ArrayBuffer
): Promise<ResultadoImport> {
  const wb = XLSX.read(buffer, { type: "array" });

  const wsName =
    wb.SheetNames.find((n) => n.toUpperCase() === "BASE") ||
    wb.SheetNames.find((n) => n.toUpperCase() === "DATOS") ||
    wb.SheetNames[0];

  const ws = wb.Sheets[wsName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: null,
    raw: false,
  });

  // Detectar fila de encabezados: la que contenga "DESCRIPCION" o "COD PT" o "TIPO"
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(15, rows.length); i++) {
    const row = rows[i] as unknown[];
    const set = row.map(norm);
    if (set.includes("TIPO") && (set.includes("DESCRIPCION") || set.includes("COD PT"))) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    return {
      piezas: [],
      errores: [`No se encontró la fila de encabezados en la hoja "${wsName}".`],
      hojaUsada: wsName,
      totalFilas: rows.length,
      encabezadosDetectados: {},
    };
  }

  const headerRow = rows[headerRowIndex] as unknown[];

  // Resolver índices por nombre
  const col: Record<keyof typeof HEADERS, number> = {} as Record<keyof typeof HEADERS, number>;
  const encabezadosDetectados: Record<string, number> = {};
  (Object.keys(HEADERS) as (keyof typeof HEADERS)[]).forEach((key) => {
    const idx = buscarColumna(headerRow, HEADERS[key]);
    col[key] = idx;
    encabezadosDetectados[key] = idx;
  });

  const dataRows = rows.slice(headerRowIndex + 1);
  const piezas: PiezaImportada[] = [];
  const errores: string[] = [];
  const codigosVistos = new Map<string, number>();

  dataRows.forEach((row, idx) => {
    const r = row as unknown[];
    const descripcion = String(r[col.descripcion] ?? "").trim();
    const tipoMaterial = String(r[col.tipoMaterial] ?? "").trim();

    // Solo filas que tengan descripción de pieza y un tipo
    if (!descripcion || !tipoMaterial) return;

    // Código: COD PROG si existe; si no, sintético basado en descripción+dimensiones
    let codigo = String(r[col.codigo] ?? "").trim();
    const largo = aNumero(r[col.largo]);
    const ancho = aNumero(r[col.ancho]);

    if (!codigo) {
      codigo = `${descripcion.replace(/\s+/g, "_")}_${largo ?? "X"}x${ancho ?? "X"}`.toUpperCase();
    }

    // Asegurar unicidad: si el código se repite, deduplicamos (mismo código = misma pieza)
    // pero si las descripciones difieren, añadimos sufijo.
    const visto = codigosVistos.get(codigo);
    if (visto !== undefined) {
      // Ya existe: lo tratamos como duplicado y lo omitimos (catálogo deduplicado)
      codigosVistos.set(codigo, visto + 1);
      return;
    }
    codigosVistos.set(codigo, 1);

    try {
      piezas.push({
        codigo,
        descripcion,
        tipoMaterial,
        color: r[col.color] ? String(r[col.color]).trim() : null,
        espesor: aNumero(r[col.espesor]),
        largo,
        ancho,
        veta: r[col.veta] ? String(r[col.veta]).trim() : null,
        ranura: col.ranura >= 0 ? aBooleano(r[col.ranura]) : false,
        mecanizado: col.mecanizado >= 0 ? aBooleano(r[col.mecanizado]) : false,
        perforado: col.perforado >= 0 ? aBooleano(r[col.perforado]) : false,
        proyecto: r[col.proyecto] ? String(r[col.proyecto]).trim() : null,
        conjunto: r[col.conjunto] ? String(r[col.conjunto]).trim() : null,
        subConjunto: r[col.subConjunto] ? String(r[col.subConjunto]).trim() : null,
        cantidadFabricar: aNumero(r[col.cantidadFabricar] ?? r[col.cantBase]),
        rawData: JSON.stringify(r),
      });
    } catch {
      errores.push(`Fila ${idx + headerRowIndex + 2}: error al procesar`);
    }
  });

  return {
    piezas,
    errores,
    hojaUsada: wsName,
    totalFilas: dataRows.length,
    encabezadosDetectados,
  };
}
