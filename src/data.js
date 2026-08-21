import { assetPath, media } from './data/media';
import { estebanCatalogProducts, catalogCategories } from './catalog';

export { media };

export const themePresets = [
  {
    id: 'default',
    name: 'Gigaprint base',
    eyebrow: 'Siempre activo',
    description: 'Naranja, tinta y crema: el sistema visual principal de Gigaprint.',
    palette: { accent: '#ea580c', accentDark: '#c2410c', accentSoft: '#fff1e8', secondary: '#171714' },
    label: 'Gigaprint',
    decorations: ['✦', '+', '∞'],
  },
  {
    id: 'navidad',
    name: 'Navidad Gigaprint',
    eyebrow: 'Temporada navideña',
    description: 'Rojo y verde festivos sin perder el naranja de la marca.',
    palette: { accent: '#c9362f', accentDark: '#982521', accentSoft: '#fde9e5', secondary: '#2f7447' },
    label: 'Navidad',
    decorations: ['✦', '❄', '✧', '🎄'],
  },
  {
    id: 'milagro',
    name: 'Fiestas de Milagro',
    eyebrow: 'Temporada de septiembre',
    description: 'Verde y dorado inspirados en Milagro, manteniendo el naranja como firma.',
    palette: { accent: '#2f8f5b', accentDark: '#1e6841', accentSoft: '#e5f4e9', secondary: '#d9a62e' },
    label: 'Milagro',
    decorations: ['✦', '●', '✧', '＋'],
  },
  {
    id: 'black-friday',
    name: 'Black Friday Gigaprint',
    eyebrow: 'Campaña comercial',
    description: 'Alto contraste para promociones, lanzamientos y temporadas de venta.',
    palette: { accent: '#ea580c', accentDark: '#c2410c', accentSoft: '#fff1e8', secondary: '#090909' },
    label: 'Black Friday',
    decorations: ['%', '✦', '↗', '+'],
  },
  {
    id: 'independencia',
    name: 'Fiestas de Ecuador',
    eyebrow: 'Temporada patria',
    description: 'Verde y dorado para campañas patrias, conservando la firma naranja de Gigaprint.',
    palette: { accent: '#0f766e', accentDark: '#115e59', accentSoft: '#e5f6f3', secondary: '#d97706' },
    label: 'Ecuador',
    decorations: ['✦', '◆', '✧', '＋'],
  },
  {
    id: 'verano',
    name: 'Verano en grande',
    eyebrow: 'Campaña de temporada',
    description: 'Una energía fresca para activaciones, eventos y productos promocionales.',
    palette: { accent: '#0891b2', accentDark: '#0e7490', accentSoft: '#e6f8fc', secondary: '#f59e0b' },
    label: 'Verano',
    decorations: ['☼', '✦', '≈', '＋'],
  },
];

export const initialData = {
  schemaVersion: 2,
  catalogVersion: 4,
  settings: {
    brand: 'Gigaprint',
    slogan: 'Tus ideas en grande',
    phone: '+593 99 999 9999',
    email: 'hola@gigaprint.ec',
    address: 'Quito, Ecuador · Atención con cita previa',
    whatsapp: '593999999999',
    themePreset: 'default',
    heroKicker: 'Publicidad que se ve. Marcas que se recuerdan.',
    heroTitle: 'Haz que tu marca ocupe espacio.',
    heroText: 'Diseñamos, producimos e instalamos soluciones visuales para que tu negocio se vea profesional desde el primer vistazo.',
  },
  services: [
    { id: 'rotulos', name: 'Rótulos & fachadas', short: 'Tu local empieza a vender desde la calle.', detail: 'Rótulos sencillos, luminosos, corpóreos y fachadas completas con materiales pensados para durar.', icon: 'Building2', image: media.letrero, tag: 'Más solicitado' },
    { id: 'impresion', name: 'Impresión gran formato', short: 'Que tu campaña se vea a distancia.', detail: 'Lonas, viniles, microperforados, pendones y todo lo que necesitas para comunicar en grande.', icon: 'Printer', image: media.lona, tag: 'Producción rápida' },
    { id: 'personalizados', name: 'Personalizados & regalos', short: 'Detalles que hacen que te recuerden.', detail: 'Lámparas, neones, señalética, placas QR y piezas únicas para regalar o ambientar.', icon: 'Sparkles', image: media.laser, tag: 'A medida' },
    { id: 'laser', name: 'Corte y grabado láser', short: 'Precisión para ideas con carácter.', detail: 'Cortamos y grabamos MDF, acrílico, madera y otros materiales para proyectos especiales.', icon: 'ScanLine', image: media.laser, tag: 'Precisión' },
  ],
  products: [
    { id: 'lona', name: 'Lona publicitaria', category: 'Gran formato', type: 'm2', calcType: 'm2', price: 7.5, unit: 'm²', image: media.lona, description: 'Impresión full color para exteriores e interiores.', featured: true, specs: ['13 oz / 510 g', 'Full color CMYK', 'Acabado mate o brillante'] },
    { id: 'vinil', name: 'Vinil adhesivo', category: 'Gran formato', type: 'm2', calcType: 'm2', price: 12, unit: 'm²', image: media.vinil, description: 'Ideal para vitrinas, paredes, vehículos y señalización.', featured: true, specs: ['Corte opcional', 'Interior / exterior', 'Aplicación profesional'] },
    { id: 'corporeo', name: 'Letras corpóreas', category: 'Rótulos', type: 'unit', price: 18, unit: 'unidad', image: media.luminoso, description: 'Volumen y presencia para que tu logo destaque.', featured: true, specs: ['Acrílico, PVC o MDF', 'Color personalizado', 'Instalación disponible'] },
    { id: 'neon', name: 'Neón LED personalizado', category: 'Personalizados', type: 'unit', price: 95, unit: 'desde', image: media.neon, description: 'Tu frase o logo convertido en una pieza luminosa.', featured: false, specs: ['Base acrílica', 'Fuente incluida', 'Diseño a medida'] },
    { id: 'rollup', name: 'Roll up 85 × 200 cm', category: 'Gran formato', type: 'unit', price: 64, unit: 'unidad', image: media.rollupProduct, description: 'Tu comunicación lista para eventos y puntos de venta.', featured: false, specs: ['Estructura portátil', 'Gráfico reemplazable', 'Bolso incluido'] },
    { id: 'stickers', name: 'Stickers personalizados', category: 'Imprenta', type: 'unit', price: 0.35, unit: 'unidad', image: media.stickers, description: 'Pequeños formatos, gran recordación de marca.', featured: false, specs: ['Vinil adhesivo', 'Corte personalizado', 'Pedidos desde 50 unidades'] },
  ].concat(estebanCatalogProducts),
  promotions: [
    { id: 'promo-1', title: 'Kit apertura', eyebrow: 'Para nuevos negocios', description: 'Rótulo + tarjetas + stickers para abrir con una imagen que se sienta tuya.', price: 189, oldPrice: 245, badge: 'Ahorra 23%', active: true },
    { id: 'promo-2', title: 'Tu vitrina habla', eyebrow: 'Este mes', description: 'Diseño e instalación de vinil para vitrina hasta 4 m².', price: 79, oldPrice: 105, badge: 'Cupo limitado', active: true },
    { id: 'promo-3', title: 'Pack feria', eyebrow: 'Eventos y activaciones', description: 'Roll up + 500 tarjetas + 100 stickers para salir a vender.', price: 129, oldPrice: 168, badge: 'Más vendido', active: true },
  ],
  inquiries: [],
  homeBlocks: [
    { id: 'home-intro', type: 'text', visible: true, animation: 'none', content: '<div class="home-block-kicker">Gigaprint / sistema visual</div><h2>Una misma idea puede vivir en una fachada, una vitrina y una experiencia.</h2><p>Usa este espacio desde el editor para contar campañas, mostrar procesos o destacar un servicio de temporada.</p>' },
    { id: 'home-story', type: 'media-text', visible: true, animation: 'none', side: 'left', title: 'Diseñamos para que la producción tenga sentido.', content: '<p>El diseño no termina en la pantalla. Probamos proporciones, materiales y acabados para que tu idea llegue al mundo con la fuerza correcta.</p>', src: media.workspace, alt: 'Equipo de Gigaprint trabajando' },
    { id: 'home-gallery', type: 'gallery', visible: true, animation: 'none', layout: 'masonry', columns: 3, items: [media.lona, media.neon, media.luminoso, media.rollupProduct].map((src) => ({ src, alt: 'Material de publicidad Gigaprint' })) },
  ],
};

export const categories = Array.from(new Set([...catalogCategories, 'Gran formato', 'Rótulos', 'Personalizados', 'Imprenta']));

export function money(value) {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value || 0);
}
