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
  PieChart
} from 'lucide-react';
import { loadPOSStore, exportOrdersToCSV, toISODate, getMondayOfWeek } from '../../lib/posStore';

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

  // Aggregate Metrics
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

  // Advisor Leaderboard Performance Table
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
    <div className="pos-container">
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

      {/* Executive KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
          <small style={{ color: '#dc2626', fontWeight: 700 }}>Saldos pendientes en la calle</small>
        </div>

        <div className="pos-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Gastos Caja Chica</span>
          <h2 style={{ fontSize: '26px', margin: '6px 0 2px', color: '#d97706', fontFamily: 'Space Grotesk' }}>
            {money(totalExpenses)}
          </h2>
          <small style={{ color: 'var(--muted)' }}>{filteredExpenses.length} egresos reportados</small>
        </div>

        <div className="pos-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Neto en Caja</span>
          <h2 style={{ fontSize: '26px', margin: '6px 0 2px', color: '#2563eb', fontFamily: 'Space Grotesk' }}>
            {money(netIncome)}
          </h2>
          <small style={{ color: '#2563eb', fontWeight: 700 }}>Recaudación menos egresos</small>
        </div>
      </div>

      {/* Methods Breakdown & Payment Split */}
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

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(147, 51, 234, 0.08)', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#9333ea' }}>📜 CHEQUES</span>
            <div style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0', color: '#6b21a8' }}>{money(checkAmount)}</div>
            <small style={{ color: 'var(--muted)' }}>{totalDeposits > 0 ? `${((checkAmount / totalDeposits) * 100).toFixed(1)}%` : '0%'}</small>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--orange-dark)' }}>💳 TARJETAS</span>
            <div style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0', color: 'var(--orange-dark)' }}>{money(cardAmount)}</div>
            <small style={{ color: 'var(--muted)' }}>{totalDeposits > 0 ? `${((cardAmount / totalDeposits) * 100).toFixed(1)}%` : '0%'}</small>
          </div>
        </div>
      </div>

      {/* Advisor Leaderboard Performance Table */}
      <div className="pos-card">
        <div className="pos-card-title">
          <h3>
            <Award size={18} style={{ color: 'var(--orange)' }} />
            Desempeño y Cumplimiento de Metas por Asesora
          </h3>
          <span>Comparativa del periodo seleccionado</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="pos-daily-excel-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Asesora Comercial</th>
                <th>Trabajos</th>
                <th>Venta Realizada</th>
                <th>Abonado Recaudado</th>
                <th>Por Cobrar</th>
                <th>Gastos</th>
                <th>Neto Caja</th>
                <th>Ticket Prom.</th>
                <th>Meta Semanal</th>
                <th style={{ textAlign: 'center' }}>% Cumplimiento</th>
              </tr>
            </thead>
            <tbody>
              {advisorPerformance.map((adv) => {
                const isPassed = adv.compliance >= 100;
                return (
                  <tr key={adv.id}>
                    <td style={{ textAlign: 'left', fontWeight: 800 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: 'var(--orange-soft)',
                          color: 'var(--orange-dark)',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'grid',
                          placeItems: 'center'
                        }}>
                          {adv.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{adv.name}</span>
                      </div>
                    </td>
                    <td>{adv.orderCount}</td>
                    <td style={{ fontWeight: 800 }}>{money(adv.sales)}</td>
                    <td className="pos-highlight-cash">{money(adv.deposits)}</td>
                    <td className="pos-highlight-balance">{money(adv.balance)}</td>
                    <td style={{ color: '#d97706' }}>{money(adv.expenses)}</td>
                    <td style={{ fontWeight: 800, color: '#2563eb' }}>{money(adv.net)}</td>
                    <td>{money(adv.avgTicket)}</td>
                    <td>{money(adv.weeklyGoal)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        <div style={{ width: '60px', height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, adv.compliance)}%`,
                            height: '100%',
                            background: isPassed ? '#16a34a' : 'var(--orange)'
                          }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: isPassed ? '#16a34a' : 'var(--ink)' }}>
                          {adv.compliance.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td style={{ textAlign: 'left', fontWeight: 900 }}>TOTALES CONSOLIDADOS</td>
                <td>{filteredOrders.length}</td>
                <td style={{ fontWeight: 900, color: 'var(--orange-dark)' }}>{money(totalSales)}</td>
                <td className="pos-highlight-cash">{money(totalDeposits)}</td>
                <td className="pos-highlight-balance">{money(totalBalanceDue)}</td>
                <td style={{ color: '#d97706' }}>{money(totalExpenses)}</td>
                <td style={{ fontWeight: 900, color: '#2563eb' }}>{money(netIncome)}</td>
                <td>{money(filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0)}</td>
                <td>-</td>
                <td style={{ textAlign: 'center', fontWeight: 800 }}>
                  {totalSales > 0 ? `${((totalDeposits / totalSales) * 100).toFixed(1)}% recaudado` : '0%'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
