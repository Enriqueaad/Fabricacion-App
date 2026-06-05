# Prompt Codex — Fase UI-B1

Eres el ejecutor de este proyecto. El arquitecto es Claude Code.

Lee este archivo antes de hacer cualquier cosa:
- `PROJECT_STATUS.md` — contexto completo, decisiones de arquitectura, archivos instalados y prohibidos

---

CONTEXTO RÁPIDO:
Estás trabajando en "Fabricación APP" — Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui Nova.
Claude Code completó la Fase UI-A: instaló shadcn/ui, configuró los tokens Formatto (primary = rojo
terracota), creó Navbar, StatusBadge, PageHeader y escribió app/historial/page.tsx como molde canónico.
Tu trabajo es la Fase UI-B1: aplicar ese mismo patrón a las otras 3 páginas de servidor simples.

---

REGLA PRINCIPAL: No inventes estilos. Copia exactamente el molde:
- **Molde canónico →** `app/historial/page.tsx` (escrito por Claude Code)

Ese archivo demuestra el patrón completo:
`PageHeader` + `Card` wrapping `Table` + empty state con `Card` + `Button asChild` + colores semánticos.

---

LO QUE DEBES HACER:

**1. app/page.tsx — Dashboard**
- `<PageHeader title="Dashboard" />`
- Stat cards: `<Card className="border-l-4 border-primary">` con número `text-2xl font-bold text-primary`
- Tabla últimas órdenes: igual que el molde (`Card` > `Table`) con `<StatusBadge estado={o.estado} />`
- Acciones rápidas: `<Button asChild>` + `<Button variant="outline" asChild>`
- Empty state si no hay órdenes: `<Card>` centrada, misma estructura que molde

**2. app/ordenes/page.tsx — Lista de órdenes**
- `<PageHeader title="Órdenes" actions={<Button asChild><Link href="/ordenes/nueva">Nueva orden</Link></Button>} />`
- `Card` > `Table` igual que el molde
- Columna estado: `<StatusBadge estado={o.estado} />`
- Columna cantidad piezas: `<Badge variant="secondary">`
- Empty state igual que molde

**3. app/solicitudes/page.tsx — Lista de solicitudes de stock**
- `<PageHeader title="Solicitudes de Stock" />`
- `Card` > `Table` igual que el molde
- Columna piezas: `<Badge variant="secondary">`
- Empty state igual que molde

---

IMPORTS (los mismos del molde):
```tsx
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import Link from "next/link"
```

---

NO TOCAR:
`app/historial/page.tsx` (es el molde — no modificar),
`app/ordenes/[id]/hoja-de-ruta/page.tsx`,
`app/solicitudes/[id]/documento/page.tsx`,
`app/solicitudes/[id]/documento/PrintButton.tsx`,
`components/ui/*`, `components/layout/*`, `lib/*`, `prisma/*`

---

AL TERMINAR:
- `npx tsc --noEmit` → sin errores (ignorar prisma.config.ts)
- `npm run build` → sin errores
- Abre las 4 páginas en el navegador y confirma que renderizan sin errores de consola

→ Claude Code hará la revisión final (Fase UI-B2) cuando entregues este reporte.

```
✅ FASE UI-B1 COMPLETADA: Páginas servidor simples
Archivos modificados: [lista]
npx tsc --noEmit: [pasando / fallando]
npm run build: [pasando / fallando]
→ Listo para revisión de Claude Code
```
