# Prompt Codex — Fase UI-B2

Eres el ejecutor de este proyecto. El arquitecto es Claude Code.

Lee este archivo antes de hacer cualquier cosa:
- `PROJECT_STATUS.md` — contexto completo, decisiones de arquitectura, archivos instalados y prohibidos

---

CONTEXTO RÁPIDO:
Estás trabajando en "Fabricación APP" — Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui Nova.
La Fase UI-B1 fue aprobada por Claude Code. Ya existen páginas de lista rediseñadas como referencia.
Tu trabajo es la Fase UI-B2: rediseñar las páginas de detalle y el formulario de creación de órdenes.

---

REGLA PRINCIPAL: No inventes estilos. Copia exactamente los moldes:
- **Molde lista →** `app/historial/page.tsx` (patrón Card > Table, PageHeader, empty state)
- **Molde lista con estado →** `app/ordenes/page.tsx` (patrón con StatusBadge — rediseñada en B1)

---

LO QUE DEBES HACER:

**1. app/ordenes/[id]/page.tsx — Detalle de orden**
- Botón volver: `<Button variant="ghost" size="sm" asChild><Link href="/ordenes">← Órdenes</Link></Button>`
- `<PageHeader title={orden.codigo} actions={<StatusBadge estado={orden.estado} />} />`
- Sección metadatos: `<Card><CardHeader><CardTitle>Proyecto</CardTitle></CardHeader><CardContent>` con grid `<dl className="grid grid-cols-2 gap-3">` — `<dt>` en `text-muted-foreground text-sm`, `<dd>` en `font-medium`
- Sección resumen: `<Card>` con número `text-3xl font-bold text-primary`
- Tabla de piezas: igual que molde (`Card` > `Table`) con `<Badge variant="secondary">` para tipoMaterial
- Conservar toda la lógica Prisma existente — solo cambiar presentación

**2. app/ordenes/nueva/page.tsx — Formulario crear orden (client component)**
- `<PageHeader title="Nueva Orden" />`
- Sección metadatos: `<Card><CardContent>` con grid de `<Input>` de shadcn
- Sección agregar piezas: `<Card><CardContent>` con `<Input>` de búsqueda
- Dropdown resultados: mantener lógica posicionada, usar `bg-card border-border shadow-md`
- Tabla piezas agregadas: `Card` > `Table` igual que molde
- Botón guardar: `<Button>` (primary — rojo Formatto)
- Botón cancelar: `<Button variant="outline">`
- Botón eliminar pieza (✕): `<Button variant="ghost" size="icon">`
- Errores: `<Alert variant="destructive"><AlertDescription>mensaje</AlertDescription></Alert>`
- Conservar toda la lógica de estado (useState, fetch, router) — solo cambiar presentación

**3. app/ordenes/[id]/GenerarHRButton.tsx — Botón generar hoja de ruta**
- Reemplazar `<button className="...">` por `<Button>` de shadcn
- Estado cargando: `<Button disabled>Generando...</Button>`
- Conservar toda la lógica (fetch, router.push) — solo cambiar el elemento visual

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
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import Link from "next/link"
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
- Flujo completo: crear orden → ver detalle → generar HR → navega a hoja de ruta imprimible

→ Claude Code hará la revisión final (Fase UI-B3) cuando entregues este reporte.

```
✅ FASE UI-B2 COMPLETADA: Páginas detalle y formulario
Archivos modificados: [lista]
npx tsc --noEmit: [pasando / fallando]
npm run build: [pasando / fallando]
Flujo crear orden end-to-end: [verificado / con problemas — detallar]
→ Listo para revisión de Claude Code
```
