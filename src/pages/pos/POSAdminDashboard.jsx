import React, { useState, useMemo } from 'react';
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
  Percent
} from 'lucide-react';
import {
  loadPOSStore,
  exportOrdersToCSV,
  toISODate,
  getMondayOfWeek,
  calculateOrderMargin
} from '../../lib/posStore';

export function POSAdminDashboard() {
  const [store] = useState(loadPOSStore);
  const [timeframe, setTimeframe] = useState('week'); // 'today', 'week', 'prev_week', 'month', 'year', 'custom'
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('all');
  const [customFrom, setCustomFrom] = useState(toISODate(new Date(Date.now() - 30 * 86400000)));
  const [customTo, setCustomTo] = useState(toISODate());

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
    return store.orders.filter((order) => {
      const inDate = (!dateRange.from || order.orderDate >= dateRange.from) && (!dateRange.to || order.orderDate <= dateRange.to);
      const inAdvisor = selectedAdvisorId === 'all' || order.advisorId === selectedAdvisorId;
      return inDate && inAdvisor;
    });
  }, [store.orders, dateRange, selectedAdvisorId]);

  // Filter payments by date range and advisor
  const filteredPayments = useMemo(() => {
    return store.payments.filter((payment) => {
      const inDate = (!dateRange.from || payment.paymentDate >= dateRange.from) && (!dateRange.to || payment.paymentDate <= dateRange.to);
      const inAdvisor = selectedAdvisorId === 'all' || payment.advisorId === selectedAdvisorId;
      return inDate && inAdvisor;
    });
  }, [store.payments, dateRange, selectedAdvisorId]);

  // Filter expenses by date range and advisor
  const filteredExpenses = useMemo(() => {
    return store.expenses.filter((expense) => {
      const inDate = (!dateRange.from || expense.expenseDate >= dateRange.from) && (!dateRange.to || expense.expenseDate <= dateRange.to);
      const inAdvisor = selectedAdvisorId === 'all' || expense.advisorId === selectedAdvisorId;
      return inDate && inAdvisor;
    });
  }, [store.expenses, dateRange, selectedAdvisorId]);

  // Aggregate Financial Metrics
  const totalSales = filteredOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalDeposits = filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalBalanceDue = filteredOrders.reduce((sum, o) => sum + Number(o.balanceDue || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netIncome = totalDeposits - totalExpenses;

  // Breakdown by payment methods
  const cashAmount = filteredPayments.filter((p) => p.paymentMethod === 'cash').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const transferAmount = filteredPayments.filter((p) => p.paymentMethod === 'transfer').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const checkAmount = filteredPayments.filter((p) => p.paymentMethod === 'check').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const cardAmount = filteredPayments.filter((p) => p.paymentMethod === 'card').reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Profit Margin & Job Costing Analytics
  const marginSummary = useMemo(() => {
    let totalEstimatedCost = 0;
    let totalEstimatedMaterial = 0;

    filteredOrders.forEach((o) => {
      const items = (store.orderItems || []).filter((i) => i.orderId === o.id);
      const margin = calculateOrderMargin(o, items, store.materials || []);
      totalEstimatedCost += margin.totalCost;
      totalEstimatedMaterial += margin.materialCost;
    });

    const grossProfit = totalSales - totalEstimatedCost;
    const marginPercent = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    return {
      totalEstimatedCost,
      totalEstimatedMaterial,
      grossProfit,
      marginPercent
    };
  }, [filteredOrders, totalSales, store.orderItems, store.materials]);

  // Substrates & Categories Revenue Distribution
  const categoryBreakdown = useMemo(() => {
    const cats = {};
    filteredOrders.forEach((o) => {
      const items = (store.orderItems || []).filter((i) => i.orderId === o.id);
      items.forEach((itm) => {
        const cat = itm.category || 'Gran Formato';
        const amt = Number(itm.totalPrice || 0);
        const area = Number(itm.areaM2 || 0) * (itm.quantity || 1);
        if (!cats[cat]) cats[cat] = { revenue: 0, count: 0, m2: 0 };
        cats[cat].revenue += amt;
        cats[cat].count += Number(itm.quantity || 1);
        cats[cat].m2 += area;
      });
    });

    return Object.entries(cats).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      count: data.count,
      m2: data.m2,
      percent: totalSales > 0 ? (data.revenue / totalSales) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, store.orderItems, totalSales]);

  // Daily Sales for Current Selection (for Bar Chart)
  const dailySalesData = useMemo(() => {
    const daysMap = {};
    filteredOrders.forEach((o) => {
      const d = o.orderDate;
      if (!daysMap[d]) daysMap[d] = 0;
      daysMap[d] += Number(o.totalAmount || 0);
    });

    const sortedDates = Object.keys(daysMap).sort();
    const maxVal = Math.max(...Object.values(daysMap), 100);

    return sortedDates.map((dateStr) => ({
      date: dateStr,
      dayLabel: dateStr.split('-').slice(1).join('/'),
      sales: daysMap[dateStr] || 0,
      heightPercent: Math.min(100, Math.max(10, ((daysMap[dateStr] || 0) / maxVal) * 100))
    }));
  }, [filteredOrders]);

  // Advisor Performance Leaderboard
  const advisorPerformance = useMemo(() => {
    return store.advisors.map((advisor) => {
      const advOrders = store.orders.filter((o) => o.advisorId === advisor.id && (!dateRange.from || o.orderDate >= dateRange.from) && (!dateRange.to || o.orderDate <= dateRange.to));
      const advPayments = store.payments.filter((p) => p.advisorId === advisor.id && (!dateRange.from || p.paymentDate >= dateRange.from) && (!dateRange.to || p.paymentDate <= dateRange.to));
      const advExpenses = store.expenses.filter((e) => e.advisorId === advisor.id && (!dateRange.from || e.expenseDate >= dateRange.from) && (!dateRange.to || e.expenseDate <= dateRange.to));

      const sales = advOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const deposits = advPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const balance = advOrders.reduce((sum, o) => sum + Number(o.balanceDue || 0), 0);
      const expenses = advExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const net = deposits - expenses;

      const goal = Number(advisor.weeklyGoal || 3200);
      const compliance = goal > 0 ? (sales / goal) * 100 : 0;
      const avgTicket = advOrders.length > 0 ? sales / advOrders.length : 0;

      return {
        ...advisor,
        orderCount: advOrders.length,
        sales,
        deposits,
        balance,
        expenses,
        net,
        compliance,
        avgTicket
      };
    }).sort((a, b) => b.sales - a.sales);
  }, [store.advisors, store.orders, store.payments, store.expenses, dateRange]);

  return (
    <div className="pos-container" style={{ display: 'grid', gap: '20px' }}>
      {/* Top Banner & Date Filter Toolbar */}
      <div className="pos-top-bar">
        <div className="pos-brand-badge">
          <h1>
            <TrendingUp size={22} style={{ color: 'var(--orange)' }} />
            Centro de Control & Balances
          </h1>
          <span>{dateRange.label}</span>
        </div>

        <div className="pos-top-actions">
          {/* Timeframe Presets */}
          <div className="pos-nav-tabs">
            <button
              type="button"
              className={`pos-nav-tab ${timeframe === 'today' ? 'active' : ''}`}
              onClick={() => setTimeframe('today')}
            >
              Hoy
            </button>
            <button
              type="button"
              className={`pos-nav-tab ${timeframe === 'week' ? 'active' : ''}`}
              onClick={() => setTimeframe('week')}
            >
              Esta Semana
            </button>
            <button
              type="button"
              className={`pos-nav-tab ${timeframe === 'prev_week' ? 'active' : ''}`}
              onClick={() => setTimeframe('prev_week')}
            >
              Semana Ant.
            </button>
            <button
              type="button"
              className={`pos-nav-tab ${timeframe === 'month' ? 'active' : ''}`}
              onClick={() => setTimeframe('month')}
            >
              Este Mes
            </button>
            <button
              type="button"
              className={`pos-nav-tab ${timeframe === 'custom' ? 'active' : ''}`}
              onClick={() => setTimeframe('custom')}
            >
              Rango...
            </button>
          </div>

          {/* Advisor Selector */}
          <div className="pos-advisor-selector">
            <Filter size={15} style={{ color: 'var(--muted)' }} />
            <select
              value={selectedAdvisorId}
              onChange={(e) => setSelectedAdvisorId(e.target.value)}
            >
              <option value="all">Todas las Asesoras</option>
              {store.advisors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Export to Excel / CSV */}
          <button
            type="button"
            className="pos-submit-order-btn"
            style={{ padding: '8px 14px', fontSize: '13px', background: '#16a34a' }}
            onClick={() => exportOrdersToCSV(filteredOrders, store.advisors)}
          >
            <Download size={15} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Custom Date Pickers (if timeframe === 'custom') */}
      {timeframe === 'custom' && (
        <div className="pos-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>Desde:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>Hasta:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
            />
          </div>
        </div>
      )}

      {/* Executive Financial KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        <div className="pos-card" style={{ borderLeft: '4px solid var(--orange)' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Ventas Brutas</span>
          <h2 style={{ fontSize: '26px', margin: '6px 0 2px', color: 'var(--ink)', fontFamily: 'Space Grotesk' }}>
            {money(totalSales)}
          </h2>
          <small style={{ color: 'var(--muted)' }}>{filteredOrders.length} trabajos registrados</small>
        </div>

        <div className="pos-card" style={{ borderLeft: '4px solid #16a34a' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Recaudado (Abonos)</span>
          <h2 style={{ fontSize: '26px', margin: '6px 0 2px', color: '#16a34a', fontFamily: 'Space Grotesk' }}>
            {money(totalDeposits)}
          </h2>
          <small style={{ color: '#16a34a', fontWeight: 700 }}>
            {totalSales > 0 ? `${((totalDeposits / totalSales) * 100).toFixed(1)}% cobrado` : '0%'}
          </small>
        </div>

        <div className="pos-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Cartera por Cobrar</span>
          <h2 style={{ fontSize: '26px', margin: '6px 0 2px', color: '#dc2626', fontFamily: 'Space Grotesk' }}>
            {money(totalBalanceDue)}
          </h2>
          <small style={{ color: '#dc2626', fontWeight: 700 }}>Saldos pendientes de cobro</small>
        </div>

        <div className="pos-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Gastos Caja Chica</span>
          <h2 style={{ fontSize: '26px', margin: '6px 0 2px', color: '#d97706', fontFamily: 'Space Grotesk' }}>
            {money(totalExpenses)}
          </h2>
          <small style={{ color: 'var(--muted)' }}>{filteredExpenses.length} egresos reportados</small>
        </div>

        <div className="pos-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Margen Bruto Est.</span>
          <h2 style={{ fontSize: '26px', margin: '6px 0 2px', color: '#8b5cf6', fontFamily: 'Space Grotesk' }}>
            {marginSummary.marginPercent.toFixed(1)}%
          </h2>
          <small style={{ color: '#8b5cf6', fontWeight: 700 }}>Utilidad: {money(marginSummary.grossProfit)}</small>
        </div>
      </div>

      {/* Visual Chart: Daily Sales Trend */}
      {dailySalesData.length > 0 && (
        <div className="pos-card" style={{ display: 'grid', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} style={{ color: 'var(--orange)' }} />
              Tendencia de Ventas Diarias
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Facturación por día</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '140px', paddingTop: '20px', borderBottom: '1px solid var(--line)' }}>
            {dailySalesData.map((d, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)' }}>
                  ${d.sales > 0 ? d.sales.toFixed(0) : '0'}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '40px',
                    height: `${d.heightPercent}%`,
                    background: 'linear-gradient(180deg, var(--orange) 0%, var(--orange-dark) 100%)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.3s ease'
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>
                  {d.dayLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Substrates & Products Revenue Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="pos-card" style={{ display: 'grid', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--orange)' }} />
              Participación por Familia de Productos & Sustratos
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Volumen e ingresos</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{cat.name}</strong>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--orange)' }}>{cat.percent.toFixed(1)}%</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--ink)', fontFamily: 'Space Grotesk' }}>
                  {money(cat.revenue)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {cat.count} ítems {cat.m2 > 0 ? `• ${cat.m2.toFixed(1)} m² impresos` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Split Breakdown */}
      <div className="pos-card">
        <div className="pos-card-title">
          <h3>
            <CreditCard size={18} style={{ color: 'var(--orange)' }} />
            Distribución por Métodos de Pago
          </h3>
          <span>Total recaudado: {money(totalDeposits)}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a' }}>💵 EFECTIVO</span>
            <div style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0', color: '#166534' }}>{money(cashAmount)}</div>
            <small style={{ color: 'var(--muted)' }}>{totalDeposits > 0 ? `${((cashAmount / totalDeposits) * 100).toFixed(1)}%` : '0%'}</small>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb' }}>🏦 TRANSFERENCIAS</span>
            <div style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0', color: '#1e40af' }}>{money(transferAmount)}</div>
            <small style={{ color: 'var(--muted)' }}>{totalDeposits > 0 ? `${((transferAmount / totalDeposits) * 100).toFixed(1)}%` : '0%'}</small>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706' }}>💳 TARJETAS</span>
            <div style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0', color: '#b45309' }}>{money(cardAmount)}</div>
            <small style={{ color: 'var(--muted)' }}>{totalDeposits > 0 ? `${((cardAmount / totalDeposits) * 100).toFixed(1)}%` : '0%'}</small>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(100, 116, 139, 0.08)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>📜 CHEQUES</span>
            <div style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0', color: '#334155' }}>{money(checkAmount)}</div>
            <small style={{ color: 'var(--muted)' }}>{totalDeposits > 0 ? `${((checkAmount / totalDeposits) * 100).toFixed(1)}%` : '0%'}</small>
          </div>
        </div>
      </div>

      {/* Advisor Leaderboard Performance Table */}
      <div className="pos-card">
        <div className="pos-card-title">
          <h3>
            <Award size={18} style={{ color: 'var(--orange)' }} />
            Rendimiento Comercial & Cumplimiento de Metas
          </h3>
          <span>Semana {store.advisors[0]?.currentWeekCode || 'Actual'}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="pos-orders-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Asesora</th>
                <th>Trabajos</th>
                <th>Venta Bruta</th>
                <th>Cobrado</th>
                <th>Por Cobrar</th>
                <th>Gastos</th>
                <th>Neto Caja</th>
                <th>Ticket Prom.</th>
                <th>Meta Semanal</th>
                <th style={{ minWidth: '130px' }}>Cumplimiento</th>
              </tr>
            </thead>
            <tbody>
              {advisorPerformance.map((adv) => (
                <tr key={adv.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="pos-advisor-pill-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                        {adv.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong>{adv.name}</strong>
                        {adv.isActive === false && <span style={{ fontSize: '10px', color: '#dc2626', display: 'block' }}>Inactiva</span>}
                      </div>
                    </div>
                  </td>
                  <td><b>{adv.orderCount}</b></td>
                  <td><b>{money(adv.sales)}</b></td>
                  <td style={{ color: '#16a34a', fontWeight: 700 }}>{money(adv.deposits)}</td>
                  <td style={{ color: adv.balance > 0 ? '#dc2626' : 'var(--muted)', fontWeight: 700 }}>{money(adv.balance)}</td>
                  <td style={{ color: '#d97706' }}>{money(adv.expenses)}</td>
                  <td><b style={{ color: '#2563eb' }}>{money(adv.net)}</b></td>
                  <td>{money(adv.avgTicket)}</td>
                  <td>{money(adv.weeklyGoal || 3200)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '8px', background: 'var(--line)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, adv.compliance)}%`,
                            background: adv.compliance >= 100 ? '#16a34a' : (adv.compliance >= 60 ? 'var(--orange)' : '#dc2626'),
                            borderRadius: '999px'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: adv.compliance >= 100 ? '#16a34a' : 'var(--ink)' }}>
                        {adv.compliance.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
