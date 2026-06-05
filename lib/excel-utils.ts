/** Normaliza un valor a string en mayúsculas sin espacios extremos. */
export function norm(v: unknown): string {
  return String(v ?? "").trim().toUpperCase();
}

/** Busca el índice de la primera columna cuyo encabezado coincida con alguno de los alias. */
export function buscarColumna(headerRow: unknown[], alias: string[]): number {
  const aliasNorm = alias.map((a) => a.toUpperCase());
  for (let c = 0; c < headerRow.length; c++) {
    if (aliasNorm.includes(norm(headerRow[c]))) return c;
  }
  return -1;
}

/** Convierte valores de proceso ("<", "AC<16", números, etc.) a booleano. */
export function aBooleano(v: unknown): boolean {
  const s = norm(v);
  if (!s || s === "0" || s === "NO" || s === "N/A" || s === "NULL") return false;
  return true;
}

/** Convierte un valor a número, acepta comas decimales. Devuelve null si no es válido. */
export function aNumero(v: unknown): number | null {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
}
