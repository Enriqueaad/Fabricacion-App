import * as XLSX from "xlsx";
import { norm, buscarColumna, aBooleano, aNumero } from "@/lib/excel-utils";

// ---------------------------------------------------------------------------
// Interfaces públicas
// ---------------------------------------------------------------------------

export interface FiltrosMerge {
  pisoDesde?: number | null;
  pisoHasta?: number | null;
  departamentos?: string[]; // vacío = todos
}

export interface PiezaMerge {
  codProg: string;        // COD PROG (o sintético) → CODIGO CORTE2
  codSAP: string | null;  // COD SAP → TABLERO en export CNC
  descripcion: string;    // DESCRIP PIEZA
  tipo: string;           // TIPO MEL
  colorMel: string | null;
  espesorMel: number | null;
  largo: number | null;
  ancho: number | null;
  cantidad: number;       // Σ(Recuento × CANT_BASE)
  veta: string | null;
  enchape: string;        // 4 chars: (tapL?"11":"00")+(tapA?"11":"00")
  ranura: boolean;
  mecanizado: boolean;
  perforado: boolean;
  pisos: string[];
  departamentos: string[];
  destino: "corte" | "stock"; // default "corte"
}

export interface ResultadoMerge {
  piezas: PiezaMerge[];
  sinMatch: string[];      // SKUs NV_RTA sin match en ORDEN_DE_FABRICACION
  errores: string[];
  pisos: string[];         // valores únicos ordenados para chips de filtro
  departamentos: string[]; // valores únicos ordenados para chips de filtro
  totalNvRta: number;
  totalOrdenFab: number;
}

// ---------------------------------------------------------------------------
// Interfaces internas
// ---------------------------------------------------------------------------

interface FilaNvRta {
  sku: string;
  recuento: number;
  piso: string;
  departamento: string;
}

interface FilaOrdenFab {
  codPT: string;
  codProg: string;
  codSAP: string | null;
  descripcion: string; // DESCRIP PIEZA
  tipo: string;
  colorMel: string | null;
  espesorMel: number | null;
  largo: number | null;
  ancho: number | null;
  cantBase: number;
  veta: string | null;
  ranura: boolean;
  mecanizado: boolean;
  perforado: boolean;
  tapL: string | null;
  tapA: string | null;
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

const NV_HEADERS = {
  recuento:     ["RECUENTO"],
  sku:          ["SKU"],
  piso:         ["PISO"],
  departamento: ["DEPARTAMENTO"],
};

export function parsearNvRta(rows: unknown[][]): { filas: FilaNvRta[]; errores: string[] } {
  const errores: string[] = [];
  if (rows.length === 0) return { filas: [], errores: ["Hoja NV_RTA vacía"] };

  const headerRow = rows[0] as unknown[];
  const col = {
    recuento:     buscarColumna(headerRow, NV_HEADERS.recuento),
    sku:          buscarColumna(headerRow, NV_HEADERS.sku),
    piso:         buscarColumna(headerRow, NV_HEADERS.piso),
    departamento: buscarColumna(headerRow, NV_HEADERS.departamento),
  };

  const filas: FilaNvRta[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    const sku = String(r[col.sku] ?? "").trim();
    if (!sku) continue;
    const recuento = aNumero(r[col.recuento]) ?? 1;
    filas.push({
      sku,
      recuento,
      piso: String(r[col.piso] ?? "").trim(),
      departamento: String(r[col.departamento] ?? "").trim(),
    });
  }
  return { filas, errores };
}

const OF_HEADERS = {
  codPT:        ["COD PT"],
  codProg:      ["COD PROG"],
  codSAP:       ["COD SAP"],
  descripcion:  ["DESCRIP PIEZA"],
  tipo:         ["TIPO", "TIPO MEL"],
  colorMel:     ["COLOR MEL"],
  espesorMel:   ["ESPESOR MEL"],
  largo:        ["LARGO"],
  ancho:        ["ANCHO"],
  cantBase:     ["CANT BASE"],
  veta:         ["VETA"],
  ranura:       ["RANURA"],
  mecanizado:   ["MECANIZADO"],
  perforado:    ["PERFORADO"],
  tapL:         ["L"],
  tapA:         ["A"],
};

export function parsearOrdenFabricacion(rows: unknown[][]): { filas: FilaOrdenFab[]; errores: string[] } {
  const errores: string[] = [];
  if (rows.length < 4) return { filas: [], errores: ["Hoja ORDEN DE FABRICACIÓN con pocas filas"] };

  // Fila 0 = headers reales. Filas 1 y 2 = metadatos (skip). Datos desde fila 3.
  const headerRow = rows[0] as unknown[];
  const col = {} as Record<keyof typeof OF_HEADERS, number>;
  (Object.keys(OF_HEADERS) as (keyof typeof OF_HEADERS)[]).forEach((key) => {
    col[key] = buscarColumna(headerRow, OF_HEADERS[key]);
  });

  const filas: FilaOrdenFab[] = [];
  let sinProgIdx = 0;

  for (let i = 3; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    const codPT = String(r[col.codPT] ?? "").trim();
    const descripcion = String(r[col.descripcion] ?? "").trim();
    if (!codPT || !descripcion) continue;

    let codProg = String(r[col.codProg] ?? "").trim();
    if (!codProg) {
      // Generar código sintético igual al patrón del software CNC (COD_00_())
      const abrev = descripcion.replace(/\s+/g, "_").substring(0, 20).toUpperCase();
      codProg = `COD_${String(sinProgIdx).padStart(2, "0")}_${abrev}`;
      sinProgIdx++;
    }

    filas.push({
      codPT,
      codProg,
      codSAP: col.codSAP >= 0 ? (String(r[col.codSAP] ?? "").trim() || null) : null,
      descripcion,
      tipo: String(r[col.tipo] ?? "").trim(),
      colorMel: col.colorMel >= 0 ? (String(r[col.colorMel] ?? "").trim() || null) : null,
      espesorMel: col.espesorMel >= 0 ? aNumero(r[col.espesorMel]) : null,
      largo: col.largo >= 0 ? aNumero(r[col.largo]) : null,
      ancho: col.ancho >= 0 ? aNumero(r[col.ancho]) : null,
      cantBase: aNumero(r[col.cantBase]) ?? 1,
      veta: col.veta >= 0 ? (String(r[col.veta] ?? "").trim() || null) : null,
      ranura:    col.ranura    >= 0 ? aBooleano(r[col.ranura])    : false,
      mecanizado: col.mecanizado >= 0 ? aBooleano(r[col.mecanizado]) : false,
      perforado: col.perforado >= 0 ? aBooleano(r[col.perforado]) : false,
      tapL: col.tapL >= 0 ? (String(r[col.tapL] ?? "").trim() || null) : null,
      tapA: col.tapA >= 0 ? (String(r[col.tapA] ?? "").trim() || null) : null,
    });
  }

  if (filas.length === 0) {
    errores.push("No se encontraron piezas en ORDEN DE FABRICACIÓN");
  }
  return { filas, errores };
}

// ---------------------------------------------------------------------------
// Motor del Lookup + Merge
// ---------------------------------------------------------------------------

function derivarEnchape(tapL: string | null, tapA: string | null): string {
  const l = aBooleano(tapL);
  const a = aBooleano(tapA);
  return (l ? "11" : "00") + (a ? "11" : "00");
}

export function merge(nvRta: FilaNvRta[], ordenFab: FilaOrdenFab[]): ResultadoMerge {
  // Agrupar NV_RTA por SKU → Map<sku, { totalRecuento, pisos[], dptos[] }>
  const nvMap = new Map<string, { recuento: number; pisos: Set<string>; dptos: Set<string> }>();
  for (const fila of nvRta) {
    const key = fila.sku;
    if (!nvMap.has(key)) nvMap.set(key, { recuento: 0, pisos: new Set(), dptos: new Set() });
    const entry = nvMap.get(key)!;
    entry.recuento += fila.recuento;
    if (fila.piso) entry.pisos.add(fila.piso);
    if (fila.departamento) entry.dptos.add(fila.departamento);
  }

  // Acumular piezas por COD PROG → Map<codProg, PiezaMerge>
  const piezaMap = new Map<string, PiezaMerge>();
  const sinMatch = new Set<string>();

  for (const fila of ordenFab) {
    const nvEntry = nvMap.get(fila.codPT);
    if (!nvEntry) {
      sinMatch.add(fila.codPT);
      continue;
    }

    const cantidadAdicional = nvEntry.recuento * fila.cantBase;
    const existing = piezaMap.get(fila.codProg);

    if (existing) {
      existing.cantidad += cantidadAdicional;
      nvEntry.pisos.forEach((p) => existing.pisos.push(p));
      nvEntry.dptos.forEach((d) => existing.departamentos.push(d));
      // Deduplicar arrays
      existing.pisos = [...new Set(existing.pisos)];
      existing.departamentos = [...new Set(existing.departamentos)];
    } else {
      piezaMap.set(fila.codProg, {
        codProg: fila.codProg,
        codSAP: fila.codSAP,
        descripcion: fila.descripcion,
        tipo: fila.tipo,
        colorMel: fila.colorMel,
        espesorMel: fila.espesorMel,
        largo: fila.largo,
        ancho: fila.ancho,
        cantidad: cantidadAdicional,
        veta: fila.veta,
        enchape: derivarEnchape(fila.tapL, fila.tapA),
        ranura: fila.ranura,
        mecanizado: fila.mecanizado,
        perforado: fila.perforado,
        pisos: [...nvEntry.pisos],
        departamentos: [...nvEntry.dptos],
        destino: "corte",
      });
    }
  }

  const piezas = Array.from(piezaMap.values());

  // Construir listas únicas para la UI de filtros
  const pisosSet = new Set<string>();
  const dptosSet = new Set<string>();
  for (const fila of nvRta) {
    if (fila.piso) pisosSet.add(fila.piso);
    if (fila.departamento) dptosSet.add(fila.departamento);
  }

  const sortNum = (a: string, b: string) => {
    const na = parseFloat(a), nb = parseFloat(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  };

  return {
    piezas,
    sinMatch: [...sinMatch],
    errores: [],
    pisos: [...pisosSet].sort(sortNum),
    departamentos: [...dptosSet].sort(sortNum),
    totalNvRta: nvRta.length,
    totalOrdenFab: ordenFab.length,
  };
}

// ---------------------------------------------------------------------------
// Filtros (función pura, se usa client-side sin round-trip)
// ---------------------------------------------------------------------------

export function aplicarFiltros(piezas: PiezaMerge[], filtros: FiltrosMerge): PiezaMerge[] {
  const { pisoDesde, pisoHasta, departamentos } = filtros;
  const filtraPiso = pisoDesde != null || pisoHasta != null;
  const filtraDpto = departamentos && departamentos.length > 0;

  if (!filtraPiso && !filtraDpto) return piezas;

  return piezas.filter((p) => {
    if (filtraPiso) {
      const enRango = p.pisos.some((ps) => {
        const n = parseFloat(ps);
        if (isNaN(n)) return false;
        if (pisoDesde != null && n < pisoDesde) return false;
        if (pisoHasta != null && n > pisoHasta) return false;
        return true;
      });
      if (!enRango) return false;
    }
    if (filtraDpto) {
      const enDpto = p.departamentos.some((d) => departamentos!.includes(d));
      if (!enDpto) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Entry point para las API routes
// ---------------------------------------------------------------------------

export async function procesarDesdeBuffer(
  buffer: ArrayBuffer,
  filtros?: FiltrosMerge
): Promise<ResultadoMerge> {
  const wb = XLSX.read(buffer, { type: "array" });

  // Detectar hojas (case-insensitive)
  const nvRtaName = wb.SheetNames.find((n) => norm(n) === "NV_RTA");
  const ordenFabName = wb.SheetNames.find(
    (n) => norm(n).includes("ORDEN") && norm(n).includes("FABRICACI")
  );

  const errores: string[] = [];

  if (!nvRtaName) errores.push('No se encontró la hoja "NV_RTA"');
  if (!ordenFabName) errores.push('No se encontró la hoja "ORDEN DE FABRICACIÓN"');
  if (errores.length > 0) {
    return {
      piezas: [], sinMatch: [], errores,
      pisos: [], departamentos: [], totalNvRta: 0, totalOrdenFab: 0,
    };
  }

  const nvRows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[nvRtaName!], {
    header: 1, defval: null, raw: false,
  });
  const ofRows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[ordenFabName!], {
    header: 1, defval: null, raw: false,
  });

  const { filas: nvRta, errores: nvErr } = parsearNvRta(nvRows as unknown[][]);
  const { filas: ordenFab, errores: ofErr } = parsearOrdenFabricacion(ofRows as unknown[][]);

  const resultado = merge(nvRta, ordenFab);
  resultado.errores.push(...nvErr, ...ofErr);

  if (filtros) {
    resultado.piezas = aplicarFiltros(resultado.piezas, filtros);
  }

  return resultado;
}

// ---------------------------------------------------------------------------
// Export CNC
// ---------------------------------------------------------------------------

export function generarExportCNC(piezas: PiezaMerge[]): string {
  const header = "CODIGO CORTE2\tTABLERO\tLARGO2\tANCHO2\tCANTIDAD4\tSOBRE %\tBAJO %\tVETA2\tENCHAPE";
  const dataRows = piezas
    .filter((p) => p.destino === "corte")
    .map((p) =>
      [
        p.codProg,
        p.codSAP ?? "",
        p.largo ?? "",
        p.ancho ?? "",
        p.cantidad,
        0,
        0,
        p.veta ?? "",
        p.enchape,
      ].join("\t")
    );
  // Fila en blanco SIEMPRE entre el header y la primera pieza
  return [header, "", ...dataRows].join("\n");
}
