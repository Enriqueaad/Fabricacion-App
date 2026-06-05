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

export default async function Dashboard() {
  const [totalPiezas, totalOrdenes, ordenesActivas] = await Promise.all([
    prisma.pieza.count(),
    prisma.orden.count(),
    prisma.orden.count({ where: { estado: { in: ["BORRADOR", "EN_PROCESO"] } } }),
  ]);

  const ultimasOrdenes = await prisma.orden.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { detalles: true } } },
  });

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-l-4 border-primary">
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalPiezas}</div>
            <p className="text-sm text-muted-foreground mt-1">Piezas en base</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-primary">
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalOrdenes}</div>
            <p className="text-sm text-muted-foreground mt-1">Órdenes totales</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-primary">
          <CardContent>
            <div className="text-2xl font-bold text-primary">{ordenesActivas}</div>
            <p className="text-sm text-muted-foreground mt-1">Órdenes activas</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button asChild>
          <Link href="/ordenes/nueva">Nueva orden</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/piezas">Gestionar piezas</Link>
        </Button>
      </div>

      {ultimasOrdenes.length === 0 ? (
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
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ultimasOrdenes.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {o.codigo}
                  </TableCell>
                  <TableCell className="font-medium">{o.cliente}</TableCell>
                  <TableCell className="text-muted-foreground">{o.proyecto}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{o._count.detalles}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge estado={o.estado} />
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
