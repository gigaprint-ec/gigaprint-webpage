import rawCatalog from './data/estebanCatalog.json';
import { media } from './data/media';

const numberFromLabel = (value) => {
  const match = String(value ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const quantityLabel = (value) => {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text || !/\d/.test(text)) return false;
  return /^\d+(?:[.,]\d+)?(?:\s*(?:-|–|—|a|x|\/|hasta)\s*\d+(?:[.,]\d+)?)?(?:\s*(?:m2|m²|cm|unidades?|uds?))?$/i.test(text);
};

const slugify = (value) => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  .slice(0, 70) || 'producto';

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

function imageFor(category, text = '') {
  const haystack = `${category} ${text}`.toLowerCase();
  if (haystack.includes('lona') || haystack.includes('campana')) return media.lona;
  if (haystack.includes('vinil') || haystack.includes('dtf')) return media.vinil;
  if (haystack.includes('credencial') || haystack.includes('imprenta') || haystack.includes('tarjeta')) return media.stickers;
  if (haystack.includes('laser') || haystack.includes('acril')) return media.laser;
  if (haystack.includes('rotulo') || haystack.includes('letrero')) return media.letrero;
  return media.stickers;
}

function isAreaProduct(category, text) {
  const haystack = `${category} ${text}`.toLowerCase();
  return /campana\s+lonas|\bm2\b|m²/.test(haystack);
}

function isTotalTierProduct(category) {
  return /imprenta|precios imprenta/.test(String(category).toLowerCase());
}

function buildGroupKey(row) {
  const productIsQuantity = quantityLabel(row.producto);
  const variantIsQuantity = quantityLabel(row.variante);
  if (productIsQuantity && !variantIsQuantity) return row.categoria;
  if (productIsQuantity && variantIsQuantity) return row.categoria;
  return `${row.categoria}::${row.producto}`;
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
    description: `Tarifas importadas del catálogo de Esteban · ${rows.length} reglas de precio configurables.`,
    specs: unique([category, options[0] ? 'Variantes seleccionables' : null, pricingMode === 'area' ? 'Cálculo por m²' : 'Precio por volumen']),
    featured: index < 8,
    isPublished: true,
    variantOptions: options,
    priceScales,
    priceMatrix: pricesByVariant,
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
  return product?.calcType || product?.type || (product?.pricingMode === 'area' ? 'm2' : 'unit');
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

export function getTier(product, quantity, selection = {}) {
  const tiers = getPriceTiers(product, selection);
  return tiers.reduce((current, tier) => Number(quantity) >= Number(tier.qty) ? tier : current, tiers[0] || { qty: 1, price: Number(product?.price) || 0 });
}

export function calculateCatalogQuote(product, config = {}) {
  const quantity = Math.max(Number(product?.minQuantity || 1), Number(config.quantity) || 1);
  const tier = getTier(product, quantity, config.options || {});
  const rate = Number(tier.price ?? product?.price ?? 0);
  const mode = product?.pricingMode || (getProductCalcType(product) === 'm2' ? 'area' : 'unit');
  const width = Math.max(0.01, Number(config.width) || 1);
  const height = Math.max(0.01, Number(config.height) || 1);
  const area = width * height;
  const design = Number(config.designCost) || 0;
  const extras = (config.extras || []).reduce((sum, extra) => sum + Number(extra.price || 0), 0);
  const optionAdjustment = Number(config.optionAdjustment) || 0;
  const material = mode === 'area' ? area * rate * quantity : mode === 'tier-total' ? rate : rate * quantity;
  const subtotal = Math.max(0, material + design + extras + optionAdjustment);
  return { quantity, tier, rate, mode, width, height, area, material, design, extras, optionAdjustment, subtotal, total: subtotal };
}
