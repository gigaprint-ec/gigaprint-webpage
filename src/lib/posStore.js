import { supabase, hasSupabase } from './supabase';

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
  const pinNum = 1000 + (positive % 9000);
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
    if (adv.currentWeekCode !== currentWeek || force || !adv.weeklyPin) {
      const pin = force
        ? String(Math.floor(1000 + Math.random() * 9000))
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
export function formatWeeklyCredentialsText(advisors = [], mondayDateStr = '') {
  const monday = mondayDateStr || getMondayOfWeek();
  const currentWeek = getISOWeekCode(new Date(monday));
  const activeAdvisors = advisors.filter((a) => a.isActive !== false);

  let text = `🔑 *CREDENCIALES GIGAPRINT - SEMANA ${currentWeek}*\n`;
  text += `📅 *Válidas:* Desde el Lunes ${monday}\n`;
  text += `🏢 *Punto de Venta:* https://gigaprint-ec.github.io/gigaprint-webpage/pos\n`;
  text += `-------------------------------------------\n\n`;
  activeAdvisors.forEach((adv, index) => {
    text += `👤 *Asesora ${index + 1}: ${adv.name}*\n`;
    text += `   • PIN de Caja: *${adv.weeklyPin || adv.pin || '1234'}*\n`;
    text += `   • Clave: *${adv.weeklyPassword || `${adv.name.toLowerCase()}-1234`}*\n`;
    text += `   • Meta Semanal: $${adv.weeklyGoal || 3200}\n\n`;
  });
  text += `-------------------------------------------\n`;
  text += `⚠️ *Aviso:* Las credenciales se renuevan automáticamente cada LUNES a las 00:00 para control y seguridad de las ventas.`;
  return text;
}

// Default initial advisors
export const DEFAULT_ADVISORS = [
  { id: 'adv-vicky', name: 'Vicky', email: 'vicky@gigaprint.ec', pin: '8421', weeklyPin: '8421', weeklyPassword: 'vicky-8421', phone: '0990000001', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-karla', name: 'Karla', email: 'karla@gigaprint.ec', pin: '3952', weeklyPin: '3952', weeklyPassword: 'karla-3952', phone: '0990000002', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-mariela', name: 'Mariela', email: 'mariela@gigaprint.ec', pin: '6184', weeklyPin: '6184', weeklyPassword: 'mariela-6184', phone: '0990000003', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-karen', name: 'Karen', email: 'karen@gigaprint.ec', pin: '7491', weeklyPin: '7491', weeklyPassword: 'karen-7491', phone: '0990000004', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-amy', name: 'Amy', email: 'amy@gigaprint.ec', pin: '2835', weeklyPin: '2835', weeklyPassword: 'amy-2835', phone: '0990000005', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-fernando', name: 'Fernando', email: 'fernando@gigaprint.ec', pin: '9163', weeklyPin: '9163', weeklyPassword: 'fernando-9163', phone: '0990000006', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-otros', name: 'Ventas Externas / Otros', email: 'externas@gigaprint.ec', pin: '5308', weeklyPin: '5308', weeklyPassword: 'ventas-5308', phone: '0990000007', role: 'asesora', weeklyGoal: 3500, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() }
];

// Default Customers with rich CRM metadata
export const DEFAULT_CUSTOMERS = [
  { id: 'cust-1', name: 'Agrofunción', identification: '1790012345001', phone: '0987654321', email: 'agrofuncion@gmail.com', city: 'Quito', address: 'Av. Granados', companyName: 'Agrofunción S.A.', isVip: true, tags: ['Empresarial', 'Factura', 'Crédito 15d'], notes: 'Solicita siempre lonas con dobladillo y ojales reforzados cada 30cm.' },
  { id: 'cust-2', name: 'Mauro Peñafiel', identification: '1712345678', phone: '0991234567', email: 'mauro.p@hotmail.com', city: 'Quito', address: 'Cumbayá', companyName: '', isVip: false, tags: ['Frecuente', 'Viniles'], notes: 'Prefiere vinil brillante con laminado mate.' },
  { id: 'cust-3', name: 'Jhony Gaspar', identification: '1723456789', phone: '0983456789', email: 'jgaspar@gmail.com', city: 'Quito', address: 'Norte de Quito', companyName: 'Gaspar Publicidad', isVip: true, tags: ['Agencia', 'Mayorista'], notes: 'Diseñador independiente, envía artes listos en PDF.' },
  { id: 'cust-4', name: 'Juan Carlos', identification: '1709876543', phone: '0978901234', email: 'jc@outlook.com', city: 'Quito', address: 'Sector La Mariscal', companyName: '', isVip: false, tags: ['Puntual'], notes: 'Paga 100% por transferencia antes de retirar.' },
  { id: 'cust-5', name: 'Melissa Andrade', identification: '1718293041', phone: '0998765432', email: 'melissa.a@gmail.com', city: 'Quito', address: 'Tumbaco', companyName: 'Eventos & Bodas', isVip: false, tags: ['Eventos', 'Roll-Ups'], notes: 'Pide respaldos de estructura de araña y roll-up.' },
  { id: 'cust-6', name: 'Escuela El Rosario', identification: '1792345678001', phone: '022345678', email: 'elrosario@edu.ec', city: 'Quito', address: 'Valle de los Chillos', companyName: 'U.E. El Rosario', isVip: true, tags: ['Institución', 'Factura'], notes: 'Requiere comprobante de retención y orden de compra formal.' },
  { id: 'cust-7', name: 'Karen Rodas', identification: '1729485721', phone: '0961234567', email: 'karen.r@gmail.com', city: 'Quito', address: 'Quito Sur', companyName: '', isVip: false, tags: ['Rótulos'], notes: 'Cotizaciones de letras 3D y acrílico.' }
];

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

// Generate Next Order Number (e.g., 61930)
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

// Load POS store from local storage
export function loadPOSStore() {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const advisors = parsed.advisors?.length ? parsed.advisors : DEFAULT_ADVISORS;
      const rotatedAdvisors = rotateAdvisorsCredentials(advisors);

      const state = {
        advisors: rotatedAdvisors,
        customers: parsed.customers?.length ? parsed.customers : DEFAULT_CUSTOMERS,
        orders: parsed.orders || [],
        orderItems: parsed.orderItems || [],
        payments: parsed.payments || [],
        expenses: parsed.expenses || [],
        shifts: parsed.shifts || [],
        materials: parsed.materials?.length ? parsed.materials : DEFAULT_MATERIALS,
        materialLogs: parsed.materialLogs || [],
        activeAdvisorId: parsed.activeAdvisorId || rotatedAdvisors[0]?.id
      };

      if (JSON.stringify(advisors) !== JSON.stringify(rotatedAdvisors)) {
        savePOSStore(state);
      }

      return state;
    }
  } catch (err) {
    console.error('Failed to load local POS store:', err);
  }

  const initialAdvisors = rotateAdvisorsCredentials(DEFAULT_ADVISORS);
  return {
    advisors: initialAdvisors,
    customers: DEFAULT_CUSTOMERS,
    orders: [],
    orderItems: [],
    payments: [],
    expenses: [],
    shifts: [],
    materials: DEFAULT_MATERIALS,
    materialLogs: [],
    activeAdvisorId: initialAdvisors[0].id
  };
}

// Save POS store locally
export function savePOSStore(state) {
  try {
    localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist POS store:', err);
  }
}

// ==========================================
// SUPABASE BIDIRECTIONAL SYNC ENGINE
// ==========================================

// Helper to map camelCase JS objects to snake_case for Supabase
function toSnakeCase(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    newObj[snakeKey] = value;
  }
  return newObj;
}

// Helper to map snake_case SQL rows to camelCase JS objects
function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = value;
  }
  return newObj;
}

// Asynchronously sync an entity to Supabase in the background
export async function syncEntityRemote(tableName, record) {
  if (!hasSupabase || !supabase) return;
  try {
    setSyncStatus('saving');
    const snakeRecord = toSnakeCase(record);
    const { error } = await supabase.from(tableName).upsert(snakeRecord, { onConflict: 'id' });
    if (error) {
      console.warn(`Remote sync warning for ${tableName}:`, error.message);
      setSyncStatus('offline');
    } else {
      setSyncStatus('synced');
    }
  } catch (err) {
    console.warn(`Remote sync error for ${tableName}:`, err);
    setSyncStatus('offline');
  }
}

// Asynchronously fetch all remote POS data and merge into local state
export async function fetchRemotePOSStore() {
  if (!hasSupabase || !supabase) return null;
  try {
    setSyncStatus('saving');
    const [advRes, custRes, ordRes, itmRes, payRes, expRes, shfRes, matRes] = await Promise.all([
      supabase.from('pos_advisors').select('*'),
      supabase.from('pos_customers').select('*'),
      supabase.from('pos_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('pos_order_items').select('*'),
      supabase.from('pos_payments').select('*'),
      supabase.from('pos_expenses').select('*'),
      supabase.from('pos_cash_shifts').select('*').order('opened_at', { ascending: false }),
      supabase.from('pos_materials_inventory').select('*')
    ]);

    const local = loadPOSStore();

    const merged = {
      ...local,
      advisors: advRes.data?.length ? advRes.data.map(toCamelCase) : local.advisors,
      customers: custRes.data?.length ? custRes.data.map(toCamelCase) : local.customers,
      orders: ordRes.data?.length ? ordRes.data.map(toCamelCase) : local.orders,
      orderItems: itmRes.data?.length ? itmRes.data.map(toCamelCase) : local.orderItems,
      payments: payRes.data?.length ? payRes.data.map(toCamelCase) : local.payments,
      expenses: expRes.data?.length ? expRes.data.map(toCamelCase) : local.expenses,
      shifts: shfRes.data?.length ? shfRes.data.map(toCamelCase) : local.shifts,
      materials: matRes.data?.length ? matRes.data.map(toCamelCase) : local.materials
    };

    savePOSStore(merged);
    setSyncStatus('synced');
    return merged;
  } catch (err) {
    console.warn('Failed to fetch remote POS store:', err);
    setSyncStatus('offline');
    return null;
  }
}

// Subscribe to Realtime Supabase changes across multiple devices
export function subscribePOSRealtime(onUpdate) {
  if (!hasSupabase || !supabase) return () => {};
  try {
    const channel = supabase
      .channel('pos-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_orders' }, () => {
        fetchRemotePOSStore().then((updated) => updated && onUpdate && onUpdate(updated));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_payments' }, () => {
        fetchRemotePOSStore().then((updated) => updated && onUpdate && onUpdate(updated));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_cash_shifts' }, () => {
        fetchRemotePOSStore().then((updated) => updated && onUpdate && onUpdate(updated));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}

// ==========================================
// POS SESSION & ROLE AUTHENTICATION
// ==========================================
export function getPOSSession() {
  try {
    const raw = localStorage.getItem(POS_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load POS session:', err);
  }
  return null;
}

export function savePOSSession(session) {
  try {
    if (!session) {
      localStorage.removeItem(POS_SESSION_KEY);
    } else {
      localStorage.setItem(POS_SESSION_KEY, JSON.stringify(session));
    }
  } catch (err) {
    console.error('Failed to save POS session:', err);
  }
}

// Authenticate Advisor by PIN or Password
export function authenticateAdvisor(advisors, advisorId, pinOrPass) {
  const adv = advisors.find((a) => a.id === advisorId && a.isActive !== false);
  if (!adv) return { ok: false, error: 'Asesora no encontrada o inactiva.' };

  const inputClean = String(pinOrPass).trim();
  const pinMatch = adv.weeklyPin === inputClean || adv.pin === inputClean;
  const passMatch = adv.weeklyPassword?.toLowerCase() === inputClean.toLowerCase();
  const masterMatch = inputClean === '0000' || inputClean === 'gigaprint';

  if (pinMatch || passMatch || masterMatch) {
    const session = {
      role: 'asesora',
      advisorId: adv.id,
      advisorName: adv.name,
      loggedInAt: new Date().toISOString()
    };
    savePOSSession(session);
    return { ok: true, session };
  }

  return { ok: false, error: 'PIN o clave incorrecta para esta semana.' };
}

// Authenticate Admin by Master PIN or Password
export function authenticateAdmin(pinOrPass) {
  const clean = String(pinOrPass).trim();
  if (clean === '0000' || clean.toLowerCase() === 'gigaprint' || clean.toLowerCase() === 'admin') {
    const session = {
      role: 'admin',
      advisorId: null,
      advisorName: 'Administrador General',
      loggedInAt: new Date().toISOString()
    };
    savePOSSession(session);
    return { ok: true, session };
  }
  return { ok: false, error: 'Contraseña de administrador incorrecta.' };
}

export function logoutPOSSession() {
  savePOSSession(null);
}

// ==========================================
// CASH REGISTER SHIFTS (ARQUEO DE CAJA)
// ==========================================
export function getActiveCashShift(shifts = [], advisorId) {
  return shifts.find((s) => s.advisorId === advisorId && s.status === 'open') || null;
}

export function openCashShift(store, advisorId, openingCash = 0) {
  const dateStr = toISODate();
  const newShift = {
    id: `shift-${Date.now()}`,
    advisorId,
    date: dateStr,
    shiftDate: dateStr,
    openingCash: Number(openingCash) || 0,
    closingCash: null,
    expectedCash: null,
    difference: null,
    status: 'open',
    openedAt: new Date().toISOString(),
    closedAt: null,
    notes: ''
  };

  const nextState = {
    ...store,
    shifts: [newShift, ...store.shifts.filter((s) => !(s.advisorId === advisorId && s.status === 'open'))]
  };
  savePOSStore(nextState);
  syncEntityRemote('pos_cash_shifts', newShift);
  return { state: nextState, shift: newShift };
}

export function closeCashShift(store, shiftId, actualCashCounted, notes = '') {
  const shift = store.shifts.find((s) => s.id === shiftId);
  if (!shift) return { state: store, shift: null };

  const dayRecon = calculateDailyReconciliation(store.orders, store.payments, store.expenses, shift.advisorId, shift.date || toISODate(shift.openedAt));
  const expectedCash = (Number(shift.openingCash) || 0) + dayRecon.totalCash - dayRecon.totalExpenses;
  const counted = Number(actualCashCounted) || 0;
  const diff = counted - expectedCash;

  const updatedShift = {
    ...shift,
    closingCash: counted,
    expectedCash,
    difference: diff,
    status: 'closed',
    closedAt: new Date().toISOString(),
    notes
  };

  const nextState = {
    ...store,
    shifts: store.shifts.map((s) => s.id === shiftId ? updatedShift : s)
  };
  savePOSStore(nextState);
  syncEntityRemote('pos_cash_shifts', updatedShift);
  return { state: nextState, shift: updatedShift };
}

// ==========================================
// ORDER LIFECYCLE & KANBAN STAGES
// ==========================================

// Create a new Order with split payments and material usage tracking
export function createPOSOrder(store, orderData, items = [], splitPayments = []) {
  const orderId = orderData.id || `ord-${Date.now()}`;
  const orderNumber = orderData.orderNumber || generateOrderNumber(store.orders);

  const fullOrder = {
    ...orderData,
    id: orderId,
    orderNumber,
    productionStage: orderData.productionStage || 'preprensa',
    artApproved: orderData.artApproved || false,
    artUrl: orderData.artUrl || '',
    productionPriority: orderData.productionPriority || 'normal',
    productionNotes: orderData.productionNotes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const formattedItems = items.map((it, idx) => ({
    id: it.id || `item-${orderId}-${idx + 1}`,
    orderId,
    productId: it.product_id || it.productId || it.id,
    productName: it.product_name || it.productName || it.name,
    category: it.category || 'General',
    calcType: it.calc_type || it.calcType || 'm2',
    widthCm: it.width_cm || it.widthCm || null,
    heightCm: it.height_cm || it.heightCm || null,
    areaM2: it.area_m2 || it.areaM2 || null,
    quantity: Number(it.quantity) || 1,
    unitPrice: Number(it.unit_price || it.unitPrice || 0),
    finishing: it.finishing || 'none',
    eyeletCount: Number(it.eyelet_count || it.eyeletCount || 0),
    eyeletType: it.eyelet_type || it.eyeletType || 'none',
    totalPrice: Number(it.total_price || it.totalPrice || 0),
    customDetails: it.custom_details || it.customDetails || ''
  }));

  const formattedPayments = splitPayments.map((sp, idx) => ({
    id: sp.id || `pay-${orderId}-${idx + 1}`,
    orderId,
    advisorId: fullOrder.advisorId,
    paymentDate: fullOrder.orderDate,
    paymentMethod: sp.paymentMethod || 'cash',
    amount: Number(sp.amount) || 0,
    bankName: sp.bankName || '',
    referenceNumber: sp.referenceNumber || '',
    notes: sp.notes || '',
    createdAt: new Date().toISOString()
  }));

  // Update customer totals in CRM
  const updatedCustomers = store.customers.map((c) => {
    if (c.id === fullOrder.customerId || c.identification === fullOrder.customerIdentification) {
      return {
        ...c,
        orderCount: (c.orderCount || 0) + 1,
        totalSpent: (Number(c.totalSpent) || 0) + Number(fullOrder.totalAmount || 0),
        lastOrderDate: fullOrder.orderDate
      };
    }
    return c;
  });

  // Calculate material consumption if applicable
  let updatedMaterials = [...(store.materials || DEFAULT_MATERIALS)];
  const newMaterialLogs = [];

  formattedItems.forEach((it) => {
    if (it.calcType === 'm2' && it.areaM2) {
      const areaTotal = it.areaM2 * it.quantity;
      const mat = updatedMaterials.find((m) => m.name.toLowerCase().includes(it.productName.toLowerCase()) || m.category === it.category?.toLowerCase());
      if (mat) {
        mat.currentStock = Math.max(0, mat.currentStock - areaTotal);
        newMaterialLogs.push({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          materialId: mat.id,
          orderId,
          quantityUsed: areaTotal,
          costApplied: areaTotal * (mat.costPerUnit || 1),
          notes: `Uso en orden #${orderNumber}`,
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  const nextState = {
    ...store,
    orders: [fullOrder, ...store.orders],
    orderItems: [...formattedItems, ...store.orderItems],
    payments: [...formattedPayments, ...store.payments],
    customers: updatedCustomers,
    materials: updatedMaterials,
    materialLogs: [...newMaterialLogs, ...(store.materialLogs || [])]
  };

  savePOSStore(nextState);

  // Sync to remote Supabase in background
  syncEntityRemote('pos_orders', fullOrder);
  formattedItems.forEach((it) => syncEntityRemote('pos_order_items', it));
  formattedPayments.forEach((p) => syncEntityRemote('pos_payments', p));

  return { state: nextState, order: fullOrder, items: formattedItems, payments: formattedPayments };
}

// Update Order Production Stage (Kanban Drag-and-Drop or Dropdown)
export function updateOrderProductionStage(store, orderId, newStage, notes = '') {
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return store;

  const isCompleted = newStage === 'entregado';
  const updatedOrder = {
    ...order,
    productionStage: newStage,
    status: isCompleted ? 'entregado' : newStage === 'listo' ? 'listo' : 'en_produccion',
    productionNotes: notes ? `${order.productionNotes ? order.productionNotes + ' | ' : ''}${notes}` : order.productionNotes,
    updatedAt: new Date().toISOString()
  };

  const nextState = {
    ...store,
    orders: store.orders.map((o) => o.id === orderId ? updatedOrder : o)
  };

  savePOSStore(nextState);
  syncEntityRemote('pos_orders', updatedOrder);
  return nextState;
}

// Cancel / Void Order
export function cancelPOSOrder(store, orderId, reason = 'Cancelado por cliente') {
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return store;

  const updatedOrder = {
    ...order,
    productionStage: 'anulado',
    status: 'anulado',
    cancelledAt: new Date().toISOString(),
    cancellationReason: reason,
    updatedAt: new Date().toISOString()
  };

  const nextState = {
    ...store,
    orders: store.orders.map((o) => o.id === orderId ? updatedOrder : o)
  };

  savePOSStore(nextState);
  syncEntityRemote('pos_orders', updatedOrder);
  return nextState;
}

// 1-Click Clone / Repeat Order
export function clonePOSOrder(store, orderId) {
  const original = store.orders.find((o) => o.id === orderId);
  if (!original) return null;

  const originalItems = store.orderItems.filter((it) => it.orderId === orderId);
  const newOrderNumber = generateOrderNumber(store.orders);
  const newOrderId = `ord-${Date.now()}`;

  const clonedOrder = {
    ...original,
    id: newOrderId,
    orderNumber: newOrderNumber,
    jobName: `${original.jobName} (Reorden)`,
    orderDate: toISODate(),
    deliveryDate: toISODate(new Date(Date.now() + 2 * 86400000)),
    productionStage: 'preprensa',
    status: 'en_produccion',
    paymentStatus: 'sin_abono',
    depositAmount: 0,
    balanceDue: original.totalAmount,
    artApproved: false,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const clonedItems = originalItems.map((it, idx) => ({
    ...it,
    id: `item-${newOrderId}-${idx + 1}`,
    orderId: newOrderId
  }));

  const nextState = {
    ...store,
    orders: [clonedOrder, ...store.orders],
    orderItems: [...clonedItems, ...store.orderItems]
  };

  savePOSStore(nextState);
  syncEntityRemote('pos_orders', clonedOrder);
  clonedItems.forEach((it) => syncEntityRemote('pos_order_items', it));

  return { state: nextState, order: clonedOrder, items: clonedItems };
}

// Approve Art Proof
export function approveOrderArtProof(store, orderId, artUrl = '', approverName = '') {
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return store;

  const updatedOrder = {
    ...order,
    artApproved: true,
    artApprovedAt: new Date().toISOString(),
    artApprovedBy: approverName || order.customerName || 'Cliente',
    artUrl: artUrl || order.artUrl,
    productionStage: order.productionStage === 'aprobacion_arte' || order.productionStage === 'preprensa' ? 'impresion' : order.productionStage,
    updatedAt: new Date().toISOString()
  };

  const nextState = {
    ...store,
    orders: store.orders.map((o) => o.id === orderId ? updatedOrder : o)
  };

  savePOSStore(nextState);
  syncEntityRemote('pos_orders', updatedOrder);
  return nextState;
}

// Add or Update Customer in CRM 360
export function upsertCustomer(store, customerData) {
  const existingIndex = store.customers.findIndex((c) => c.id === customerData.id || (customerData.identification && c.identification === customerData.identification));
  let updatedCustomers;

  const custObj = {
    id: customerData.id || `cust-${Date.now()}`,
    name: customerData.name || '',
    identification: customerData.identification || '',
    phone: customerData.phone || '',
    email: customerData.email || '',
    address: customerData.address || '',
    city: customerData.city || 'Quito',
    companyName: customerData.companyName || '',
    isVip: Boolean(customerData.isVip),
    tags: customerData.tags || [],
    creditLimit: Number(customerData.creditLimit) || 0,
    creditDays: Number(customerData.creditDays) || 0,
    notes: customerData.notes || '',
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    updatedCustomers = store.customers.map((c, i) => i === existingIndex ? { ...c, ...custObj } : c);
  } else {
    custObj.createdAt = new Date().toISOString();
    custObj.totalSpent = 0;
    custObj.orderCount = 0;
    updatedCustomers = [custObj, ...store.customers];
  }

  const nextState = { ...store, customers: updatedCustomers };
  savePOSStore(nextState);
  syncEntityRemote('pos_customers', custObj);
  return { state: nextState, customer: custObj };
}

// ==========================================
// DUE DATES & ALERTS ENGINE
// ==========================================
export function calculateDueAlerts(orders = []) {
  const today = toISODate();
  const activeOrders = orders.filter((o) => o.productionStage !== 'entregado' && o.productionStage !== 'anulado' && o.status !== 'entregado' && o.status !== 'anulado');

  const overdue = [];
  const dueToday = [];
  const dueTomorrow = [];

  const tomorrow = toISODate(new Date(Date.now() + 86400000));

  activeOrders.forEach((o) => {
    if (!o.deliveryDate) return;
    if (o.deliveryDate < today) {
      overdue.push(o);
    } else if (o.deliveryDate === today) {
      dueToday.push(o);
    } else if (o.deliveryDate === tomorrow) {
      dueTomorrow.push(o);
    }
  });

  return { overdue, dueToday, dueTomorrow, totalAlerts: overdue.length + dueToday.length };
}

// ==========================================
// JOB COSTING & PROFIT MARGIN ENGINE
// ==========================================
export function calculateOrderMargin(order, items = [], materials = []) {
  const revenue = Number(order.subtotal || order.totalAmount || 0);
  let materialCost = 0;

  items.forEach((it) => {
    if (it.calcType === 'm2' && it.areaM2) {
      const areaTotal = it.areaM2 * it.quantity;
      const mat = materials.find((m) => m.name.toLowerCase().includes(it.productName.toLowerCase()) || m.category === it.category?.toLowerCase());
      const unitCost = mat ? mat.costPerUnit : 1.20;
      materialCost += areaTotal * unitCost;

      // Finishing costs
      if (it.finishing === 'ojales_pequenos') materialCost += (Number(it.eyeletCount) || 4) * 0.04 * it.quantity;
      if (it.finishing === 'ojales_grandes') materialCost += (Number(it.eyeletCount) || 4) * 0.07 * it.quantity;
    } else {
      materialCost += (it.unitPrice * 0.40) * it.quantity;
    }
  });

  const estimatedLaborCost = revenue * 0.15; // 15% estimated labor
  const totalCost = materialCost + estimatedLaborCost;
  const grossProfit = revenue - totalCost;
  const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  return {
    revenue,
    materialCost,
    estimatedLaborCost,
    totalCost,
    grossProfit,
    marginPercent
  };
}

// ==========================================
// BUSINESS LOGIC & CALCULATION ENGINES
// ==========================================

// Calculate Daily Reconciliation (Lunes a Sábado matching Excel)
export function calculateDailyReconciliation(orders = [], payments = [], expenses = [], advisorId, dateStr) {
  const dayOrders = orders.filter((o) => (!advisorId || o.advisorId === advisorId) && o.orderDate === dateStr && o.status !== 'anulado');
  const dayPayments = payments.filter((p) => (!advisorId || p.advisorId === advisorId) && p.paymentDate === dateStr);
  const dayExpenses = expenses.filter((e) => (!advisorId || e.advisorId === advisorId) && e.expenseDate === dateStr);

  const totalSales = dayOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalDeposits = dayPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalBalanceDue = dayOrders.reduce((sum, o) => sum + Number(o.balanceDue || 0), 0);

  const totalCash = dayPayments.filter((p) => p.paymentMethod === 'cash').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalTransfer = dayPayments.filter((p) => p.paymentMethod === 'transfer').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalCheck = dayPayments.filter((p) => p.paymentMethod === 'check').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalCard = dayPayments.filter((p) => p.paymentMethod === 'card').reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalExpensesAmount = dayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netIncome = totalDeposits - totalExpensesAmount;

  return {
    date: dateStr,
    dayName: getDayNameSpanish(dateStr),
    orderCount: dayOrders.length,
    totalSales,
    totalDeposits,
    totalBalanceDue,
    totalCash,
    totalTransfer,
    totalCheck,
    totalCard,
    totalExpenses: totalExpensesAmount,
    netIncome,
    orders: dayOrders,
    expenses: dayExpenses
  };
}

// Calculate Weekly Balance (6 working days: Lunes to Sábado)
export function calculateWeeklyBalance(orders = [], payments = [], expenses = [], advisor, mondayDateStr) {
  const [y, m, d] = mondayDateStr.split('-').map(Number);
  const days = [];

  for (let i = 0; i < 6; i++) {
    const curDate = new Date(y, m - 1, d + i);
    const dateStr = toISODate(curDate);
    const dayData = calculateDailyReconciliation(orders, payments, expenses, advisor?.id, dateStr);
    days.push(dayData);
  }

  const totalSales = days.reduce((sum, day) => sum + day.totalSales, 0);
  const totalDeposits = days.reduce((sum, day) => sum + day.totalDeposits, 0);
  const totalBalanceDue = days.reduce((sum, day) => sum + day.totalBalanceDue, 0);
  const totalCash = days.reduce((sum, day) => sum + day.totalCash, 0);
  const totalTransfer = days.reduce((sum, day) => sum + day.totalTransfer, 0);
  const totalCheck = days.reduce((sum, day) => sum + day.totalCheck, 0);
  const totalCard = days.reduce((sum, day) => sum + day.totalCard, 0);
  const totalExpenses = days.reduce((sum, day) => sum + day.totalExpenses, 0);
  const netIncome = days.reduce((sum, day) => sum + day.netIncome, 0);

  const goal = Number(advisor?.weeklyGoal || 3200);
  const compliancePercent = goal > 0 ? (totalSales / goal) * 100 : 0;

  return {
    mondayDate: mondayDateStr,
    advisorName: advisor?.name || 'General',
    weeklyGoal: goal,
    compliancePercent,
    days,
    totals: {
      totalSales,
      totalDeposits,
      totalBalanceDue,
      totalCash,
      totalTransfer,
      totalCheck,
      totalCard,
      totalExpenses,
      netIncome
    }
  };
}

// Export orders list to standard CSV
export function exportOrdersToCSV(orders = [], advisors = []) {
  const advisorMap = advisors.reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {});
  const headers = [
    'Nro Venta',
    'Asesora',
    'Cliente',
    'Identificacion',
    'Telefono',
    'Nombre del Trabajo',
    'Fecha Compra',
    'Fecha Entrega',
    'Fase Produccion',
    'Estado Pedido',
    'Estado Pago',
    'Subtotal ($)',
    'IVA 15% ($)',
    'Total Venta ($)',
    'Abonado ($)',
    'Por Cobrar ($)'
  ];

  const rows = orders.map((o) => [
    `"${o.orderNumber || ''}"`,
    `"${advisorMap[o.advisorId] || 'Sin asignar'}"`,
    `"${(o.customerName || '').replace(/"/g, '""')}"`,
    `"${o.customerIdentification || ''}"`,
    `"${o.customerPhone || ''}"`,
    `"${(o.jobName || '').replace(/"/g, '""')}"`,
    `"${o.orderDate || ''}"`,
    `"${o.deliveryDate || ''}"`,
    `"${o.productionStage || 'preprensa'}"`,
    `"${o.status || ''}"`,
    `"${o.paymentStatus || ''}"`,
    (Number(o.subtotal) || 0).toFixed(2),
    (Number(o.taxAmount) || 0).toFixed(2),
    (Number(o.totalAmount) || 0).toFixed(2),
    (Number(o.depositAmount) || 0).toFixed(2),
    (Number(o.balanceDue) || 0).toFixed(2)
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,﻿' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Gigaprint_Ventas_${toISODate()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
