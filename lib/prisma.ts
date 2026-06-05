import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Ruta absoluta a la base de datos — evita ambigüedad de cwd con Turbopack
const dbPath = path.join(process.cwd(), "prisma", "dev.db");

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
    datasources: {
      db: { url: `file:${dbPath}` },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
