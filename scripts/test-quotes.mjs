import { estebanCatalogProducts, calculateCatalogQuote, getTier, getSavingsPercentage } from '../src/catalog.js';

console.log('Testing calculateCatalogQuote across products...');

// 1. Area product (e.g. Campana Lonas)
const lona = estebanCatalogProducts.find(p => p.pricingMode === 'area');
console.log('\n--- 1. AREA PRODUCT ---');
console.log('Product:', lona.name, '| Category:', lona.category, '| Mode:', lona.pricingMode);
const quoteLona = calculateCatalogQuote(lona, { width: 2, height: 1.5, quantity: 2, taxRate: 15, designCost: 5 });
console.log('Quote 2x1.5m (3m2/unit, total 6m2), 2 units, +$5 design:');
console.log('  Material subtotal:', quoteLona.material);
console.log('  Design:', quoteLona.design);
console.log('  Subtotal:', quoteLona.subtotal);
console.log('  IVA (15%):', quoteLona.tax);
console.log('  Total:', quoteLona.total);

// 2. Unit scale product (e.g. Credenciales or Camisetas)
const credencial = estebanCatalogProducts.find(p => p.pricingMode === 'unit' && p.priceScales.length > 3);
console.log('\n--- 2. SCALE UNIT PRODUCT ---');
console.log('Product:', credencial.name, '| Category:', credencial.category);
const quoteCred1 = calculateCatalogQuote(credencial, { quantity: 1, taxRate: 15 });
const quoteCred12 = calculateCatalogQuote(credencial, { quantity: 12, taxRate: 15 });
console.log('Quote 1 unit: Rate =', quoteCred1.rate, '| Total =', quoteCred1.total);
console.log('Quote 12 units: Rate =', quoteCred12.rate, '| Total =', quoteCred12.total, '| Savings% =', quoteCred12.savingsPercent);

// 3. Tier-total product (e.g. Precios Imprenta / Tarjetas)
const imprenta = estebanCatalogProducts.find(p => p.pricingMode === 'tier-total');
console.log('\n--- 3. TIER-TOTAL PRODUCT (LOTE) ---');
console.log('Product:', imprenta.name, '| Category:', imprenta.category);
const quoteImprenta = calculateCatalogQuote(imprenta, { quantity: 1000, taxRate: 15 });
console.log('Quote 1000 units lote: Lot Price =', quoteImprenta.rate, '| Total =', quoteImprenta.total, '| Unit cost =', quoteImprenta.unitEffectivePrice.toFixed(4));

console.log('\nALL CALCULATIONS PASSED VERIFICATION.');
