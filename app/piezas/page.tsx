"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface Pieza {
  id: number;
  codigo: string;
  descripcion: string;
  tipoMaterial: string;
  largo: number | null;
  ancho: number | null;
  color: string | null;
}

export default function PiezasPage() {
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [total, setTotal] = useState(0);
  const [buscar, setBuscar] = useState("");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajeError, setMensajeError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const cargar = async () => {
    setCargando(true);
    const res = await fetch(`/api/piezas?buscar=${buscar}&pagina=${pagina}`);
    const data = await res.json();
    setPiezas(data.piezas);
    setTotal(data.total);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, [buscar, pagina]);

  const importarExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportando(true);
    setMensajeError(false);
    setMensaje("Importando...");

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/piezas/import", { method: "POST", body: fd });
    const data = await res.json();

    if (res.ok) {
      setMensaje(`${data.insertadas} insertadas, ${data.actualizadas} actualizadas de ${data.total} total`);
      setMensajeError(false);
      cargar();
    } else {
      setMensaje(`${data.error}: ${data.errores?.join(", ")}`);
      setMensajeError(true);
    }
    setImportando(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const totalPaginas = Math.ceil(total / 50);

  return (
    <div>
      <PageHeader
        title="Piezas"
        actions={
          <>
            <Input
              placeholder="Buscar por código o descripción..."
              value={buscar}
              onChange={(e) => { setBuscar(e.target.value); setPagina(1); }}
              className="w-72"
            />
            <input
              type="file"
              accept=".xlsx,.xlsm,.xls"
              ref={fileRef}
              onChange={importarExcel}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={importando}
            >
              {importando ? "Importando..." : "Importar Excel"}
            </Button>
          </>
        }
      />

      {mensaje && (
        <Alert variant={mensajeError ? "destructive" : "default"} className="mb-4">
          <AlertDescription>{mensaje}</AlertDescription>
        </Alert>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Largo</TableHead>
              <TableHead>Ancho</TableHead>
              <TableHead>Color</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : piezas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No hay piezas. Importa el archivo Excel para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              piezas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.codigo}
                  </TableCell>
                  <TableCell className="font-medium">{p.descripcion}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.tipoMaterial}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.largo ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.ancho ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.color ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {total > 50 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >
            Anterior
          </Button>
          <span className="px-3 py-1 text-sm text-muted-foreground">
            Pág {pagina} de {totalPaginas}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina((p) => p + 1)}
            disabled={pagina >= totalPaginas}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
