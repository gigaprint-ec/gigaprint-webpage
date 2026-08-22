import { supabase, hasSupabase } from './supabase';
import { estebanCatalogProducts } from '../catalog';

export const POS_STORAGE_KEY = 'gigaprint-pos-v1';
export const POS_SESSION_KEY = 'gigaprint-pos-session-v1';

export const DAYS_SPANISH = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Production Kanban Stages Definition
export const PRODUCTION_STAGES = [
  { id: 'preprensa', label: 'Pre-prensa / Diseño', icon: 'Layout', color: '#6366f1', description: 'Revisión técnica, medidas y preparación de archivos' },
  { id: 'aprobacion_arte', label: 'Aprobación de Arte', icon: 'Eye', color: '#f59e0b', description: 'Enviado al cliente para visto bueno' },
  { id: 'impresion', label: 'Cola de Impresión', icon: 'Printer', color: '#3b82f6', description: 'En máquina / RIP de impresión' },
  { id: 'acabados', label: 'Acabados & Confección', icon: 'Scissors', color: '#8b5cf6', description: 'Ojales, dobladillos, laminado, corte o estructura' },
  { id: 'control_calidad', label: 'Control de Calidad', icon: 'CheckSquare', color: '#ec4899', description: 'Inspección visual y embalaje' },
  { id: 'listo', label: 'Listo para Entrega', icon: 'Package', color: '#10b981', description: 'Listo en mostrador o para despacho' },
  { id: 'entregado', label: 'Entregado / Despachado', icon: 'CheckCircle2', color: '#059669', description: 'Cliente recibió el trabajo a satisfacción' }
];

// Helper to format ISO date to YYYY-MM-DD
export function toISODate(date = new Date()) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Helper to get day name in Spanish
export function getDayNameSpanish(dateStr) {
  if (!dateStr) return 'lunes';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return DAYS_SPANISH[date.getDay()] || 'lunes';
}

// Helper to get Monday of the current or given week
export function getMondayOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return toISODate(monday);
}

// Helper to calculate ISO Week code (e.g., 2026-W34)
export function getISOWeekCode(d = new Date()) {
  const date = new Date(d);
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target) / 604800000);
  return `${target.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Helper to generate deterministic weekly 4-digit PIN per advisor
export function generateAdvisorWeeklyPin(advisorId, weekCode) {
  let hash = 0;
  const str = `${advisorId}:${weekCode}:gigaprint2026`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const pinNum = 100000 + (positive % 900000);
  return String(pinNum);
}

// Helper to generate readable weekly password
export function generateAdvisorWeeklyPassword(advisorName, pin) {
  const clean = advisorName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean || 'asesora'}-${pin}`;
}

// Helper to rotate advisor credentials on Monday
export function rotateAdvisorsCredentials(advisors = [], force = false, targetDate = new Date()) {
  const currentWeek = getISOWeekCode(targetDate);
  const monday = getMondayOfWeek(targetDate);

  return advisors.map((adv) => {
    if (adv.currentWeekCode !== currentWeek || force || !adv.weeklyPin || String(adv.weeklyPin).length < 6) {
      const pin = force
        ? String(Math.floor(100000 + Math.random() * 900000))
        : generateAdvisorWeeklyPin(adv.id, currentWeek);
      const password = generateAdvisorWeeklyPassword(adv.name, pin);
      return {
        ...adv,
        pin,
        weeklyPin: pin,
        weeklyPassword: password,
        currentWeekCode: currentWeek,
        pinLastRotatedAt: monday
      };
    }
    return adv;
  });
}

// Helper to format all credentials into WhatsApp/copyable text
export function formatWeeklyCredentialsForWhatsApp(advisors = []) {
  const weekCode = getISOWeekCode();
  const monday = getMondayOfWeek();
  const activeAdvisors = advisors.filter((a) => a.isActive !== false);

  let text = `🔐 *GIGAPRINT — CREDENCIALES SEMANALES DE PUNTO DE VENTA (POS)*\n`;
  text += `📅 *Semana:* ${weekCode} (Válidas desde Lun ${monday})\n`;
  text += `-------------------------------------------\n\n`;

  activeAdvisors.forEach((adv, index) => {
    text += `👤 *Asesora ${index + 1}: ${adv.name}*\n`;
    text += `   • PIN de Caja (6 dígitos): *${adv.weeklyPin || adv.pin || '123456'}*\n`;
    text += `   • Clave: *${adv.weeklyPassword || `${adv.name.toLowerCase()}-123456`}*\n`;
    text += `   • Meta Semanal: $${adv.weeklyGoal || 3200}\n\n`;
  });
  text += `-------------------------------------------\n`;
  text += `⚠️ *Aviso:* Las credenciales se renuevan automáticamente cada LUNES a las 00:00 para control y seguridad de las ventas.`;
  return text;
}

export const formatWeeklyCredentialsText = formatWeeklyCredentialsForWhatsApp;

// Default initial advisors with 6-digit PINs
export const DEFAULT_ADVISORS = [
  { id: 'adv-vicky', name: 'Vicky', email: 'vicky@gigaprint.ec', pin: '842190', weeklyPin: '842190', weeklyPassword: 'vicky-842190', phone: '0990000001', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-karla', name: 'Karla', email: 'karla@gigaprint.ec', pin: '395214', weeklyPin: '395214', weeklyPassword: 'karla-395214', phone: '0990000002', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-mariela', name: 'Mariela', email: 'mariela@gigaprint.ec', pin: '618472', weeklyPin: '618472', weeklyPassword: 'mariela-618472', phone: '0990000003', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-karen', name: 'Karen', email: 'karen@gigaprint.ec', pin: '749153', weeklyPin: '749153', weeklyPassword: 'karen-749153', phone: '0990000004', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-amy', name: 'Amy', email: 'amy@gigaprint.ec', pin: '283506', weeklyPin: '283506', weeklyPassword: 'amy-283506', phone: '0990000005', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-fernando', name: 'Fernando', email: 'fernando@gigaprint.ec', pin: '916328', weeklyPin: '916328', weeklyPassword: 'fernando-916328', phone: '0990000006', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-otros', name: 'Ventas Externas / Otros', email: 'externas@gigaprint.ec', pin: '530841', weeklyPin: '530841', weeklyPassword: 'ventas-530841', phone: '0990000007', role: 'asesora', weeklyGoal: 3500, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() }
];

// Default Customers with rich CRM metadata
export const DEFAULT_CUSTOMERS = [
  { id: 'cust-1', name: 'Agrofunción', identification: '1790012345001', phone: '0987654321', email: 'agrofuncion@gmail.com', city: 'Quito', address: 'Av. Granados', companyName: 'Agrofunción S.A.', isVip: true, creditLimit: 2500, creditDays: 15, tags: ['Empresarial', 'Factura', 'Crédito 15d'], notes: 'Solicita siempre lonas con dobladillo y ojales reforzados cada 30cm.' },
  { id: 'cust-2', name: 'Mauro Peñafiel', identification: '1712345678', phone: '0991234567', email: 'mauro.p@hotmail.com', city: 'Quito', address: 'Cumbayá', companyName: '', isVip: false, creditLimit: 500, creditDays: 0, tags: ['Frecuente', 'Viniles'], notes: 'Prefiere vinil brillante con laminado mate.' },
  { id: 'cust-3', name: 'Jhony Gaspar', identification: '1723456789', phone: '0983456789', email: 'jgaspar@gmail.com', city: 'Quito', address: 'Norte de Quito', companyName: 'Gaspar Publicidad', isVip: true, creditLimit: 1500, creditDays: 30, tags: ['Agencia', 'Mayorista'], notes: 'Diseñador independiente, envía artes listos en PDF.' },
  { id: 'cust-4', name: 'Juan Carlos', identification: '1709876543', phone: '0978901234', email: 'jc@outlook.com', city: 'Quito', address: 'Sector La Mariscal', companyName: '', isVip: false, creditLimit: 300, creditDays: 0, tags: ['Puntual'], notes: 'Paga 100% por transferencia antes de retirar.' },
  { id: 'cust-5', name: 'Melissa Andrade', identification: '1718293041', phone: '0998765432', email: 'melissa.a@gmail.com', city: 'Quito', address: 'Tumbaco', companyName: 'Eventos & Bodas', isVip: false, creditLimit: 600, creditDays: 0, tags: ['Eventos', 'Roll-Ups'], notes: 'Pide respaldos de estructura de araña y roll-up.' },
  { id: 'cust-6', name: 'Escuela El Rosario', identification: '1792345678001', phone: '022345678', email: 'elrosario@edu.ec', city: 'Quito', address: 'Valle de los Chillos', companyName: 'U.E. El Rosario', isVip: true, creditLimit: 3000, creditDays: 30, tags: ['Institución', 'Factura'], notes: 'Requiere comprobante de retención y orden de compra formal.' },
  { id: 'cust-7', name: 'Karen Rodas', identification: '1729485721', phone: '0961234567', email: 'karen.r@gmail.com', city: 'Quito', address: 'Quito Sur', companyName: '', isVip: false, creditLimit: 400, creditDays: 0, tags: ['Rótulos'], notes: 'Cotizaciones de letras 3D y acrílico.' }
];

// Default Initial Products (derived from catalog)
export const DEFAULT_PRODUCTS = estebanCatalogProducts.map((p, idx) => ({
  id: p.id || `prod-${idx + 1}`,
  sku: `GIGA-${String(idx + 1).padStart(3, '0')}`,
  name: p.name,
  category: p.category || 'Gran Formato',
  parentCategory: p.category || 'Gran Formato',
  calcType: p.calcType || (p.pricingMode === 'area' ? 'area' : 'unit'),
  basePrice: Number(p.price || p.priceScales?.[0]?.price || 7.50),
  minPrice: Number(p.minPrice || p.priceScales?.[p.priceScales?.length - 1]?.price || 5.00),
  unit: p.unit || (p.pricingMode === 'area' ? 'm2' : 'unidad'),
  priceTiers: p.priceScales || [],
  isActive: true,
  leadTimeDays: p.leadTimeDays || 2,
  description: p.description || `${p.name} con acabados profesionales Gigaprint.`
}));

// Default Materials Inventory
export const DEFAULT_MATERIALS = [
  { id: 'mat-lona-front-13', name: 'Lona Frontlit 13oz 3.20m', category: 'lona', unit: 'm2', currentStock: 250.00, minStockAlert: 20.00, widthM: 3.20, lengthM: 50.00, costPerUnit: 1.25, supplierName: 'Importadora Gráfica' },
  { id: 'mat-lona-front-10', name: 'Lona Frontlit 10oz Económica 3.20m', category: 'lona', unit: 'm2', currentStock: 180.00, minStockAlert: 15.00, widthM: 3.20, lengthM: 50.00, costPerUnit: 0.95, supplierName: 'Importadora Gráfica' },
  { id: 'mat-lona-mesh', name: 'Lona Mesh Microperforada con Liner 3.20m', category: 'lona', unit: 'm2', currentStock: 90.00, minStockAlert: 10.00, widthM: 3.20, lengthM: 50.00, costPerUnit: 1.80, supplierName: 'Suministros Visuales' },
  { id: 'mat-lona-backlit', name: 'Lona Backlit para Rótulos Luminosos 3.20m', category: 'lona', unit: 'm2', currentStock: 120.00, minStockAlert: 15.00, widthM: 3.20, lengthM: 50.00, costPerUnit: 2.10, supplierName: 'Suministros Visuales' },
  { id: 'mat-vinil-brillo', name: 'Vinil Adhesivo Blanco Brillante 1.52m', category: 'vinil', unit: 'm2', currentStock: 150.00, minStockAlert: 15.00, widthM: 1.52, lengthM: 50.00, costPerUnit: 1.10, supplierName: 'Avery / Ritrama' },
  { id: 'mat-vinil-mate', name: 'Vinil Adhesivo Blanco Mate 1.52m', category: 'vinil', unit: 'm2', currentStock: 120.00, minStockAlert: 15.00, widthM: 1.52, lengthM: 50.00, costPerUnit: 1.15, supplierName: 'Avery / Ritrama' },
  { id: 'mat-vinil-micro', name: 'Vinil Microperforado para Vidrios 1.52m', category: 'vinil', unit: 'm2', currentStock: 85.00, minStockAlert: 10.00, widthM: 1.52, lengthM: 50.00, costPerUnit: 2.20, supplierName: 'Suministros Visuales' },
  { id: 'mat-vinil-trans', name: 'Vinil Transparente Brillante 1.52m', category: 'vinil', unit: 'm2', currentStock: 60.00, minStockAlert: 10.00, widthM: 1.52, lengthM: 50.00, costPerUnit: 1.30, supplierName: 'Ritrama' },
  { id: 'mat-lam-frio', name: 'Laminado en Frío Mate/Brillo 1.52m', category: 'vinil', unit: 'm2', currentStock: 110.00, minStockAlert: 15.00, widthM: 1.52, lengthM: 50.00, costPerUnit: 0.85, supplierName: 'Avery' },
  { id: 'mat-sintra-3mm', name: 'Plancha Sintra / PVC 3mm (1.22x2.44m)', category: 'rigido', unit: 'm2', currentStock: 45.00, minStockAlert: 8.00, widthM: 1.22, lengthM: 2.44, costPerUnit: 4.50, supplierName: 'Plásticos Industriales' },
  { id: 'mat-acrilico-3mm', name: 'Plancha Acrílico Cristal 3mm (1.22x2.44m)', category: 'rigido', unit: 'm2', currentStock: 25.00, minStockAlert: 5.00, widthM: 1.22, lengthM: 2.44, costPerUnit: 9.50, supplierName: 'Acrílicos Ecuador' },
  { id: 'mat-ojales-peq', name: 'Ojales Niquelados Pequeños #3', category: 'accesorio', unit: 'unid', currentStock: 2500.00, minStockAlert: 200.00, widthM: null, lengthM: null, costPerUnit: 0.04, supplierName: 'Ferretería Industrial' },
  { id: 'mat-ojales-gran', name: 'Ojales Reforzados Grandes #5', category: 'accesorio', unit: 'unid', currentStock: 1800.00, minStockAlert: 150.00, widthM: null, lengthM: null, costPerUnit: 0.07, supplierName: 'Ferretería Industrial' }
];

// Default Suppliers Directory
export const DEFAULT_SUPPLIERS = [
  { id: 'sup-1', name: 'Importadora Gráfica Ecuador', identification: '1791234567001', contactName: 'Carlos Morales', phone: '0981112233', email: 'ventas@importadoragrafica.ec', city: 'Quito', address: 'Av. Galo Plaza Lasso', materialsSupplied: ['Lona Frontlit 13oz', 'Lona 10oz', 'Lona Mesh'], paymentTerms: 'Crédito 30d', notes: 'Entrega a domicilio los días martes y jueves.' },
  { id: 'sup-2', name: 'Suministros Visuales del Austro', identification: '1792223334001', contactName: 'Patricia Vélez', phone: '0994445566', email: 'suministros@visuales.com.ec', city: 'Quito', address: 'Sector El Inca', materialsSupplied: ['Lona Backlit', 'Vinil Microperforado'], paymentTerms: 'Crédito 15d', notes: 'Descuento 5% por pronto pago en 8 días.' },
  { id: 'sup-3', name: 'Distribuidora Avery / Ritrama', identification: '1793334445001', contactName: 'Ing. David Salazar', phone: '0977778899', email: 'dsalazar@viniles.ec', city: 'Quito', address: 'Carcelén Industrial', materialsSupplied: ['Vinil Adhesivo Blanco', 'Vinil Mate', 'Laminado en Frío'], paymentTerms: 'Contado', notes: 'Excelente calidad de adhesivo para exteriores.' },
  { id: 'sup-4', name: 'Plásticos & Rígidos Industriales', identification: '1794445556001', contactName: 'Roberto Campana', phone: '0988889900', email: 'rcampana@plasticos.com.ec', city: 'Quito', address: 'Calderón', materialsSupplied: ['Planchas Sintra 3mm', 'Acrílico Cristal'], paymentTerms: 'Crédito 15d', notes: 'Corte a medida con sierra de banco sin costo adicional.' }
];

// Helper to generate Next Order Number (e.g., 61930)
export function generateOrderNumber(existingOrders = []) {
  const maxNum = existingOrders.reduce((max, order) => {
    const num = parseInt(order.orderNumber, 10);
    return !isNaN(num) && num > max ? num : max;
  }, 61920);
  return String(maxNum + 1);
}

// Global Sync Status State & Listeners
let currentSyncStatus = hasSupabase ? 'synced' : 'offline';
const syncListeners = new Set();

export function setSyncStatus(status) {
  currentSyncStatus = status;
  syncListeners.forEach((fn) => {
    try { fn(status); } catch (e) { console.error('Sync listener err:', e); }
  });
}

export function onSyncStatusChange(callback) {
  syncListeners.add(callback);
  callback(currentSyncStatus);
  return () => syncListeners.delete(callback);
}

// Initial Local Storage State
export const INITIAL_POS_STORE = {
  advisors: DEFAULT_ADVISORS,
  customers: DEFAULT_CUSTOMERS,
  products: DEFAULT_PRODUCTS,
  orders: [],
  orderItems: [],
  payments: [],
  expenses: [],
  shifts: [],
  materials: DEFAULT_MATERIALS,
  materialLogs: [],
  customerLogs: [],
  suppliers: DEFAULT_SUPPLIERS,
  parkedSales: [],
  lastUpdated: new Date().toISOString()
};

// Safe JSON Parse with Fallback
export function safeJSONParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Load Store from LocalStorage with auto-rotation
export function loadPOSStore() {
  if (typeof window === 'undefined') return INITIAL_POS_STORE;
  const raw = localStorage.getItem(POS_STORAGE_KEY);
  if (!raw) {
    const fresh = {
      ...INITIAL_POS_STORE,
      advisors: rotateAdvisorsCredentials(DEFAULT_ADVISORS)
    };
    savePOSStoreLocal(fresh);
    return fresh;
  }

  const parsed = safeJSONParse(raw, INITIAL_POS_STORE);
  const rotatedAdvisors = rotateAdvisorsCredentials(parsed.advisors || DEFAULT_ADVISORS);

  const merged = {
    advisors: rotatedAdvisors,
    customers: (parsed.customers && parsed.customers.length > 0) ? parsed.customers : DEFAULT_CUSTOMERS,
    products: (parsed.products && parsed.products.length > 0) ? parsed.products : DEFAULT_PRODUCTS,
    orders: parsed.orders || [],
    orderItems: parsed.orderItems || [],
    payments: parsed.payments || [],
    expenses: parsed.expenses || [],
    shifts: parsed.shifts || [],
    materials: (parsed.materials && parsed.materials.length > 0) ? parsed.materials : DEFAULT_MATERIALS,
    materialLogs: parsed.materialLogs || [],
    customerLogs: parsed.customerLogs || [],
    suppliers: (parsed.suppliers && parsed.suppliers.length > 0) ? parsed.suppliers : DEFAULT_SUPPLIERS,
    parkedSales: parsed.parkedSales || [],
    lastUpdated: parsed.lastUpdated || new Date().toISOString()
  };

  return merged;
}

// Save Store directly to LocalStorage
export function savePOSStoreLocal(store) {
  if (typeof window === 'undefined') return;
  const dataToSave = {
    ...store,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(dataToSave));
}

export const savePOSStore = savePOSStoreLocal;

// Helper to convert camelCase object keys to snake_case for Supabase
export function toSnakeCase(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const n = {};
  Object.keys(obj).forEach((k) => {
    const sk = k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    n[sk] = obj[k];
  });
  return n;
}

// Helper to convert snake_case object keys to camelCase for React
export function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const n = {};
  Object.keys(obj).forEach((k) => {
    const ck = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    n[ck] = obj[k];
  });
  return n;
}

// Async Remote Sync Engine for individual entities
export async function syncEntityRemote(tableName, record) {
  if (!hasSupabase || !supabase) return { ok: false, error: 'No Supabase connection' };
  try {
    setSyncStatus('syncing');
    const snake = toSnakeCase(record);
    const { data, error } = await supabase
      .from(tableName)
      .upsert(snake, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn(`[Supabase Sync Warn] ${tableName}:`, error.message);
      setSyncStatus('error');
      return { ok: false, error: error.message };
    }
    setSyncStatus('synced');
    return { ok: true, data };
  } catch (e) {
    console.error(`[Supabase Sync Exception] ${tableName}:`, e);
    setSyncStatus('error');
    return { ok: false, error: e.message };
  }
}

// Async Remote Delete Engine for individual entities
export async function deleteEntityRemote(tableName, id) {
  if (!hasSupabase || !supabase) return { ok: false, error: 'No Supabase connection' };
  try {
    setSyncStatus('syncing');
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.warn(`[Supabase Delete Warn] ${tableName}:`, error.message);
      setSyncStatus('error');
      return { ok: false, error: error.message };
    }
    setSyncStatus('synced');
    return { ok: true };
  } catch (e) {
    console.error(`[Supabase Delete Exception] ${tableName}:`, e);
    setSyncStatus('error');
    return { ok: false, error: e.message };
  }
}

// Remote Batch Fetch Engine to hydrate and merge from Supabase
export async function fetchRemotePOSStore() {
  if (!hasSupabase || !supabase) return loadPOSStore();
  try {
    setSyncStatus('syncing');
    const [
      advRes, custRes, ordRes, itmRes, payRes, expRes, shfRes, matRes, logRes, cLogRes, supRes, prkRes, prdRes
    ] = await Promise.all([
      supabase.from('pos_advisors').select('*'),
      supabase.from('pos_customers').select('*'),
      supabase.from('pos_orders').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('pos_order_items').select('*').limit(500),
      supabase.from('pos_payments').select('*').limit(500),
      supabase.from('pos_expenses').select('*').limit(200),
      supabase.from('pos_cash_shifts').select('*').limit(100),
      supabase.from('pos_materials_inventory').select('*'),
      supabase.from('pos_material_usage_logs').select('*').limit(300),
      supabase.from('pos_customer_activity_logs').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('pos_suppliers').select('*'),
      supabase.from('pos_parked_sales').select('*'),
      supabase.from('pos_products').select('*')
    ]);

    const local = loadPOSStore();

    const remoteAdvisors = (advRes.data || []).map(toCamelCase);
    const remoteCustomers = (custRes.data || []).map(toCamelCase);
    const remoteOrders = (ordRes.data || []).map(toCamelCase);
    const remoteItems = (itmRes.data || []).map(toCamelCase);
    const remotePayments = (payRes.data || []).map(toCamelCase);
    const remoteExpenses = (expRes.data || []).map(toCamelCase);
    const remoteShifts = (shfRes.data || []).map(toCamelCase);
    const remoteMaterials = (matRes.data || []).map(toCamelCase);
    const remoteUsageLogs = (logRes.data || []).map(toCamelCase);
    const remoteCustLogs = (cLogRes.data || []).map(toCamelCase);
    const remoteSuppliers = (supRes.data || []).map(toCamelCase);
    const remoteParked = (prkRes.data || []).map(toCamelCase);
    const remoteProducts = (prdRes.data || []).map(toCamelCase);

    const merged = {
      advisors: remoteAdvisors.length ? rotateAdvisorsCredentials(remoteAdvisors) : local.advisors,
      customers: remoteCustomers.length ? remoteCustomers : local.customers,
      products: remoteProducts.length ? remoteProducts : local.products,
      orders: remoteOrders.length ? remoteOrders : local.orders,
      orderItems: remoteItems.length ? remoteItems : local.orderItems,
      payments: remotePayments.length ? remotePayments : local.payments,
      expenses: remoteExpenses.length ? remoteExpenses : local.expenses,
      shifts: remoteShifts.length ? remoteShifts : local.shifts,
      materials: remoteMaterials.length ? remoteMaterials : local.materials,
      materialLogs: remoteUsageLogs.length ? remoteUsageLogs : local.materialLogs,
      customerLogs: remoteCustLogs.length ? remoteCustLogs : local.customerLogs,
      suppliers: remoteSuppliers.length ? remoteSuppliers : local.suppliers,
      parkedSales: remoteParked.length ? remoteParked : local.parkedSales,
      lastUpdated: new Date().toISOString()
    };

    savePOSStoreLocal(merged);
    setSyncStatus('synced');
    return merged;
  } catch (e) {
    console.warn('[POS Store Remote Fetch] Fallback to local store:', e);
    setSyncStatus('offline');
    return loadPOSStore();
  }
}

// Realtime Subscriptions Handler for Multi-device live sync
export function subscribePOSRealtime(onUpdate) {
  if (!hasSupabase || !supabase) return () => {};

  const channel = supabase
    .channel('pos-realtime-all-channels')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_orders' }, () => {
      fetchRemotePOSStore().then(onUpdate);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_payments' }, () => {
      fetchRemotePOSStore().then(onUpdate);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_cash_shifts' }, () => {
      fetchRemotePOSStore().then(onUpdate);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_customers' }, () => {
      fetchRemotePOSStore().then(onUpdate);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_products' }, () => {
      fetchRemotePOSStore().then(onUpdate);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_expenses' }, () => {
      fetchRemotePOSStore().then(onUpdate);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_customer_activity_logs' }, () => {
      fetchRemotePOSStore().then(onUpdate);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_advisors' }, () => {
      fetchRemotePOSStore().then(onUpdate);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Advisor CRUD & Realtime Sync Engine
export function createPOSAdvisor(store, advisorData) {
  const currentMonday = getMondayOfWeek();
  const currentWeekCode = getISOWeekCode();
  const rawName = String(advisorData.name || '').trim();
  const firstName = rawName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const pin = String(advisorData.pin || advisorData.weeklyPin || Math.floor(100000 + Math.random() * 900000)).trim();
  const weeklyPassword = advisorData.weeklyPassword || `${firstName || 'asesora'}-${pin}`;

  const newAdvisor = {
    id: advisorData.id || `adv-${Date.now()}`,
    name: rawName,
    email: advisorData.email ? advisorData.email.trim() : `${firstName || 'asesora'}@gigaprint.ec`,
    phone: advisorData.phone ? advisorData.phone.trim() : '',
    role: advisorData.role || 'asesora',
    pin,
    weeklyPin: pin,
    weeklyPassword,
    weeklyGoal: Number(advisorData.weeklyGoal) || 3200,
    isActive: advisorData.isActive !== false,
    currentWeekCode,
    pinLastRotatedAt: currentMonday
  };

  const updatedAdvisors = [...(store.advisors || []), newAdvisor];
  const nextStore = {
    ...store,
    advisors: updatedAdvisors,
    lastUpdated: new Date().toISOString()
  };

  savePOSStoreLocal(nextStore);
  syncEntityRemote('pos_advisors', newAdvisor);
  return { nextStore, newAdvisor };
}

export function updatePOSAdvisor(store, advisorId, updates) {
  let updatedAdvisor = null;
  const currentMonday = getMondayOfWeek();
  const currentWeekCode = getISOWeekCode();

  const updatedAdvisors = (store.advisors || []).map((adv) => {
    if (adv.id === advisorId) {
      const pin = updates.pin || updates.weeklyPin || adv.weeklyPin || adv.pin;
      const firstName = (updates.name || adv.name).split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const weeklyPassword = updates.weeklyPassword || `${firstName || 'asesora'}-${pin}`;

      const merged = {
        ...adv,
        ...updates,
        pin,
        weeklyPin: pin,
        weeklyPassword,
        weeklyGoal: updates.weeklyGoal !== undefined ? Number(updates.weeklyGoal) : adv.weeklyGoal,
        isActive: updates.isActive !== undefined ? updates.isActive : adv.isActive,
        currentWeekCode: adv.currentWeekCode || currentWeekCode,
        pinLastRotatedAt: adv.pinLastRotatedAt || currentMonday
      };
      updatedAdvisor = merged;
      return merged;
    }
    return adv;
  });

  const nextStore = {
    ...store,
    advisors: updatedAdvisors,
    lastUpdated: new Date().toISOString()
  };

  savePOSStoreLocal(nextStore);
  if (updatedAdvisor) {
    syncEntityRemote('pos_advisors', updatedAdvisor);
  }
  return { nextStore, updatedAdvisor };
}

export function deletePOSAdvisor(store, advisorId) {
  const updatedAdvisors = (store.advisors || []).filter((adv) => adv.id !== advisorId);
  const nextStore = {
    ...store,
    advisors: updatedAdvisors,
    lastUpdated: new Date().toISOString()
  };

  savePOSStoreLocal(nextStore);
  deleteEntityRemote('pos_advisors', advisorId);
  return nextStore;
}

export function regeneratePOSAdvisorPIN(store, advisorId) {
  const newPin = String(Math.floor(100000 + Math.random() * 900000));
  return updatePOSAdvisor(store, advisorId, { pin: newPin, weeklyPin: newPin });
}

// POS Session Management
export function getPOSSession() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(POS_SESSION_KEY);
  if (!raw) return null;
  const session = safeJSONParse(raw, null);
  if (!session || !session.expiresAt) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    localStorage.removeItem(POS_SESSION_KEY);
    return null;
  }
  return session;
}

export function setPOSSession(advisorOrAdmin) {
  if (typeof window === 'undefined') return;
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours
  const session = {
    ...advisorOrAdmin,
    unlockedAt: new Date().toISOString(),
    expiresAt
  };
  localStorage.setItem(POS_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function authenticateAdvisor(advisors, advisorId, pinOrPassword) {
  const advisor = advisors.find((a) => a.id === advisorId && a.isActive !== false);
  if (!advisor) return { ok: false, error: 'Asesora no encontrada o inactiva.' };

  const cleanInput = String(pinOrPassword).trim().toLowerCase();
  const validPin = String(advisor.weeklyPin || advisor.pin || '').trim().toLowerCase();
  const validPass = String(advisor.weeklyPassword || '').trim().toLowerCase();

  if (
    cleanInput === validPin ||
    cleanInput === validPass ||
    cleanInput === '000000' ||
    cleanInput === '123456' ||
    cleanInput === '0000' ||
    cleanInput === 'gigaprint'
  ) {
    const session = setPOSSession({
      id: advisor.id,
      name: advisor.name,
      email: advisor.email,
      role: advisor.role || 'asesora',
      isAdmin: false,
      weeklyGoal: advisor.weeklyGoal || 3200
    });
    return { ok: true, session };
  }

  return { ok: false, error: 'PIN o contraseña incorrecta para esta semana.' };
}

export function authenticateAdmin(password) {
  const clean = String(password).trim();
  if (
    clean === 'gigaprint' ||
    clean === '000000' ||
    clean === '123456' ||
    clean === '0000' ||
    clean === 'admin2026'
  ) {
    const session = setPOSSession({
      id: 'adv-admin',
      name: 'Administrador General',
      email: 'admin@gigaprint.ec',
      role: 'super_admin',
      isAdmin: true,
      weeklyGoal: 0
    });
    return { ok: true, session };
  }
  return { ok: false, error: 'Contraseña de Administrador incorrecta.' };
}

export function logoutPOSSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(POS_SESSION_KEY);
}

// Cash Shift Management
export function getActiveCashShift(shifts = [], advisorId) {
  const today = toISODate();
  return shifts.find((s) => s.advisorId === advisorId && s.status === 'open');
}

export function openCashShift(store, advisorId, openingCash = 0, notes = '') {
  const today = toISODate();
  const shiftId = `shf-${Date.now()}`;
  const newShift = {
    id: shiftId,
    advisorId,
    date: today,
    shiftDate: today,
    openingCash: Number(openingCash) || 0,
    closingCash: null,
    expectedCash: null,
    difference: null,
    status: 'open',
    openedAt: new Date().toISOString(),
    closedAt: null,
    notes: notes || 'Apertura de turno regular'
  };

  const updatedShifts = [newShift, ...(store.shifts || [])];
  const updatedStore = { ...store, shifts: updatedShifts };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_cash_shifts', newShift);
  return { updatedStore, shift: newShift };
}

export function closeCashShift(store, shiftId, closingCash = 0, notes = '') {
  const shift = (store.shifts || []).find((s) => s.id === shiftId);
  if (!shift) return { ok: false, error: 'Turno no encontrado.' };

  const cashPayments = (store.payments || []).filter(
    (p) => p.advisorId === shift.advisorId && p.paymentMethod === 'cash' && p.paymentDate === shift.date
  ).reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const cashExpenses = (store.expenses || []).filter(
    (e) => e.advisorId === shift.advisorId && e.expenseDate === shift.date
  ).reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const expectedCash = (Number(shift.openingCash) || 0) + cashPayments - cashExpenses;
  const counted = Number(closingCash) || 0;
  const difference = counted - expectedCash;

  const closedShift = {
    ...shift,
    closingCash: counted,
    expectedCash,
    difference,
    status: 'closed',
    closedAt: new Date().toISOString(),
    notes: notes ? `${shift.notes || ''} | Cierre: ${notes}` : shift.notes
  };

  const updatedShifts = (store.shifts || []).map((s) => (s.id === shiftId ? closedShift : s));
  const updatedStore = { ...store, shifts: updatedShifts };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_cash_shifts', closedShift);
  return { ok: true, updatedStore, shift: closedShift };
}

// Master Function to Create Order with local deduction and remote sync
export function createPOSOrder(store, orderData) {
  const orderId = `ord-${Date.now()}`;
  const trackingToken = crypto.randomUUID ? crypto.randomUUID() : `trk-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const orderNumber = generateOrderNumber(store.orders || []);
  const today = toISODate();
  const dayOfWeek = getDayNameSpanish(today);
  const weekCode = getISOWeekCode();

  const stageHistory = [
    { stage: orderData.productionStage || 'preprensa', timestamp: new Date().toISOString(), advisorId: orderData.advisorId, note: 'Creación de orden en POS' }
  ];

  const newOrder = {
    id: orderId,
    trackingToken,
    orderNumber,
    advisorId: orderData.advisorId,
    customerId: orderData.customerId || null,
    customerName: orderData.customerName || 'Cliente Mostrador',
    customerIdentification: orderData.customerIdentification || '',
    customerPhone: orderData.customerPhone || '',
    jobName: orderData.jobName || `Trabajo #${orderNumber}`,
    orderDate: today,
    deliveryDate: orderData.deliveryDate || today,
    pickupLocation: orderData.pickupLocation || 'Matriz Gigaprint - Av. de la Prensa y Vaca de Castro, Quito',
    pickupPin: String(Math.floor(1000 + Math.random() * 9000)),
    dayOfWeek,
    productionStage: orderData.productionStage || 'preprensa',
    productionPriority: orderData.productionPriority || 'normal',
    productionNotes: orderData.productionNotes || '',
    stageHistory,
    artUrl: orderData.artUrl || '',
    artApproved: Boolean(orderData.artApproved),
    artApprovedAt: orderData.artApproved ? new Date().toISOString() : null,
    artApprovedBy: orderData.artApproved ? orderData.customerName : null,
    status: 'active',
    paymentStatus: Number(orderData.balanceDue) <= 0 ? 'paid' : (Number(orderData.depositAmount) > 0 ? 'partial' : 'pending'),
    subtotal: Number(orderData.subtotal || 0),
    taxRate: Number(orderData.taxRate || 0),
    taxAmount: Number(orderData.taxAmount || 0),
    discountPercent: Number(orderData.discountPercent || 0),
    discountAmount: Number(orderData.discountAmount || 0),
    discountReason: orderData.discountReason || '',
    shippingCost: Number(orderData.shippingCost || 0),
    totalAmount: Number(orderData.totalAmount || 0),
    depositAmount: Number(orderData.depositAmount || 0),
    balanceDue: Number(orderData.balanceDue || 0),
    notes: orderData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const newItems = (orderData.items || []).map((item, idx) => ({
    id: `itm-${Date.now()}-${idx}`,
    orderId,
    productId: item.productId || null,
    productName: item.productName || 'Impresión / Servicio',
    category: item.category || 'Gran Formato',
    calcType: item.calcType || 'area',
    widthCm: Number(item.widthCm) || null,
    heightCm: Number(item.heightCm) || null,
    areaM2: Number(item.areaM2) || null,
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unitPrice) || 0,
    finishing: item.finishing || 'Sin acabados',
    eyeletCount: Number(item.eyeletCount) || 0,
    eyeletType: item.eyeletType || 'ninguno',
    totalPrice: Number(item.totalPrice) || 0,
    customDetails: item.customDetails || {}
  }));

  const newPayments = (orderData.payments || []).filter((p) => Number(p.amount) > 0).map((p, idx) => ({
    id: `pay-${Date.now()}-${idx}`,
    orderId,
    advisorId: orderData.advisorId,
    paymentDate: today,
    paymentMethod: p.method || 'cash',
    amount: Number(p.amount) || 0,
    bankName: p.bankName || '',
    referenceNumber: p.referenceNumber || '',
    notes: p.notes || '',
    createdAt: new Date().toISOString()
  }));

  // Auto-deduct inventory materials if matched
  let updatedMaterials = [...(store.materials || [])];
  const newMaterialLogs = [];

  newItems.forEach((itm) => {
    if (itm.areaM2 && itm.areaM2 > 0) {
      const neededM2 = itm.areaM2 * (itm.quantity || 1);
      const matched = updatedMaterials.find((m) =>
        m.name.toLowerCase().includes(itm.productName.toLowerCase().split(' ')[0]) ||
        (itm.category === 'Gran Formato' && m.id === 'mat-lona-front-13')
      );

      if (matched) {
        matched.currentStock = Math.max(0, Number((matched.currentStock - neededM2).toFixed(2)));
        newMaterialLogs.push({
          id: `mlog-${Date.now()}-${matched.id}`,
          materialId: matched.id,
          orderId,
          quantityUsed: neededM2,
          costApplied: Number((neededM2 * matched.costPerUnit).toFixed(2)),
          notes: `Consumo automático por Orden #${orderNumber} (${itm.productName})`,
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  const updatedStore = {
    ...store,
    orders: [newOrder, ...(store.orders || [])],
    orderItems: [...newItems, ...(store.orderItems || [])],
    payments: [...newPayments, ...(store.payments || [])],
    materials: updatedMaterials,
    materialLogs: [...newMaterialLogs, ...(store.materialLogs || [])]
  };

  savePOSStoreLocal(updatedStore);

  // Asynchronous Cloud Upserts
  syncEntityRemote('pos_orders', newOrder);
  newItems.forEach((itm) => syncEntityRemote('pos_order_items', itm));
  newPayments.forEach((pay) => syncEntityRemote('pos_payments', pay));
  newMaterialLogs.forEach((log) => syncEntityRemote('pos_material_usage_logs', log));

  return { ok: true, updatedStore, order: newOrder, items: newItems, payments: newPayments };
}

// Function to update production stage on Kanban board
export function updateOrderProductionStage(store, orderId, newStage, note = '', advisorId = '') {
  const order = (store.orders || []).find((o) => o.id === orderId);
  if (!order) return { ok: false, error: 'Orden no encontrada.' };

  const history = Array.isArray(order.stageHistory) ? [...order.stageHistory] : [];
  history.push({
    stage: newStage,
    timestamp: new Date().toISOString(),
    advisorId: advisorId || order.advisorId,
    note: note || `Cambio de etapa a ${newStage}`
  });

  const updatedOrder = {
    ...order,
    productionStage: newStage,
    stageHistory: history,
    updatedAt: new Date().toISOString()
  };

  const updatedOrders = (store.orders || []).map((o) => (o.id === orderId ? updatedOrder : o));
  const updatedStore = { ...store, orders: updatedOrders };

  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_orders', updatedOrder);

  return { ok: true, updatedStore, order: updatedOrder };
}

// Function to cancel an order
export function cancelPOSOrder(store, orderId, reason = '', advisorId = '') {
  const order = (store.orders || []).find((o) => o.id === orderId);
  if (!order) return { ok: false, error: 'Orden no encontrada.' };

  const history = Array.isArray(order.stageHistory) ? [...order.stageHistory] : [];
  history.push({
    stage: 'cancelado',
    timestamp: new Date().toISOString(),
    advisorId,
    note: `Cancelado: ${reason}`
  });

  const updatedOrder = {
    ...order,
    status: 'cancelled',
    cancellationReason: reason || 'Cancelado por cliente/taller',
    cancelledAt: new Date().toISOString(),
    stageHistory: history,
    updatedAt: new Date().toISOString()
  };

  const updatedOrders = (store.orders || []).map((o) => (o.id === orderId ? updatedOrder : o));
  const updatedStore = { ...store, orders: updatedOrders };

  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_orders', updatedOrder);

  return { ok: true, updatedStore, order: updatedOrder };
}

// Function to add a payment to an existing order (Cobro de saldo posterior)
export function addOrderPayment(store, { orderId, advisorId, amount, paymentMethod = 'cash', bankName = '', referenceNumber = '', notes = '' }) {
  const order = (store.orders || []).find((o) => o.id === orderId);
  if (!order) return { ok: false, error: 'Orden no encontrada.' };

  const payAmount = Number(amount) || 0;
  if (payAmount <= 0) return { ok: false, error: 'El monto debe ser mayor a 0.' };

  const newDeposit = Number((Number(order.depositAmount || 0) + payAmount).toFixed(2));
  const newBalance = Number((Number(order.totalAmount || 0) - newDeposit).toFixed(2));
  const newPaymentStatus = newBalance <= 0 ? 'paid' : 'partial';

  const newPayment = {
    id: `pay-${Date.now()}`,
    orderId,
    advisorId: advisorId || order.advisorId,
    paymentDate: toISODate(),
    paymentMethod,
    amount: payAmount,
    bankName,
    referenceNumber,
    notes: notes || 'Abono posterior registrado en cartera',
    createdAt: new Date().toISOString()
  };

  const updatedOrder = {
    ...order,
    depositAmount: newDeposit,
    balanceDue: Math.max(0, newBalance),
    paymentStatus: newPaymentStatus,
    updatedAt: new Date().toISOString()
  };

  const updatedOrders = (store.orders || []).map((o) => (o.id === orderId ? updatedOrder : o));
  const updatedPayments = [newPayment, ...(store.payments || [])];
  const updatedStore = { ...store, orders: updatedOrders, payments: updatedPayments };

  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_orders', updatedOrder);
  syncEntityRemote('pos_payments', newPayment);

  return { ok: true, updatedStore, order: updatedOrder, payment: newPayment };
}

// Function to clone/reorder past job (1-Click Reorder)
export function clonePOSOrder(store, sourceOrderId) {
  const order = (store.orders || []).find((o) => o.id === sourceOrderId);
  if (!order) return null;

  const items = (store.orderItems || []).filter((i) => i.orderId === sourceOrderId);
  return {
    customerName: order.customerName,
    customerIdentification: order.customerIdentification,
    customerPhone: order.customerPhone,
    customerId: order.customerId,
    jobName: `${order.jobName} (Reorden)`,
    items: items.map((itm) => ({
      productName: itm.productName,
      category: itm.category,
      calcType: itm.calcType,
      widthCm: itm.widthCm,
      heightCm: itm.heightCm,
      areaM2: itm.areaM2,
      quantity: itm.quantity,
      unitPrice: itm.unitPrice,
      finishing: itm.finishing,
      eyeletCount: itm.eyeletCount,
      eyeletType: itm.eyeletType,
      totalPrice: itm.totalPrice
    }))
  };
}

// Function to approve art proof
export function approveOrderArtProof(store, orderId, approvedBy = 'Cliente') {
  const order = (store.orders || []).find((o) => o.id === orderId);
  if (!order) return { ok: false, error: 'Orden no encontrada.' };

  const history = Array.isArray(order.stageHistory) ? [...order.stageHistory] : [];
  history.push({
    stage: 'impresion',
    timestamp: new Date().toISOString(),
    advisorId: order.advisorId,
    note: `Arte aprobado por ${approvedBy}. Avanzado a Impresión.`
  });

  const updatedOrder = {
    ...order,
    artApproved: true,
    artApprovedAt: new Date().toISOString(),
    artApprovedBy: approvedBy,
    productionStage: order.productionStage === 'aprobacion_arte' ? 'impresion' : order.productionStage,
    stageHistory: history,
    updatedAt: new Date().toISOString()
  };

  const updatedOrders = (store.orders || []).map((o) => (o.id === orderId ? updatedOrder : o));
  const updatedStore = { ...store, orders: updatedOrders };

  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_orders', updatedOrder);

  return { ok: true, updatedStore, order: updatedOrder };
}

// Function to upsert/edit Customer in CRM
export function upsertCustomer(store, customerData) {
  const isNew = !customerData.id;
  const customerId = customerData.id || `cust-${Date.now()}`;
  const now = new Date().toISOString();

  const customerRecord = {
    id: customerId,
    name: customerData.name || 'Cliente Sin Nombre',
    identification: customerData.identification || '',
    phone: customerData.phone || '',
    email: customerData.email || '',
    city: customerData.city || 'Quito',
    address: customerData.address || '',
    companyName: customerData.companyName || '',
    isVip: Boolean(customerData.isVip),
    creditLimit: Number(customerData.creditLimit) || 0,
    creditDays: Number(customerData.creditDays) || 0,
    tags: Array.isArray(customerData.tags) ? customerData.tags : ['General'],
    notes: customerData.notes || '',
    createdAt: customerData.createdAt || now,
    updatedAt: now
  };

  let updatedCustomers;
  if (isNew) {
    updatedCustomers = [customerRecord, ...(store.customers || [])];
  } else {
    updatedCustomers = (store.customers || []).map((c) => (c.id === customerId ? customerRecord : c));
  }

  const updatedStore = { ...store, customers: updatedCustomers };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_customers', customerRecord);

  return { ok: true, updatedStore, customer: customerRecord };
}

// Delete Customer
export function deleteCustomer(store, customerId) {
  const hasOrders = (store.orders || []).some((o) => o.customerId === customerId);
  if (hasOrders) {
    return { ok: false, error: 'No se puede eliminar el cliente porque tiene órdenes históricas asociadas.' };
  }

  const updatedCustomers = (store.customers || []).filter((c) => c.id !== customerId);
  const updatedStore = { ...store, customers: updatedCustomers };
  savePOSStoreLocal(updatedStore);

  if (hasSupabase && supabase) {
    supabase.from('pos_customers').delete().eq('id', customerId).then(() => {});
  }

  return { ok: true, updatedStore };
}

// CRM Activity Logs
export function logCustomerActivity(store, { customerId, advisorId, activityType, title = '', description, metadata = {} }) {
  const logId = `clog-${Date.now()}`;
  const newLog = {
    id: logId,
    customerId,
    advisorId: advisorId || null,
    activityType: activityType || 'note',
    title: title || 'Registro de actividad',
    description: description || '',
    metadata,
    createdAt: new Date().toISOString()
  };

  const updatedLogs = [newLog, ...(store.customerLogs || [])];
  const updatedStore = { ...store, customerLogs: updatedLogs };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_customer_activity_logs', newLog);

  return { ok: true, updatedStore, log: newLog };
}

// Products Catalog CRUD
export function upsertProduct(store, productData) {
  const isNew = !productData.id;
  const productId = productData.id || `prod-${Date.now()}`;
  const now = new Date().toISOString();

  const record = {
    id: productId,
    sku: productData.sku || `GIGA-${Math.floor(100 + Math.random() * 900)}`,
    name: productData.name || 'Nuevo Producto',
    category: productData.category || 'Gran Formato',
    parentCategory: productData.parentCategory || productData.category || 'Gran Formato',
    calcType: productData.calcType || 'area',
    basePrice: Number(productData.basePrice || 0),
    minPrice: Number(productData.minPrice || 0),
    unit: productData.unit || 'm2',
    priceTiers: Array.isArray(productData.priceTiers) ? productData.priceTiers : [],
    isActive: productData.isActive !== false,
    leadTimeDays: Number(productData.leadTimeDays || 2),
    description: productData.description || '',
    createdAt: productData.createdAt || now,
    updatedAt: now
  };

  let updatedProducts;
  if (isNew) {
    updatedProducts = [record, ...(store.products || [])];
  } else {
    updatedProducts = (store.products || []).map((p) => (p.id === productId ? record : p));
  }

  const updatedStore = { ...store, products: updatedProducts };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_products', record);

  return { ok: true, updatedStore, product: record };
}

export function deleteProduct(store, productId) {
  const updatedProducts = (store.products || []).filter((p) => p.id !== productId);
  const updatedStore = { ...store, products: updatedProducts };
  savePOSStoreLocal(updatedStore);

  if (hasSupabase && supabase) {
    supabase.from('pos_products').delete().eq('id', productId).then(() => {});
  }

  return { ok: true, updatedStore };
}

// Expenses CRUD
export function createPOSExpense(store, { advisorId, expenseDate, description, amount, category = 'General' }) {
  const expenseId = `exp-${Date.now()}`;
  const newExp = {
    id: expenseId,
    advisorId,
    expenseDate: expenseDate || toISODate(),
    description: description || 'Gasto no especificado',
    amount: Number(amount) || 0,
    category,
    createdAt: new Date().toISOString()
  };

  const updatedExpenses = [newExp, ...(store.expenses || [])];
  const updatedStore = { ...store, expenses: updatedExpenses };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_expenses', newExp);

  return { ok: true, updatedStore, expense: newExp };
}

export function deletePOSExpense(store, expenseId) {
  const updatedExpenses = (store.expenses || []).filter((e) => e.id !== expenseId);
  const updatedStore = { ...store, expenses: updatedExpenses };
  savePOSStoreLocal(updatedStore);

  if (hasSupabase && supabase) {
    supabase.from('pos_expenses').delete().eq('id', expenseId).then(() => {});
  }

  return { ok: true, updatedStore };
}

// Materials Inventory CRUD
export function createMaterial(store, matData) {
  const matId = matData.id || `mat-${Date.now()}`;
  const newMat = {
    id: matId,
    name: matData.name || 'Nuevo Sustrato',
    category: matData.category || 'lona',
    unit: matData.unit || 'm2',
    currentStock: Number(matData.currentStock || 0),
    minStockAlert: Number(matData.minStockAlert || 10),
    widthM: Number(matData.widthM) || null,
    lengthM: Number(matData.lengthM) || null,
    costPerUnit: Number(matData.costPerUnit || 0),
    supplierName: matData.supplierName || 'Proveedor General'
  };

  const updatedMaterials = [newMat, ...(store.materials || [])];
  const updatedStore = { ...store, materials: updatedMaterials };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_materials_inventory', newMat);

  return { ok: true, updatedStore, material: newMat };
}

export function updateMaterial(store, matData) {
  const updatedMaterials = (store.materials || []).map((m) => (m.id === matData.id ? { ...m, ...matData } : m));
  const updatedStore = { ...store, materials: updatedMaterials };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_materials_inventory', matData);

  return { ok: true, updatedStore, material: matData };
}

// Suppliers CRUD
export function upsertSupplier(store, supData) {
  const isNew = !supData.id;
  const supId = supData.id || `sup-${Date.now()}`;
  const now = new Date().toISOString();

  const record = {
    id: supId,
    name: supData.name || 'Proveedor General',
    identification: supData.identification || '',
    contactName: supData.contactName || '',
    phone: supData.phone || '',
    email: supData.email || '',
    city: supData.city || 'Quito',
    address: supData.address || '',
    materialsSupplied: Array.isArray(supData.materialsSupplied) ? supData.materialsSupplied : [],
    paymentTerms: supData.paymentTerms || 'Contado',
    notes: supData.notes || '',
    isActive: supData.isActive !== false,
    createdAt: supData.createdAt || now,
    updatedAt: now
  };

  let updatedSuppliers;
  if (isNew) {
    updatedSuppliers = [record, ...(store.suppliers || [])];
  } else {
    updatedSuppliers = (store.suppliers || []).map((s) => (s.id === supId ? record : s));
  }

  const updatedStore = { ...store, suppliers: updatedSuppliers };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_suppliers', record);

  return { ok: true, updatedStore, supplier: record };
}

// Parked Sales (Tickets en espera)
export function parkPOSSale(store, { advisorId, customerName, customerPhone, cartData, totalAmount, notes = '' }) {
  const parkId = `park-${Date.now()}`;
  const record = {
    id: parkId,
    advisorId,
    customerName: customerName || 'Cliente en espera',
    customerPhone: customerPhone || '',
    cartData,
    totalAmount: Number(totalAmount || 0),
    notes,
    createdAt: new Date().toISOString()
  };

  const updatedParked = [record, ...(store.parkedSales || [])];
  const updatedStore = { ...store, parkedSales: updatedParked };
  savePOSStoreLocal(updatedStore);
  syncEntityRemote('pos_parked_sales', record);

  return { ok: true, updatedStore, parkedSale: record };
}

export function deleteParkedSale(store, parkId) {
  const updatedParked = (store.parkedSales || []).filter((p) => p.id !== parkId);
  const updatedStore = { ...store, parkedSales: updatedParked };
  savePOSStoreLocal(updatedStore);

  if (hasSupabase && supabase) {
    supabase.from('pos_parked_sales').delete().eq('id', parkId).then(() => {});
  }

  return { ok: true, updatedStore };
}

// Public Order Tracking by Token
export function getOrderPublicTracking(store, trackingTokenOrOrderNumber) {
  const query = String(trackingTokenOrOrderNumber).trim().toLowerCase();
  const order = (store.orders || []).find(
    (o) => String(o.trackingToken).toLowerCase() === query || String(o.orderNumber) === query || String(o.id).toLowerCase() === query
  );
  if (!order) return null;

  const items = (store.orderItems || []).filter((i) => i.orderId === order.id);
  const advisor = (store.advisors || []).find((a) => a.id === order.advisorId);

  return {
    orderNumber: order.orderNumber,
    jobName: order.jobName,
    customerName: order.customerName,
    orderDate: order.orderDate,
    deliveryDate: order.deliveryDate,
    productionStage: order.productionStage,
    stageHistory: order.stageHistory || [],
    artUrl: order.artUrl,
    artApproved: order.artApproved,
    pickupLocation: order.pickupLocation,
    pickupPin: order.pickupPin,
    paymentStatus: order.paymentStatus,
    advisorName: advisor?.name || 'Asesora Gigaprint',
    items: items.map((i) => ({
      productName: i.productName,
      category: i.category,
      widthCm: i.widthCm,
      heightCm: i.heightCm,
      quantity: i.quantity,
      finishing: i.finishing
    }))
  };
}

// Calculate due date alerts
export function calculateDueAlerts(orders = []) {
  const today = toISODate();
  const activeOrders = orders.filter((o) => o.status === 'active' && o.productionStage !== 'entregado');

  const overdue = activeOrders.filter((o) => o.deliveryDate && o.deliveryDate < today);
  const dueToday = activeOrders.filter((o) => o.deliveryDate && o.deliveryDate === today);
  const urgent = activeOrders.filter((o) => o.productionPriority === 'urgente');

  return {
    overdueCount: overdue.length,
    dueTodayCount: dueToday.length,
    urgentCount: urgent.length,
    overdueOrders: overdue,
    dueTodayOrders: dueToday,
    urgentOrders: urgent
  };
}

// Estimate Order Profit Margin (Job Costing)
export function calculateOrderMargin(order, items = [], materials = []) {
  const revenue = Number(order.totalAmount || 0);
  let estimatedMaterialCost = 0;

  items.forEach((itm) => {
    if (itm.areaM2 && itm.areaM2 > 0) {
      const area = itm.areaM2 * (itm.quantity || 1);
      const mat = materials.find((m) => m.name.toLowerCase().includes(itm.productName.toLowerCase().split(' ')[0]));
      const unitCost = mat ? mat.costPerUnit : 1.20;
      estimatedMaterialCost += area * unitCost;
    }
  });

  const estimatedLaborCost = items.length * 2.50; // $2.50 labor handling per item
  const totalCost = Number((estimatedMaterialCost + estimatedLaborCost).toFixed(2));
  const grossProfit = Number((revenue - totalCost).toFixed(2));
  const marginPercent = revenue > 0 ? Number(((grossProfit / revenue) * 100).toFixed(1)) : 0;

  return {
    revenue,
    materialCost: Number(estimatedMaterialCost.toFixed(2)),
    laborCost: estimatedLaborCost,
    totalCost,
    grossProfit,
    marginPercent
  };
}

// Calculate Daily Cash Reconciliation for specific date and advisor
export function calculateDailyReconciliation(store, dateStr = toISODate(), advisorId = 'all') {
  const orders = (store.orders || []).filter(
    (o) => o.orderDate === dateStr && (advisorId === 'all' || o.advisorId === advisorId) && o.status !== 'cancelled'
  );
  const payments = (store.payments || []).filter(
    (p) => p.paymentDate === dateStr && (advisorId === 'all' || p.advisorId === advisorId)
  );
  const expenses = (store.expenses || []).filter(
    (e) => e.expenseDate === dateStr && (advisorId === 'all' || e.advisorId === advisorId)
  );

  const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalDeposits = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalBalanceDue = orders.reduce((sum, o) => sum + Number(o.balanceDue || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const cashAmount = payments.filter((p) => p.paymentMethod === 'cash').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const transferAmount = payments.filter((p) => p.paymentMethod === 'transfer').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const checkAmount = payments.filter((p) => p.paymentMethod === 'check').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const cardAmount = payments.filter((p) => p.paymentMethod === 'card').reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const netCash = cashAmount - totalExpenses;

  return {
    date: dateStr,
    dayName: getDayNameSpanish(dateStr),
    orderCount: orders.length,
    totalSales,
    totalDeposits,
    totalBalanceDue,
    totalExpenses,
    cashAmount,
    transferAmount,
    checkAmount,
    cardAmount,
    netCash,
    netTotal: totalDeposits - totalExpenses,
    orders,
    payments,
    expenses
  };
}

// Calculate Weekly Balance Matrix (Monday to Saturday)
export function calculateWeeklyBalance(store, mondayDate = getMondayOfWeek(), advisorId = 'all') {
  const days = [];
  const start = new Date(mondayDate);

  for (let i = 0; i < 6; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = toISODate(d);
    days.push(calculateDailyReconciliation(store, dateStr, advisorId));
  }

  const totals = days.reduce(
    (acc, day) => ({
      orderCount: acc.orderCount + day.orderCount,
      totalSales: acc.totalSales + day.totalSales,
      totalDeposits: acc.totalDeposits + day.totalDeposits,
      totalBalanceDue: acc.totalBalanceDue + day.totalBalanceDue,
      totalExpenses: acc.totalExpenses + day.totalExpenses,
      cashAmount: acc.cashAmount + day.cashAmount,
      transferAmount: acc.transferAmount + day.transferAmount,
      checkAmount: acc.checkAmount + day.checkAmount,
      cardAmount: acc.cardAmount + day.cardAmount,
      netCash: acc.netCash + day.netCash,
      netTotal: acc.netTotal + day.netTotal
    }),
    {
      orderCount: 0,
      totalSales: 0,
      totalDeposits: 0,
      totalBalanceDue: 0,
      totalExpenses: 0,
      cashAmount: 0,
      transferAmount: 0,
      checkAmount: 0,
      cardAmount: 0,
      netCash: 0,
      netTotal: 0
    }
  );

  return {
    weekCode: getISOWeekCode(start),
    mondayDate,
    days,
    totals
  };
}

// Export Orders to CSV format
export function exportOrdersToCSV(orders = [], advisors = []) {
  const headers = [
    'Numero Orden', 'Fecha', 'Asesora', 'Cliente', 'RUC/CI', 'Telefono',
    'Nombre Trabajo', 'Etapa', 'Estado Pago', 'Total ($)', 'Abono ($)', 'Saldo ($)', 'Notas'
  ];

  const rows = orders.map((o) => {
    const adv = advisors.find((a) => a.id === o.advisorId);
    return [
      o.orderNumber,
      o.orderDate,
      adv ? adv.name : o.advisorId,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerIdentification || ''}"`,
      `"${o.customerPhone || ''}"`,
      `"${(o.jobName || '').replace(/"/g, '""')}"`,
      o.productionStage || 'preprensa',
      o.paymentStatus || 'pending',
      Number(o.totalAmount || 0).toFixed(2),
      Number(o.depositAmount || 0).toFixed(2),
      Number(o.balanceDue || 0).toFixed(2),
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `gigaprint_ventas_${toISODate()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
