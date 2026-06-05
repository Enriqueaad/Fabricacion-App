import Link from "next/link";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default async function HistorialPage() {
  const hojas = await prisma.hojaDeRuta.findMany({
    orderBy: { generadoEn: "desc" },
    include: { orden: true },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Historial de Hojas de Ruta"
        description="Últimas 50 hojas de ruta generadas"
      />

      {hojas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              No se han generado hojas de ruta aún.
            </p>
            <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href="/ordenes">Ver órdenes</Link>
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
                <TableHead className="text-center">Páginas</TableHead>
                <TableHead>Generada</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {hojas.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {h.orden.codigo}
                  </TableCell>
                  <TableCell className="font-medium">{h.orden.cliente}</TableCell>
                  <TableCell className="text-muted-foreground">{h.orden.proyecto}</TableCell>
                  <TableCell className="text-center">{h.totalPaginas}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(h.generadoEn).toLocaleString("es-CL")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/ordenes/${h.ordenId}/hoja-de-ruta`}>
                        Ver →
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
