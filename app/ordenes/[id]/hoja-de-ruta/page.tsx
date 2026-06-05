import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { DatosHojaDeRuta } from "@/lib/hoja-de-ruta-engine";
import HRPrintButton from "./HRPrintButton";

export default async function HojaDeRutaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ultima = await prisma.hojaDeRuta.findFirst({
    where: { ordenId: parseInt(id) },
    orderBy: { generadoEn: "desc" },
    include: { orden: true },
  });

  if (!ultima) notFound();

  const datos: DatosHojaDeRuta = JSON.parse(ultima.snapshotData);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <Link href={`/ordenes/${id}`} className="text-gray-400 hover:text-gray-600 text-sm">← Volver</Link>
        <h1 className="text-xl font-bold text-gray-800">Hoja de Ruta — {datos.codigo}</h1>
        <HRPrintButton />
      </div>

      {datos.paginas.map((pagina) => (
        <div key={pagina.numeroPagina}
          className="bg-white border border-gray-300 rounded mb-6 print:rounded-none print:border-none print:mb-0 print:break-after-page"
          style={{ width: "277mm", minHeight: "190mm", padding: "8mm", fontSize: "10px", fontFamily: "Calibri, sans-serif" }}>

          {/* Encabezado */}
          <div style={{ borderBottom: "2px solid black", marginBottom: "4mm" }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>
              HOJA DE RUTA LÍNEA FLEXIBLE
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4mm" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #ccc", padding: "2mm", fontWeight: "bold" }}>PLANO DE CORTE</td>
                <td style={{ border: "1px solid #ccc", padding: "2mm" }} colSpan={2}>{datos.codigo}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ccc", padding: "2mm", fontWeight: "bold" }}>CLIENTE</td>
                <td style={{ border: "1px solid #ccc", padding: "2mm" }}>{datos.cliente}</td>
                <td style={{ border: "1px solid #ccc", padding: "2mm" }}>
                  <strong>PROYECTO</strong> {datos.proyecto}
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ccc", padding: "2mm", fontWeight: "bold" }}>CONJUNTO</td>
                <td style={{ border: "1px solid #ccc", padding: "2mm" }} colSpan={2}>{datos.conjunto} / {datos.subConjunto}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ccc", padding: "2mm", fontWeight: "bold" }}>COLOR MEL</td>
                <td style={{ border: "1px solid #ccc", padding: "2mm" }}>{datos.colorMelamina}</td>
                <td style={{ border: "1px solid #ccc", padding: "2mm" }}>ESP: {datos.espesor}mm | TAP: {datos.tapacanto}</td>
              </tr>
            </tbody>
          </table>

          {/* Máquinas */}
          <div style={{ display: "flex", gap: "4mm", marginBottom: "4mm" }}>
            <div style={{ flex: 1, border: "1px solid #ccc", padding: "2mm" }}>
              <strong>MAQ ENCHAPE</strong>
              <div>KAL 330/525: {datos.maquinasEnchape.kal330 ? "✓" : "-"}</div>
              <div>MDS AMBITION: {datos.maquinasEnchape.mdsAmbition ? "✓" : "-"}</div>
              <div>STREAM ST-I: {datos.maquinasEnchape.streamSTI ? "✓" : "-"}</div>
              <div>STREAM ST-D: {datos.maquinasEnchape.streamSTD ? "✓" : "-"}</div>
            </div>
            <div style={{ flex: 1, border: "1px solid #ccc", padding: "2mm" }}>
              <strong>MAQ PERFORADO</strong>
              <div>BHX-500: {datos.maquinasPerforado.bhx500 ? "✓" : "-"}</div>
              <div>BHX 055: {datos.maquinasPerforado.bhx055 ? "✓" : "-"}</div>
              <div>BAZ 32: {datos.maquinasPerforado.baz32 ? "✓" : "-"}</div>
              <div>BAZ 211: {datos.maquinasPerforado.baz211 ? "✓" : "-"}</div>
              <div>WEEKE: {datos.maquinasPerforado.weeke ? "✓" : "-"}</div>
            </div>
          </div>

          {/* Tabla piezas */}
          <div style={{ marginBottom: "2mm", fontWeight: "bold", borderBottom: "1px solid black" }}>
            RESUMEN DE PIEZAS
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={{ border: "1px solid #ccc", padding: "1mm 2mm", textAlign: "left" }}>PIEZA</th>
                <th style={{ border: "1px solid #ccc", padding: "1mm 2mm", textAlign: "left" }}>COD PROG</th>
                <th style={{ border: "1px solid #ccc", padding: "1mm 2mm", textAlign: "center" }}>LARGO</th>
                <th style={{ border: "1px solid #ccc", padding: "1mm 2mm", textAlign: "center" }}>ANCHO</th>
                <th style={{ border: "1px solid #ccc", padding: "1mm 2mm", textAlign: "center" }}>CANTIDAD</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 14 }).map((_, i) => {
                const p = pagina.piezas[i];
                return (
                  <tr key={i} style={{ height: "6mm" }}>
                    <td style={{ border: "1px solid #ccc", padding: "1mm 2mm", fontSize: "9px" }}>{p?.descripcion ?? ""}</td>
                    <td style={{ border: "1px solid #ccc", padding: "1mm 2mm", fontFamily: "monospace", fontSize: "9px" }}>{p?.codigo ?? ""}</td>
                    <td style={{ border: "1px solid #ccc", padding: "1mm 2mm", textAlign: "center" }}>{p?.largo ?? ""}</td>
                    <td style={{ border: "1px solid #ccc", padding: "1mm 2mm", textAlign: "center" }}>{p?.ancho ?? ""}</td>
                    <td style={{ border: "1px solid #ccc", padding: "1mm 2mm", textAlign: "center", fontWeight: "bold" }}>{p?.cantidad ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Número de página */}
          <div style={{ textAlign: "right", marginTop: "2mm", fontWeight: "bold" }}>
            PAG {pagina.numeroPagina} DE {pagina.totalPaginas}
          </div>
        </div>
      ))}
    </div>
  );
}
