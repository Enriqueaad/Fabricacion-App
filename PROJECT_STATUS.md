# Estado del Proyecto — Fabricación APP
**Última actualización:** 2026-06-04

---

## Roles del Equipo

### Claude Code — Arquitecto Líder y Revisor
1. **Planificar** (modo plan, al inicio de cada fase) — plan completo con tareas atómicas, dependencias y criterios de aceptación
2. **Código de arquitectura** — engines de lógica, schema Prisma, estructura de carpetas, middleware, patrones base. Lo que Claude Code escribe es la referencia; Codex no lo modifica sin aprobación
3. **Revisar** después de cada entrega de Codex — aprueba, corrige arquitectura él mismo, o delega implementación a Codex

### Codex — Ejecutor de Código
- Implementa estrictamente lo que el plan aprobado indica — sin decisiones de arquitectura
- Una fase a la vez, no avanza sin aprobación de Claude Code
- Reporta bloqueros antes de improvisar soluciones
- Escribe tests por módulo antes de marcar tarea completa
- **Formato de entrega obligatorio:**
  ```
  ✅ FASE [N] COMPLETADA: [nombre]
  Archivos creados/modificados: [lista]
  Tests: [pasando / fallando]
  → Listo para revisión de Claude Code
  ```

### Workflow
```
Claude Code (modo plan)
  ↓ plan completo en fases + criterios de aceptación
  ↓ [opcional] escribe código base de arquitectura
  ↓ usuario aprueba
Codex
  ↓ ejecuta Fase N estrictamente según el plan
  ↓ entrega reporte ✅
Claude Code (revisión)
  ↓ APRUEBA → Codex ejecuta Fase N+1
  ↓ ARQUITECTURA → Claude Code corrige directamente
  ↓ IMPLEMENTACIÓN → Codex corrige → Claude Code re-revisa
```

> **Nota:** Fase 1 fue implementada íntegramente por Claude Code porque el workflow no estaba definido aún. Desde Fase 2 en adelante se aplica estrictamente este rol.

---

## Fase Activa: Fase 1 — Lookup + Merge Cocina

## ✅ Completado (Fase 0 — Base)
- Módulo Piezas: catálogo, importación Excel simple
- Módulo Órdenes: CRUD completo
- Hojas de Ruta: generación y vista imprimible
- Historial de HojasDeRuta

## ✅ Completado — Fase 1 (2026-06-04)
- [x] Paso 1: `lib/excel-utils.ts` — helpers extraídos, `excel-import.ts` actualizado
- [x] Paso 2: `prisma/schema.prisma` + migración `fase1_lookup_merge` aplicada
- [x] Paso 3: `lib/excel-lookup-merge.ts` — motor Lookup+Merge completo
- [x] Paso 4: `lib/solicitud-stock-engine.ts`
- [x] Paso 5: `app/api/lookup-merge/preview/route.ts`
- [x] Paso 6: `app/api/lookup-merge/confirmar/route.ts`
- [x] Paso 7: `app/api/solicitudes/route.ts` + `[id]/route.ts`
- [x] Paso 8: `app/lookup-merge/page.tsx` — wizard 4 pasos
- [x] Paso 9: `app/solicitudes/page.tsx`
- [x] Paso 10: `app/solicitudes/[id]/documento/page.tsx` + `PrintButton.tsx`
- [x] Paso 11: `app/layout.tsx` — links "Lookup+Merge" y "Solicitudes Stock"

**Notas de implementación:**
- `generarExportCNC` inlineada en el wizard (evita bundlear xlsx en cliente)
- TypeScript sin errores (error preexistente en prisma.config.ts no relacionado)

---

## Metodología de Trabajo

| Archivo | Propósito |
|---|---|
| `PROJECT_STATUS.md` | Estado vivo del proyecto — se actualiza en cada fase |
| `FASE-[nombre].md` | Prompt autocontenido para Codex — uno por fase |

**Flujo por fase:**
1. Claude Code crea `FASE-[nombre].md` con el prompt completo
2. Usuario copia el contenido y lo pega en Codex
3. Codex implementa y entrega con formato `✅ FASE [N] COMPLETADA`
4. Usuario trae el reporte a Claude Code para revisión
5. Claude Code aprueba o indica ajustes → actualiza `PROJECT_STATUS.md`

---

## 🟡 En Progreso — Fase UI (Design System Formatto)

### ✅ UI-A completado (Claude Code — 2026-06-04)
- [x] A1: `npx shadcn@latest init` — estilo Nova/New York, base Radix, CSS variables
- [x] A2: 14 componentes instalados en `components/ui/` (button, input, table, card, badge, select, dialog, alert-dialog, tabs, checkbox, separator, tooltip, sheet, progress)
- [x] A3: `app/globals.css` — tokens Formatto en OKLCH (#d35132 → oklch(0.585 0.173 37.6)), dark mode declarado pero desactivado
- [x] A4: `app/layout.tsx` — Titillium Web via `next/font/google`, TooltipProvider, Navbar component
- [x] A5: `components/layout/Navbar.tsx` — navbar oscura Formatto con íconos Lucide
- [x] A6: `components/ui/status-badge.tsx` — BORRADOR/EN_PROCESO/COMPLETADO/FINALIZADO
- [x] A7: `components/ui/page-header.tsx` — title + description + actions slot + Separator
- [x] A8: `lib/utils.ts` — auto-creado por shadcn init ✓
- TypeScript: sin errores

### ⬜ Pendiente — UI-B (Codex)
- [x] B1 ✅ APROBADA (2026-06-04) → `app/page.tsx`, `app/ordenes/page.tsx`, `app/solicitudes/page.tsx`
- [x] B2 ✅ APROBADA (2026-06-04) → `app/ordenes/[id]/page.tsx`, `app/ordenes/nueva/page.tsx`, `GenerarHRButton.tsx`
- [x] B3 ✅ APROBADA (2026-06-04) → `app/lookup-merge/page.tsx`, `app/piezas/page.tsx`

**Correcciones arquitectura Claude Code post-B2:**
- `components/ui/alert.tsx` instalado (faltaba en UI-A)
- `app/ordenes/[id]/hoja-de-ruta/HRPrintButton.tsx` creado — extrae onClick del Server Component

**ARCHIVOS QUE CODEX NO DEBE TOCAR:**
```
app/ordenes/[id]/hoja-de-ruta/page.tsx     ← vista impresión
app/solicitudes/[id]/documento/page.tsx    ← vista impresión
app/solicitudes/[id]/documento/PrintButton.tsx
```

## ⬜ Pendiente — Fases Futuras
- **Fase 2:** Lookup+Merge Closet & Piernas (proyecto × fichas individuales .xlsm)
- **Fase 3:** Ajuste dimensional por máquina (LARGO2/ANCHO2 con tolerancias para export CNC)
- **Fase 4:** Solicitudes Especiales

---

## Decisiones de Arquitectura
- **Terminología:** "Lookup + Merge" para el cruce de tablas NV_RTA × ORDEN_DE_FABRICACION
- **JOIN KEY:** `NV_RTA.SKU === ORDEN_DE_FABRICACION."COD PT"`
- **Cantidad:** `Σ(NV_RTA.Recuento × ORDEN_DE_FABRICACION."CANT BASE")` deduplicada por COD PROG
- **ENCHAPE encoding:** `(tapL?"11":"00") + (tapA?"11":"00")` → 4 chars (ej: "1100", "0000")
- **COD PROG vacío:** generar código sintético `"COD_{i:02}_{abreviacion}"`
- **Filtros:** client-side con `aplicarFiltros()`, sin round-trip al servidor
- **Export CNC:** fila en blanco SIEMPRE entre el header y la primera pieza
- **VACIO3 (col 23):** ignorar — usado por software anterior
- **SolicitudStock:** JSON snapshot igual a patrón HojaDeRuta
- **codigoTablero:** campo nuevo en Pieza para el COD SAP (columna TABLERO del export CNC)

## Estructura de Archivos — Fase 1
```
lib/
  excel-utils.ts          ← helpers: norm, buscarColumna, aBooleano, aNumero
  excel-lookup-merge.ts   ← motor principal del Lookup+Merge
  solicitud-stock-engine.ts ← snapshot engine para SolicitudStock
app/
  lookup-merge/page.tsx   ← wizard 4 pasos
  solicitudes/
    page.tsx              ← lista de solicitudes
    [id]/documento/
      page.tsx            ← vista imprimible
      PrintButton.tsx     ← wrapper client
  api/
    lookup-merge/
      preview/route.ts
      confirmar/route.ts
    solicitudes/
      route.ts
      [id]/route.ts
```

## ✅ Fase UI Completada (2026-06-04)
shadcn/ui Nova + Lucide + Titillium Web + tokens Formatto aplicados a toda la app.
Vistas de impresión intactas. TypeScript limpio.

## Problemas Conocidos / Blockers
- Verificar encoding ENCHAPE contra export real del software CNC
- **Timeout API preview** con Excel 59MB (`BD_COCINA_GOLA`): excede 120s en Next.js API route → pendiente optimización (aumentar timeout en `next.config.ts` o procesar en chunks)
- Ruta exacta del Excel de prueba:
  `Base de Datos - APP\Tasco\COCINA\BD_COCINA_GOLA - TASCO_VIVE QUINTA_V5.xlsx`
  (relativa al directorio de la app)

## Notas para Codex
- Siempre importar helpers desde `@/lib/excel-utils` (no redeclarar)
- El motor `excel-lookup-merge.ts` NO debe importar Prisma (lógica pura)
- ORDEN DE FABRICACIÓN: usar fila 0 como headers, SKIP filas 1 y 2, datos desde fila 3
- Patrón de upsert: `findUnique` → `create` / `update` (igual a `app/api/piezas/import/route.ts`)
- Patrón de vista imprimible: inline styles (no Tailwind), igual a `app/ordenes/[id]/hoja-de-ruta/page.tsx`
