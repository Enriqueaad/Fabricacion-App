import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GenerarHRButton from "./GenerarHRButton";

export default async function OrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orden = await prisma.orden.findUnique({
    where: { id: parseInt(id) },
    include: {
      detalles: { include: { pieza: true }, orderBy: { pieza: { codigo: "asc" } } },
      hojasDeRuta: { orderBy: { generadoEn: "desc" } },
    },
  });

  if (!orden) notFound();

  const piezasMateriaP = orden.detalles.filter(
    (d) => d.pieza.tipoMaterial === "MATERIA PRIMA" && d.cantidad > 0
  );

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/ordenes">← Órdenes</Link>
      </Button>

      <PageHeader
        title={orden.codigo}
        actions={<StatusBadge estado={orden.estado} />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px] mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Cliente", orden.cliente],
                ["Proyecto", orden.proyecto],
                ["Conjunto", orden.conjunto],
                ["Sub-Conjunto", orden.subConjunto],
                ["Color Melamina", orden.colorMelamina],
                ["Espesor", orden.espesorGeneral ? `${orden.espesorGeneral}mm` : "-"],
                ["Tapacanto", orden.tapacantoGeneral],
              ].map(([k, v]) =>
                v ? (
                  <div key={k}>
                    <dt className="text-muted-foreground text-sm">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{orden.detalles.length}</div>
            <p className="text-sm text-muted-foreground mb-4">piezas en la orden</p>

            <div className="text-3xl font-bold text-primary">{piezasMateriaP.length}</div>
            <p className="text-sm text-muted-foreground mb-4">
              piezas MATERIA PRIMA
            </p>

            <GenerarHRButton ordenId={orden.id} />

            {orden.hojasDeRuta.length > 0 && (
              <Button variant="outline" size="sm" asChild className="mt-2 w-full">
                <Link href={`/ordenes/${orden.id}/hoja-de-ruta`}>
                  Ver última hoja de ruta ({orden.hojasDeRuta[0].totalPaginas} págs)
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Largo</TableHead>
              <TableHead>Ancho</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orden.detalles.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {d.pieza.codigo}
                </TableCell>
                <TableCell className="font-medium">{d.pieza.descripcion}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{d.pieza.tipoMaterial}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.pieza.largo ?? "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.pieza.ancho ?? "-"}
                </TableCell>
                <TableCell className="text-center font-medium">{d.cantidad}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
