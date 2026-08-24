# Gigaprint — Memoria y Guía Técnica para Agentes

Lee este archivo antes de modificar el proyecto. Es el mapa rápido de la aplicación, su arquitectura completa, su despliegue y sus convenciones.
Para el resumen exhaustivo y detallado, consulta [PROJECT_COMPLETE_SUMMARY.md](file:///G:/CODE/Giga/PROJECT_COMPLETE_SUMMARY.md).

---

## Identidad del Proyecto

- **Marca:** Gigaprint — Tus ideas en grande.
- **Tipo:** Plataforma web comercial, cotizador inteligente multivariable y ERP/POS de taller publicitario.
- **Stack:** React 19, Vite 8, React Router v7, TipTap, Lucide Icons, Supabase (PostgreSQL, Auth, RLS, Storage).
- **Repositorio Oficial:** `https://github.com/gigaprint-ec/gigaprint-webpage`
- **Sitio Desplegado:** `https://gigaprint-ec.github.io/gigaprint-webpage/`
- **Proyecto Supabase:** `ihifnhibzlgxotywbeji`.

---

## Reglas de Seguridad & Secretos

- **Cero secretos en código:** Nunca guardes contraseñas, tokens de GitHub o service-role keys en archivos commiteados. Usa `.env.local` para desarrollo local y variables seguras en CI/CD.
- **Modo Demo:** La contraseña de prueba local es `gigaprint` y solo opera en modo prototipo/fallback. En producción se utiliza Supabase Auth.
- **Local-First Resiliente:** Toda la operativa de caja y taller funciona al 100% en `localStorage` ante caídas de red y se sincroniza en segundo plano con Supabase mediante `safeQuery` y `syncEntityRemote`.

---

## Comandos Principales

```bash
npm install     # Instalar dependencias
npm run dev     # Iniciar entorno de desarrollo local (HMR)
npm run build   # Compilar para producción (Vite + Rolldown)
```

El build de GitHub Pages se ejecuta automáticamente con `.github/workflows/deploy-pages.yml` ante cada `push` a la rama `main`.

---

## Arquitectura de Código & Archivos Clave

### 1. Núcleo Público & CMS
- `src/App.jsx`: Rutas públicas, shells de navegación y rutas privadas admin.
- `src/components.jsx`: Header, Footer, Hero, buscador de comandos `Ctrl+K`, carrito y menú contextual.
- `src/store.jsx`: Estado local/fallback del CMS público, carrito de cotizaciones y temas de temporada.
- `src/catalog.js`: Normalización del catálogo de Esteban con 849 filas de tarifas agrupadas en familias.
- `src/components/studio/`: Block Builder, editor TipTap, uploader WebP y selector de colores.

### 2. ERP, Punto de Venta (POS) & Taller Multi-Rol
- `src/lib/posStore.js`: Motor de datos Local-First, sincronización Supabase, cálculo de turnos, envejecimiento de cartera, actualización de etapas y checklist por ítem.
- `src/lib/productionWorkflow.js`: Rutas multiárea, dependencias, tiempos estimados, asignación por carga y capacidad.
- `src/pos.css`: Estilos dedicados para punto de venta, tarjetas táctiles, vista de 3 columnas de producción y tickets térmicos `@media print`.
- `src/pages/pos/POSPage.jsx`: Terminal de cobranza rápida en mostrador, cálculo por $m^2$, acabados, diseño, instalación y ventas en espera.
- `src/pages/pos/components/POSProductQuickMatrix.jsx`: Selector táctil de sustratos, desglose de tarifas y sobreescritura de precio comercial por ítem.
- `src/pages/pos/POSStationWorkspaces.jsx`: Tablero táctil de 3 columnas (`Por Fabricar ➔ En Máquina ➔ Terminado`) con checklist por ítem para **Impresión**, **Sublimación & DTF** y **Corte Láser & CNC**.
- `src/pages/pos/POSWorkshopMasterBillboard.jsx`: Cartelera semanal para el **Coordinador de Taller** (ejecución vs montaje en sitio, WhatsApp y OTs).
- `src/pages/pos/POSProductionControl.jsx`: Centro operativo con flujo por área y calendario semanal de capacidad.
- `src/pages/pos/POSCustomerCRM.jsx`: CRM de clientes, cartera vencida (15d/30d/+60d), WhatsApp directo y bitácora.
- `src/pages/pos/POSAdminDashboard.jsx`: Cuadre semanal ejecutivo, arqueo de caja ciego/declarado y auditoría de turnos.
- `src/pages/pos/POSInventoryMaterials.jsx`: Inventario de bobinas en $m^2$, tintas y registro de mermas.
- `src/pages/pos/POSPurchaseOrdersManager.jsx`: Órdenes de compra a proveedores con recepción automática a stock.
- `src/pages/pos/POSAdvisorsManagement.jsx`: Gestión del equipo y RBAC. Solo asesoras/admin abren caja; solo asesoras tienen meta; coordinación y operadores ingresan a trabajos por área.
- `src/pages/pos/POSSRIInvoiceModal.jsx`: Facturación electrónica SRI con clave de acceso Módulo 11 e IVA 15%/0%.

### 3. Base de Datos & Migraciones
- `supabase/schema_pos_complete.sql`: Esquema SQL maestro con todas las tablas, índices, RLS y triggers listo para ejecutar en Supabase.
- `supabase/migrations/20260824000000_pos_production_workflow_engine.sql`: Motor operativo vigente.
- `docs/POS_WORKFLOW.md`: Lógica completa, pruebas y deuda de seguridad del POS.

---

## Rutas del Sistema

### Rutas Públicas:
`/`, `/gigaprint`, `/promociones`, `/tienda`, `/tienda/:id`, `/cotizador`, `/rastreo/:token`, `/contacto`, `/carrito`.

### Rutas Privadas / Operativas:
`/admin`, `/admin/login`, `/admin/pos`, `/admin/taller`, `/admin/estaciones`, `/admin/crm`, `/admin/pos/dashboard`, `/admin/inventario`, `/admin/compras`, `/admin/equipo`, `/admin/productos`, `/admin/contenido`, `/admin/editor`.

---

## Convenciones para Agentes Antigravity

- **Idioma de interacción:** Responde siempre en español al usuario.
- **Idioma del código:** Variables, funciones, comentarios y mensajes de commit siempre en inglés.
- **Commits atómicos:** Formato Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`).
- **Validación obligatoria:** Siempre ejecutar `npm run build` antes de proponer como completa una tarea.
