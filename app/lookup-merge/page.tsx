"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, FileText, Upload } from "lucide-react";
import type { FiltrosMerge, PiezaMerge, ResultadoMerge } from "@/lib/excel-lookup-merge";

// Inline: evita bundlear xlsx (solo usado en el servidor) en el cliente
function generarExportCNC(piezas: PiezaMerge[]): string {
  const header = "CODIGO CORTE2\tTABLERO\tLARGO2\tANCHO2\tCANTIDAD4\tSOBRE %\tBAJO %\tVETA2\tENCHAPE";
  const dataRows = piezas
    .filter((p) => p.destino === "corte")
    .map((p) =>
      [p.codProg, p.codSAP ?? "", p.largo ?? "", p.ancho ?? "", p.cantidad, 0, 0, p.veta ?? "", p.enchape].join("\t")
    );
  return [header, "", ...dataRows].join("\n");
}

type Paso = 1 | 2 | 3 | 4;

// Filtrado client-side (no importa XLSX en el bundle)
function filtrarPiezas(piezas: PiezaMerge[], filtros: FiltrosMerge): PiezaMerge[] {
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
      if (!p.departamentos.some((d) => departamentos!.includes(d))) return false;
    }
    return true;
  });
}

function generarCodigoOrden(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ORD-${ymd}-${rand}`;
}

export default function LookupMergePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [paso, setPaso] = useState<Paso>(1);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoMerge | null>(null);
  const [filtros, setFiltros] = useState<FiltrosMerge>({ pisoDesde: null, pisoHasta: null, departamentos: [] });
  const [destinoMap, setDestinoMap] = useState<Map<string, "corte" | "stock">>(new Map());
  const [ordenData, setOrdenData] = useState({
    codigo: generarCodigoOrden(),
    cliente: "",
    proyecto: "",
    conjunto: "",
    subConjunto: "",
    colorMelamina: "",
    espesorGeneral: "",
  });
  const [confirmado, setConfirmado] = useState<{ ordenId: number; solicitudStockId: number | null } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exportCopiado, setExportCopiado] = useState(false);

  // Computed: piezas filtradas client-side
  const piezasFiltradas = useMemo(
    () => (resultado ? filtrarPiezas(resultado.piezas, filtros) : []),
    [resultado, filtros]
  );

  // Computed: piezas con destino aplicado
  const piezasConDestino = useMemo(
    () => piezasFiltradas.map((p) => ({ ...p, destino: destinoMap.get(p.codProg) ?? "corte" as const })),
    [piezasFiltradas, destinoMap]
  );

  const countCorte = piezasConDestino.filter((p) => p.destino === "corte").length;
  const countStock = piezasConDestino.filter((p) => p.destino === "stock").length;

  async function handleArchivo(file: File) {
    setArchivo(file);
    setCargando(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/lookup-merge/preview", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al procesar el archivo"); return; }
      setResultado(data as ResultadoMerge);
      setDestinoMap(new Map());
      setPaso(2);
    } catch {
      setError("Error de conexión al servidor");
    } finally {
      setCargando(false);
    }
  }

  function toggleDpto(dpto: string) {
    setFiltros((prev) => {
      const actual = prev.departamentos ?? [];
      const nuevo = actual.includes(dpto) ? actual.filter((d) => d !== dpto) : [...actual, dpto];
      return { ...prev, departamentos: nuevo };
    });
  }

  function toggleDestino(codProg: string, destino: "corte" | "stock") {
    setDestinoMap((prev) => { const next = new Map(prev); next.set(codProg, destino); return next; });
  }

  function marcarTodos(destino: "corte" | "stock") {
    const next = new Map(destinoMap);
    piezasFiltradas.forEach((p) => next.set(p.codProg, destino));
    setDestinoMap(next);
  }

  async function handleConfirmar() {
    if (!ordenData.cliente || !ordenData.proyecto) {
      setError("Cliente y Proyecto son obligatorios"); return;
    }
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/lookup-merge/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordenData: {
            ...ordenData,
            espesorGeneral: ordenData.espesorGeneral ? parseFloat(ordenData.espesorGeneral) : undefined,
          },
          piezas: piezasConDestino,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      setConfirmado(data);
      setPaso(4);
    } catch {
      setError("Error de conexión al servidor");
    } finally {
      setCargando(false);
    }
  }

  function handleExportarCopiar() {
    const txt = generarExportCNC(piezasConDestino);
    navigator.clipboard.writeText(txt).then(() => {
      setExportCopiado(true);
      setTimeout(() => setExportCopiado(false), 2500);
    });
  }

  function handleExportarDescargar() {
    const txt = generarExportCNC(piezasConDestino);
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ordenData.codigo}_corte.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stepLabel = (n: Paso, label: string) => {
    const completed = paso > n;
    const active = paso === n;

    return (
      <div className="flex items-center gap-2 text-sm font-medium">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            completed || active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {completed ? <Check className="w-3 h-3" /> : n}
        </span>
        <span className={completed || active ? "text-foreground" : "text-muted-foreground"}>
          {label}
        </span>
      </div>
    );
  };

  const stepIndicator = (
    <div className="mb-8 flex items-center gap-4">
      {stepLabel(1, "Cargar archivo")}
      <Separator className="flex-1" />
      {stepLabel(2, "Filtrar")}
      <Separator className="flex-1" />
      {stepLabel(3, "Clasificar")}
      <Separator className="flex-1" />
      {stepLabel(4, "Resultado")}
    </div>
  );

  if (paso === 1) return (
    <div>
      <PageHeader
        title="Lookup + Merge"
        description="Cruce NV_RTA × ORDEN DE FABRICACIÓN para generar lista de corte"
      />

      {stepIndicator}

      <Card
        className="cursor-pointer border-dashed"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleArchivo(f); }}
      >
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          {cargando ? (
            <p className="text-sm font-medium text-primary">Procesando archivo...</p>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <p className="font-medium">Arrastra el Excel aquí o haz clic para seleccionar</p>
              <p className="mt-1 text-sm text-muted-foreground">
                .xlsx · .xlsm · requiere hojas NV_RTA y ORDEN DE FABRICACIÓN
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xlsm,.xls"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArchivo(f); }}
      />

      {archivo && (
        <p className="mt-3 text-sm text-muted-foreground">Archivo: {archivo.name}</p>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  if (paso === 2 && resultado) return (
    <div>
      {stepIndicator}

      <Alert className="mb-6">
        <AlertDescription>
          <span className="font-semibold">{resultado.totalNvRta}</span> refs. NV_RTA ×{" "}
          <span className="font-semibold">{resultado.totalOrdenFab}</span> filas ORDEN_FAB →{" "}
          <span className="font-semibold">{resultado.piezas.length}</span> piezas totales
          {resultado.sinMatch.length > 0 && (
            <span className="ml-2 text-amber-700">({resultado.sinMatch.length} SKUs sin match)</span>
          )}
        </AlertDescription>
      </Alert>

      <Card className="mb-4">
        <CardContent>
          <label className="mb-3 block text-sm font-medium">Rango de pisos</label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Piso</span>
            <Input
              type="number"
              min="1"
              placeholder="Desde"
              value={filtros.pisoDesde ?? ""}
              onChange={(e) => setFiltros((f) => ({ ...f, pisoDesde: e.target.value ? parseInt(e.target.value) : null }))}
              className="w-20 text-center"
            />
            <span className="text-sm text-muted-foreground">a</span>
            <Input
              type="number"
              min="1"
              placeholder="Hasta"
              value={filtros.pisoHasta ?? ""}
              onChange={(e) => setFiltros((f) => ({ ...f, pisoHasta: e.target.value ? parseInt(e.target.value) : null }))}
              className="w-20 text-center"
            />
            {(filtros.pisoDesde || filtros.pisoHasta) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltros((f) => ({ ...f, pisoDesde: null, pisoHasta: null }))}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium">Departamentos</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltros((f) => ({ ...f, departamentos: [] }))}
            >
              Todos
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {resultado.departamentos.map((d) => {
              const sel = (filtros.departamentos ?? []).includes(d);
              return (
                <Badge
                  key={d}
                  variant={sel ? "default" : "outline"}
                  onClick={() => toggleDpto(d)}
                  className="cursor-pointer"
                >
                  {d}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Alert className="mb-6">
        <AlertDescription>
          Resultado del filtro: <span className="font-semibold">{piezasFiltradas.length} piezas</span>
          {filtros.departamentos && filtros.departamentos.length > 0 && (
            <span className="ml-2">· {filtros.departamentos.length} dptos seleccionados</span>
          )}
          {(filtros.pisoDesde || filtros.pisoHasta) && (
            <span className="ml-2">
              · Pisos {filtros.pisoDesde ?? "—"} a {filtros.pisoHasta ?? "—"}
            </span>
          )}
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setPaso(1)}>
          Volver
        </Button>
        <Button
          onClick={() => { setDestinoMap(new Map()); setPaso(3); }}
          disabled={piezasFiltradas.length === 0}
        >
          Siguiente ({piezasFiltradas.length} piezas)
        </Button>
      </div>
    </div>
  );

  if (paso === 3) return (
    <div>
      {stepIndicator}

      <Card className="mb-6">
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "codigo", label: "Código de Orden", required: true },
              { key: "cliente", label: "Cliente", required: true },
              { key: "proyecto", label: "Proyecto", required: true },
              { key: "conjunto", label: "Conjunto" },
              { key: "subConjunto", label: "Sub-Conjunto" },
              { key: "colorMelamina", label: "Color Melamina" },
              { key: "espesorGeneral", label: "Espesor General (mm)" },
            ].map(({ key, label, required }) => (
              <div key={key}>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {label}{required && " *"}
                </label>
                <Input
                  type={key === "espesorGeneral" ? "number" : "text"}
                  value={ordenData[key as keyof typeof ordenData]}
                  onChange={(e) => setOrdenData((o) => ({ ...o, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>
              Piezas · <span className="text-primary">{countCorte} a corte</span>
              {countStock > 0 && <span className="ml-2 text-amber-600">{countStock} a stock</span>}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => marcarTodos("corte")}>
                Todos a corte
              </Button>
              <Button variant="outline" size="sm" onClick={() => marcarTodos("stock")}>
                Todos a stock
              </Button>
            </div>
          </div>
        </CardHeader>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Prog</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tablero</TableHead>
                <TableHead className="text-right">L</TableHead>
                <TableHead className="text-right">A</TableHead>
                <TableHead className="text-right">Cant</TableHead>
                <TableHead>Destino</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {piezasConDestino.map((p) => (
                <TableRow key={p.codProg}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.codProg}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium">{p.descripcion}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.codSAP ?? "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{p.largo ?? "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{p.ancho ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">{p.cantidad}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={p.destino === "corte" ? "default" : "ghost"}
                        onClick={() => toggleDestino(p.codProg, "corte")}
                      >
                        Corte
                      </Button>
                      <Button
                        size="sm"
                        variant={p.destino === "stock" ? "default" : "ghost"}
                        className={p.destino === "stock" ? "bg-amber-500 text-white hover:bg-amber-600" : ""}
                        onClick={() => toggleDestino(p.codProg, "stock")}
                      >
                        Stock
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setPaso(2)}>
          Volver
        </Button>
        <Button onClick={handleConfirmar} disabled={cargando || countCorte === 0}>
          {cargando ? "Guardando..." : `Confirmar y Guardar (${countCorte} corte${countStock > 0 ? ` · ${countStock} stock` : ""})`}
        </Button>
      </div>
    </div>
  );

  const piezasCorte = piezasConDestino.filter((p) => p.destino === "corte");
  const previewCNC = generarExportCNC(piezasCorte).split("\n").slice(0, 7).join("\n");

  return (
    <div>
      {stepIndicator}

      <div className="mb-8 grid grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent>
            <p className="mb-1 text-xs font-semibold text-green-700">Orden de Fabricación creada</p>
            <p className="mb-3 text-lg font-bold text-green-800">{ordenData.codigo}</p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/ordenes/${confirmado?.ordenId}`}>Ver Orden</Link>
            </Button>
          </CardContent>
        </Card>

        {confirmado?.solicitudStockId ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent>
              <p className="mb-1 text-xs font-semibold text-amber-700">Solicitud de Stock creada</p>
              <p className="mb-3 text-lg font-bold text-amber-800">{countStock} piezas</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/solicitudes/${confirmado.solicitudStockId}/documento`}>
                  Ver Solicitud
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Sin piezas de stock</p>
            </CardContent>
          </Card>
        )}
      </div>

      {piezasCorte.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export para máquina CNC</CardTitle>
            <p className="text-xs text-muted-foreground">
              {piezasCorte.length} piezas a corte · Fila en blanco incluida después del header
            </p>
          </CardHeader>
          <CardContent>
            <pre className="mb-4 overflow-x-auto rounded-lg bg-[oklch(0.145_0_0)] p-4 font-mono text-xs leading-5 text-green-400">
              {previewCNC}
              {piezasCorte.length > 5 && `\n... (${piezasCorte.length - 4} filas más)`}
            </pre>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportarCopiar}>
                {exportCopiado ? "Copiado" : "Copiar al portapapeles"}
              </Button>
              <Button onClick={handleExportarDescargar}>
                Descargar .txt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="ghost" onClick={() => router.push("/ordenes")} className="mt-6">
        Ir a Órdenes
      </Button>
    </div>
  );
}
