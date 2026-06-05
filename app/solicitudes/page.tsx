import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";

export default async function SolicitudesPage() {
  const solicitudes = await prisma.solicitudStock.findMany({
    orderBy: { generadaEn: "desc" },
    take: 100,
    include: {
      orden: { select: { codigo: true, cliente: true, proyecto: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Solicitudes de Stock" />

      {solicitudes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              No hay solicitudes de stock aún.
            </p>
            <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href="/lookup-merge">Ir a Lookup+Merge</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead className="text-center">Piezas</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {s.orden.codigo}
                  </TableCell>
                  <TableCell className="font-medium">{s.orden.cliente}</TableCell>
                  <TableCell className="text-muted-foreground">{s.orden.proyecto}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{s.totalPiezas}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(s.generadaEn).toLocaleString("es-CL")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/solicitudes/${s.id}/documento`}>
                        Ver documento -&gt;
                      </Link>
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
