# Prompt Codex — Fase UI-B3

Eres el ejecutor de este proyecto. El arquitecto es Claude Code.

Lee este archivo antes de hacer cualquier cosa:
- `PROJECT_STATUS.md` — contexto completo, decisiones de arquitectura, archivos instalados y prohibidos

---

CONTEXTO RÁPIDO:
Estás trabajando en "Fabricación APP" — Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui Nova.
Las Fases UI-B1 y UI-B2 fueron aprobadas por Claude Code. Ya existen páginas rediseñadas como referencia.
Tu trabajo es la Fase UI-B3: rediseñar las dos páginas más complejas (client components con estado).

---

REGLA PRINCIPAL: No inventes estilos. Copia exactamente los moldes:
- **Molde lista →** `app/historial/page.tsx` (Card > Table, PageHeader, empty state)
- **Molde formulario →** `app/ordenes/nueva/page.tsx` (Card > inputs, Button, Alert — rediseñada en B2)
- **Molde tabla con toggles →** No existe molde previo. Usar patrón: `<Button size="sm" variant="default">` activo / `<Button size="sm" variant="ghost">` inactivo

---

LO QUE DEBES HACER:

**1. app/piezas/page.tsx — Catálogo de piezas (client component)**
- `<PageHeader title="Piezas" actions={...} />` con botón "Importar Excel" + input búsqueda
- Botón importar: `<Button variant="outline">` que dispara `<input type="file" hidden ref={fileRef}>`
- Input búsqueda: `<Input placeholder="Buscar por código o descripción..." />`
- Resultado import exitoso: `<Alert><AlertDescription>mensaje</AlertDescription></Alert>`
- Resultado import con error: `<Alert variant="destructive"><AlertDescription>mensaje</AlertDescription></Alert>`
- Tabla piezas: `Card` > `Table` igual que molde, `<Badge variant="secondary">` para tipoMaterial
- Paginación: `<Button variant="outline" size="sm" disabled={...}>Anterior</Button>` y `Siguiente`
- Conservar toda la lógica (useState, fetch, fileRef, cargar) — solo cambiar presentación

**2. app/lookup-merge/page.tsx — Wizard 4 pasos (client component)**

*Step indicator (reemplazar función stepLabel):*
- Paso completado: círculo `bg-primary text-primary-foreground` con ícono `<Check className="w-3 h-3" />`
- Paso activo: círculo `bg-primary text-primary-foreground` con número
- Paso pendiente: círculo `bg-muted text-muted-foreground` con número
- Entre pasos: `<Separator className="flex-1" />`

*Paso 1 — Upload:*
- `<Card>` con borde dashed, ícono `<Upload className="w-8 h-8 text-muted-foreground/40" />`, zona drag & drop

*Paso 2 — Filtros:*
- Cada panel: `<Card><CardContent>`
- Inputs piso: `<Input type="number" className="w-20 text-center" />`
- Chips departamento: `<Badge variant="outline">` inactivo → `<Badge variant="default">` activo (con onClick)

*Paso 3 — Clasificar:*
- Formulario metadatos: `<Card><CardContent>` con grid de `<Input>`
- Tabla piezas: `Card` > `Table`
- Toggle Corte activo: `<Button size="sm" variant="default">Corte</Button>`
- Toggle Corte inactivo: `<Button size="sm" variant="ghost">Corte</Button>`
- Toggle Stock activo: `<Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Stock</Button>`
- Toggle Stock inactivo: `<Button size="sm" variant="ghost">Stock</Button>`
- Botones masivos: `<Button variant="outline" size="sm">`

*Paso 4 — Resultado:*
- Card orden creada: `<Card className="border-green-200 bg-green-50">`
- Card sin stock: `<Card className="border-dashed">`
- Preview CNC: mantener `<pre>` con fondo oscuro (`bg-[oklch(0.145_0_0)] text-green-400`) — es terminal, no cambiar
- Copiar: `<Button variant="outline">` | Descargar: `<Button>`
- Conservar toda la lógica (useState, fetch, clipboard, blob download) — solo cambiar presentación

---

IMPORTS:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/ui/page-header"
import { Check, Upload, FileText } from "lucide-react"
```

---

NO TOCAR:
`app/ordenes/[id]/hoja-de-ruta/page.tsx`,
`app/solicitudes/[id]/documento/page.tsx`,
`app/solicitudes/[id]/documento/PrintButton.tsx`,
`components/ui/*`, `components/layout/*`, `lib/*`, `prisma/*`

---

AL TERMINAR:
- `npx tsc --noEmit` → sin errores (ignorar prisma.config.ts)
- `npm run build` → sin errores
- Flujo Lookup+Merge completo con Excel real: upload → filtros → clasificar → confirmar → descargar .txt
- Import Excel en piezas: sube archivo y muestra mensaje de resultado

→ Claude Code hará la revisión final y actualizará PROJECT_STATUS.md cuando entregues este reporte.

```
✅ FASE UI-B3 COMPLETADA: Wizard y páginas complejas
Archivos modificados: [lista]
npx tsc --noEmit: [pasando / fallando]
npm run build: [pasando / fallando]
Flujo Lookup+Merge end-to-end: [verificado / con problemas — detallar]
Import piezas Excel: [verificado / con problemas — detallar]
→ Listo para revisión de Claude Code
```
