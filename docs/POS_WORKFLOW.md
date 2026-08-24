# POS y flujo operativo de Gigaprint

## Resultado de la auditoría (24 de agosto de 2026)

Cada venta genera una ruta de operaciones dependientes y sincronizada mediante `pos_production_operations`.

Ruta base:

1. Asesoría y venta (se completa al registrar la venta).
2. Diseño y preparación de archivos.
3. Aprobación de arte del cliente. Esta etapa bloquea fabricación.
4. Producción por áreas: impresión, corte láser/CNC y/o sublimación. Pueden ejecutarse en paralelo.
5. Taller/armado, cuando el producto lo necesita; espera las producciones previas.
6. Control de calidad.
7. Entrega o instalación.

Una lámpara con vinil impreso, por ejemplo, se propone como `diseño → aprobación → impresión + corte láser → taller → calidad → entrega`. La asesora puede corregir las áreas sugeridas antes de registrar la venta.

## Archivos principales

- `src/lib/productionWorkflow.js`: inferencia de áreas, tiempos, dependencias, asignación y agenda laboral.
- `src/lib/posStore.js`: venta, pagos, órdenes, operaciones, sincronización y estados.
- `src/pages/pos/POSProductionControl.jsx`: tablero operativo y calendario de capacidad.
- `src/pages/pos/POSPage.jsx`: mostrador, selección de ruta y centro operativo.
- `supabase/migrations/20260824000000_pos_production_workflow_engine.sql`: esquema, índices, realtime y dependencias.
- `supabase/migrations/20260824020000_pos_team_roles_cash_permissions.sql`: capacidades de caja, metas, espacio inicial y validación de apertura por rol.
- `supabase/migrations/20260824030000_auth_pos_access_realtime.sql`: propietarios superadmin idempotentes y publicación Realtime de todas las tablas escuchadas por el POS.

## Reglas funcionales

- Una venta exige turno abierto, cliente, teléfono, artículos y ruta productiva.
- Solo `asesora`, `admin` y `super_admin` pueden abrir caja. Supabase lo valida con el trigger `trg_pos_validate_cash_shift_owner`.
- Solo `asesora` tiene meta semanal de ventas. Los demás roles conservan `weekly_goal = 0`.
- Administradores acceden a todos los espacios; coordinación asigna responsables, fechas y duración; cada operador ve y ejecuta únicamente trabajos compatibles con su área.
- Los PIN semanales de caja solo se rotan para integrantes con `can_open_cash = true`; el resto usa acceso operativo sin convertirse en cajero.
- `/admin/login` autentica propietarios con Supabase Auth y lee `role`/`display_name` desde `profiles`; el correo proviene de `auth.users`.
- En `/pos` y `/caja`, la pestaña Administrador usa las mismas credenciales Supabase. La pestaña Equipo usa el PIN de seis dígitos de cada integrante.
- Después del PIN, asesoras entran a mostrador; coordinación, diseño y operadores entran automáticamente al espacio permitido por `getRoleCapabilities`.
- Un descuento exige motivo.
- Efectivo recibido, valor aplicado y vuelto se guardan por separado.
- Los números de orden evitan colisiones entre terminales.
- Una operación se libera cuando todas sus dependencias están terminadas.
- Al avanzar operaciones se actualizan `workflow_status` y `production_stage`.
- La agenda trabaja de lunes a viernes, 08:00–17:00. El coordinador puede cambiar fecha, duración y responsable.
- Órdenes antiguas sin operaciones se reconstruyen al hidratar el POS.

## Verificación

```powershell
npm run build
$env:SUPABASE_DB_PASSWORD='<PASSWORD>'
node scripts/verify-pos-remote.mjs
node scripts/test-pos-workflow-transaction.mjs
```

La prueba transaccional usa `BEGIN/ROLLBACK` y no deja pedidos de prueba.

## Deuda de seguridad conocida

Las terminales aún autentican al personal con PIN local. Por compatibilidad, varias políticas POS permiten operaciones anónimas. Antes de exponer `/pos` públicamente se debe crear un usuario Supabase Auth por empleado, vincularlo con `pos_advisors.auth_user_id`, mover los PIN a hashes verificados por una función segura y restringir RLS por rol/área. No almacenar PIN ni contraseñas legibles en el frontend.

## Próxima fase recomendada

1. Supabase Auth individual y RLS por sucursal/área.
2. Horarios por empleado, feriados, ausencias y turnos configurables.
3. Recetas/BOM por producto y reservas reales de material.
4. Notificaciones automáticas por eventos del flujo.
5. Pausas, reprocesos, desperdicio y tiempos reales.
6. Instalación en campo con evidencia y firma de entrega.
