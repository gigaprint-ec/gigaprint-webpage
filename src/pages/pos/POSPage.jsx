import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Users, Calendar, DollarSign, Plus, Trash2, Printer, 
  Search, ArrowRight, CheckCircle2, AlertCircle, FileText, Lock, 
  Shield, Check, UserCheck, Phone, MapPin, RefreshCw, Layers,
  CreditCard, Send, Percent, Sparkles, MessageCircle, AlertTriangle,
  Layout, Eye, Scissors, Package, Wrench, Clock
} from 'lucide-react';
import { 
  loadPOSStore, 
  savePOSStore, 
  getPOSSession, 
  savePOSSession, 
  logoutPOSSession,
  generateOrderNumber, 
  calculateDailyReconciliation, 
  calculateWeeklyBalance, 
  exportOrdersToCSV,
  openCashShift,
  closeCashShift,
  getActiveCashShift,
  toISODate,
  getISOWeekCode,
  getMondayOfWeek,
  createPOSOrder,
  clonePOSOrder,
  cancelPOSOrder,
  calculateDueAlerts,
  fetchRemotePOSStore,
  subscribePOSRealtime,
  onSyncStatusChange,
  DEFAULT_ADVISORS,
  DEFAULT_CUSTOMERS,
  DEFAULT_MATERIALS,
  PRODUCTION_STAGES
} from '../../lib/posStore';
import { POSLockScreen } from './POSLockScreen';
import { POSReceiptModal } from './POSReceiptModal';
import { POSWorkOrderModal } from './POSWorkOrderModal';
import { POSArtProofModal } from './POSArtProofModal';
import { POSProductionKanban } from './POSProductionKanban';
import { POSCustomerCRM } from './POSCustomerCRM';
import { POSInventoryMaterials } from './POSInventoryMaterials';
import estebanCatalog from '../../data/estebanCatalog.json';
import { catalogCategories } from '../../catalog';
import '../../pos.css';

export function POSPage() {
  const navigate = useNavigate();
  const [store, setStore] = useState(() => loadPOSStore());
  const [session, setSession] = useState(() => getPOSSession());
  const [syncStatus, setSyncStatus] = useState('synced');

  // Navigation tabs: 'cashier', 'orders', 'kanban', 'crm', 'inventory', 'weekly', 'expenses'
  const [activeTab, setActiveTab] = useState('cashier');

  // Modals state
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [workOrderData, setWorkOrderData] = useState(null);
  const [artProofData, setArtProofData] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftOpeningCash, setShiftOpeningCash] = useState(20);
  const [shiftCountedCash, setShiftCountedCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');

  // ----------------------------------------------------
  // Sync with Supabase in background on mount & Realtime
  // ----------------------------------------------------
  useEffect(() => {
    const unsubSync = onSyncStatusChange((st) => setSyncStatus(st));

    fetchRemotePOSStore().then((remoteData) => {
      if (remoteData) setStore(remoteData);
    });

    const unsubRealtime = subscribePOSRealtime((updated) => {
      if (updated) setStore(updated);
    });

    return () => {
      unsubSync();
      unsubRealtime();
    };
  }, []);

  // Sync state to local storage when modified
  useEffect(() => {
    savePOSStore(store);
  }, [store]);

  // Current active advisor based on session
  const activeAdvisor = useMemo(() => {
    if (session?.role === 'asesora' && session.advisorId) {
      return (store.advisors || []).find((a) => a.id === session.advisorId) || store.advisors[0];
    }
    return (store.advisors || []).find((a) => a.id === store.activeAdvisorId) || store.advisors[0];
  }, [store.advisors, store.activeAdvisorId, session]);

  const activeCashShift = useMemo(() => {
    return getActiveCashShift(store.shifts, activeAdvisor?.id);
  }, [store.shifts, activeAdvisor]);

  // Due alerts for workshop
  const dueAlerts = useMemo(() => {
    return calculateDueAlerts(store.orders || []);
  }, [store.orders]);

  // ----------------------------------------------------
  // CASHIER FORM STATE
  // ----------------------------------------------------
  const [orderNumber, setOrderNumber] = useState('');
  const [jobName, setJobName] = useState('');
  const [orderDate, setOrderDate] = useState(toISODate());
  const [deliveryDate, setDeliveryDate] = useState(toISODate(new Date(Date.now() + 2 * 86400000)));
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerIdentification, setCustomerIdentification] = useState('');
  const [productionPriority, setProductionPriority] = useState('normal');
  const [productionNotes, setProductionNotes] = useState('');
  const [artUrl, setArtUrl] = useState('');
  const [artApproved, setArtApproved] = useState(false);

  // Cart & Line Items
  const [cartItems, setCartItems] = useState([]);

  // Taxes, Shipping & Splits
  const [includeTax, setIncludeTax] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [splitPayments, setSplitPayments] = useState([
    { id: 'sp-1', paymentMethod: 'cash', amount: '', bankName: '', referenceNumber: '' }
  ]);

  // Catalog item selector
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState(null);
  const [itemWidthCm, setItemWidthCm] = useState(100);
  const [itemHeightCm, setItemHeightCm] = useState(100);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemFinishing, setItemFinishing] = useState('none');
  const [itemEyeletCount, setItemEyeletCount] = useState(4);
  const [itemCustomDetails, setItemCustomDetails] = useState('');

  // Initial order number sync
  useEffect(() => {
    if (!orderNumber) {
      setOrderNumber(generateOrderNumber(store.orders));
    }
  }, [store.orders, orderNumber]);

  // Filter Catalog Products for Visual Tiles
  const catalogProducts = useMemo(() => {
    const rows = estebanCatalog?.rows || [];
    return rows.filter((p) => {
      const matchCat = catalogCategory === 'all' || p.category === catalogCategory;
      const matchSearch = !catalogSearch || p.name.toLowerCase().includes(catalogSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [catalogCategory, catalogSearch]);

  // Available categories for tabs
  const catalogCats = useMemo(() => {
    const rows = estebanCatalog?.rows || [];
    const set = new Set(rows.map((r) => r.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, []);

  // Filter Customers for Autocomplete
  const matchedCustomers = useMemo(() => {
    if (!customerSearch) return [];
    const q = customerSearch.toLowerCase();
    return (store.customers || []).filter((c) => 
      c.name.toLowerCase().includes(q) || (c.identification && c.identification.includes(q))
    ).slice(0, 5);
  }, [store.customers, customerSearch]);

  const selectedCustomerObj = useMemo(() => {
    return (store.customers || []).find((c) => c.id === selectedCustomerId) || null;
  }, [store.customers, selectedCustomerId]);

  // Handle select customer from autocomplete
  const handleSelectCustomer = (cust) => {
    setSelectedCustomerId(cust.id);
    setCustomerSearch(cust.name);
    setCustomerPhone(cust.phone || '');
    setCustomerIdentification(cust.identification || '');
  };

  // Add Item from Visual Tile or Form
  const handleAddItemToCart = (prod = selectedCatalogProduct) => {
    if (!prod) return;

    const isM2 = prod.calcType === 'm2' || prod.unit === 'm2';
    const areaM2 = isM2 ? (Number(itemWidthCm) / 100) * (Number(itemHeightCm) / 100) : null;
    const basePrice = Number(prod.price) || 5.00;

    let finishExtra = 0;
    if (itemFinishing === 'ojales_pequenos') finishExtra = (Number(itemEyeletCount) || 4) * 0.30;
    if (itemFinishing === 'ojales_grandes') finishExtra = (Number(itemEyeletCount) || 4) * 0.50;
    if (itemFinishing === 'bolsillo') finishExtra = 4.00;

    let itemTotal = 0;
    if (isM2 && areaM2) {
      itemTotal = ((areaM2 * basePrice) + finishExtra) * Number(itemQuantity);
    } else {
      itemTotal = (basePrice + finishExtra) * Number(itemQuantity);
    }

    const newItem = {
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      productId: prod.id || 'prod-custom',
      productName: prod.name,
      category: prod.category || 'General',
      calcType: isM2 ? 'm2' : 'unit',
      widthCm: isM2 ? Number(itemWidthCm) : null,
      heightCm: isM2 ? Number(itemHeightCm) : null,
      areaM2: isM2 ? Number(areaM2.toFixed(3)) : null,
      quantity: Number(itemQuantity),
      unitPrice: basePrice,
      finishing: itemFinishing,
      eyeletCount: Number(itemEyeletCount),
      eyeletType: itemFinishing.includes('ojales') ? itemFinishing : 'none',
      totalPrice: Number(itemTotal.toFixed(2)),
      customDetails: itemCustomDetails
    };

    setCartItems([...cartItems, newItem]);
    setSelectedCatalogProduct(null);
    setItemCustomDetails('');
  };

  // Update Hot Item Price in Cart with finishing calculation fix
  const handleUpdateItemPrice = (itemId, newPrice) => {
    setCartItems(cartItems.map((it) => {
      if (it.id !== itemId) return it;
      const p = Number(newPrice) || 0;

      let finishingCost = 0;
      if (it.finishing === 'ojales_pequenos') finishingCost = (Number(it.eyeletCount) || 4) * 0.30;
      if (it.finishing === 'ojales_grandes') finishingCost = (Number(it.eyeletCount) || 4) * 0.50;
      if (it.finishing === 'bolsillo') finishingCost = 4.00;

      let total = 0;
      if (it.calcType === 'm2' && it.areaM2) {
        total = ((it.areaM2 * p) + finishingCost) * it.quantity;
      } else {
        total = (p + finishingCost) * it.quantity;
      }
      return { ...it, unitPrice: p, totalPrice: Number(total.toFixed(2)) };
    }));
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter((it) => it.id !== itemId));
  };

  // Order Totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + Number(it.totalPrice || 0), 0);
  }, [cartItems]);

  const taxAmount = includeTax ? subtotal * 0.15 : 0;
  const totalAmount = subtotal + taxAmount + (Number(shippingCost) || 0);

  const totalDepositPaid = useMemo(() => {
    return splitPayments.reduce((sum, sp) => sum + (Number(sp.amount) || 0), 0);
  }, [splitPayments]);

  const balanceDue = Math.max(0, totalAmount - totalDepositPaid);

  const addSplitPayment = () => {
    setSplitPayments([
      ...splitPayments,
      { id: 'sp-' + Date.now(), paymentMethod: 'transfer', amount: '', bankName: 'Banco Pichincha', referenceNumber: '' }
    ]);
  };

  const removeSplitPayment = (id) => {
    if (splitPayments.length > 1) {
      setSplitPayments(splitPayments.filter((sp) => sp.id !== id));
    }
  };

  const updateSplitPayment = (id, field, value) => {
    setSplitPayments(splitPayments.map((sp) => sp.id === id ? { ...sp, [field]: value } : sp));
  };

  // Handle 1-Click Reorder (Cloning past order into cashier)
  const handleReorder = (pastOrder) => {
    const pastItems = (store.orderItems || []).filter((it) => it.orderId === pastOrder.id);
    setSelectedCustomerId(pastOrder.customerId || '');
    setCustomerSearch(pastOrder.customerName || '');
    setCustomerPhone(pastOrder.customerPhone || '');
    setCustomerIdentification(pastOrder.customerIdentification || '');
    setJobName((pastOrder.jobName || '') + ' (Reorden)');
    setCartItems(pastItems.map((it, idx) => ({
      id: 'cart-reorder-' + idx,
      productId: it.productId || 'prod',
      productName: it.productName || it.product_name,
      category: it.category || 'General',
      calcType: it.calcType || it.calc_type || 'm2',
      widthCm: it.widthCm || it.width_cm,
      heightCm: it.heightCm || it.height_cm,
      areaM2: it.areaM2 || it.area_m2,
      quantity: it.quantity || 1,
      unitPrice: it.unitPrice || it.unit_price,
      finishing: it.finishing || 'none',
      eyeletCount: it.eyeletCount || it.eyelet_count || 0,
      eyeletType: it.eyeletType || it.eyelet_type || 'none',
      totalPrice: it.totalPrice || it.total_price,
      customDetails: it.customDetails || it.custom_details || ''
    })));
    setActiveTab('cashier');
  };

  // Submit and Register Sale
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Agrega al menos un producto al carrito para registrar la venta.');
      return;
    }
    if (!customerSearch.trim()) {
      alert('Ingresa el nombre del cliente.');
      return;
    }

    const orderData = {
      orderNumber,
      advisorId: activeAdvisor.id,
      customerId: selectedCustomerId || 'cust-' + Date.now(),
      customerName: customerSearch.trim(),
      customerPhone: customerPhone.trim(),
      customerIdentification: customerIdentification.trim(),
      jobName: jobName.trim() || 'Trabajo de Impresión #' + orderNumber,
      orderDate,
      deliveryDate,
      dayOfWeek: getMondayOfWeek(new Date(orderDate)),
      productionStage: 'preprensa',
      productionPriority,
      productionNotes,
      artUrl,
      artApproved,
      status: 'en_produccion',
      paymentStatus: balanceDue === 0 ? 'pagado' : totalDepositPaid > 0 ? 'con_saldo' : 'sin_abono',
      subtotal: Number(subtotal.toFixed(2)),
      taxRate: includeTax ? 15 : 0,
      taxAmount: Number(taxAmount.toFixed(2)),
      shippingCost: Number(shippingCost) || 0,
      totalAmount: Number(totalAmount.toFixed(2)),
      depositAmount: Number(totalDepositPaid.toFixed(2)),
      balanceDue: Number(balanceDue.toFixed(2)),
      notes: ''
    };

    const validPayments = splitPayments.filter((sp) => Number(sp.amount) > 0);

    const { state: nextState, order: createdOrder, items: createdItems } = createPOSOrder(
      store,
      orderData,
      cartItems,
      validPayments
    );

    setStore(nextState);

    // Open receipt modal
    setReceiptOrder({ order: createdOrder, items: createdItems, advisor: activeAdvisor });

    // Reset cashier form
    setCartItems([]);
    setJobName('');
    setCustomerSearch('');
    setCustomerPhone('');
    setCustomerIdentification('');
    setSelectedCustomerId('');
    setProductionNotes('');
    setArtUrl('');
    setArtApproved(false);
    setSplitPayments([{ id: 'sp-1', paymentMethod: 'cash', amount: '', bankName: '', referenceNumber: '' }]);
    setOrderNumber(generateOrderNumber(nextState.orders));
  };

  // Open/Close Cash Register Shifts
  const handleOpenShift = () => {
    const { state, shift } = openCashShift(store, activeAdvisor.id, shiftOpeningCash);
    setStore(state);
    setShowShiftModal(false);
  };

  const handleCloseShift = () => {
    if (!activeCashShift) return;
    const { state, shift } = closeCashShift(store, activeCashShift.id, shiftCountedCash, shiftNotes);
    setStore(state);
    setShowShiftModal(false);
    setShiftCountedCash('');
    setShiftNotes('');
  };

  // Lock Screen View if no active session
  if (!session) {
    return (
      <POSLockScreen
        advisors={store.advisors}
        onUnlockSuccess={(sess) => {
          setSession(sess);
        }}
      />
    );
  }

  const isAdmin = session.role === 'admin';

  return (
    <div className="pos-container">
      {/* Due Dates Alert Banner */}
      {dueAlerts.totalAlerts > 0 && (
        <div style={{
          background: dueAlerts.overdue.length > 0 ? '#fee2e2' : '#fef3c7',
          border: '1px solid ' + (dueAlerts.overdue.length > 0 ? '#fca5a5' : '#fde68a'),
          padding: '10px 16px',
          borderRadius: '12px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: dueAlerts.overdue.length > 0 ? '#991b1b' : '#92400e' }}>
            <AlertTriangle size={18} />
            <span>
              {dueAlerts.overdue.length > 0 ? '🚨 Hay ' + dueAlerts.overdue.length + ' trabajos vencidos en taller!' : ''}
              {dueAlerts.dueToday.length > 0 ? ' ⏳ Hay ' + dueAlerts.dueToday.length + ' trabajos con entrega comprometida para HOY.' : ''}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('kanban')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 0,
              background: dueAlerts.overdue.length > 0 ? '#dc2626' : '#d97706',
              color: '#fff',
              fontWeight: '800',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Ver en Tablero de Taller ➔
          </button>
        </div>
      )}

      {/* Top Header & Navigation Bar */}
      <header className="pos-top-bar">
        <div className="pos-brand-badge">
          <h1>
            <span className="brand-mark">G</span> Gigaprint POS & CRM
            {isAdmin ? (
              <span className="pos-role-badge admin"><Shield size={12} /> Admin General</span>
            ) : (
              <span className="pos-role-badge advisor"><UserCheck size={12} /> Asesora: {activeAdvisor?.name}</span>
            )}
          </h1>
        </div>

        <div className="pos-top-actions">
          {/* Cloud Sync Status Pill */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: '800',
            padding: '4px 8px',
            borderRadius: '999px',
            background: syncStatus === 'synced' ? '#dcfce7' : syncStatus === 'saving' ? '#fef3c7' : '#fee2e2',
            color: syncStatus === 'synced' ? '#166534' : syncStatus === 'saving' ? '#92400e' : '#991b1b',
            border: '1px solid ' + (syncStatus === 'synced' ? '#86efac' : syncStatus === 'saving' ? '#fde68a' : '#fca5a5')
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: syncStatus === 'synced' ? '#16a34a' : syncStatus === 'saving' ? '#d97706' : '#dc2626' }}></span>
            {syncStatus === 'synced' ? 'Nube Sincronizada' : syncStatus === 'saving' ? 'Sincronizando...' : 'Modo Local / Offline'}
          </span>

          {/* Cash Shift Button */}
          <button
            className={'pos-shift-status-btn ' + (activeCashShift ? 'open' : 'closed')}
            onClick={() => setShowShiftModal(true)}
            title={activeCashShift ? 'Caja abierta con fondo de $' + activeCashShift.openingCash : 'Caja cerrada. Clic para abrir turno.'}
          >
            <DollarSign size={14} />
            {activeCashShift ? 'Caja Abierta ($' + activeCashShift.openingCash + ')' : 'Abrir Caja'}
          </button>

          {/* Lock Screen Button */}
          <button 
            className="pos-lock-session-btn"
            onClick={() => {
              logoutPOSSession();
              setSession(null);
            }}
            title="Bloquear terminal (Cambio de turno)"
          >
            <Lock size={14} /> Bloquear
          </button>

          {isAdmin && (
            <Link to="/admin/pos/asesoras" className="pos-pin-quick-badge">
              <Users size={13} /> Credenciales Semanales
            </Link>
          )}
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="pos-nav-tabs" style={{ marginBottom: '20px', overflowX: 'auto' }}>
        <button
          className={'pos-nav-tab ' + (activeTab === 'cashier' ? 'active' : '')}
          onClick={() => setActiveTab('cashier')}
        >
          <ShoppingBag size={16} /> Cajero POS
        </button>

        <button
          className={'pos-nav-tab ' + (activeTab === 'kanban' ? 'active' : '')}
          onClick={() => setActiveTab('kanban')}
        >
          <Layout size={16} /> Tablero de Taller (Kanban)
          {dueAlerts.totalAlerts > 0 && (
            <span style={{ padding: '1px 5px', borderRadius: '999px', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: '900' }}>
              {dueAlerts.totalAlerts}
            </span>
          )}
        </button>

        <button
          className={'pos-nav-tab ' + (activeTab === 'crm' ? 'active' : '')}
          onClick={() => setActiveTab('crm')}
        >
          <Users size={16} /> Clientes & CRM 360°
        </button>

        <button
          className={'pos-nav-tab ' + (activeTab === 'orders' ? 'active' : '')}
          onClick={() => setActiveTab('orders')}
        >
          <FileText size={16} /> Cartera & Pedidos ({store.orders?.length || 0})
        </button>

        <button
          className={'pos-nav-tab ' + (activeTab === 'inventory' ? 'active' : '')}
          onClick={() => setActiveTab('inventory')}
        >
          <Layers size={16} /> Inventario Sustratos
        </button>

        <button
          className={'pos-nav-tab ' + (activeTab === 'weekly' ? 'active' : '')}
          onClick={() => setActiveTab('weekly')}
        >
          <Calendar size={16} /> Cuadre Semanal (Excel)
        </button>

        <button
          className={'pos-nav-tab ' + (activeTab === 'expenses' ? 'active' : '')}
          onClick={() => setActiveTab('expenses')}
        >
          <DollarSign size={16} /> Caja Chica
        </button>
      </nav>

      {/* ====================================================
          TAB 1: CASHIER & SMART POS REGISTER
          ==================================================== */}
      {activeTab === 'cashier' && (
        <div className="pos-cashier-grid">
          {/* Left Column: Job Form & Visual Catalog Grid */}
          <div className="pos-left-panel">
            {/* Customer & Job Header Card */}
            <div className="pos-card">
              <div className="pos-card-title">
                <h3><FileText size={18} color="var(--orange)" /> Datos del Pedido #{orderNumber}</h3>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '700' }}>
                  Semana: {getISOWeekCode()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {/* Customer Autocomplete Input */}
                <div className="pos-form-group" style={{ position: 'relative' }}>
                  <label>Cliente / Empresa *</label>
                  <input
                    type="text"
                    placeholder="Buscar o escribir cliente..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setSelectedCustomerId('');
                    }}
                  />
                  {matchedCustomers.length > 0 && !selectedCustomerId && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      zIndex: 100,
                      marginTop: '4px',
                      overflow: 'hidden'
                    }}>
                      {matchedCustomers.map((mc) => (
                        <div
                          key={mc.id}
                          onClick={() => handleSelectCustomer(mc)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--line)',
                            fontSize: '12px',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                        >
                          <strong>{mc.name}</strong>
                          <span style={{ color: 'var(--muted)' }}>{mc.identification || mc.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pos-form-group">
                  <label>Teléfono WhatsApp</label>
                  <input
                    type="text"
                    placeholder="099..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>

                <div className="pos-form-group">
                  <label>RUC / Cédula</label>
                  <input
                    type="text"
                    placeholder="17..."
                    value={customerIdentification}
                    onChange={(e) => setCustomerIdentification(e.target.value)}
                  />
                </div>

                <div className="pos-form-group">
                  <label>Nombre del Trabajo / Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej. Lona Microperforada Dental..."
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                  />
                </div>

                <div className="pos-form-group">
                  <label>Fecha de Entrega Comprometida</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>

                <div className="pos-form-group">
                  <label>Prioridad de Taller</label>
                  <select
                    value={productionPriority}
                    onChange={(e) => setProductionPriority(e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">⚡ Alta</option>
                    <option value="urgente">🔥 Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Visual Product Catalog Tiles */}
            <div className="pos-card">
              <div className="pos-card-title">
                <h3><ShoppingBag size={18} color="var(--orange)" /> Catálogo Visual de Productos</h3>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    fontSize: '12px',
                    maxWidth: '180px'
                  }}
                />
              </div>

              {/* Category Pills */}
              <div className="pos-catalog-category-tabs">
                {catalogCats.map((cat) => (
                  <button
                    key={cat}
                    className={'pos-catalog-cat-pill ' + (catalogCategory === cat ? 'active' : '')}
                    onClick={() => setCatalogCategory(cat)}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))}
              </div>

              {/* Visual Product Tiles Grid */}
              <div className="pos-catalog-tiles-grid">
                {catalogProducts.slice(0, 24).map((p) => {
                  const isSelected = selectedCatalogProduct?.id === p.id;
                  const priceStr = '$' + (Number(p.price) || 5.00).toFixed(2) + ' / ' + (p.calcType === 'm2' ? 'm²' : 'u');
                  return (
                    <div
                      key={p.id}
                      className={'pos-product-tile ' + (isSelected ? 'selected' : '')}
                      onClick={() => setSelectedCatalogProduct(p)}
                    >
                      <div className="pos-tile-img-wrap">
                        <img 
                          src={p.image || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&auto=format&fit=crop&q=60'} 
                          alt={p.name} 
                        />
                      </div>
                      <div className="pos-tile-info">
                        <strong>{p.name}</strong>
                        <span>{priceStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Product Configurator Box (Appears when a product is clicked) */}
              {selectedCatalogProduct && (
                <div className="pos-item-customizer-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>
                      Configurando: {selectedCatalogProduct.name}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--orange-dark)', fontWeight: '800' }}>
                      Tarifa Base: {'$' + (Number(selectedCatalogProduct.price) || 5).toFixed(2) + ' / ' + (selectedCatalogProduct.calcType === 'm2' ? 'm²' : 'u')}
                    </span>
                  </div>

                  <div className="pos-item-form-grid">
                    {selectedCatalogProduct.calcType === 'm2' && (
                      <>
                        <div className="pos-form-group">
                          <label>Ancho (cm)</label>
                          <input
                            type="number"
                            value={itemWidthCm}
                            onChange={(e) => setItemWidthCm(e.target.value)}
                          />
                        </div>
                        <div className="pos-form-group">
                          <label>Alto (cm)</label>
                          <input
                            type="number"
                            value={itemHeightCm}
                            onChange={(e) => setItemHeightCm(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    <div className="pos-form-group">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                      />
                    </div>

                    <div className="pos-form-group">
                      <label>Acabados / Confección</label>
                      <select
                        value={itemFinishing}
                        onChange={(e) => setItemFinishing(e.target.value)}
                      >
                        <option value="none">Al ras / Sin confección</option>
                        <option value="ojales_pequenos">Ojales Pequeños ($0.30 c/u)</option>
                        <option value="ojales_grandes">Ojales Grandes ($0.50 c/u)</option>
                        <option value="bolsillo">Bolsillo para Tubo ($4.00)</option>
                      </select>
                    </div>

                    {itemFinishing.includes('ojales') && (
                      <div className="pos-form-group">
                        <label>Nro. de Ojales</label>
                        <input
                          type="number"
                          min="1"
                          value={itemEyeletCount}
                          onChange={(e) => setItemEyeletCount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedCatalogProduct(null)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItemToCart()}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 0, background: 'var(--orange)', color: '#fff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} /> Añadir al Carrito
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items Table */}
            <div className="pos-card">
              <div className="pos-card-title">
                <h3><ShoppingBag size={18} color="var(--orange)" /> Ítems en Carrito ({cartItems.length})</h3>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Edita el precio en caliente para negociar</span>
              </div>

              {cartItems.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                  El carrito está vacío. Haz clic en cualquier producto arriba para agregarlo.
                </div>
              ) : (
                <table className="pos-cart-items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Medidas</th>
                      <th>Cant.</th>
                      <th>P. Unitario ($)</th>
                      <th>Total ($)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((it) => (
                      <tr key={it.id}>
                        <td>
                          <strong>{it.productName}</strong>
                          {it.finishing && it.finishing !== 'none' && (
                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--orange-dark)' }}>
                              [{it.finishing}]
                            </span>
                          )}
                        </td>
                        <td>
                          {it.calcType === 'm2' && it.widthCm && it.heightCm ? (
                            <span>{it.widthCm}x{it.heightCm}cm ({it.areaM2}m²)</span>
                          ) : (
                            <span>Unidad</span>
                          )}
                        </td>
                        <td>{it.quantity}</td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            className="pos-inline-edit-input"
                            value={it.unitPrice}
                            onChange={(e) => handleUpdateItemPrice(it.id, e.target.value)}
                          />
                        </td>
                        <td><strong>${(Number(it.totalPrice) || 0).toFixed(2)}</strong></td>
                        <td>
                          <button
                            onClick={() => handleRemoveItem(it.id)}
                            style={{ border: 0, background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Multi-Tender Checkout */}
          <div className="pos-order-summary-card">
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--ink)' }}>
              Liquidación Financiera
            </h3>

            {/* Totals Breakdown */}
            <div className="pos-totals-display">
              <div className="pos-totals-row">
                <span>Subtotal Ítems:</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>

              <div className="pos-totals-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={includeTax}
                    onChange={(e) => setIncludeTax(e.target.checked)}
                  />
                  <span>Aplicar IVA (15%):</span>
                </label>
                <strong>${taxAmount.toFixed(2)}</strong>
              </div>

              <div className="pos-totals-row">
                <span>Envío / Flete:</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  style={{ width: '60px', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--line)', textAlign: 'right' }}
                />
              </div>

              <div className="pos-totals-row grand-total">
                <span>TOTAL VENTA:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Multi-Tender Payment Methods */}
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Formas de Cobro / Abono
                </strong>
                <button
                  type="button"
                  onClick={addSplitPayment}
                  style={{ fontSize: '11px', color: 'var(--orange-dark)', fontWeight: '800', background: 'none', border: 0, cursor: 'pointer' }}
                >
                  + Dividir Pago
                </button>
              </div>

              {splitPayments.map((sp, idx) => (
                <div key={sp.id} className="pos-split-payment-row" style={{ display: 'grid', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      value={sp.paymentMethod}
                      onChange={(e) => updateSplitPayment(sp.id, 'paymentMethod', e.target.value)}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--paper)', fontSize: '12px' }}
                    >
                      <option value="cash">💵 Efectivo</option>
                      <option value="transfer">🏦 Transferencia</option>
                      <option value="card">💳 Tarjeta</option>
                      <option value="check">📑 Cheque</option>
                    </select>

                    <input
                      type="number"
                      step="0.01"
                      placeholder="Monto ($)"
                      value={sp.amount}
                      onChange={(e) => updateSplitPayment(sp.id, 'amount', e.target.value)}
                      style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--paper)', fontSize: '12px', fontWeight: '800' }}
                    />

                    {splitPayments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSplitPayment(sp.id)}
                        style={{ border: 0, background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {sp.paymentMethod === 'transfer' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      <input
                        type="text"
                        placeholder="Banco (ej. Pichincha)"
                        value={sp.bankName}
                        onChange={(e) => updateSplitPayment(sp.id, 'bankName', e.target.value)}
                        style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '11px' }}
                      />
                      <input
                        type="text"
                        placeholder="Nro. Comprobante"
                        value={sp.referenceNumber}
                        onChange={(e) => updateSplitPayment(sp.id, 'referenceNumber', e.target.value)}
                        style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '11px' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Balance Due Status */}
            <div className={'pos-balance-status-box ' + (balanceDue > 0 ? 'has-balance' : '')}>
              <div>
                <span style={{ fontSize: '11px', display: 'block' }}>Abonado: <strong>${totalDepositPaid.toFixed(2)}</strong></span>
                <strong style={{ fontSize: '13px' }}>
                  {balanceDue === 0 ? '✓ Pagado Completo' : 'Saldo Pendiente: $' + balanceDue.toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              className="pos-submit-order-btn"
              onClick={handleSubmitOrder}
              disabled={cartItems.length === 0}
            >
              <CheckCircle2 size={18} /> Registrar Venta #{orderNumber}
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 2: KANBAN PRODUCTION JOB BOARD
          ==================================================== */}
      {activeTab === 'kanban' && (
        <POSProductionKanban
          store={store}
          setStore={setStore}
          session={session}
          onOpenWorkOrder={(order) => {
            const items = (store.orderItems || []).filter((it) => it.orderId === order.id);
            setWorkOrderData({ order, items, advisor: activeAdvisor });
          }}
          onOpenArtProof={(order) => {
            setArtProofData(order);
          }}
        />
      )}

      {/* ====================================================
          TAB 3: CUSTOMER CRM 360°
          ==================================================== */}
      {activeTab === 'crm' && (
        <POSCustomerCRM
          store={store}
          setStore={setStore}
          onReorder={(order) => handleReorder(order)}
        />
      )}

      {/* ====================================================
          TAB 4: ORDERS DIRECTORY & CARTERA
          ==================================================== */}
      {activeTab === 'orders' && (
        <div className="pos-card" style={{ display: 'grid', gap: '16px' }}>
          <div className="pos-card-title">
            <h3><FileText size={18} color="var(--orange)" /> Cartera de Pedidos y Ventas</h3>
            <button
              onClick={() => exportOrdersToCSV(store.orders, store.advisors)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Descargar CSV (Excel)
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="pos-daily-excel-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}># Orden</th>
                  <th style={{ textAlign: 'left' }}>Cliente</th>
                  <th style={{ textAlign: 'left' }}>Trabajo</th>
                  <th>Fecha</th>
                  <th>Entrega</th>
                  <th>Fase Producción</th>
                  <th>Total ($)</th>
                  <th>Abono ($)</th>
                  <th>Saldo ($)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(store.orders || []).map((ord) => {
                  const items = (store.orderItems || []).filter((it) => it.orderId === ord.id);
                  return (
                    <tr key={ord.id}>
                      <td style={{ textAlign: 'left', fontWeight: '900', color: 'var(--orange-dark)' }}>
                        #{ord.orderNumber}
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <strong>{ord.customerName}</strong>
                        {ord.customerPhone && <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>{ord.customerPhone}</span>}
                      </td>
                      <td style={{ textAlign: 'left' }}>{ord.jobName}</td>
                      <td>{ord.orderDate}</td>
                      <td>
                        <strong style={{ color: ord.deliveryDate && ord.deliveryDate < toISODate() ? '#dc2626' : 'var(--ink)' }}>
                          {ord.deliveryDate || '-'}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '999px', background: 'var(--orange-soft)', color: 'var(--orange-dark)' }}>
                          {ord.productionStage || 'preprensa'}
                        </span>
                      </td>
                      <td><strong>${Number(ord.totalAmount || 0).toFixed(2)}</strong></td>
                      <td className="pos-highlight-cash">${Number(ord.depositAmount || 0).toFixed(2)}</td>
                      <td className={ord.balanceDue > 0 ? 'pos-highlight-balance' : ''}>
                        {ord.balanceDue > 0 ? '$' + Number(ord.balanceDue).toFixed(2) : 'Pagado'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setReceiptOrder({ order: ord, items, advisor: activeAdvisor })}
                            title="Ver Comprobante / Imprimir Ticket"
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--paper)', cursor: 'pointer' }}
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            onClick={() => setWorkOrderData({ order: ord, items, advisor: activeAdvisor })}
                            title="Hoja de Taller (Work Order)"
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--paper)', cursor: 'pointer' }}
                          >
                            <Wrench size={13} />
                          </button>
                          <button
                            onClick={() => handleReorder(ord)}
                            title="Repetir Pedido (Reorden)"
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--orange-dark)', cursor: 'pointer' }}
                          >
                            <RefreshCw size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 5: INVENTORY RAW MATERIALS
          ==================================================== */}
      {activeTab === 'inventory' && (
        <POSInventoryMaterials store={store} setStore={setStore} />
      )}

      {/* ====================================================
          TAB 6: WEEKLY RECONCILIATION TABLE (EXCEL IDÉNTICO)
          ==================================================== */}
      {activeTab === 'weekly' && (
        <div className="pos-card" style={{ display: 'grid', gap: '16px' }}>
          <div className="pos-card-title">
            <h3><Calendar size={18} color="var(--orange)" /> Cuadre Semanal de Asesoras (Lunes a Sábado)</h3>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ink)' }}>
              Semana: {getISOWeekCode()} | Meta: ${activeAdvisor?.weeklyGoal || 3200}
            </span>
          </div>

          {/* Excel-identical table */}
          {(() => {
            const monday = getMondayOfWeek();
            const weeklyData = calculateWeeklyBalance(store.orders, store.payments, store.expenses, activeAdvisor, monday);

            return (
              <div style={{ overflowX: 'auto' }}>
                <table className="pos-daily-excel-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Día</th>
                      <th>Fecha</th>
                      <th>Ventas ($)</th>
                      <th>Abonos ($)</th>
                      <th>Por Cobrar ($)</th>
                      <th>Efectivo ($)</th>
                      <th>Transferencia ($)</th>
                      <th>Cheque ($)</th>
                      <th>Gastos ($)</th>
                      <th>Neto en Caja ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyData.days.map((d) => (
                      <tr key={d.date}>
                        <td style={{ textAlign: 'left', fontWeight: '800', textTransform: 'capitalize' }}>{d.dayName}</td>
                        <td>{d.date}</td>
                        <td>${d.totalSales.toFixed(2)}</td>
                        <td className="pos-highlight-cash">${d.totalDeposits.toFixed(2)}</td>
                        <td className={d.totalBalanceDue > 0 ? 'pos-highlight-balance' : ''}>
                          ${d.totalBalanceDue.toFixed(2)}
                        </td>
                        <td>${d.totalCash.toFixed(2)}</td>
                        <td>${d.totalTransfer.toFixed(2)}</td>
                        <td>${d.totalCheck.toFixed(2)}</td>
                        <td style={{ color: '#ef4444' }}>${d.totalExpenses.toFixed(2)}</td>
                        <td style={{ fontWeight: '900', color: d.netIncome >= 0 ? '#16a34a' : '#dc2626' }}>
                          ${d.netIncome.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan="2" style={{ textAlign: 'left' }}>TOTALES SEMANALES</td>
                      <td>${weeklyData.totals.totalSales.toFixed(2)}</td>
                      <td>${weeklyData.totals.totalDeposits.toFixed(2)}</td>
                      <td>${weeklyData.totals.totalBalanceDue.toFixed(2)}</td>
                      <td>${weeklyData.totals.totalCash.toFixed(2)}</td>
                      <td>${weeklyData.totals.totalTransfer.toFixed(2)}</td>
                      <td>${weeklyData.totals.totalCheck.toFixed(2)}</td>
                      <td>${weeklyData.totals.totalExpenses.toFixed(2)}</td>
                      <td>${weeklyData.totals.netIncome.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ====================================================
          TAB 7: PETTY CASH (CAJA CHICA)
          ==================================================== */}
      {activeTab === 'expenses' && (
        <div className="pos-card" style={{ display: 'grid', gap: '16px' }}>
          <div className="pos-card-title">
            <h3><DollarSign size={18} color="var(--orange)" /> Registro de Gastos de Caja Chica</h3>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const desc = e.target.description.value.trim();
              const amt = Number(e.target.amount.value) || 0;
              const cat = e.target.category.value;
              if (!desc || amt <= 0) return;

              const newExp = {
                id: 'exp-' + Date.now(),
                advisorId: activeAdvisor.id,
                expenseDate: toISODate(),
                description: desc,
                amount: amt,
                category: cat
              };

              const nextState = {
                ...store,
                expenses: [newExp, ...(store.expenses || [])]
              };
              setStore(nextState);
              e.target.reset();
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 120px',
              gap: '10px',
              background: 'var(--bg)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--line)'
            }}
          >
            <input
              type="text"
              name="description"
              required
              placeholder="Descripción del gasto (ej. Cinta adhesiva)"
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)' }}
            />
            <input
              type="number"
              step="0.01"
              name="amount"
              required
              placeholder="Monto ($)"
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)' }}
            />
            <select
              name="category"
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)' }}
            >
              <option value="suministros">Suministros Taller</option>
              <option value="fletes">Fletes y Envíos</option>
              <option value="alimentacion">Alimentación</option>
              <option value="varios">Varios</option>
            </select>
            <button
              type="submit"
              style={{ padding: '8px 14px', borderRadius: '8px', border: 0, background: 'var(--orange)', color: '#fff', fontWeight: '800', cursor: 'pointer' }}
            >
              + Guardar
            </button>
          </form>

          {/* Expenses list */}
          <table className="pos-cart-items-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Monto ($)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(store.expenses || []).map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.expenseDate}</td>
                  <td><strong>{exp.description}</strong></td>
                  <td>{exp.category}</td>
                  <td><strong style={{ color: '#ef4444' }}>-${(Number(exp.amount) || 0).toFixed(2)}</strong></td>
                  <td>
                    <button
                      onClick={() => setStore({ ...store, expenses: store.expenses.filter((e) => e.id !== exp.id) })}
                      style={{ border: 0, background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================
          MODALS
          ==================================================== */}

      {/* Thermal Receipt Modal */}
      {receiptOrder && (
        <POSReceiptModal
          order={receiptOrder.order}
          items={receiptOrder.items}
          advisor={receiptOrder.advisor}
          isOpen={Boolean(receiptOrder)}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      {/* Work Order Modal */}
      {workOrderData && (
        <POSWorkOrderModal
          order={workOrderData.order}
          items={workOrderData.items}
          advisor={workOrderData.advisor}
          isOpen={Boolean(workOrderData)}
          onClose={() => setWorkOrderData(null)}
        />
      )}

      {/* Art Proofing Modal */}
      {artProofData && (
        <POSArtProofModal
          order={artProofData}
          store={store}
          setStore={setStore}
          isOpen={Boolean(artProofData)}
          onClose={() => setArtProofData(null)}
        />
      )}

      {/* Cash Shift Modal */}
      {showShiftModal && (
        <div className="pos-modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--paper)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            border: '1px solid var(--line)',
            display: 'grid',
            gap: '14px'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--ink)' }}>
              {activeCashShift ? 'Cierre y Arqueo de Turno de Caja' : 'Apertura de Turno de Caja'}
            </h3>

            {activeCashShift ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px', fontSize: '13px', display: 'grid', gap: '4px' }}>
                  <span>Fondo Inicial: <strong>${activeCashShift.openingCash}</strong></span>
                  <span>Turno abierto el: <strong>{activeCashShift.openedAt ? activeCashShift.openedAt.substring(11, 16) : '-'}</strong></span>
                </div>

                <div className="pos-form-group">
                  <label>Efectivo Físico Contado en Caja ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Monto real en billetes y monedas"
                    value={shiftCountedCash}
                    onChange={(e) => setShiftCountedCash(e.target.value)}
                  />
                </div>

                <div className="pos-form-group">
                  <label>Notas de Cierre</label>
                  <input
                    type="text"
                    placeholder="Observaciones de caja..."
                    value={shiftNotes}
                    onChange={(e) => setShiftNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => setShowShiftModal(false)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCloseShift}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: 0, background: '#dc2626', color: '#fff', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Cerrar Turno y Cuadrar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div className="pos-form-group">
                  <label>Fondo Inicial en Efectivo para Cambio ($) *</label>
                  <input
                    type="number"
                    step="1"
                    value={shiftOpeningCash}
                    onChange={(e) => setShiftOpeningCash(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => setShowShiftModal(false)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleOpenShift}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: 0, background: '#16a34a', color: '#fff', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Abrir Turno de Caja
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
