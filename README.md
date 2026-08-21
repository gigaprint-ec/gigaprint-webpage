# Gigaprint — Tus ideas en grande

Sitio comercial de publicidad, impresión y fabricación visual. Está construido con React + Vite y funciona desde el primer arranque con datos demo persistidos en `localStorage`.

## Incluye

- Páginas públicas: Inicio, Gigaprint, Promociones, Tienda, detalle de producto, Cotizador, Contacto y Carrito de cotizaciones.
- Catálogo filtrable con productos por medida, unidad y precio por lote.
- Catálogo de Esteban normalizado en `src/catalog.js` + `src/data/estebanCatalog.json`: 849 filas de tarifas agrupadas en familias editables, con variantes y escalas por volumen.
- Cotizador inteligente con cálculo por m², precio unitario escalonado, precio total por lote, variantes, diseño e instalación.
- Panel privado para editar textos, productos, promociones y revisar solicitudes.
- Temas de temporada editables desde `/admin/temas`: base Gigaprint, Navidad y Fiestas de Milagro. Se aplica o quita con un botón, conserva el naranja del logo y queda listo para persistirse en Supabase.
- Studio de edición reutilizable en `/admin/editor`: Block Builder, editor enriquecido, formularios dinámicos, galería, calendario, paleta de color, biblioteca de medios con WebP, buscador Ctrl/Cmd+K y modo claro/oscuro.
- Menú contextual personalizado con clic derecho y pulsación larga en móvil, más animaciones premium con soporte para `prefers-reduced-motion`.
- Esquema base en `supabase/schema.sql` para migrar el contenido y leads.

## Desarrollo local

```bash
npm install
npm run dev
```

El acceso demo del panel es `/admin` con contraseña `gigaprint`. Antes de publicar hay que reemplazarlo por Supabase Auth.

## Publicación

GitHub Pages se publica automáticamente desde la rama `main` mediante GitHub Actions en:
`https://gigaprint-ec.github.io/gigaprint-webpage/`

## Próximo paso con Supabase

1. Ejecutar `supabase/schema.sql` en el proyecto.
2. Copiar `.env.example` a `.env.local` y completar URL y anon key.
3. Cambiar el adaptador de `src/store.jsx` por consultas a Supabase, manteniendo los mismos IDs y colecciones.
4. Agregar políticas de escritura para usuarios autenticados antes de conectar el panel en producción.

## Sistema de componentes

Los componentes de edición viven en `src/components/studio/`:

- `BlockBuilder.jsx` y `BlockRenderer.jsx`: bloques de texto, columnas, imágenes, galerías, banners, video, divisor, botones, redes, mapa, HTML y formularios.
- `RichTextEditor.jsx`: editor TipTap con encabezados, listas, citas, enlaces, imágenes, código, resaltado, color, alineación y pantalla completa.
- `MediaUploader.jsx`: subida múltiple, drag & drop y conversión de imágenes a WebP en el navegador.
- `MediaGallery.jsx`: mosaico, masonry, carrusel y lightbox.
- `Calendar.jsx`: calendario mensual con eventos y agenda.
- `FieldRenderer.jsx`: texto, textarea, número, selector, opción única, múltiples, colores, fechas, archivos y rating.
- `ColorPicker.jsx`: color picker múltiple y valores HEX, RGB, HSB y CMYK.
- `Chrome.jsx`: tema, diálogo, toast, context menu, buscador Ctrl/Cmd+K y utilidades de interfaz.
- El editor de productos permite crear variables, colores, tamaños y reglas de precio sin tocar código.
