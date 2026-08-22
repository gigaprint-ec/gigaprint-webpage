import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  DollarSign,
  Printer,
  MessageCircle,
  Search,
  Calendar,
  Layers,
  Sparkles,
  Edit3,
  CreditCard,
  Receipt,
  FileText,
  AlertCircle,
  Filter,
  X,
  Target,
  ArrowRight,
  Key,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import {
  loadPOSStore,
  savePOSStore,
  toISODate,
  getDayNameSpanish,
  getMondayOfWeek,
  getISOWeekCode,
  generateOrderNumber,
  calculateWeeklyBalance,
  calculateDailyReconciliation
} from '../../lib/posStore';
import { POSReceiptModal } from './POSReceiptModal';
import { initialData as siteCatalogData } from '../../data';
import { getProductCalcType } from '../../catalog';

export function POSPage() {
  const [store, setStore] = useState(loadPOSStore);
  const [activeTab, setActiveTab] = useState('cashier'); // 'cashier', 'orders', 'daily_close', 'expenses'

  // Active Advisor
  const activeAdvisor = useMemo(() => {
    return store.advisors.find((a) => a.id === store.activeAdvisorId) || store.advisors[0];
  }, [store.advisors, store.activeAdvisorId]);

  const money = (val) => `$${(Number(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const currentMonday = getMondayOfWeek();
  const currentWeekCode = getISOWeekCode();

  // ==========================================
  // CASHIER (NEW ORDER) STATE
  // ==========================================
  const [orderNumber, setOrderNumber] = useState(() => generateOrderNumber(store.orders));
  const [jobName, setJobName] = useState('');
  const [orderDate, setOrderDate] = useState(toISODate());
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return toISODate(d);
  });

  // Customer selection
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isNewCustomerModal, setIsNewCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', identification: '', phone: '', email: '', city: 'Quito' });

  // Cart / Items
  const [cartItems, setCartItems] = useState([]);

  // Item builder state
  const [itemForm, setItemForm] = useState({
    productId: '',
    productName: 'Lona Impresa 13oz',
    category: 'Gran formato',
    calcType: 'm2',
    widthCm: 100,
    heightCm: 100,
    quantity: 1,
    unitPrice: 5.50,
    finishing: 'none',
    eyeletCount: 4,
    eyeletType: 'small',
    designLevel: 'none',
    hasInstallation: false,
    customDetails: ''
  });

  // Billing & Payments
  const [includeTax, setIncludeTax] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [depositInput, setDepositInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer'); // 'cash', 'transfer', 'check', 'card'
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentBank, setPaymentBank] = useState('Pichincha');

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [receiptItems, setReceiptItems] = useState([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Credentials quick view popup
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Expense Logger State
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('suministros');

  // CRM Orders Filter State
  const [crmSearch, setCrmSearch] = useState('');
  const [crmStatusFilter, setCrmStatusFilter] = useState('all');

  // Switch Active Advisor
  const handleAdvisorChange = (advId) => {
    const nextState = { ...store, activeAdvisorId: advId };
    setStore(nextState);
    savePOSStore(nextState);
  };

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return store.customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.identification && c.identification.includes(q)) ||
      (c.phone && c.phone.includes(q))
    ).slice(0, 5);
  }, [store.customers, customerSearch]);

  // Handle Catalog Quick Chip Selection
  const handleQuickProduct = (prod) => {
    const calcType = getProductCalcType(prod);
    const price = Number(prod.price) || 5.0;
    setItemForm({
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      calcType: calcType === 'm2' ? 'm2' : prod.pricingMode === 'tier-total' ? 'lot' : 'unit',
      widthCm: 100,
      heightCm: 100,
      quantity: 1,
      unitPrice: price,
      finishing: 'none',
      eyeletCount: 4,
      eyeletType: 'small',
      designLevel: 'none',
      hasInstallation: false,
      customDetails: ''
    });
  };

  // Add Item to Cart
  const handleAddItemToCart = () => {
    if (!itemForm.productName.trim()) return;

    let area = 0;
    let lineTotal = 0;

    if (itemForm.calcType === 'm2') {
      area = (Number(itemForm.widthCm || 100) / 100) * (Number(itemForm.heightCm || 100) / 100);
      const eyeletCost = itemForm.finishing === 'small' ? (Number(itemForm.eyeletCount || 4) * 0.30) :
                         itemForm.finishing === 'large' ? (Number(itemForm.eyeletCount || 4) * 0.50) :
                         itemForm.finishing === 'pocket' ? 4.0 : 0;
      lineTotal = ((area * Number(itemForm.unitPrice)) + eyeletCost) * Number(itemForm.quantity || 1);
    } else {
      lineTotal = Number(itemForm.unitPrice) * Number(itemForm.quantity || 1);
    }

    const newItem = {
      id: `item-${Date.now()}`,
      product_id: itemForm.productId,
      product_name: itemForm.productName,
      category: itemForm.category,
      calc_type: itemForm.calcType,
      width_cm: itemForm.calcType === 'm2' ? Number(itemForm.widthCm) : null,
      height_cm: itemForm.calcType === 'm2' ? Number(itemForm.heightCm) : null,
      area_m2: area > 0 ? area : null,
      quantity: Number(itemForm.quantity || 1),
      unit_price: Number(itemForm.unitPrice),
      finishing: itemForm.finishing,
      eyelet_count: itemForm.eyeletCount,
      eyelet_type: itemForm.eyeletType,
      design_level: itemForm.designLevel,
      has_installation: itemForm.hasInstallation,
      total_price: lineTotal,
      custom_details: itemForm.customDetails
    };

    setCartItems([...cartItems, newItem]);
    if (!jobName) {
      setJobName(newItem.product_name);
    }
  };

  // Remove Item from Cart
  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter((it) => it.id !== itemId));
  };

  // Update Item Price in Hot (in Cart)
  const handleUpdateItemPrice = (itemId, newPrice) => {
    setCartItems(cartItems.map((it) => {
      if (it.id !== itemId) return it;
      const p = Number(newPrice) || 0;
      let total = p;
      if (it.calc_type === 'm2' && it.area_m2) {
        total = (it.area_m2 * p) * it.quantity;
      } else {
        total = p * it.quantity;
      }
      return { ...it, unit_price: p, total_price: total };
    }));
  };

  // Calculate Order Totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + Number(it.total_price || 0), 0);
  }, [cartItems]);

  const taxAmount = includeTax ? subtotal * 0.15 : 0;
  const totalAmount = subtotal + taxAmount + (Number(shippingCost) || 0);
  const depositAmount = depositInput === '' ? totalAmount : Math.min(totalAmount, Number(depositInput) || 0);
  const balanceDue = Math.max(0, totalAmount - depositAmount);

  // Save New Customer Modal
  const handleSaveNewCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) return;

    const newCust = {
      id: `cust-${Date.now()}`,
      ...newCustomerForm
    };

    const nextCustomers = [newCust, ...store.customers];
    const nextState = { ...store, customers: nextCustomers };
    setStore(nextState);
    savePOSStore(nextState);
    setSelectedCustomer(newCust);
    setIsNewCustomerModal(false);
    setCustomerSearch('');
  };

  // Submit Order (Save to store & Open Receipt)
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Debes agregar al menos un producto a la venta.');
      return;
    }

    const custName = selectedCustomer ? selectedCustomer.name : customerSearch.trim() || 'Consumidor Final';
    const dayName = getDayNameSpanish(orderDate);

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: String(orderNumber),
      advisorId: activeAdvisor.id,
      customerId: selectedCustomer?.id || null,
      customerName: custName,
      customerPhone: selectedCustomer?.phone || '',
      customerIdentification: selectedCustomer?.identification || '',
      jobName: jobName || cartItems[0]?.product_name || 'Trabajo de Impresión',
      orderDate,
      deliveryDate,
      dayOfWeek: dayName,
      status: 'en_produccion',
      paymentStatus: balanceDue === 0 ? 'pagado' : depositAmount > 0 ? 'con_saldo' : 'sin_abono',
      subtotal,
      taxRate: includeTax ? 15 : 0,
      taxAmount,
      shippingCost: Number(shippingCost) || 0,
      discountAmount: 0,
      totalAmount,
      depositAmount,
      balanceDue,
      notes: ''
    };

    const newPayment = depositAmount > 0 ? {
      id: `pay-${Date.now()}`,
      orderId: newOrder.id,
      advisorId: activeAdvisor.id,
      paymentDate: orderDate,
      paymentMethod,
      amount: depositAmount,
      bankName: paymentMethod === 'transfer' || paymentMethod === 'check' ? paymentBank : null,
      referenceNumber: paymentRef || null,
      notes: 'Abono inicial de venta'
    } : null;

    const nextOrders = [newOrder, ...store.orders];
    const nextOrderItems = [...cartItems.map((it) => ({ ...it, order_id: newOrder.id })), ...store.orderItems];
    const nextPayments = newPayment ? [newPayment, ...store.payments] : store.payments;

    const nextState = {
      ...store,
      orders: nextOrders,
      orderItems: nextOrderItems,
      payments: nextPayments
    };

    setStore(nextState);
    savePOSStore(nextState);

    // Open receipt modal
    setReceiptOrder(newOrder);
    setReceiptItems(cartItems);
    setIsReceiptOpen(true);

    // Reset cashier form
    setCartItems([]);
    setJobName('');
    setSelectedCustomer(null);
    setCustomerSearch('');
    setDepositInput('');
    setPaymentRef('');
    setOrderNumber(generateOrderNumber(nextOrders));
  };

  // Add Payment to Existing Order (CRM Settle balance)
  const handleSettleOrder = (order) => {
    const payVal = prompt(`Registrar cobro de saldo para Orden #${order.orderNumber} (${order.customerName}):\nSaldo pendiente: ${money(order.balanceDue)}`, String(order.balanceDue));
    if (!payVal || isNaN(payVal) || Number(payVal) <= 0) return;

    const amountPaid = Math.min(Number(order.balanceDue), Number(payVal));
    const newBalance = Math.max(0, Number(order.balanceDue) - amountPaid);
    const newDeposit = Number(order.depositAmount) + amountPaid;

    const newPayment = {
      id: `pay-${Date.now()}`,
      orderId: order.id,
      advisorId: activeAdvisor.id,
      paymentDate: toISODate(),
      paymentMethod: 'cash',
      amount: amountPaid,
      notes: 'Liquidación de saldo'
    };

    const updatedOrders = store.orders.map((o) =>
      o.id === order.id
        ? {
            ...o,
            depositAmount: newDeposit,
            balanceDue: newBalance,
            paymentStatus: newBalance === 0 ? 'pagado' : 'con_saldo'
          }
        : o
    );

    const nextState = {
      ...store,
      orders: updatedOrders,
      payments: [newPayment, ...store.payments]
    };

    setStore(nextState);
    savePOSStore(nextState);
  };

  // Add Daily Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount || isNaN(expenseAmount)) return;

    const newExp = {
      id: `exp-${Date.now()}`,
      advisorId: activeAdvisor.id,
      expenseDate: toISODate(),
      description: expenseDesc.trim(),
      amount: Number(expenseAmount),
      category: expenseCategory
    };

    const nextState = {
      ...store,
      expenses: [newExp, ...store.expenses]
    };

    setStore(nextState);
    savePOSStore(nextState);
    setExpenseDesc('');
    setExpenseAmount('');
  };

  const handleDeleteExpense = (expId) => {
    const nextState = {
      ...store,
      expenses: store.expenses.filter((e) => e.id !== expId)
    };
    setStore(nextState);
    savePOSStore(nextState);
  };

  // Weekly Balance calculations for active advisor
  const weeklyData = useMemo(() => {
    const monday = getMondayOfWeek();
    return calculateWeeklyBalance(store.orders, store.payments, store.expenses, activeAdvisor, monday);
  }, [store.orders, store.payments, store.expenses, activeAdvisor]);

  // CRM Filtered Orders
  const crmOrders = useMemo(() => {
    return store.orders.filter((o) => {
      const matchSearch =
        o.orderNumber.includes(crmSearch) ||
        o.customerName.toLowerCase().includes(crmSearch.toLowerCase()) ||
        o.jobName.toLowerCase().includes(crmSearch.toLowerCase());
      const matchStatus =
        crmStatusFilter === 'all' ||
        (crmStatusFilter === 'con_saldo' && o.paymentStatus === 'con_saldo') ||
        (crmStatusFilter === 'pagado' && o.paymentStatus === 'pagado') ||
        o.status === crmStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [store.orders, crmSearch, crmStatusFilter]);

  const copyMyCreds = () => {
    const text = `🔑 Mi Credencial Gigaprint (${currentWeekCode})\n👤 Asesora: ${activeAdvisor.name}\n🔢 PIN de Caja: ${activeAdvisor.weeklyPin || activeAdvisor.pin}\n🔐 Clave: ${activeAdvisor.weeklyPassword}\n🌐 Acceso: https://gigaprint-ec.github.io/gigaprint-webpage/#/admin/pos`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  return (
    <div className="pos-container">
      {/* Top Header & Navigation */}
      <div className="pos-top-bar">
        <div className="pos-brand-badge">
          <h1>
            <ShoppingCart size={22} style={{ color: 'var(--orange)' }} />
            Punto de Venta & CRM
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Asesora: <b>{activeAdvisor?.name}</b></span>
            <button
              type="button"
              onClick={() => setShowCredsModal(true)}
              title="Ver mi PIN y clave semanal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(234, 88, 12, 0.4)',
                background: 'var(--orange-soft)',
                color: 'var(--orange-dark)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <Key size={12} /> PIN: {activeAdvisor?.weeklyPin || activeAdvisor?.pin || '1234'}
            </button>
          </div>
        </div>

        <div className="pos-top-actions">
          {/* Advisor Quick Switcher */}
          <div className="pos-advisor-selector">
            <User size={15} style={{ color: 'var(--orange)' }} />
            <select
              value={activeAdvisor?.id}
              onChange={(e) => handleAdvisorChange(e.target.value)}
              aria-label="Seleccionar Asesora Activa"
            >
              {store.advisors.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.name} (PIN: {adv.weeklyPin || adv.pin || '1234'})
                </option>
              ))}
            </select>
          </div>

          {/* POS Navigation Tabs */}
          <div className="pos-nav-tabs">
            <button
              type="button"
              className={`pos-nav-tab ${activeTab === 'cashier' ? 'active' : ''}`}
              onClick={() => setActiveTab('cashier')}
            >
              <ShoppingCart size={15} /> Nueva Venta
            </button>
            <button
              type="button"
              className={`pos-nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FileText size={15} /> Pedidos & Cartera ({store.orders.length})
            </button>
            <button
              type="button"
              className={`pos-nav-tab ${activeTab === 'daily_close' ? 'active' : ''}`}
              onClick={() => setActiveTab('daily_close')}
            >
              <Receipt size={15} /> Mi Cuadre Semanal
            </button>
            <button
              type="button"
              className={`pos-nav-tab ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              <DollarSign size={15} /> Caja Chica
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: NUEVA VENTA / CAJERO (POS)
          ========================================================================= */}
      {activeTab === 'cashier' && (
        <div className="pos-cashier-grid">
          {/* Left Column: Customer & Products */}
          <div className="pos-left-panel">
            {/* Order Info & Customer Box */}
            <div className="pos-card">
              <div className="pos-card-title">
                <h3>
                  <User size={18} style={{ color: 'var(--orange)' }} />
                  Datos de la Venta & Cliente
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>NRO. PROFORMA:</span>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    style={{
                      width: '80px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid var(--orange)',
                      fontWeight: 800,
                      fontSize: '13px',
                      textAlign: 'center',
                      background: 'var(--bg)',
                      color: 'var(--ink)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="pos-form-group">
                  <label>Nombre del Trabajo / Proyecto *</label>
                  <input
                    type="text"
                    placeholder="ej. Lona Agrofunción 150x115..."
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    required
                  />
                </div>
                <div className="pos-form-group">
                  <label>Fecha Compra</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
                <div className="pos-form-group">
                  <label>Fecha Entrega Prometida</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Customer Selector */}
              <div className="pos-customer-selector-box">
                {selectedCustomer ? (
                  <div className="pos-selected-customer-pill">
                    <div className="pos-customer-info">
                      <strong>{selectedCustomer.name}</strong>
                      <small>
                        {selectedCustomer.identification ? `CI/RUC: ${selectedCustomer.identification} · ` : ''}
                        {selectedCustomer.phone ? `Tel: ${selectedCustomer.phone} · ` : ''}
                        {selectedCustomer.city || 'Quito'}
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="pos-customer-search-row">
                    <div className="pos-search-input-wrap">
                      <Search size={16} style={{ color: 'var(--muted)' }} />
                      <input
                        type="text"
                        placeholder="Buscar cliente por nombre, RUC o teléfono..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="pos-quick-product-btn"
                      style={{ background: 'var(--orange-soft)', borderColor: 'var(--orange)', color: 'var(--orange-dark)' }}
                      onClick={() => setIsNewCustomerModal(true)}
                    >
                      <Plus size={14} /> Crear Cliente
                    </button>
                  </div>
                )}

                {/* Dropdown search results */}
                {!selectedCustomer && filteredCustomers.length > 0 && (
                  <div style={{
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    background: 'var(--paper)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}>
                    {filteredCustomers.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setCustomerSearch('');
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          textAlign: 'left',
                          border: 0,
                          borderBottom: '1px solid var(--line)',
                          background: 'transparent',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          color: 'var(--ink)'
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px' }}>{cust.name}</strong>
                          <small style={{ color: 'var(--muted)' }}>{cust.identification || cust.phone || 'Sin datos adicionales'}</small>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--orange-dark)', fontWeight: 700 }}>Seleccionar</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Catalog Fast Item Builder */}
            <div className="pos-card">
              <div className="pos-card-title">
                <h3>
                  <Layers size={18} style={{ color: 'var(--orange)' }} />
                  Configurador de Producto / Ítem
                </h3>
                <span>Precios editables en caliente</span>
              </div>

              {/* Quick Products Chips */}
              <div className="pos-catalog-fast-selector">
                <div className="pos-catalog-quick-chips">
                  {siteCatalogData.products.slice(0, 10).map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      className={`pos-quick-product-btn ${itemForm.productId === prod.id ? 'active' : ''}`}
                      onClick={() => handleQuickProduct(prod)}
                    >
                      {prod.name}
                    </button>
                  ))}
                </div>

                {/* Live Item Form */}
                <div className="pos-item-form-grid">
                  <div className="pos-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Nombre del Producto / Descripción</label>
                    <input
                      type="text"
                      value={itemForm.productName}
                      onChange={(e) => setItemForm({ ...itemForm, productName: e.target.value })}
                    />
                  </div>

                  <div className="pos-form-group">
                    <label>Tipo de Cobro</label>
                    <select
                      value={itemForm.calcType}
                      onChange={(e) => setItemForm({ ...itemForm, calcType: e.target.value })}
                    >
                      <option value="m2">Por Metro Cuadrado (m²)</option>
                      <option value="unit">Por Unidad / Pieza</option>
                      <option value="lot">Por Lote</option>
                    </select>
                  </div>

                  {itemForm.calcType === 'm2' && (
                    <>
                      <div className="pos-form-group">
                        <label>Ancho (cm)</label>
                        <input
                          type="number"
                          min="1"
                          value={itemForm.widthCm}
                          onChange={(e) => setItemForm({ ...itemForm, widthCm: Math.max(1, Number(e.target.value) || 1) })}
                        />
                      </div>
                      <div className="pos-form-group">
                        <label>Alto (cm)</label>
                        <input
                          type="number"
                          min="1"
                          value={itemForm.heightCm}
                          onChange={(e) => setItemForm({ ...itemForm, heightCm: Math.max(1, Number(e.target.value) || 1) })}
                        />
                      </div>
                    </>
                  )}

                  <div className="pos-form-group">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={itemForm.quantity}
                      onChange={(e) => setItemForm({ ...itemForm, quantity: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </div>

                  <div className="pos-form-group">
                    <label>Tarifa Unit. / m² ($) *</label>
                    <input
                      type="number"
                      step="0.10"
                      value={itemForm.unitPrice}
                      onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) || 0 })}
                      style={{ fontWeight: 800, color: 'var(--orange-dark)' }}
                    />
                  </div>

                  {itemForm.calcType === 'm2' && (
                    <>
                      <div className="pos-form-group">
                        <label>Acabados / Ojales</label>
                        <select
                          value={itemForm.finishing}
                          onChange={(e) => setItemForm({ ...itemForm, finishing: e.target.value })}
                        >
                          <option value="none">Sin ojales / Al ras ($0)</option>
                          <option value="small">Ojales Pequeños ($0.30 c/u)</option>
                          <option value="large">Ojales Grandes ($0.50 c/u)</option>
                          <option value="pocket">Bolsillo para tubo ($4.00)</option>
                        </select>
                      </div>

                      {(itemForm.finishing === 'small' || itemForm.finishing === 'large') && (
                        <div className="pos-form-group">
                          <label>Cantidad Ojales</label>
                          <input
                            type="number"
                            min="1"
                            value={itemForm.eyeletCount}
                            onChange={(e) => setItemForm({ ...itemForm, eyeletCount: Math.max(1, Number(e.target.value) || 1) })}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="pos-submit-order-btn"
                    style={{ padding: '10px 20px', fontSize: '13px', width: 'auto' }}
                    onClick={handleAddItemToCart}
                  >
                    <Plus size={16} /> Agregar al Pedido
                  </button>
                </div>
              </div>

              {/* Current Cart Items Table */}
              {cartItems.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
                    Ítems en esta venta ({cartItems.length})
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="pos-cart-items-table">
                      <thead>
                        <tr>
                          <th>Cant.</th>
                          <th>Descripción & Medidas</th>
                          <th>Acabados</th>
                          <th style={{ textAlign: 'right' }}>Tarifa Unit. ($)</th>
                          <th style={{ textAlign: 'right' }}>Total ($)</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 800 }}>{item.quantity}</td>
                            <td>
                              <b>{item.product_name}</b>
                              {item.width_cm && item.height_cm && (
                                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                  {item.width_cm} × {item.height_cm} cm ({(item.area_m2).toFixed(2)} m²)
                                </div>
                              )}
                            </td>
                            <td>
                              <span style={{ fontSize: '11px', color: item.finishing !== 'none' ? 'var(--orange-dark)' : 'var(--muted)' }}>
                                {item.finishing === 'small' ? `${item.eyelet_count} ojales peq.` :
                                 item.finishing === 'large' ? `${item.eyelet_count} ojales gran.` :
                                 item.finishing === 'pocket' ? 'Bolsillo tubo' : 'Al ras'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <input
                                type="number"
                                step="0.10"
                                value={item.unit_price}
                                onChange={(e) => handleUpdateItemPrice(item.id, e.target.value)}
                                className="pos-inline-edit-input"
                                title="Editar precio para esta venta"
                              />
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--orange-dark)' }}>
                              {money(item.total_price)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#dc2626' }}
                                title="Eliminar ítem"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Billing & Order Summary */}
          <aside className="pos-order-summary-card">
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>
              Liquidación Financiera
            </h3>

            <div className="pos-totals-display">
              <div className="pos-totals-row">
                <span>Subtotal ítems:</span>
                <b>{money(subtotal)}</b>
              </div>

              <div className="pos-totals-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={includeTax}
                    onChange={(e) => setIncludeTax(e.target.checked)}
                  />
                  <span>Incluir IVA (15%)</span>
                </label>
                <b>{money(taxAmount)}</b>
              </div>

              <div className="pos-totals-row">
                <span>Envío / Flete:</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Math.max(0, Number(e.target.value) || 0))}
                  style={{ width: '65px', padding: '2px 6px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--line)' }}
                />
              </div>

              <div className="pos-totals-row grand-total">
                <span>TOTAL VENTA:</span>
                <b>{money(totalAmount)}</b>
              </div>
            </div>

            {/* Payment Breakdown & Abono */}
            <div style={{ display: 'grid', gap: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
                Método de Pago
              </label>
              <div className="pos-payment-methods-grid">
                <button
                  type="button"
                  className={`pos-payment-method-btn ${paymentMethod === 'transfer' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  🏦 Transferencia
                </button>
                <button
                  type="button"
                  className={`pos-payment-method-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  💵 Efectivo
                </button>
                <button
                  type="button"
                  className={`pos-payment-method-btn ${paymentMethod === 'check' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('check')}
                >
                  📜 Cheque
                </button>
                <button
                  type="button"
                  className={`pos-payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  💳 Tarjeta
                </button>
              </div>

              {(paymentMethod === 'transfer' || paymentMethod === 'check') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Banco (Pichincha, Guayaquil...)"
                    value={paymentBank}
                    onChange={(e) => setPaymentBank(e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="Nro. Comprobante / Cheque"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '12px' }}
                  />
                </div>
              )}

              <div className="pos-form-group">
                <label>Abono de Entrada ($)</label>
                <input
                  type="number"
                  step="0.50"
                  placeholder={`Ej. ${totalAmount.toFixed(2)} (Total)`}
                  value={depositInput}
                  onChange={(e) => setDepositInput(e.target.value)}
                  style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}
                />
              </div>

              <div className={`pos-balance-status-box ${balanceDue > 0 ? 'has-balance' : ''}`}>
                <div>
                  <span style={{ fontSize: '11px', display: 'block' }}>
                    {balanceDue > 0 ? 'Falta por pagar:' : 'Estado de pago:'}
                  </span>
                  <strong>{balanceDue > 0 ? money(balanceDue) : 'PAGADO COMPLETO 💲'}</strong>
                </div>
                {balanceDue > 0 ? <AlertCircle size={20} color="#d97706" /> : <CheckCircle2 size={20} color="#16a34a" />}
              </div>
            </div>

            <button
              type="button"
              className="pos-submit-order-btn"
              onClick={handleSubmitOrder}
              disabled={cartItems.length === 0}
            >
              <CheckCircle2 size={18} /> Registrar Venta & Comprobante
            </button>
          </aside>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PEDIDOS & CRM (CARTERA)
          ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="pos-card">
          <div className="pos-card-title">
            <h3>
              <FileText size={18} style={{ color: 'var(--orange)' }} />
              Directorio de Pedidos & Cuentas por Cobrar
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="pos-search-input-wrap" style={{ width: '280px' }}>
                <Search size={15} style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por cliente, nro venta o trabajo..."
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                />
              </div>
              <select
                value={crmStatusFilter}
                onChange={(e) => setCrmStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '12px' }}
              >
                <option value="all">Todos los Estados</option>
                <option value="con_saldo">Con Saldo Pendiente</option>
                <option value="pagado">Pagados Completos</option>
                <option value="en_produccion">En Producción</option>
                <option value="listo">Listo para Entrega</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="pos-daily-excel-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Nro</th>
                  <th style={{ textAlign: 'left' }}>Cliente & Trabajo</th>
                  <th>Fecha Compra</th>
                  <th>Entrega</th>
                  <th>Total Venta</th>
                  <th>Abonado</th>
                  <th>Por Cobrar</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {crmOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                      No se encontraron pedidos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  crmOrders.map((order) => {
                    const orderItemsList = store.orderItems.filter((it) => it.order_id === order.id || it.orderId === order.id);
                    return (
                      <tr key={order.id}>
                        <td style={{ textAlign: 'left', fontWeight: 800 }}>#{order.orderNumber}</td>
                        <td style={{ textAlign: 'left' }}>
                          <strong style={{ display: 'block', color: 'var(--ink)' }}>{order.customerName}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{order.jobName}</span>
                        </td>
                        <td>{order.orderDate}</td>
                        <td>{order.deliveryDate || '-'}</td>
                        <td style={{ fontWeight: 800 }}>{money(order.totalAmount)}</td>
                        <td className="pos-highlight-cash">{money(order.depositAmount)}</td>
                        <td className={Number(order.balanceDue) > 0 ? 'pos-highlight-balance' : 'pos-highlight-cash'}>
                          {money(order.balanceDue)}
                        </td>
                        <td>
                          <span className={`pos-badge-pill ${order.paymentStatus === 'pagado' ? 'paid' : 'pending'}`}>
                            {order.paymentStatus === 'pagado' ? 'PAGADO 💲' : 'CON SALDO'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            {Number(order.balanceDue) > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSettleOrder(order)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #16a34a',
                                  background: '#dcfce7',
                                  color: '#166534',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer'
                                }}
                              >
                                Cobrar Saldo
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptOrder(order);
                                setReceiptItems(orderItemsList);
                                setIsReceiptOpen(true);
                              }}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid var(--line)',
                                background: 'var(--paper)',
                                color: 'var(--ink)',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Printer size={13} /> Ticket
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MI CUADRE SEMANAL (EXCEL FORMAT IDÉNTICO)
          ========================================================================= */}
      {activeTab === 'daily_close' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Weekly Goal Progress Card */}
          <div className="pos-goal-tracker-card">
            <div className="pos-goal-header">
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Meta de Ventas Semanal · Asesora {activeAdvisor?.name}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>
                  {money(weeklyData.totals.totalSales)} / <small style={{ color: 'var(--muted)' }}>{money(weeklyData.weeklyGoal)}</small>
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: weeklyData.compliancePercent >= 100 ? '#16a34a' : 'var(--orange-dark)'
                }}>
                  {weeklyData.compliancePercent.toFixed(1)}%
                </span>
                <small style={{ display: 'block', color: 'var(--muted)' }}>Cumplimiento</small>
              </div>
            </div>

            <div className="pos-goal-progress-track">
              <div
                className="pos-goal-progress-fill"
                style={{ width: `${Math.min(100, weeklyData.compliancePercent)}%` }}
              />
            </div>
          </div>

          {/* Excel Format Table (Lunes a Sábado) */}
          <div className="pos-card">
            <div className="pos-card-title">
              <h3>
                <Receipt size={18} style={{ color: 'var(--orange)' }} />
                Cuadre de Ventas, Abonos y Caja Chica (Semana Activa)
              </h3>
              <span>Desde Lunes {weeklyData.mondayDate}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="pos-daily-excel-table">
                <thead>
                  <tr>
                    <th>DÍA</th>
                    <th>VENTAS</th>
                    <th>ABONADO</th>
                    <th>POR COBRAR</th>
                    <th>EFECTIVO</th>
                    <th>TRANSFERENCIA</th>
                    <th>CHEQUE</th>
                    <th>GASTOS</th>
                    <th>NETO EN CAJA</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.days.map((day) => (
                    <tr key={day.date}>
                      <td style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                        {day.dayName} <small style={{ color: 'var(--muted)', fontSize: '10px' }}>({day.date.substring(5)})</small>
                      </td>
                      <td style={{ fontWeight: 700 }}>{money(day.totalSales)}</td>
                      <td className="pos-highlight-cash">{money(day.totalDeposits)}</td>
                      <td className="pos-highlight-balance">{money(day.totalBalanceDue)}</td>
                      <td style={{ color: '#16a34a' }}>{money(day.totalCash)}</td>
                      <td style={{ color: '#2563eb' }}>{money(day.totalTransfer)}</td>
                      <td style={{ color: '#9333ea' }}>{money(day.totalCheck)}</td>
                      <td style={{ color: '#d97706' }}>{money(day.totalExpenses)}</td>
                      <td style={{ fontWeight: 800, color: '#2563eb' }}>{money(day.netIncome)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td style={{ fontWeight: 900 }}>TOTALES SEMANALES</td>
                    <td style={{ fontWeight: 900, color: 'var(--orange-dark)' }}>{money(weeklyData.totals.totalSales)}</td>
                    <td className="pos-highlight-cash">{money(weeklyData.totals.totalDeposits)}</td>
                    <td className="pos-highlight-balance">{money(weeklyData.totals.totalBalanceDue)}</td>
                    <td style={{ color: '#16a34a' }}>{money(weeklyData.totals.totalCash)}</td>
                    <td style={{ color: '#2563eb' }}>{money(weeklyData.totals.totalTransfer)}</td>
                    <td style={{ color: '#9333ea' }}>{money(weeklyData.totals.totalCheck)}</td>
                    <td style={{ color: '#d97706' }}>{money(weeklyData.totals.totalExpenses)}</td>
                    <td style={{ fontWeight: 900, color: '#2563eb' }}>{money(weeklyData.totals.netIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: CAJA CHICA & EGRESOS
          ========================================================================= */}
      {activeTab === 'expenses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px' }}>
          {/* New Expense Form */}
          <div className="pos-card">
            <div className="pos-card-title">
              <h3>
                <DollarSign size={18} style={{ color: 'var(--orange)' }} />
                Registrar Gasto de Caja Chica
              </h3>
            </div>

            <form onSubmit={handleAddExpense} style={{ display: 'grid', gap: '12px' }}>
              <div className="pos-form-group">
                <label>Descripción del Gasto *</label>
                <input
                  type="text"
                  placeholder="ej. Cinta de embalaje, Flete a Cumbayá..."
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  required
                />
              </div>

              <div className="pos-form-group">
                <label>Monto del Gasto ($) *</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.10"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                />
              </div>

              <div className="pos-form-group">
                <label>Categoría</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                >
                  <option value="suministros">Suministros y Materiales</option>
                  <option value="fletes">Fletes y Envíos</option>
                  <option value="alimentacion">Alimentación / Refrigerios</option>
                  <option value="impresion_terceros">Impresión con Terceros</option>
                  <option value="varios">Varios / Imprevistos</option>
                </select>
              </div>

              <button
                type="submit"
                className="pos-submit-order-btn"
                style={{ padding: '12px', fontSize: '13px', marginTop: '6px' }}
              >
                <Plus size={16} /> Guardar Egreso
              </button>
            </form>
          </div>

          {/* Expenses History List */}
          <div className="pos-card">
            <div className="pos-card-title">
              <h3>Egresos Registrados</h3>
              <span>Total: {money(store.expenses.reduce((s, e) => s + Number(e.amount || 0), 0))}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="pos-daily-excel-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Fecha</th>
                    <th style={{ textAlign: 'left' }}>Descripción</th>
                    <th>Categoría</th>
                    <th>Monto ($)</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {store.expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                        No hay gastos registrados.
                      </td>
                    </tr>
                  ) : (
                    store.expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td style={{ textAlign: 'left' }}>{exp.expenseDate}</td>
                        <td style={{ textAlign: 'left', fontWeight: 700 }}>{exp.description}</td>
                        <td>{exp.category}</td>
                        <td style={{ fontWeight: 800, color: '#dc2626' }}>{money(exp.amount)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#dc2626' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: NEW CUSTOMER & CREDENTIALS QUICK VIEW
          ========================================================================= */}
      {showCredsModal && (
        <div className="pos-modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="pos-modal-content" style={{
            background: 'var(--paper)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '420px',
            border: '1px solid var(--line)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} style={{ color: 'var(--orange)' }} /> Credencial de Acceso
              </h3>
              <button type="button" onClick={() => setShowCredsModal(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'var(--bg)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                Asesora Activa
              </div>
              <strong style={{ fontSize: '18px', color: 'var(--ink)', display: 'block' }}>
                {activeAdvisor?.name}
              </strong>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Semana activa: <b>{currentWeekCode}</b> (Lunes {currentMonday})
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                <div style={{ background: 'var(--paper)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', fontWeight: 700 }}>PIN DE CAJA</span>
                  <strong style={{ fontSize: '20px', color: 'var(--orange-dark)' }}>{activeAdvisor?.weeklyPin || activeAdvisor?.pin || '1234'}</strong>
                </div>
                <div style={{ background: 'var(--paper)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', fontWeight: 700 }}>CLAVE WEB</span>
                  <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{activeAdvisor?.weeklyPassword || `${activeAdvisor?.name.toLowerCase()}-1234`}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={copyMyCreds}
                className="pos-submit-order-btn"
                style={{ flex: 1, padding: '12px', fontSize: '13px' }}
              >
                {copiedCreds ? <Check size={16} /> : <Copy size={16} />}
                {copiedCreds ? '¡Copiado!' : 'Copiar mi credencial'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewCustomerModal && (
        <div className="pos-modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="pos-modal-content" style={{
            background: 'var(--paper)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px',
            border: '1px solid var(--line)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>
                Registrar Nuevo Cliente
              </h3>
              <button type="button" onClick={() => setIsNewCustomerModal(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} style={{ display: 'grid', gap: '12px' }}>
              <div className="pos-form-group">
                <label>Nombre / Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Constructora Quito S.A."
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="pos-form-group">
                  <label>RUC o Cédula</label>
                  <input
                    type="text"
                    placeholder="1790000000001"
                    value={newCustomerForm.identification}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, identification: e.target.value })}
                  />
                </div>
                <div className="pos-form-group">
                  <label>Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0991234567"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="pos-form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="cliente@gmail.com"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="pos-submit-order-btn"
                  style={{ flex: 1, padding: '12px', fontSize: '13px' }}
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <POSReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={receiptOrder}
        items={receiptItems}
        advisor={activeAdvisor}
      />
    </div>
  );
}
