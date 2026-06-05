export const FILAS_POR_PAGINA = 14;
export const MAX_PAGINAS = 8;

export interface FilaPieza {
  codigo: string;
  descripcion: string;
  largo: number | null;
  ancho: number | null;
  cantidad: number;
}

export interface MaquinasEnchape {
  kal330: boolean;
  mdsAmbition: boolean;
  streamSTI: boolean;
  streamSTD: boolean;
}

export interface MaquinasPerforado {
  bhx500: boolean;
  bhx055: boolean;
  baz32: boolean;
  baz211: boolean;
  weeke: boolean;
}

export interface PaginaHR {
  numeroPagina: number;
  totalPaginas: number;
  piezas: FilaPieza[];
}

export interface DatosHojaDeRuta {
  codigo: string;
  cliente: string;
  proyecto: string;
  conjunto: string;
  subConjunto: string;
  colorMelamina: string;
  espesor: string;
  tapacanto: string;
  fecha: string;
  maquinasEnchape: MaquinasEnchape;
  maquinasPerforado: MaquinasPerforado;
  paginas: PaginaHR[];
  totalPiezas: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generarHojaDeRuta(orden: any): DatosHojaDeRuta {
  // Replicar filtro VBA: campo9="MATERIA PRIMA", campo42>0
  const filasValidas: FilaPieza[] = (orden.detalles || [])
    .filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) =>
        d.pieza.tipoMaterial === "MATERIA PRIMA" && d.cantidad > 0
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((d: any) => ({
      codigo: d.pieza.codigo,
      descripcion: d.pieza.descripcion,
      largo: d.pieza.largo,
      ancho: d.pieza.ancho,
      cantidad: d.cantidad,
    }));

  const totalPaginas = Math.min(
    Math.ceil(filasValidas.length / FILAS_POR_PAGINA),
    MAX_PAGINAS
  );

  const paginas: PaginaHR[] = Array.from({ length: totalPaginas }, (_, i) => ({
    numeroPagina: i + 1,
    totalPaginas,
    piezas: filasValidas.slice(
      i * FILAS_POR_PAGINA,
      (i + 1) * FILAS_POR_PAGINA
    ),
  }));

  // Máquinas: OR de todas las piezas de la orden
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orPieza = (key: string) => (orden.detalles || []).some((d: any) => d.pieza[key]);

  return {
    codigo: orden.codigo,
    cliente: orden.cliente,
    proyecto: orden.proyecto,
    conjunto: orden.conjunto ?? "",
    subConjunto: orden.subConjunto ?? "",
    colorMelamina: orden.colorMelamina ?? "",
    espesor: orden.espesorGeneral?.toString() ?? "",
    tapacanto: orden.tapacantoGeneral ?? "",
    fecha: new Date().toLocaleDateString("es-CL"),
    maquinasEnchape: {
      kal330: orPieza("maqEnchapeKal330"),
      mdsAmbition: orPieza("maqEnchaperMdsAmbition"),
      streamSTI: orPieza("maqEnchapeStreamSTI"),
      streamSTD: orPieza("maqEnchapeStreamSTD"),
    },
    maquinasPerforado: {
      bhx500: orPieza("maqPerforadoBhx500"),
      bhx055: orPieza("maqPerforadoBhx055"),
      baz32: orPieza("maqPerforadoBaz32"),
      baz211: orPieza("maqPerforadoBaz211"),
      weeke: orPieza("maqPerforadoWeeke"),
    },
    paginas,
    totalPiezas: filasValidas.length,
  };
}
