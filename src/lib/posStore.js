import { supabase } from './supabase';

const POS_STORAGE_KEY = 'gigaprint-pos-v1';

// Default initial advisors from real company operations
export const DEFAULT_ADVISORS = [
  { id: 'adv-vicky', name: 'Vicky', email: 'vicky@gigaprint.ec', pin: '1234', phone: '0990000001', role: 'asesora', weeklyGoal: 3200, isActive: true },
  { id: 'adv-karla', name: 'Karla', email: 'karla@gigaprint.ec', pin: '1234', phone: '0990000002', role: 'asesora', weeklyGoal: 3200, isActive: true },
  { id: 'adv-mariela', name: 'Mariela', email: 'mariela@gigaprint.ec', pin: '1234', phone: '0990000003', role: 'asesora', weeklyGoal: 3200, isActive: true },
  { id: 'adv-karen', name: 'Karen', email: 'karen@gigaprint.ec', pin: '1234', phone: '0990000004', role: 'asesora', weeklyGoal: 3200, isActive: true },
  { id: 'adv-amy', name: 'Amy', email: 'amy@gigaprint.ec', pin: '1234', phone: '0990000005', role: 'asesora', weeklyGoal: 3200, isActive: true },
  { id: 'adv-fernando', name: 'Fernando', email: 'fernando@gigaprint.ec', pin: '1234', phone: '0990000006', role: 'asesora', weeklyGoal: 3200, isActive: true },
  { id: 'adv-otros', name: 'Ventas Externas / Otros', email: 'externas@gigaprint.ec', pin: '0000', phone: '0990000007', role: 'asesora', weeklyGoal: 3500, isActive: true }
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

// Generate Next Order Number (e.g., 61930)
export function generateOrderNumber(existingOrders = []) {
  const maxNum = existingOrders.reduce((max, order) => {
    const num = parseInt(order.orderNumber, 10);
    return !isNaN(num) && num > max ? num : max;
  }, 61920);
  return String(maxNum + 1);
}

// Load initial POS state
export function loadPOSStore() {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        advisors: parsed.advisors?.length ? parsed.advisors : DEFAULT_ADVISORS,
        customers: parsed.customers?.length ? parsed.customers : DEFAULT_CUSTOMERS,
        orders: parsed.orders || [],
        orderItems: parsed.orderItems || [],
        payments: parsed.payments || [],
        expenses: parsed.expenses || [],
        activeAdvisorId: parsed.activeAdvisorId || DEFAULT_ADVISORS[0].id
      };
    }
  } catch (err) {
    console.error('Failed to load local POS store:', err);
  }

  return {
    advisors: DEFAULT_ADVISORS,
    customers: DEFAULT_CUSTOMERS,
    orders: [],
    orderItems: [],
    payments: [],
    expenses: [],
    activeAdvisorId: DEFAULT_ADVISORS[0].id
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

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Gigaprint_Ventas_${toISODate()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
