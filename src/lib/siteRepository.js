import { supabase } from './supabase';
import { assetPath } from '../data/media';

const firstError = (results) => results.find((result) => result.error)?.error || null;
const assetStoragePath = (value) => {
  if (!value || typeof value !== 'string') return value;
  const base = import.meta.env.BASE_URL || '/';
  if (base !== '/' && value.startsWith(base)) return `/${value.slice(base.length)}`;
  return value;
};
const cleanAssets = (value) => Array.isArray(value)
  ? value.map(cleanAssets)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanAssets(item)]))
    : assetStoragePath(value);

const fromProduct = (row) => ({
  ...row,
  calcType: row.calc_type,
  pricingMode: row.pricing_mode,
  priceScales: row.price_scales || [],
  variantOptions: row.variant_options || [],
  priceMatrix: row.price_matrix || {},
  minQuantity: row.min_quantity,
  quantityStep: row.quantity_step,
  isPublished: row.is_published,
  image: row.image ? assetPath(row.image) : row.image,
});

const fromSettings = (row) => ({
  brand: row.brand,
  slogan: row.slogan,
  phone: row.phone,
  email: row.email,
  address: row.address,
  whatsapp: row.whatsapp,
  heroKicker: row.hero_kicker,
  heroTitle: row.hero_title,
  heroText: row.hero_text,
  themePreset: row.theme_preset,
  themePresets: row.theme_presets || [],
});

export async function fetchSiteData() {
  if (!supabase) return null;
  const [settings, services, products, promotions, inquiries, pages, blocks] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 'main').maybeSingle(),
    supabase.from('services').select('*').eq('is_published', true).order('sort_order'),
    supabase.from('products').select('*').eq('is_published', true).order('sort_order'),
    supabase.from('promotions').select('*').eq('active', true).order('sort_order'),
    supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
    supabase.from('pages').select('*').eq('slug', 'home').maybeSingle(),
    supabase.from('page_blocks').select('*').eq('is_visible', true).order('sort_order'),
  ]);
  const error = firstError([settings, services, products, promotions, inquiries, pages, blocks]);
  if (error) throw error;
  if (!settings.data && !products.data?.length) return null;
  const homeBlocks = (blocks.data || []).map((row) => ({ id: row.id, type: row.block_type, visible: row.is_visible, ...(row.content || {}) }));
  return {
    settings: settings.data ? fromSettings(settings.data) : {},
    services: (services.data || []).map((row) => ({ ...row, isPublished: row.is_published, sortOrder: row.sort_order, image: row.image ? assetPath(row.image) : row.image })),
    products: (products.data || []).map(fromProduct),
    promotions: (promotions.data || []).map((row) => ({ ...row, oldPrice: row.old_price, sortOrder: row.sort_order })),
    inquiries: inquiries.data || [],
    homeBlocks,
    remotePageId: pages.data?.id || null,
  };
}

export async function persistSiteData(data) {
  if (!supabase) return null;
  const settings = data.settings || {};
  const operations = [
    supabase.from('site_settings').upsert({
      id: 'main', brand: settings.brand, slogan: settings.slogan, phone: settings.phone, email: settings.email,
      address: settings.address, whatsapp: settings.whatsapp, hero_kicker: settings.heroKicker, hero_title: settings.heroTitle,
      hero_text: settings.heroText, theme_preset: settings.themePreset || 'default', theme_presets: settings.themePresets || [], updated_at: new Date().toISOString(),
    }),
    supabase.from('services').upsert((data.services || []).map((row, index) => ({ id: row.id, name: row.name, short: row.short, detail: row.detail, icon: row.icon, image: assetStoragePath(row.image), tag: row.tag, sort_order: index, is_published: row.isPublished !== false })), { onConflict: 'id' }),
    supabase.from('products').upsert((data.products || []).map((row, index) => ({
      id: row.id, name: row.name, category: row.category || 'General', type: row.type || 'unit', calc_type: row.calcType || row.type || 'unit', pricing_mode: row.pricingMode || 'unit', price: Number(row.price) || 0, unit: row.unit,
      image: assetStoragePath(row.image), description: row.description, specs: row.specs || [], price_scales: row.priceScales || [], variant_options: row.variantOptions || [], price_matrix: row.priceMatrix || {}, colors: row.colors || [], sizes: row.sizes || [], min_quantity: Number(row.minQuantity) || 1, quantity_step: Number(row.quantityStep) || 1, source: row.source || 'manual', featured: Boolean(row.featured), is_published: row.isPublished !== false, sort_order: index,
    })), { onConflict: 'id' }),
    supabase.from('promotions').upsert((data.promotions || []).map((row, index) => ({ id: row.id, title: row.title, eyebrow: row.eyebrow, description: row.description, price: Number(row.price) || 0, old_price: Number(row.oldPrice) || 0, badge: row.badge, active: row.active !== false, sort_order: index })), { onConflict: 'id' }),
    supabase.from('pages').upsert({ id: 'home', slug: 'home', title: 'Inicio', intro: settings.heroText, is_published: true, updated_at: new Date().toISOString() }, { onConflict: 'id' }),
  ];
  const pageBlocks = (data.homeBlocks || []).map((block, index) => ({ id: block.id, page_id: 'home', block_type: block.type, content: cleanAssets(Object.fromEntries(Object.entries(block).filter(([key]) => !['id', 'type', 'visible'].includes(key)))), sort_order: index, is_visible: block.visible !== false, updated_at: new Date().toISOString() }));
  operations.push(supabase.from('page_blocks').upsert(pageBlocks, { onConflict: 'id' }));
  const results = await Promise.all(operations);
  const error = firstError(results);
  if (error) throw error;
  return true;
}

export async function submitInquiry(inquiry) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('inquiries').insert({ name: inquiry.name, company: inquiry.company, email: inquiry.email, phone: inquiry.phone, message: inquiry.message }).select().single();
  if (error) throw error;
  return data;
}

export async function uploadMedia(file, folder = 'uploads') {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('gigaprint-media').upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('gigaprint-media').getPublicUrl(path);
  return { path, publicUrl: data.publicUrl, name: file.name, type: file.type, bytes: file.size };
}
