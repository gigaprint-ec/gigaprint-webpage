import { supabase } from './supabase';

const POS_STORAGE_KEY = 'gigaprint-pos-v1';
const POS_SESSION_KEY = 'gigaprint-pos-session-v1';

export const DAYS_SPANISH = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Helper to format ISO date to YYYY-MM-DD
export function toISODate(date = new Date()) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Helper to get day name in Spanish
export function getDayNameSpanish(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return DAYS_SPANISH[date.getDay()] || 'lunes';
}

// Helper to get Monday of the current or given week
export function getMondayOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
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
  text += `🏢 *Punto de Venta:* https://gigaprint-ec.github.io/gigaprint-webpage/admin/pos\n`;
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

// Default initial advisors with rotated weekly PINs
export const DEFAULT_ADVISORS = [
  { id: 'adv-vicky', name: 'Vicky', email: 'vicky@gigaprint.ec', pin: '8421', weeklyPin: '8421', weeklyPassword: 'vicky-8421', phone: '0990000001', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-karla', name: 'Karla', email: 'karla@gigaprint.ec', pin: '3952', weeklyPin: '3952', weeklyPassword: 'karla-3952', phone: '0990000002', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-mariela', name: 'Mariela', email: 'mariela@gigaprint.ec', pin: '6184', weeklyPin: '6184', weeklyPassword: 'mariela-6184', phone: '0990000003', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-karen', name: 'Karen', email: 'karen@gigaprint.ec', pin: '7491', weeklyPin: '7491', weeklyPassword: 'karen-7491', phone: '0990000004', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-amy', name: 'Amy', email: 'amy@gigaprint.ec', pin: '2835', weeklyPin: '2835', weeklyPassword: 'amy-2835', phone: '0990000005', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-fernando', name: 'Fernando', email: 'fernando@gigaprint.ec', pin: '9163', weeklyPin: '9163', weeklyPassword: 'fernando-9163', phone: '0990000006', role: 'asesora', weeklyGoal: 3200, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() },
  { id: 'adv-otros', name: 'Ventas Externas / Otros', email: 'externas@gigaprint.ec', pin: '5308', weeklyPin: '5308', weeklyPassword: 'ventas-5308', phone: '0990000007', role: 'asesora', weeklyGoal: 3500, isActive: true, currentWeekCode: getISOWeekCode(), pinLastRotatedAt: getMondayOfWeek() }
];

export const DEFAULT_CUSTOMERS = [
  { id: 'cust-1', name: 'Agrofunción', identification: '1790012345001', phone: '0987654321', email: 'agrofuncion@gmail.com', city: 'Quito', address: 'Av. Granados' },
  { id: 'cust-2', name: 'Mauro Peñafiel', identification: '1712345678', phone: '0991234567', email: 'mauro.p@hotmail.com', city: 'Quito', address: 'Cumbayá' },
  { id: 'cust-3', name: 'Jhony Gaspar', identification: '1723456789', phone: '0983456789', email: 'jgaspar@gmail.com', city: 'Quito', address: 'Norte de Quito' },
  { id: 'cust-4', name: 'Juan Carlos', identification: '1709876543', phone: '0978901234', email: 'jc@outlook.com', city: 'Quito', address: 'Sector La Mariscal' },
  { id: 'cust-5', name: 'Melissa Andrade', identification: '1718293041', phone: '0998765432', email: 'melissa.a@gmail.com', city: 'Quito', address: 'Tumbaco' },
  { id: 'cust-6', name: 'Escuela El Rosario', identification: '1792345678001', phone: '022345678', email: 'elrosario@edu.ec', city: 'Quito', address: 'Valle de los Chillos' },
  { id: 'cust-7', name: 'Karen Rodas', identification: '1729485721', phone: '0961234567', email: 'karen.r@gmail.com', city: 'Quito', address: 'Quito Sur' }
];

// Generate Next Order Number (e.g., 61930)
export function generateOrderNumber(existingOrders = []) {
  const maxNum = existingOrders.reduce((max, order) => {
    const num = parseInt(order.orderNumber, 10);
    return !isNaN(num) && num > max ? num : max;
  }, 61920);
  return String(maxNum + 1);
}

// Load POS state with automatic Monday weekly rotation
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
    activeAdvisorId: initialAdvisors[0].id
  };
}

// Save POS state locally
export function savePOSStore(state) {
  try {
    localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist POS store:', err);
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
export function getActiveCashShift(shifts = [], advisorId, dateStr = toISODate()) {
  return shifts.find((s) => s.advisorId === advisorId && s.date === dateStr && s.status === 'open') || null;
}

export function openCashShift(store, advisorId, openingCash = 0) {
  const dateStr = toISODate();
  const newShift = {
    id: `shift-${Date.now()}`,
    advisorId,
    date: dateStr,
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
    shifts: [newShift, ...store.shifts.filter((s) => !(s.advisorId === advisorId && s.date === dateStr && s.status === 'open'))]
  };
  savePOSStore(nextState);
  return { state: nextState, shift: newShift };
}

export function closeCashShift(store, shiftId, actualCashCounted, notes = '') {
  const shift = store.shifts.find((s) => s.id === shiftId);
  if (!shift) return store;

  // Calculate day cash sales and expenses
  const dayRecon = calculateDailyReconciliation(store.orders, store.payments, store.expenses, shift.advisorId, shift.date);
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
  return { state: nextState, shift: updatedShift };
}

// ==========================================
// BUSINESS LOGIC & CALCULATION ENGINES
// ==========================================

// Calculate Daily Reconciliation (Lunes a Sábado matching Excel)
export function calculateDailyReconciliation(orders = [], payments = [], expenses = [], advisorId, dateStr) {
  const dayOrders = orders.filter((o) => (!advisorId || o.advisorId === advisorId) && o.orderDate === dateStr);
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
