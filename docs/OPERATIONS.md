# Operaciones, despliegue y Supabase

## Enlaces

- Repositorio: https://github.com/gigaprint-ec/gigaprint-webpage
- GitHub Pages: https://gigaprint-ec.github.io/gigaprint-webpage/
- Supabase project ref: `ihifnhibzlgxotywbeji`
- Supabase URL: `https://ihifnhibzlgxotywbeji.supabase.co`

## Variables esperadas

Copia `.env.example` a `.env.local` para desarrollo. Nunca commitees `.env.local`.

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_SITE_URL=http://localhost:5173
VITE_WHATSAPP_NUMBER=593999999999
```

La publishable/anon key puede llegar al navegador; nunca pongas una `service_role` key en `VITE_*`.

## GitHub Pages

Workflow: `.github/workflows/deploy-pages.yml`.

Flujo automático:

1. Push a `main`.
2. `npm ci`.
3. `npm run build`.
4. Vite crea `dist/` con base `/gigaprint-webpage/`.
5. Se copia `index.html` a `404.html` para las rutas SPA.
6. GitHub Pages publica el artifact.

## Migración Supabase aplicada

Fuente: `supabase/schema.sql`.

La migración fue ejecutada contra el proyecto remoto usando el pooler IPv4 de Supabase. Verificación realizada:

- 11 tablas públicas creadas.
- 11 políticas RLS creadas.
- `site_settings.theme_preset` creado.
- `site_settings.theme_presets` creado.
- Esquema aplicado sin dejar cambios locales pendientes.

Tablas:

`site_settings`, `services`, `products`, `promotions`, `inquiries`, `pages`, `page_blocks`, `media_assets`, `service_questions`, `form_submissions`, `design_tokens`.

## Cómo verificar sin exponer secretos

Usa una variable temporal local, nunca un string con contraseña en un commit:

```powershell
$env:GIGA_PG_URI = "postgresql://postgres:<PASSWORD>@<POOLER_HOST>:6543/postgres"
# Ejecutar una consulta de verificación con la herramienta de Supabase o un cliente PostgreSQL.
Remove-Item Env:GIGA_PG_URI
```

No pongas la contraseña real en este archivo. Si la conexión directa `db.<project>.supabase.co:5432` no funciona por IPv6/red, usa el pooler IPv4 indicado en el panel Connect de Supabase.

## Estado de la integración

La base de datos está creada, pero la aplicación aún conserva el adaptador local en `src/store.jsx`. La siguiente fase debe crear un adaptador Supabase que mantenga los mismos IDs y colecciones, migrando de forma gradual:

1. Leer settings y temas.
2. Leer productos y categorías.
3. Guardar solicitudes.
4. Guardar bloques y contenido admin.
5. Conectar Storage.
6. Activar Auth y políticas de escritura.

## Antes de producción

- Revocar y regenerar el token de GitHub compartido durante la configuración.
- Cambiar la contraseña de la base de datos compartida durante la configuración.
- Quitar la contraseña admin demo.
- Configurar Supabase Auth, RLS y Storage.
- Configurar variables de entorno en Vercel, no en el repositorio.
