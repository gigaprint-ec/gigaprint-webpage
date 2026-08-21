# Gigaprint — memoria para agentes

Lee este archivo antes de modificar el proyecto. Es el mapa rápido de la aplicación, su despliegue y lo que queda pendiente.

## Identidad del proyecto

- Marca: **Gigaprint — Tus ideas en grande**.
- Tipo: sitio comercial de publicidad, impresión, fabricación visual y cotizador inteligente.
- Stack: React, Vite, React Router, TipTap y Lucide.
- Repositorio: https://github.com/gigaprint-ec/gigaprint-webpage
- Sitio publicado: https://gigaprint-ec.github.io/gigaprint-webpage/
- Proyecto Supabase: `ihifnhibzlgxotywbeji`.

## Reglas de seguridad

- Nunca guardes tokens de GitHub, contraseñas de Supabase, service-role keys ni secretos en el código, Markdown, commits o variables `VITE_*` salvo la publishable/anon key.
- El token de GitHub y la contraseña de base de datos compartidos durante la configuración deben revocarse/rotarse antes de producción.
- No uses el acceso admin demo en producción. Actualmente la contraseña demo es `gigaprint` y existe solo para desarrollo local/prototipo.
- La aplicación todavía usa `localStorage`; Supabase Auth y el adaptador remoto aún deben conectarse.

## Comandos principales

```bash
npm install
npm run dev
npm run build
```

El build de GitHub Pages se ejecuta automáticamente con `.github/workflows/deploy-pages.yml` al hacer push a `main`.

## Arquitectura rápida

- `src/App.jsx`: páginas públicas, rutas admin y páginas de producto/cotizador.
- `src/components.jsx`: Header, Footer, shells públicos/admin, tarjetas, carrito, buscador y menú contextual.
- `src/store.jsx`: estado local/fallback, carrito, solicitudes, tema claro/oscuro y tema de temporada; sincroniza con Supabase cuando hay sesión admin.
- `src/lib/supabase.js` y `src/lib/siteRepository.js`: cliente, lectura pública, Auth/roles, persistencia CMS y Storage.
- `src/data.js`: contenido inicial, productos manuales, promociones y temas.
- `src/catalog.js`: normalización del catálogo de Esteban y reglas m²/unidad/lotes/volumen.
- `src/data/estebanCatalog.json`: 849 filas de tarifas importadas y agrupadas en familias editables.
- `src/components/studio/`: Block Builder, editor TipTap, medios WebP, galerías, calendario, formularios, pickers y Chrome UI.
- `src/theme.css`: animaciones premium, temas estacionales, menú contextual y accesibilidad de movimiento.
- `supabase/schema.sql`: esquema remoto inicial.
- `supabase/migrations/20260821010000_auth_storage_admin.sql`: perfiles, roles, RLS de escritura y buckets.
- `scripts/seed-supabase.mjs`: migración del catálogo/contenido local a Supabase.
- `scripts/check-supabase.mjs`: verificación de conteos y buckets.
- `scripts/optimize-resources.mjs`: convierte los recursos originales en copias web organizadas.

## Persistencia actual

- Sitio: `gigaprint-site-v1`.
- Carrito: `gigaprint-cart-v1`.
- Modo claro/oscuro: `gigaprint-theme`.
- Sesión admin Supabase Auth; la clave local solo se usa como fallback sin variables Supabase.

## Rutas públicas

`/`, `/gigaprint`, `/promociones`, `/tienda`, `/tienda/:id`, `/cotizador`, `/contacto`, `/carrito`.

## Rutas privadas

`/admin`, `/admin/login`, `/admin/editor`, `/admin/contenido`, `/admin/productos`, `/admin/temas`, `/admin/promociones`, `/admin/solicitudes`.

## Siguiente trabajo recomendado

1. Crear el primer usuario Auth y promoverlo a `profiles.role = 'admin'`.
2. Completar el uploader visual para enviar archivos a `gigaprint-media`/`gigaprint-private`.
3. Añadir Edge Function para WhatsApp Business/correo y guardar estados de solicitudes.
4. Añadir dominio propio/Vercel, SEO, analítica, legales y backups.

Para el detalle completo, lee `docs/PROJECT_STATUS.md`, `docs/COMPONENTS.md` y `docs/OPERATIONS.md`.
