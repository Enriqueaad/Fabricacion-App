"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Pieza { id: number; codigo: string; descripcion: string; tipoMaterial: string; }
interface Detalle { pieza: Pieza; cantidad: number; }

export default function NuevaOrdenPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigo: "", cliente: "", proyecto: "", conjunto: "",
    subConjunto: "", colorMelamina: "", espesorGeneral: "", tapacantoGeneral: "",
  });
  const [detalles, setDetalles] = useState<Detalle[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Pieza[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const buscarPiezas = async (q: string) => {
    setBusqueda(q);
    if (q.length < 2) { setResultados([]); return; }
    const res = await fetch(`/api/piezas?buscar=${q}&porPagina=10`);
    const data = await res.json();
    setResultados(data.piezas);
  };

  const agregarPieza = (pieza: Pieza) => {
    if (detalles.find((d) => d.pieza.id === pieza.id)) return;
    setDetalles([...detalles, { pieza, cantidad: 1 }]);
    setBusqueda(""); setResultados([]);
  };

  const actualizarCantidad = (id: number, cantidad: number) => {
    setDetalles(detalles.map((d) => d.pieza.id === id ? { ...d, cantidad } : d));
  };

  const eliminarDetalle = (id: number) => {
    setDetalles(detalles.filter((d) => d.pieza.id !== id));
  };

  const guardar = async () => {
    if (!form.codigo || !form.cliente || !form.proyecto) {
      setError("Código, cliente y proyecto son obligatorios"); return;
    }
    setGuardando(true); setError("");
    const res = await fetch("/api/ordenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        espesorGeneral: form.espesorGeneral ? parseFloat(form.espesorGeneral) : null,
        detalles: detalles.map((d) => ({ piezaId: d.pieza.id, cantidad: d.cantidad })),
      }),
    });
    const data = await res.json();
    if (res.ok) { router.push(`/ordenes/${data.id}`); }
    else { setError(data.error ?? "Error al guardar"); setGuardando(false); }
  };

  return (
    <div>
      <PageHeader title="Nueva Orden" />

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["codigo", "Código (ej: EL_ROBLE_COC_VA_BATCH1)"],
              ["cliente", "Cliente"],
              ["proyecto", "Proyecto"],
              ["conjunto", "Conjunto"],
              ["subConjunto", "Sub-Conjunto"],
              ["colorMelamina", "Color Melamina"],
              ["espesorGeneral", "Espesor (mm)"],
              ["tapacantoGeneral", "Tapacanto"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm text-muted-foreground mb-1">
                  {label}
                </label>
                <Input
                  type={key === "espesorGeneral" ? "number" : "text"}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar pieza por código o descripción..."
              value={busqueda}
              onChange={(e) => buscarPiezas(e.target.value)}
            />
            {resultados.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-md">
                {resultados.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => agregarPieza(p)}
                    className="w-full border-b px-3 py-2 text-left text-sm last:border-0 hover:bg-muted"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {p.codigo}
                    </span>
                    {" - "}
                    {p.descripcion}
                    <Badge variant="secondary" className="ml-2">
                      {p.tipoMaterial}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-24">Cantidad</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {detalles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Busca y agrega piezas
                </TableCell>
              </TableRow>
            ) : (
              detalles.map((d) => (
                <TableRow key={d.pieza.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {d.pieza.codigo}
                  </TableCell>
                  <TableCell className="font-medium">{d.pieza.descripcion}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{d.pieza.tipoMaterial}</Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={d.cantidad}
                      onChange={(e) => actualizarCantidad(d.pieza.id, parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminarDetalle(d.pieza.id)}
                      aria-label="Eliminar pieza"
                    >
                      ×
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex gap-2">
        <Button onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar Orden"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
