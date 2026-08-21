# Estado del proyecto Gigaprint

Última actualización: 2026-08-21

## Estado actual

El sitio está publicado en GitHub Pages y el build de producción funciona. La URL pública es:

https://gigaprint-ec.github.io/gigaprint-webpage/

El repositorio está en la rama `main`. GitHub Actions compila y publica automáticamente después de cada push.

El panel admin publicado está disponible en `https://gigaprint-ec.github.io/gigaprint-webpage/admin`. El acceso demo funciona y permite editar las páginas públicas desde `/admin/contenido` y `/admin/editor`, además de productos, promociones y temas. En este momento los cambios son locales al navegador hasta conectar el adaptador Supabase.

## Funcionalidades terminadas

- Inicio comercial con hero, servicios, proceso, productos destacados y bloques editables.
- Página Gigaprint/nosotros.
- Promociones.
- Tienda filtrable por categoría.
- Detalle de productos con variantes, colores, tamaños y escalas.
- Cotizador inteligente para m², unidades, volumen y lotes.
- Carrito de cotizaciones.
- Formulario de contacto y solicitudes locales.
- Panel admin demo.
- Editor visual con Block Builder y bloques de texto, columnas, imágenes, galerías, video, banner, divisor, botones, redes, mapa, embed y formulario.
- Rich text editor TipTap con formato, enlaces, imágenes, color, resaltado, listas, citas, código y pantalla completa.
- Galerías mosaico, masonry, carrusel y lightbox.
- Calendario moderno.
- Formularios dinámicos, encuestas, opción única/múltiple, colores, fechas y archivos.
- Conversión de imágenes a WebP en el navegador.
- Buscador Ctrl/Cmd+K.
- Modo claro/oscuro.
- Menú contextual personalizado con clic derecho y pulsación larga en móvil.
- Temas `default`, `navidad` y `milagro`, aplicables desde `/admin/temas`.
- Animaciones premium en hero, navegación, secciones, tarjetas, botones, menú, footer y decoraciones.
- Soporte para `prefers-reduced-motion`.

## Correcciones importantes de GitHub Pages

GitHub Pages publica el proyecto debajo de `/gigaprint-webpage/`. Para evitar enlaces e imágenes rotas:

- `vite.config.js` usa `base: '/gigaprint-webpage/'` únicamente dentro de GitHub Actions.
- `src/App.jsx` usa `BrowserRouter basename={import.meta.env.BASE_URL}`.
- `src/data/media.js` centraliza `assetPath()` para imágenes locales.
- `src/store.jsx` normaliza datos antiguos guardados con rutas `/images/...`.
- `BlockRenderer` adapta los botones internos a la base pública.
- Vite genera `dist/404.html` como fallback para rutas SPA.

## Catálogo y cotizador

`src/data/estebanCatalog.json` contiene el catálogo importado desde Esteban. `src/catalog.js` lo transforma en productos editables y conserva:

- `priceScales` para precios por volumen.
- `priceMatrix` para tarifas por medida/variante.
- `variantOptions` para materiales, acabados y configuraciones.
- `pricingMode` para unidad, m² o total por lote.
- `calcType` para cálculo por área o unidad.

El catálogo local actual contiene 95 productos normalizados, incluyendo productos manuales y familias del catálogo importado.

## Persistencia y limitaciones actuales

El sitio funciona con datos demo locales para poder probarlo sin credenciales:

- `gigaprint-site-v1`
- `gigaprint-cart-v1`
- `gigaprint-theme`
- `gigaprint-admin`

La estructura Supabase ya existe, pero todavía no se usa como adaptador principal. Antes de producción hay que migrar lecturas/escrituras, autenticación, Storage y solicitudes al backend.

## Pendientes priorizados

### Prioridad alta

- Supabase Auth para admin.
- Adaptador Supabase para settings, productos, servicios, promociones, bloques e inquiries.
- Políticas RLS de escritura únicamente para usuarios autenticados con rol admin.
- Storage para imágenes WebP, documentos, artes y archivos de cotización.
- Reemplazar datos de contacto demo por datos reales.
- Rotar los secretos compartidos durante la configuración.

### Prioridad media

- Semilla inicial de productos y contenido en Supabase.
- Historial/versionado de páginas y bloques.
- Estados de producción para solicitudes.
- Analítica y eventos de conversión.
- Dominio propio y despliegue final en Vercel.

### Prioridad baja

- Mejorar imágenes del catálogo por producto.
- Integración real de mapa.
- Integración de correo/WhatsApp mediante Edge Function.
- Checkout o pagos, si el negocio lo requiere.
