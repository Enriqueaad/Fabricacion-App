-- CreateTable
CREATE TABLE "Pieza" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipoMaterial" TEXT NOT NULL,
    "color" TEXT,
    "espesor" REAL,
    "largo" REAL,
    "ancho" REAL,
    "veta" TEXT,
    "tapacanto1" TEXT,
    "tapacanto2" TEXT,
    "tapacanto3" TEXT,
    "tapacanto4" TEXT,
    "mecanizado" BOOLEAN NOT NULL DEFAULT false,
    "perforado" BOOLEAN NOT NULL DEFAULT false,
    "ranura" BOOLEAN NOT NULL DEFAULT false,
    "maqEnchapeKal330" BOOLEAN NOT NULL DEFAULT false,
    "maqEnchaperMdsAmbition" BOOLEAN NOT NULL DEFAULT false,
    "maqEnchapeStreamSTI" BOOLEAN NOT NULL DEFAULT false,
    "maqEnchapeStreamSTD" BOOLEAN NOT NULL DEFAULT false,
    "maqPerforadoBhx500" BOOLEAN NOT NULL DEFAULT false,
    "maqPerforadoBhx055" BOOLEAN NOT NULL DEFAULT false,
    "maqPerforadoBaz32" BOOLEAN NOT NULL DEFAULT false,
    "maqPerforadoBaz211" BOOLEAN NOT NULL DEFAULT false,
    "maqPerforadoWeeke" BOOLEAN NOT NULL DEFAULT false,
    "rawData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Orden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "proyecto" TEXT NOT NULL,
    "conjunto" TEXT,
    "subConjunto" TEXT,
    "colorMelamina" TEXT,
    "espesorGeneral" REAL,
    "tapacantoGeneral" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DetalleOrden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordenId" INTEGER NOT NULL,
    "piezaId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    CONSTRAINT "DetalleOrden_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DetalleOrden_piezaId_fkey" FOREIGN KEY ("piezaId") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HojaDeRuta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordenId" INTEGER NOT NULL,
    "snapshotData" TEXT NOT NULL,
    "totalPaginas" INTEGER NOT NULL,
    "pdfPath" TEXT,
    "generadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generadoPor" TEXT,
    CONSTRAINT "HojaDeRuta_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pieza_codigo_key" ON "Pieza"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Orden_codigo_key" ON "Orden"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleOrden_ordenId_piezaId_key" ON "DetalleOrden"("ordenId", "piezaId");
