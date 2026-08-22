import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Clock,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowUpRight,
  PieChart,
  Layers,
  BarChart2,
  Wrench,
  Percent,
  Users,
  ShieldCheck,
  Building2,
  AlertCircle
} from 'lucide-react';
import {
  loadPOSStore,
  fetchRemotePOSStore,
  subscribePOSRealtime,
  exportOrdersToCSV,
  toISODate,
  getMondayOfWeek,
  calculateOrderMargin
} from '../../lib/posStore';

export function POSAdminDashboard() {
  const [store, setStore] = useState(loadPOSStore);
  const [timeframe, setTimeframe] = useState('week'); // 'today', 'week', 'prev_week', 'month', 'year', 'custom'
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('all');
  const [customFrom, setCustomFrom] = useState(toISODate(new Date(Date.now() - 30 * 86400000)));
  const [customTo, setCustomTo] = useState(toISODate());

  // Realtime subscription
  useEffect(() => {
    fetchRemotePOSStore().then(setStore);
    const unsubscribe = subscribePOSRealtime((remote) => setStore(remote));
    return () => unsubscribe();
  }, []);

  const money = (val) => `$${(Number(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Determine date bounds based on timeframe
  const dateRange = useMemo(() => {
    const today = new Date();
    const todayStr = toISODate(today);

    if (timeframe === 'today') {
      return { from: todayStr, to: todayStr, label: 'Hoy' };
    }
    if (timeframe === 'week') {
      const mon = getMondayOfWeek(today);
      const sat = new Date(new Date(mon).getTime() + 5 * 86400000);
      return { from: mon, to: toISODate(sat), label: 'Esta Semana' };
    }
    if (timeframe === 'prev_week') {
      const monThis = new Date(getMondayOfWeek(today));
      const monPrev = new Date(monThis.getTime() - 7 * 86400000);
      const satPrev = new Date(monPrev.getTime() + 5 * 86400000);
      return { from: toISODate(monPrev), to: toISODate(satPrev), label: 'Semana Anterior' };
    }
    if (timeframe === 'month') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: toISODate(first), to: toISODate(last), label: 'Este Mes' };
    }
    if (timeframe === 'year') {
      const first = new Date(today.getFullYear(), 0, 1);
      const last = new Date(today.getFullYear(), 11, 31);
      return { from: toISODate(first), to: toISODate(last), label: 'Año en Curso' };
    }
    return { from: customFrom, to: customTo, label: 'Rango Personalizado' };
  }, [timeframe, customFrom, customTo]);

  // Filter orders by date range and advisor
  const filteredOrders = useMemo(() => {
    return (store.orders || []).filter((order) => {
      const inDate = (!dateRange.from || order.orderDate >= dateRange.from) && (!dateRange.to || order.orderDate <= dateRange.to);
      const inAdvisor = selectedAdvisorId === 'all' || order.advisorId === selectedAdvisorId;
      return inDate && inAdvisor;
    });
  }, [store.orders, dateRange, selectedAdvisorId]);

  // Filter payments by date range and advisor
  const filteredPayments = useMemo(() => {
    return (store.payments || []).filter((p) => {
      const inDate = (!dateRange.from || p.paymentDate >= dateRange.from) && (!dateRange.to || p.paymentDate <= dateRange.to);
      const inAdvisor = selectedAdvisorId === 'all' || p.advisorId === selectedAdvisorId;
      return inDate && inAdvisor;
    });
  }, [store.payments, dateRange, selectedAdvisorId]);

  // Filter expenses by date range and advisor
  const filteredExpenses = useMemo(() => {
    return (store.expenses || []).filter((e) => {
      const inDate = (!dateRange.from || e.expenseDate >= dateRange.from) && (!dateRange.to || e.expenseDate <= dateRange.to);
      const inAdvisor = selectedAdvisorId === 'all' || e.advisorId === selectedAdvisorId;
      return inDate && inAdvisor;
    });
  }, [store.expenses, dateRange, selectedAdvisorId]);

  // Financial KPIs Calculations
  const metrics = useMemo(() => {
    const grossSales = filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalDeposited = filteredOrders.reduce((sum, o) => sum + (Number(o.depositAmount) || 0), 0);
    const balanceDue = filteredOrders.reduce((sum, o) => sum + (Number(o.balanceDue) || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Payments by method
    const paymentMethods = {
      cash: filteredPayments.filter((p) => p.paymentMethod === 'cash').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      transfer: filteredPayments.filter((p) => p.paymentMethod === 'transfer').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      card: filteredPayments.filter((p) => p.paymentMethod === 'card').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      check: filteredPayments.filter((p) => p.paymentMethod === 'check').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    };

    const netCashInRegister = paymentMethods.cash - totalExpenses;
    const collectionRate = grossSales > 0 ? (totalDeposited / grossSales) * 100 : 0;

    // Real Estimated Gross Margin (Job Costing)
    let totalDirectCost = 0;
    filteredOrders.forEach((o) => {
      const items = (store.orderItems || []).filter((it) => it.orderId === o.id);
      const margin = calculateOrderMargin(o, items, store.materials || []);
      totalDirectCost += margin.estimatedCost;
    });

    const grossProfit = Math.max(0, grossSales - totalDirectCost - totalExpenses);
    const grossMarginPercent = grossSales > 0 ? (grossProfit / grossSales) * 100 : 0;

    // Tax Breakdown (IVA 15%)
    const totalTaxCollected = filteredOrders.reduce((sum, o) => sum + (Number(o.taxAmount) || 0), 0);

    return {
      grossSales,
      totalDeposited,
      balanceDue,
      totalExpenses,
      paymentMethods,
      netCashInRegister,
      collectionRate,
      orderCount: filteredOrders.length,
      averageTicket: filteredOrders.length > 0 ? grossSales / filteredOrders.length : 0,
      totalDirectCost,
      grossProfit,
      grossMarginPercent,
      totalTaxCollected
    };
  }, [filteredOrders, filteredPayments, filteredExpenses, store.orderItems, store.materials]);

  // Substrate Breakdown
  const substrateBreakdown = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      const items = (store.orderItems || []).filter((it) => it.orderId === o.id);
      items.forEach((it) => {
        const cat = it.category || 'Otros';
        if (!map[cat]) map[cat] = { revenue: 0, count: 0, areaM2: 0 };
        map[cat].revenue += Number(it.totalPrice || 0);
        map[cat].count += Number(it.quantity || 1);
        map[cat].areaM2 += Number(it.areaM2 || 0);
      });
    });

    return Object.entries(map).map(([category, stats]) => ({
      category,
      ...stats,
      percent: metrics.grossSales > 0 ? (stats.revenue / metrics.grossSales) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, store.orderItems, metrics.grossSales]);

  // Daily Trend Data for Pure SVG Bar Chart
  const dailyTrend = useMemo(() => {
    const daysMap = {};
    filteredOrders.forEach((o) => {
      const d = o.orderDate;
      if (!daysMap[d]) daysMap[d] = { sales: 0, orders: 0 };
      daysMap[d].sales += Number(o.totalAmount || 0);
      daysMap[d].orders += 1;
    });

    return Object.entries(daysMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));
  }, [filteredOrders]);

  const maxDailySales = useMemo(() => {
    return Math.max(100, ...dailyTrend.map((d) => d.sales));
  }, [dailyTrend]);

  // Top Corporate Clients Analytics
  const topClients = useMemo(() => {
    const clientMap = {};
    (store.orders || []).forEach((o) => {
      const name = o.customerName || 'Consumidor Final';
      if (!clientMap[name]) clientMap[name] = { total: 0, count: 0, balance: 0, phone: o.customerPhone || '' };
      clientMap[name].total += Number(o.totalAmount || 0);
      clientMap[name].count += 1;
      clientMap[name].balance += Number(o.balanceDue || 0);
    });

    return Object.entries(clientMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [store.orders]);

  // Advisor Leaderboard
  const advisorStats = useMemo(() => {
    return (store.advisors || []).map((adv) => {
      const advOrders = (store.orders || []).filter(
        (o) => o.advisorId === adv.id && (!dateRange.from || o.orderDate >= dateRange.from) && (!dateRange.to || o.orderDate <= dateRange.to)
      );
      const sales = advOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const deposits = advOrders.reduce((sum, o) => sum + (Number(o.depositAmount) || 0), 0);
      const goal = adv.weeklyGoal || 3200;
      const progress = goal > 0 ? (sales / goal) * 100 : 0;

      return {
        ...adv,
        ordersCount: advOrders.length,
        sales,
        deposits,
        goal,
        progress
      };
    }).sort((a, b) => b.sales - a.sales);
  }, [store.advisors, store.orders, dateRange]);

  return (
    <div style={{ display: 'grid', gap: '20px', padding: '10px 0' }}>
      
      {/* Top Controls & Filter Bar */}
      <div className="pos-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={24} style={{ color: 'var(--orange)' }} />
            Dashboard Ejecutivo & Control de Operaciones
          </h1>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Línea de tiempo: <b>{dateRange.label}</b> ({dateRange.from} al {dateRange.to})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: '10px', padding: '3px', border: '1px solid var(--line)' }}>
            {['today', 'week', 'prev_week', 'month', 'year'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: timeframe === t ? 'var(--orange)' : 'transparent',
                  color: timeframe === t ? '#fff' : 'var(--ink)',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t === 'today' ? 'Hoy' : t === 'week' ? 'Semana' : t === 'prev_week' ? 'Sem. Anterior' : t === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pos-submit-order-btn"
            onClick={() => exportOrdersToCSV(filteredOrders, dateRange.label)}
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={13} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        
        {/* Card 1: Facturación */}
        <div className="pos-card" style={{ display: 'grid', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Ventas Brutas</span>
          <strong style={{ fontSize: '24px', fontWeight: 900, color: 'var(--ink)', fontFamily: 'Space Grotesk' }}>
            {money(metrics.grossSales)}
          </strong>
          <small style={{ fontSize: '11px', color: 'var(--orange-dark)', fontWeight: 700 }}>
            {metrics.orderCount} trabajos registrados
          </small>
        </div>

        {/* Card 2: Recaudado */}
        <div className="pos-card" style={{ display: 'grid', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Recaudado en Caja</span>
          <strong style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', fontFamily: 'Space Grotesk' }}>
            {money(metrics.totalDeposited)}
          </strong>
          <small style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
            {metrics.collectionRate.toFixed(1)}% tasa de cobro
          </small>
        </div>

        {/* Card 3: Cartera Pendiente */}
        <div className="pos-card" style={{ display: 'grid', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Cartera por Cobrar</span>
          <strong style={{ fontSize: '24px', fontWeight: 900, color: metrics.balanceDue > 0 ? '#dc2626' : 'var(--muted)', fontFamily: 'Space Grotesk' }}>
            {money(metrics.balanceDue)}
          </strong>
          <small style={{ fontSize: '11px', color: metrics.balanceDue > 0 ? '#dc2626' : 'var(--muted)', fontWeight: 700 }}>
            Saldos pendientes en taller
          </small>
        </div>

        {/* Card 4: Margen Bruto Real */}
        <div className="pos-card" style={{ display: 'grid', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Utilidad Bruta Estimada</span>
          <strong style={{ fontSize: '24px', fontWeight: 900, color: '#2563eb', fontFamily: 'Space Grotesk' }}>
            {money(metrics.grossProfit)}
          </strong>
          <small style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>
            {metrics.grossMarginPercent.toFixed(1)}% margen sobre sustratos
          </small>
        </div>

        {/* Card 5: IVA SRI */}
        <div className="pos-card" style={{ display: 'grid', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>IVA 15% Generado</span>
          <strong style={{ fontSize: '24px', fontWeight: 900, color: '#7c3aed', fontFamily: 'Space Grotesk' }}>
            {money(metrics.totalTaxCollected)}
          </strong>
          <small style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700 }}>
            Débito fiscal para SRI
          </small>
        </div>

      </div>

      {/* Charts & Breakdown 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(320px, 1fr)', gap: '20px' }}>
        
        {/* Left: Daily Trend SVG Bar Chart */}
        <div className="pos-card" style={{ display: 'grid', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart2 size={18} style={{ color: 'var(--orange)' }} />
            Evolución Diaria de Facturación ($)
          </h2>

          {dailyTrend.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px 0', fontSize: '12px' }}>
              No hay transacciones registradas en este período.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                {dailyTrend.map((d) => {
                  const pct = Math.max(8, (d.sales / maxDailySales) * 100);
                  return (
                    <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink)' }}>${Math.round(d.sales)}</span>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '42px',
                          height: `${pct}%`,
                          background: 'var(--orange)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.3s ease'
                        }}
                        title={`${d.date}: $${d.sales.toFixed(2)} (${d.orders} órdenes)`}
                      />
                      <span style={{ fontSize: '9px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Payment Methods Split */}
        <div className="pos-card" style={{ display: 'grid', gap: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={18} style={{ color: 'var(--orange)' }} />
            Distribución por Método de Cobro
          </h2>

          <div style={{ display: 'grid', gap: '10px' }}>
            {[
              { label: '💵 Efectivo (Caja)', val: metrics.paymentMethods.cash, color: '#16a34a' },
              { label: '🏦 Transferencias Bancarias', val: metrics.paymentMethods.transfer, color: '#2563eb' },
              { label: '💳 Tarjetas Débito / Crédito', val: metrics.paymentMethods.card, color: '#7c3aed' },
              { label: '📜 Cheques', val: metrics.paymentMethods.check, color: '#d97706' }
            ].map((p) => {
              const pct = metrics.totalDeposited > 0 ? (p.val / metrics.totalDeposited) * 100 : 0;
              return (
                <div key={p.label} style={{ display: 'grid', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                    <span>{p.label}</span>
                    <span style={{ color: p.color, fontWeight: 900 }}>{money(p.val)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '999px', background: 'var(--bg)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: p.color, borderRadius: '999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CRM Corporate Clients & Advisor Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.2fr)', gap: '20px' }}>
        
        {/* Top Clients */}
        <div className="pos-card" style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={18} style={{ color: 'var(--orange)' }} />
            Top 5 Clientes Corporativos
          </h2>

          <div style={{ display: 'grid', gap: '8px' }}>
            {topClients.map((c, idx) => (
              <div key={c.name} style={{ padding: '10px 12px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{idx + 1}. {c.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {c.count} trabajos contratados
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--orange-dark)' }}>{money(c.total)}</span>
                  {c.balance > 0 && <small style={{ display: 'block', color: '#dc2626', fontSize: '10px' }}>Saldo: {money(c.balance)}</small>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advisor Leaderboard */}
        <div className="pos-card" style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={18} style={{ color: 'var(--orange)' }} />
            Rendimiento del Equipo de Asesoras
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table className="pos-orders-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Asesora</th>
                  <th>Órdenes</th>
                  <th>Facturación</th>
                  <th>Meta Semanal</th>
                  <th>% Meta</th>
                </tr>
              </thead>
              <tbody>
                {advisorStats.map((adv) => (
                  <tr key={adv.id}>
                    <td><strong>{adv.name}</strong></td>
                    <td>{adv.ordersCount}</td>
                    <td><b style={{ color: 'var(--orange)' }}>{money(adv.sales)}</b></td>
                    <td>{money(adv.goal)}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 900,
                        background: adv.progress >= 100 ? '#dcfce7' : '#fef3c7',
                        color: adv.progress >= 100 ? '#166534' : '#b45309'
                      }}>
                        {adv.progress.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
