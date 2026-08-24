import rawCatalog from './data/estebanCatalog.json' with { type: 'json' };
import { media } from './data/media.js';

const numberFromLabel = (value) => {
  const match = String(value ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const quantityLabel = (value) => {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text || !/\d/.test(text)) return false;
  if (/^precio\s*\d/i.test(text)) return false;
  if (/^pvp/i.test(text)) return false;
  return /^\d+(?:[.,]\d+)?(?:\s*(?:-|–|—|a|x|\/|hasta)\s*\d+(?:[.,]\d+)?)?(?:\s*(?:m2|m²|cm|unidades?|uds?|millar|millares|resma|resmas))?$/i.test(text);
};

const slugify = (value) => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  .slice(0, 70) || 'producto';

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

export function imageFor(category = '', text = '') {
  const haystack = `${category} ${text}`.toLowerCase();

  // 1. Souvenirs, Jarros & Regalos
  if (haystack.includes('escarchado')) return media.jarroEscarchado || media.jarroMagico;
  if (haystack.includes('metalizado') || haystack.includes('dorado') || haystack.includes('plateado')) return media.jarroMetalizado || media.taza;
  if (haystack.includes('porta taza') || haystack.includes('caja taza')) return media.portaTazaCaja || media.taza;
  if (haystack.includes('magico') || haystack.includes('mágico')) return media.jarroMagico || media.taza;
  if (haystack.includes('cervecero') || haystack.includes('chopp')) return media.jarroCervecero || media.taza;
  if (haystack.includes('mason')) return media.jarroMason || media.taza;
  if (haystack.includes('taz') || haystack.includes('jarro') || haystack.includes('plato')) return media.taza;
  if (haystack.includes('almohada') || haystack.includes('cojin') || haystack.includes('cojín')) return media.almohada;
  if (haystack.includes('tomatodo') && (haystack.includes('plast') || haystack.includes('dtf'))) return media.tomatodoPlastico || media.tomatodo;
  if (haystack.includes('tomatodo') || haystack.includes('termo') || haystack.includes('botella')) return media.tomatodo;
  if (haystack.includes('llavero')) return media.llaveros;
  if (haystack.includes('pin') || haystack.includes('pines') || haystack.includes('boton') || haystack.includes('botón')) return media.pinesMetalicos || media.souvenirsPack;
  if (haystack.includes('sello') || haystack.includes('fechador') || haystack.includes('trodat')) return media.sellosTrodat || media.sellosStickers;
  if (haystack.includes('lapiz') || haystack.includes('lápiz') || haystack.includes('ecologico') || haystack.includes('ecológico')) return media.lapicesEcologicos || media.souvenirsPack;
  if (haystack.includes('boligrafo') || haystack.includes('bolígrafo') || haystack.includes('esfero') || haystack.includes('semiejecutivo')) return media.boligrafosEjecutivos || media.souvenirsPack;
  if (haystack.includes('cuaderno') || haystack.includes('agenda') || haystack.includes('pasta dura')) return media.cuadernoPastaDura || media.folletosPack;

  // 2. Imprenta, Credenciales & Papelería
  if (haystack.includes('brazo') || haystack.includes('reflectivo')) return media.portacredencialBrazo || media.credencialesCombo;
  if (haystack.includes('arenada') || haystack.includes('portacredencial') || haystack.includes('yoyo') || haystack.includes('retractil')) return media.portacredencialAcrilica || media.yoyoRetractil || media.credencialesCombo;
  if (haystack.includes('combo credencial') || (haystack.includes('credencial') && haystack.includes('combo'))) return media.credencialesCombo;
  if (haystack.includes('credencial') || haystack.includes('carnet') || haystack.includes('cordon') || haystack.includes('cordón') || haystack.includes('lanyard')) return media.credencialesLanyard;
  if (haystack.includes('tarjeta') || haystack.includes('presentacion') || haystack.includes('presentación')) return media.tarjetas;
  if (haystack.includes('volante') || haystack.includes('flyer') || haystack.includes('afiche')) return media.flyers;
  if (haystack.includes('triptico') || haystack.includes('tríptico') || haystack.includes('diptico') || haystack.includes('díptico') || haystack.includes('folleto') || haystack.includes('brochure')) return media.folletosPack;
  if (haystack.includes('escritorio') || haystack.includes('sobremesa') || haystack.includes('wire-o') || haystack.includes('12 hojas')) return media.calendarioSobremesa || media.calendariosPack;
  if (haystack.includes('calendario') || haystack.includes('almanaque') || haystack.includes('santoral')) return media.calendarioPared || media.calendariosPack;
  if (haystack.includes('imprenta') || haystack.includes('factura')) return media.folletosPack;

  // 3. Fundas, Bolsos & Empaques
  if (haystack.includes('boutique') || haystack.includes('manija') || haystack.includes('baja densidad') || haystack.includes('troquelada')) return media.fundasBoutique || media.fundasPlasticas;
  if (haystack.includes('funda') || haystack.includes('bolsa') || haystack.includes('radiografia') || haystack.includes('pastillera') || (haystack.includes('camiseta') && haystack.includes('funda'))) return media.fundasCamiseta || media.fundasPlasticas;
  if (haystack.includes('cambrella') || haystack.includes('bolso')) return media.bolsosCambrellaTote || media.bolsoCambrella;
  if (haystack.includes('mochila') || haystack.includes('rodeo') || haystack.includes('gymsack')) return media.mochilaGymsack || media.mochilaRodeo;
  if (haystack.includes('funda roll') || haystack.includes('funda para roll')) return media.fundaRollup || media.bolso;
  if (haystack.includes('funda banner') || haystack.includes('funda araña') || haystack.includes('funda arana')) return media.fundaBannerX || media.bolso;

  // 4. Textil & Gorras
  if (haystack.includes('body') || haystack.includes('bebe') || haystack.includes('bebé') || haystack.includes('recien nacido')) return media.bodyBebe || media.camiseta;
  if (haystack.includes('polo') || haystack.includes('pique') || haystack.includes('piqué')) return media.poloPique || media.camisetaPolo;
  if (haystack.includes('gabardina') || (haystack.includes('gorra') && haystack.includes('bordad'))) return media.gorraBordada;
  if (haystack.includes('trucker') || haystack.includes('malla')) return media.gorraTrucker;
  if (haystack.includes('gorra ecuador') || haystack.includes('patria')) return media.gorraPatria || media.gorraEcuador || media.gorra;
  if (haystack.includes('gorra') || haystack.includes('vicera') || haystack.includes('visera')) return media.gorraPatria || media.gorra;
  if (haystack.includes('camiseta') || haystack.includes('sublimacion') || haystack.includes('dtf')) return media.camiseta;

  // 5. Rótulos, Gran Formato & Señalética
  if (haystack.includes('pancarta') || haystack.includes('guindola') || haystack.includes('desfile')) return media.pancartasMadera;
  if (haystack.includes('microperforado')) return media.vinilMicro;
  if (haystack.includes('esmerilado') || haystack.includes('frosted')) return media.vinilEsmerilado;
  if (haystack.includes('banner x') || haystack.includes('aranita') || haystack.includes('araña')) return media.bannerX;
  if (haystack.includes('roll up') || haystack.includes('rollup') || haystack.includes('dummy')) return media.rollupProduct;
  if (haystack.includes('stand')) return media.stand || media.bannerX;
  if (haystack.includes('corporeo') || haystack.includes('corpóreo') || haystack.includes('3d') || haystack.includes('relieve')) return media.letras3D;
  if (haystack.includes('placa') || haystack.includes('vidrio') || haystack.includes('acril') || haystack.includes('laser')) return media.placaVidrio || media.laser;
  if (haystack.includes('neon') || haystack.includes('neón')) return media.neon;
  if (haystack.includes('totem') || haystack.includes('tótem') || haystack.includes('parado')) return media.luminosoTotem;
  if (haystack.includes('caja de luz') || haystack.includes('cajas luz') || haystack.includes('lightbox')) return media.cajasLuzPack || media.luminoso;
  if (haystack.includes('luminoso')) return media.luminoso;
  if (haystack.includes('rotulo') || haystack.includes('rótulo') || haystack.includes('letrero') || haystack.includes('fachada')) return media.cajasLuzPack || media.letrero;
  if (haystack.includes('lona') || haystack.includes('campana lonas') || haystack.includes('panaflex') || haystack.includes('banner')) return media.lona;
  if (haystack.includes('sticker') || haystack.includes('etiqueta') || haystack.includes('troquel')) return media.stickers;
  if (haystack.includes('vinil') || haystack.includes('adhesivo')) return media.vinil;

  return media.stickers;
}

export function isAreaProduct(category = '', text = '') {
  const haystack = `${category} ${text}`.toLowerCase();
  return (
    /campana\s+lonas|\bm2\b|m²|gran formato/i.test(haystack) ||
    /lona|vinil|microperforado|panaflex|tela.*bandera/i.test(haystack) ||
    /rótulo|rotulo|fachada|caja de luz|luminoso|lightbox|corpóreo|corporeo/i.test(haystack) ||
    /porta-banner|banner en a|banner araña|banner arana/i.test(haystack)
  );
}

export function isTotalTierProduct(category = '') {
  return /imprenta|precios imprenta|radiografia|boutique|fundas camiseta/i.test(String(category).toLowerCase());
}

function buildGroupKey(row) {
  const cat = String(row.categoria).trim();
  const productIsQuantity = quantityLabel(row.producto);
  const variantIsQuantity = quantityLabel(row.variante);
  
  if (['Extras', 'Precios Imprenta', 'Souvenirs'].includes(cat)) {
    return `${cat}::${row.producto}`;
  }
  
  if (productIsQuantity && !variantIsQuantity) return cat;
  if (productIsQuantity && variantIsQuantity) return cat;
  return `${cat}::${row.producto}`;
}

function buildOptionRows(rows, key) {
  const sourceKey = key === 'producto' ? 'producto' : 'variante';
  const values = unique(rows.map((row) => row[sourceKey])).map((label) => ({
    id: slugify(label),
    label: String(label),
    value: String(label),
  }));
  if (values.length < 2) return [];
  return [{ id: 'variant', key: 'variant', label: 'Variante', type: 'select', values }];
}

function makeProduct(rows, index) {
  const first = rows[0];
  const category = String(first.categoria).trim();
  const groupKey = buildGroupKey(first);
  const [categoryKey, productKey] = groupKey.split('::');
  const productIsQuantity = quantityLabel(first.producto);
  const variantIsQuantity = quantityLabel(first.variante);
  const groupedCategory = groupKey === category;
  const optionKey = groupedCategory && !productIsQuantity ? 'producto' : groupedCategory ? 'variante' : null;
  const options = optionKey ? buildOptionRows(rows, optionKey) : [];
  const pricingMode = isTotalTierProduct(category) ? 'tier-total' : isAreaProduct(category, productKey || category) ? 'area' : 'unit';
  const pricesByVariant = {};

  const variantLabels = options[0]?.values.map((option) => option.label) || [null];
  variantLabels.forEach((variantLabel) => {
    const variantRows = variantLabel == null
      ? rows
      : rows.filter((row) => String(row[optionKey]) === String(variantLabel));
    const quantityKey = optionKey === 'producto' ? 'variante' : optionKey === 'variante' ? 'producto' : 'variante';
    const tiers = variantRows
      .map((row) => ({ qty: numberFromLabel(row[quantityKey]), price: Number(row.precio) || 0, label: String(row[quantityKey]) }))
      .filter((row) => row.qty != null)
      .sort((a, b) => a.qty - b.qty)
      .filter((row, rowIndex, list) => rowIndex === list.findIndex((item) => item.qty === row.qty));
    const fallbackRows = variantRows.map((row) => ({ qty: 1, price: Number(row.precio) || 0, label: String(row[quantityKey]) }));
    pricesByVariant[variantLabel || 'default'] = tiers.length ? tiers : fallbackRows;
  });

  const defaultVariant = variantLabels[0] || null;
  const priceScales = pricesByVariant[defaultVariant || 'default'] || [];
  const basePrice = priceScales[0]?.price || Number(first.precio) || 0;
  const name = groupedCategory ? category : String(productKey || category).trim();
  const id = `esteban-${slugify(category)}-${slugify(name)}-${index}`;
  const displayUnit = pricingMode === 'area' ? 'm²' : pricingMode === 'tier-total' ? 'lote' : 'unidad';

  return {
    id,
    source: 'esteban',
    name,
    category: category,
    type: pricingMode === 'area' ? 'm2' : pricingMode === 'tier-total' ? 'scale-total' : 'scale',
    calcType: pricingMode === 'area' ? 'm2' : pricingMode === 'tier-total' ? 'scale-total' : 'scale',
    pricingMode,
    price: basePrice,
    unit: displayUnit,
    image: imageFor(category, name),
    description: `Tarifas profesionales del catálogo Gigaprint · ${rows.length} reglas de escala y volumen.`,
    specs: unique([category, options[0] ? 'Variantes seleccionables' : null, pricingMode === 'area' ? 'Cálculo exacto por m²' : pricingMode === 'tier-total' ? 'Precio por lote completo' : 'Escala por volumen']),
    featured: index < 8,
    isPublished: true,
    variantOptions: options,
    priceScales,
    priceMatrix: pricesByVariant,
    customOptions: {
      allowDesign: true,
      allowEyelets: pricingMode === 'area' && /lona|vinil|microperforado|panaflex|tela/i.test(name),
    },
    sourceRows: rows,
    minQuantity: Math.max(1, priceScales[0]?.qty || 1),
    quantityStep: 1,
  };
}

const grouped = new Map();
rawCatalog.forEach((row) => {
  const key = buildGroupKey(row);
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(row);
});

export const estebanCatalogProducts = Array.from(grouped.values())
  .map((rows, index) => makeProduct(rows, index))
  .sort((a, b) => `${a.category} ${a.name}`.localeCompare(`${b.category} ${b.name}`, 'es'));

export const catalogCategories = ['Todos', ...unique(estebanCatalogProducts.map((product) => product.category))];

export function getProductCalcType(product) {
  if (
    product?.calcType === 'm2' ||
    product?.type === 'm2' ||
    product?.unit === 'm²' ||
    product?.unit === 'm2' ||
    product?.pricingMode === 'area' ||
    isAreaProduct(product?.category, product?.name)
  ) {
    return 'm2';
  }
  if (product?.pricingMode === 'tier-total' || product?.calcType === 'scale-total') {
    return 'scale-total';
  }
  return product?.calcType || product?.type || 'scale';
}

export function getVariantOptions(product) {
  return product?.variantOptions || product?.options || [];
}

export function getSelectedVariantKey(product, selection = {}) {
  const firstOption = getVariantOptions(product)[0];
  if (!firstOption) return 'default';
  return String(selection[firstOption.key] || firstOption.values?.[0]?.value || 'default');
}

export function getPriceTiers(product, selection = {}) {
  const matrix = product?.priceMatrix || {};
  const key = getSelectedVariantKey(product, selection);
  return (matrix[key] || product?.priceScales || []).slice().sort((a, b) => Number(a.qty) - Number(b.qty));
}

function tierPrice(tier, fallback = 0) {
  return Number(tier?.price ?? tier?.pvp ?? tier?.unitPrice ?? tier?.total ?? fallback) || 0;
}

export function getTier(product, quantity, selection = {}) {
  const tiers = getPriceTiers(product, selection);
  return tiers.reduce((current, tier) => Number(quantity) >= Number(tier.qty) ? tier : current, tiers[0] || { qty: 1, price: Number(product?.price) || 0 });
}

export function getSavingsPercentage(product, quantity, selection = {}) {
  const tiers = getPriceTiers(product, selection);
  if (!tiers.length || tiers.length === 1) return 0;
  const baseTier = tiers[0];
  const activeTier = getTier(product, quantity, selection);
  const basePrice = tierPrice(baseTier, product?.price);
  const activePrice = tierPrice(activeTier, product?.price);
  if (!basePrice || activePrice >= basePrice) return 0;
  return Math.round(((basePrice - activePrice) / basePrice) * 100);
}

export const PARENT_CATEGORIES = [
  'Todos',
  'Gran formato',
  'Rótulos y Fachadas',
  'Imprenta y Papelería',
  'Textil y Promocionales',
  'Corte y Grabado Láser'
];

export function getParentCategory(category = '') {
  const c = String(category).toLowerCase();
  if (c.includes('gran formato') || c.includes('campana') || c.includes('lona') || c.includes('vinil') || c.includes('microperforado') || c.includes('panaflex') || c.includes('roll up') || c.includes('stand') || c.includes('banner')) {
    return 'Gran formato';
  }
  if (c.includes('rótulo') || c.includes('rotulo') || c.includes('fachada') || c.includes('caja de luz') || c.includes('luminoso') || c.includes('neón') || c.includes('neon') || c.includes('corpóreo') || c.includes('corporeo')) {
    return 'Rótulos y Fachadas';
  }
  if (c.includes('imprenta') || c.includes('tarjeta') || c.includes('volante') || c.includes('tríptico') || c.includes('carpeta') || c.includes('factura') || c.includes('radiografia') || c.includes('boutique') || c.includes('funda') || c.includes('credencial')) {
    return 'Imprenta y Papelería';
  }
  if (c.includes('textil') || c.includes('camiseta') || c.includes('polo') || c.includes('gorra') || c.includes('taza') || c.includes('souvenir') || c.includes('almohada') || c.includes('bolso') || c.includes('mochila') || c.includes('regalo') || c.includes('promocional')) {
    return 'Textil y Promocionales';
  }
  if (c.includes('láser') || c.includes('laser') || c.includes('grabado') || c.includes('corte') || c.includes('acrílico') || c.includes('acril') || c.includes('placa')) {
    return 'Corte y Grabado Láser';
  }
  return 'Gran formato';
}

export function getLeadTimeEstimate(product) {
  const mode = product?.pricingMode || (getProductCalcType(product) === 'm2' ? 'area' : 'unit');
  const cat = String(product?.category || '').toLowerCase();
  if (mode === 'area') {
    return '24 a 48 horas hábiles';
  }
  if (mode === 'tier-total' || cat.includes('imprenta')) {
    return '3 a 5 días hábiles';
  }
  if (cat.includes('rótulo') || cat.includes('neón') || cat.includes('luminoso') || cat.includes('corpóreo')) {
    return '4 a 7 días hábiles';
  }
  return '24 a 72 horas hábiles';
}

export function calculateCatalogQuote(product, config = {}) {
  const calcType = getProductCalcType(product);
  const isArea = calcType === 'm2';
  const isTierTotal = product?.pricingMode === 'tier-total' || calcType === 'scale-total';
  const mode = isArea ? 'area' : isTierTotal ? 'tier-total' : 'unit';
  const quantity = Math.max(Number(product?.minQuantity || 1), Number(config.quantity) || 1);
  const width = Math.max(0.01, Number(config.width) || 1);
  const height = Math.max(0.01, Number(config.height) || 1);
  const area = width * height;
  const totalArea = area * quantity;
  // Los escalones de Campana Lonas están expresados en m² totales, no en piezas.
  const tierBasis = mode === 'area' ? totalArea : quantity;
  const tier = getTier(product, tierBasis, config.options || {});
  const tiers = getPriceTiers(product, config.options || {});
  const baseRate = tierPrice(tiers[0], product?.price);
  const rate = tierPrice(tier, product?.price);
  const design = Number(config.designCost) || 0;
  const extras = (config.extras || []).reduce((sum, extra) => sum + Number(extra.price || 0), 0);
  const optionAdjustment = Number(config.optionAdjustment) || 0;
  
  const material = mode === 'area' ? area * rate * quantity : mode === 'tier-total' ? rate : rate * quantity;
  const subtotal = Math.max(0, material + design + extras + optionAdjustment);
  const taxRate = Math.max(0, Number(config.taxRate) || 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const unitEffectivePrice = mode === 'tier-total' ? (total / Math.max(1, Number(tier.qty) || 1)) : (total / quantity);
  const savingsPercent = baseRate > rate ? Math.round(((baseRate - rate) / baseRate) * 100) : 0;
  const leadTime = getLeadTimeEstimate(product);

  return {
    quantity,
    tier,
    tiers,
    tierBasis,
    rate,
    baseRate,
    mode,
    width,
    height,
    area,
    totalArea,
    material,
    design,
    extras,
    optionAdjustment,
    subtotal,
    taxRate,
    tax,
    total,
    unitEffectivePrice,
    savingsPercent,
    leadTime,
  };
}
