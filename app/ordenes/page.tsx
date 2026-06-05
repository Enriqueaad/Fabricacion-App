import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { FileText } from "lucide-react";

export default async function OrdenesPage() {
  const ordenes = await prisma.orden.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { detalles: true, hojasDeRuta: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Órdenes"
        actions={
          <Button asChild>
            <Link href="/ordenes/nueva">Nueva orden</Link>
          </Button>
        }
      />

      {ordenes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              No hay órdenes registradas aún.
            </p>
            <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href="/ordenes/nueva">Crear primera orden</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead className="text-center">Piezas</TableHead>
                <TableHead className="text-center">HR generadas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordenes.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {o.codigo}
                  </TableCell>
                  <TableCell className="font-medium">{o.cliente}</TableCell>
                  <TableCell className="text-muted-foreground">{o.proyecto}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{o._count.detalles}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{o._count.hojasDeRuta}</TableCell>
                  <TableCell>
                    <StatusBadge estado={o.estado} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(o.createdAt).toLocaleDateString("es-CL")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/ordenes/${o.id}`}>Ver -&gt;</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
