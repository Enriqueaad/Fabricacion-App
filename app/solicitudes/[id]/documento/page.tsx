import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import type { DatosSolicitudStock } from "@/lib/solicitud-stock-engine";
import PrintButton from "./PrintButton";

export default async function DocumentoSolicitudPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const solicitud = await prisma.solicitudStock.findUnique({
    where: { id: parseInt(id) },
    include: { orden: true },
  });

  if (!solicitud) return notFound();

  const datos: DatosSolicitudStock = JSON.parse(solicitud.snapshotData);

  return (
    <>
      {/* Controles — ocultos al imprimir */}
      <div className="print:hidden flex items-center gap-4 mb-6">
        <a href="/solicitudes" className="text-sm text-gray-500 hover:underline">← Solicitudes</a>
        <PrintButton />
      </div>

      {/* Documento */}
      <div
        style={{
          width: "277mm",
          minHeight: "190mm",
          padding: "8mm",
          fontFamily: "Calibri, Arial, sans-serif",
          fontSize: "10pt",
          background: "white",
          margin: "0 auto",
        }}
      >
        {/* Cabecera */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6mm" }}>
          <tbody>
            <tr>
              <td colSpan={4} style={{ fontSize: "14pt", fontWeight: "bold", padding: "2mm 0", textTransform: "uppercase" }}>
                Solicitud de Stock
              </td>
            </tr>
            <tr style={{ background: "#f3f4f6" }}>
              {[
                ["Orden", datos.ordenCodigo],
                ["Cliente", datos.cliente],
                ["Proyecto", datos.proyecto],
                ["Fecha", datos.fecha],
              ].map(([k, v]) => (
                <td key={k} style={{ padding: "2mm 3mm", border: "1px solid #d1d5db", fontSize: "9pt" }}>
                  <span style={{ fontWeight: "bold", color: "#6b7280" }}>{k}: </span>
                  <span style={{ fontWeight: "600" }}>{v}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Tabla de piezas */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1f2937", color: "white" }}>
              {["COD PROG", "DESCRIPCIÓN", "LARGO", "ANCHO", "CANTIDAD", "COLOR", "ESP"].map((h) => (
                <th key={h} style={{ padding: "2mm 3mm", textAlign: "left", fontSize: "8pt", fontWeight: "600" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.piezas.map((p, i) => (
              <tr key={p.codProg} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td style={{ padding: "1.5mm 3mm", fontSize: "8pt", fontFamily: "monospace", border: "1px solid #e5e7eb" }}>{p.codProg}</td>
                <td style={{ padding: "1.5mm 3mm", fontSize: "8pt", border: "1px solid #e5e7eb" }}>{p.descripcion}</td>
                <td style={{ padding: "1.5mm 3mm", fontSize: "8pt", textAlign: "right", border: "1px solid #e5e7eb" }}>{p.largo ?? "—"}</td>
                <td style={{ padding: "1.5mm 3mm", fontSize: "8pt", textAlign: "right", border: "1px solid #e5e7eb" }}>{p.ancho ?? "—"}</td>
                <td style={{ padding: "1.5mm 3mm", fontSize: "8pt", textAlign: "right", fontWeight: "bold", border: "1px solid #e5e7eb" }}>{p.cantidad}</td>
                <td style={{ padding: "1.5mm 3mm", fontSize: "8pt", border: "1px solid #e5e7eb" }}>{p.colorMel ?? "—"}</td>
                <td style={{ padding: "1.5mm 3mm", fontSize: "8pt", textAlign: "right", border: "1px solid #e5e7eb" }}>{p.espesorMel ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "4mm", fontSize: "8pt", color: "#6b7280", textAlign: "right" }}>
          Total: {datos.totalPiezas} ítems de stock
        </div>
      </div>
    </>
  );
}
