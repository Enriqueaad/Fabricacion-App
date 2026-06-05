-- AlterTable
ALTER TABLE "Pieza" ADD COLUMN "codigoTablero" TEXT;

-- CreateTable
CREATE TABLE "SolicitudStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordenId" INTEGER NOT NULL,
    "snapshotData" TEXT NOT NULL,
    "totalPiezas" INTEGER NOT NULL,
    "generadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generadaPor" TEXT,
    CONSTRAINT "SolicitudStock_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
