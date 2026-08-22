import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Clock,
  Calendar,
  Users,
  Layers,
  FileText,
  DollarSign,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Printer,
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  CreditCard,
  Building2,
  Phone,
  Package,
  Wrench,
  Percent,
  PauseCircle,
  PlayCircle,
  Truck,
  UploadCloud
} from 'lucide-react';
import {
  loadPOSStore,
  savePOSStoreLocal,
  fetchRemotePOSStore,
  subscribePOSRealtime,
  onSyncStatusChange,
  getPOSSession,
  logoutPOSSession,
  getActiveCashShift,
  openCashShift,
  closeCashShift,
  createPOSOrder,
  createPOSExpense,
  deletePOSExpense,
  parkPOSSale,
  deleteParkedSale,
  calculateDailyReconciliation,
  calculateWeeklyBalance,
  calculateDueAlerts,
  toISODate,
  getDayNameSpanish,
  getMondayOfWeek,
  getISOWeekCode
} from '../../lib/posStore';
import { POSLockScreen } from './POSLockScreen';
import { POSReceiptModal } from './POSReceiptModal';
import { POSWorkOrderModal } from './POSWorkOrderModal';
import { POSArtProofModal } from './POSArtProofModal';
import { POSProductionKanban } from './POSProductionKanban';
import { POSCustomerCRM } from './POSCustomerCRM';
import { POSInventoryMaterials } from './POSInventoryMaterials';
import { POSProductManager } from './POSProductManager';
import { POSPaymentCollectionModal } from './POSPaymentCollectionModal';
import { POSSRIInvoiceModal } from './POSSRIInvoiceModal';
import { POSPurchaseOrdersManager } from './POSPurchaseOrdersManager';
import { SupabaseFileUploader } from '../../components/studio/SupabaseFileUploader';

export function POSPage() {
  const [store, setStore] = useState(loadPOSStore);
  const [session, setSession] = useState(getPOSSession);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [activeTab, setActiveTab] = useState('cashier'); // 'cashier' | 'kanban' | 'crm' | 'products' | 'orders' | 'inventory' | 'purchases' | 'weekly' | 'expenses'

  // Cashier Form State
  const [customerName, setCustomerName] = useState('');
  const [customerIdentification, setCustomerIdentification] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [jobName, setJobName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(toISODate());
  const [pickupLocation, setPickupLocation] = useState('Matriz Gigaprint - Av. de la Prensa y Vaca de Castro, Quito');
  const [productionPriority, setProductionPriority] = useState('normal');
  const [productionNotes, setProductionNotes] = useState('');
  const [artUrl, setArtUrl] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [applyIVA, setApplyIVA] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [notes, setNotes] = useState('');

  // Cart & Line Items
  const [cartItems, setCartItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemWidthCm, setItemWidthCm] = useState('');
  const [itemHeightCm, setItemHeightCm] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemFinishing, setItemFinishing] = useState('none');
  const [itemEyeletCount, setItemEyeletCount] = useState(4);
  const [itemEyeletType, setItemEyeletType] = useState('pequenos');
  const [customPriceOverride, setCustomPriceOverride] = useState('');

  // Payment Methods Split
  const [payments, setPayments] = useState([{ method: 'cash', amount: '', bankName: 'Banco Pichincha', referenceNumber: '' }]);

  // Modals & Popups
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [workOrderData, setWorkOrderData] = useState(null);
  const [artProofOrder, setArtProofOrder] = useState(null);
  const [collectionOrder, setCollectionOrder] = useState(null);
  const [sriOrder, setSriOrder] = useState(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftAction, setShiftAction] = useState('open'); // 'open' | 'close'
  const [shiftCashAmount, setShiftCashAmount] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');

  // Orders Tab Filters
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
  const [orderStageFilter, setOrderStageFilter] = useState('all');

  // Load and Subscribe
  useEffect(() => {
    fetchRemotePOSStore().then((remote) => setStore(remote));
    const unsubscribeSync = onSyncStatusChange((st) => setSyncStatus(st));
    const unsubscribeRealtime = subscribePOSRealtime((remote) => setStore(remote));

    return () => {
      unsubscribeSync();
      unsubscribeRealtime();
    };
  }, []);

  // Update session listener
  useEffect(() => {
    setSession(getPOSSession());
  }, []);

  // Active Cash Shift for current advisor
  const currentAdvisorId = session?.id || 'adv-vicky';
  const activeShift = useMemo(() => {
    return getActiveCashShift(store.shifts || [], currentAdvisorId);
  }, [store.shifts, currentAdvisorId]);

  // Due date alerts
  const dueAlerts = useMemo(() => {
    return calculateDueAlerts(store.orders || []);
  }, [store.orders]);

  // Filtered Orders for the "Cartera & Pedidos" Tab
  const filteredOrdersList = useMemo(() => {
    const q = orderSearchTerm.toLowerCase().trim();
    return (store.orders || []).filter((o) => {
      const matchSearch =
        o.orderNumber.includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.jobName && o.jobName.toLowerCase().includes(q)) ||
        (o.customerIdentification && o.customerIdentification.includes(q));

      const matchPay = orderPaymentFilter === 'all' || o.paymentStatus === orderPaymentFilter;
      const matchStage = orderStageFilter === 'all' || o.productionStage === orderStageFilter;

      return matchSearch && matchPay && matchStage;
    });
  }, [store.orders, orderSearchTerm, orderPaymentFilter, orderStageFilter]);

  // Selected Product Reference
  const selectedProduct = useMemo(() => {
    return (store.products || []).find((p) => p.id === selectedProductId) || (store.products || [])[0] || null;
  }, [store.products, selectedProductId]);

  // Calculation of Single Line Item
  const computedItem = useMemo(() => {
    if (!selectedProduct) return { areaM2: 0, unitPrice: 0, totalPrice: 0 };

    const isArea = selectedProduct.calcType === 'area';
    const w = Number(itemWidthCm) || 0;
    const h = Number(itemHeightCm) || 0;
    const qty = Math.max(1, Number(itemQuantity) || 1);
    const area = isArea && w > 0 && h > 0 ? (w / 100) * (h / 100) : 0;

    let baseUnitPrice = customPriceOverride !== '' ? Number(customPriceOverride) : Number(selectedProduct.basePrice || 7.5);

    let finishingCost = 0;
    if (itemFinishing === 'ojales_pequenos') {
      finishingCost += (Number(itemEyeletCount) || 4) * 0.30;
    } else if (itemFinishing === 'ojales_grandes') {
      finishingCost += (Number(itemEyeletCount) || 4) * 0.50;
    } else if (itemFinishing === 'bolsillo') {
      finishingCost += 4.00;
    }

    const itemBaseTotal = isArea ? area * baseUnitPrice * qty : baseUnitPrice * qty;
    const totalPrice = Number((itemBaseTotal + finishingCost * qty).toFixed(2));

    return {
      areaM2: Number(area.toFixed(4)),
      unitPrice: baseUnitPrice,
      finishingCost,
      totalPrice
    };
  }, [selectedProduct, itemWidthCm, itemHeightCm, itemQuantity, itemFinishing, itemEyeletCount, customPriceOverride]);

  // Add Item to Cart
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (selectedProduct.calcType === 'area' && (!itemWidthCm || !itemHeightCm)) {
      alert('Ingresa el ancho y alto en centímetros para productos calculados por m²');
      return;
    }

    const newItem = {
      id: `cart-${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      calcType: selectedProduct.calcType,
      widthCm: Number(itemWidthCm) || null,
      heightCm: Number(itemHeightCm) || null,
      areaM2: computedItem.areaM2 || null,
      quantity: Number(itemQuantity) || 1,
      unitPrice: computedItem.unitPrice,
      finishing: itemFinishing,
      eyeletCount: itemFinishing.includes('ojales') ? Number(itemEyeletCount) : 0,
      eyeletType: itemEyeletType,
      totalPrice: computedItem.totalPrice
    };

    setCartItems([...cartItems, newItem]);
    setItemWidthCm('');
    setItemHeightCm('');
    setItemQuantity(1);
    setItemFinishing('none');
    setCustomPriceOverride('');
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (index) => {
    setCartItems(cartItems.filter((_, idx) => idx !== index));
  };

  // Financial Liquidation Totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, itm) => sum + Number(itm.totalPrice || 0), 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    const pct = Math.max(0, Math.min(100, Number(discountPercent) || 0));
    return Number(((subtotal * pct) / 100).toFixed(2));
  }, [subtotal, discountPercent]);

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const taxRate = applyIVA ? 0.15 : 0;
  const taxAmount = Number((subtotalAfterDiscount * taxRate).toFixed(2));
  const totalAmount = Number((subtotalAfterDiscount + taxAmount + (Number(shippingCost) || 0)).toFixed(2));

  const totalDeposited = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  const balanceDue = Number(Math.max(0, totalAmount - totalDeposited).toFixed(2));

  // Auto-fill customer details from CRM suggestion
  const handleSelectCustomerSuggestion = (cust) => {
    setCustomerName(cust.name);
    setCustomerIdentification(cust.identification || '');
    setCustomerPhone(cust.phone || '');
    setCustomerId(cust.id);
  };

  // Park Sale (Guardar en espera)
  const handleParkSale = () => {
    if (cartItems.length === 0) return alert('El carrito está vacío.');
    const res = parkPOSSale(store, {
      advisorId: currentAdvisorId,
      customerName: customerName.trim() || 'Cliente en espera',
      customerPhone: customerPhone.trim(),
      cartData: {
        cartItems,
        customerName,
        customerIdentification,
        customerPhone,
        customerId,
        jobName,
        deliveryDate,
        applyIVA,
        shippingCost,
        discountPercent,
        notes
      },
      totalAmount,
      notes: notes || 'Venta pausada'
    });

    if (res.ok) {
      setStore(res.updatedStore);
      handleClearCart();
      alert('Venta guardada en espera correctamente.');
    }
  };

  // Restore Parked Sale
  const handleRestoreParkedSale = (parked) => {
    const data = parked.cartData || {};
    setCartItems(data.cartItems || []);
    setCustomerName(data.customerName || '');
    setCustomerIdentification(data.customerIdentification || '');
    setCustomerPhone(data.customerPhone || '');
    setCustomerId(data.customerId || null);
    setJobName(data.jobName || '');
    setDeliveryDate(data.deliveryDate || toISODate());
    setApplyIVA(Boolean(data.applyIVA));
    setShippingCost(data.shippingCost || 0);
    setDiscountPercent(data.discountPercent || 0);
    setNotes(data.notes || '');

    const res = deleteParkedSale(store, parked.id);
    if (res.ok) setStore(res.updatedStore);
  };

  // Clear Entire Cashier Form
  const handleClearCart = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerIdentification('');
    setCustomerPhone('');
    setCustomerId(null);
    setJobName('');
    setDeliveryDate(toISODate());
    setApplyIVA(false);
    setShippingCost(0);
    setDiscountPercent(0);
    setDiscountReason('');
    setNotes('');
    setArtUrl('');
    setPayments([{ method: 'cash', amount: '', bankName: 'Banco Pichincha', referenceNumber: '' }]);
  };

  // Submit and Create Final POS Order
  const handleSubmitOrder = () => {
    if (cartItems.length === 0) return alert('Agrega al menos un producto al carrito');
    if (!customerName.trim()) return alert('Ingresa el nombre del cliente');

    const orderData = {
      advisorId: currentAdvisorId,
      customerId,
      customerName: customerName.trim(),
      customerIdentification: customerIdentification.trim(),
      customerPhone: customerPhone.trim(),
      jobName: jobName.trim() || `Trabajo ${cartItems[0]?.productName}`,
      deliveryDate,
      pickupLocation,
      productionPriority,
      productionNotes,
      artUrl,
      artApproved: false,
      productionStage: 'preprensa',
      subtotal,
      discountPercent: Number(discountPercent) || 0,
      discountAmount,
      discountReason,
      taxRate,
      taxAmount,
      shippingCost: Number(shippingCost) || 0,
      totalAmount,
      depositAmount: totalDeposited,
      balanceDue,
      notes,
      items: cartItems,
      payments
    };

    const res = createPOSOrder(store, orderData);
    if (res.ok) {
      setStore(res.updatedStore);
      setReceiptOrder(res.order);
      handleClearCart();
    } else {
      alert('Error al registrar la orden: ' + res.error);
    }
  };

  // Reorder hook from CRM
  const handleReorderFromCRM = (reorderData) => {
    setCustomerName(reorderData.customerName || '');
    setCustomerIdentification(reorderData.customerIdentification || '');
    setCustomerPhone(reorderData.customerPhone || '');
    setCustomerId(reorderData.customerId || null);
    setJobName(reorderData.jobName || '');
    setCartItems(reorderData.items.map((i, idx) => ({ ...i, id: `cart-reorder-${Date.now()}-${idx}` })));
    setActiveTab('cashier');
  };

  // Lock Screen Check
  if (!session) {
    return (
      <POSLockScreen
        advisors={store.advisors}
        onAuthenticated={(sess) => setSession(sess)}
        onUnlockSuccess={(sess) => setSession(sess)}
      />
    );
  }

  return (
    <div className="pos-container" style={{ display: 'grid', gap: '16px' }}>
      {/* Top Header Bar */}
      <div className="pos-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="pos-brand-badge">
            <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' }}>G</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--ink)' }}>
                Gigaprint POS & CRM
              </h1>
              <small style={{ color: 'var(--orange-dark)', fontWeight: 800, textTransform: 'uppercase', fontSize: '11px' }}>
                Asesora: {session.name} ({session.role})
              </small>
            </div>
          </div>

          <div style={{
            padding: '4px 10px',
            borderRadius: '999px',
            background: syncStatus === 'synced' ? '#dcfce7' : (syncStatus === 'syncing' ? '#fef3c7' : '#fee2e2'),
            color: syncStatus === 'synced' ? '#166534' : (syncStatus === 'syncing' ? '#b45309' : '#991b1b'),
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'currentColor' }} />
            <span>{syncStatus === 'synced' ? 'Nube Sincronizada' : (syncStatus === 'syncing' ? 'Sincronizando...' : 'Modo Local')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeShift ? (
            <button
              type="button"
              className="pos-nav-tab"
              onClick={() => { setShiftAction('close'); setIsShiftModalOpen(true); }}
              style={{ background: '#dcfce7', color: '#166534', fontWeight: 800, border: '1px solid #bbf7d0', padding: '6px 12px', fontSize: '12px' }}
            >
              <DollarSign size={14} /> Turno Abierto (Arqueo)
            </button>
          ) : (
            <button
              type="button"
              className="pos-nav-tab"
              onClick={() => { setShiftAction('open'); setIsShiftModalOpen(true); }}
              style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 800, border: '1px solid #fca5a5', padding: '6px 12px', fontSize: '12px' }}
            >
              <DollarSign size={14} /> Abrir Turno de Caja
            </button>
          )}

          <button
            type="button"
            className="pos-nav-tab"
            onClick={() => { logoutPOSSession(); setSession(null); }}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Lock size={14} /> Bloquear
          </button>
        </div>
      </div>

      {/* Due Date Alert Banner */}
      {(dueAlerts.overdueCount > 0 || dueAlerts.dueTodayCount > 0) && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: dueAlerts.overdueCount > 0 ? '#fef2f2' : '#fffbeb',
          border: `1px solid ${dueAlerts.overdueCount > 0 ? '#fca5a5' : '#fde68a'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} style={{ color: dueAlerts.overdueCount > 0 ? '#dc2626' : '#d97706' }} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: dueAlerts.overdueCount > 0 ? '#991b1b' : '#92400e' }}>
              {dueAlerts.overdueCount > 0 ? `⚠️ ¡Atención! Hay ${dueAlerts.overdueCount} trabajo(s) vencido(s) en taller.` : ''}
              {dueAlerts.dueTodayCount > 0 ? ` 📦 ${dueAlerts.dueTodayCount} trabajo(s) con entrega programada para hoy.` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('kanban')}
            style={{ padding: '4px 10px', borderRadius: '8px', border: 'none', background: 'var(--orange)', color: '#fff', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
          >
            Ver en Tablero ➔
          </button>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="pos-nav-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          type="button"
          className={`pos-nav-tab ${activeTab === 'cashier' ? 'active' : ''}`}
          onClick={() => setActiveTab('cashier')}
        >
          <ShoppingBag size={15} /> Cajero POS
        </button>
        <button
          type="button"
          className={`pos-nav-tab ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setActiveTab('kanban')}
        >
          <Layers size={15} /> Tablero de Taller (Kanban)
        </button>
        <button
          type="button"
          className={`pos-nav-tab ${activeTab === 'crm' ? 'active' : ''}`}
          onClick={() => setActiveTab('crm')}
        >
          <Users size={15} /> Clientes & CRM 360°
        </button>
        <button
          type="button"
          className={`pos-nav-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={15} /> Productos & Tarifas
        </button>
        <button
          type="button"
          className={`pos-nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FileText size={15} /> Cartera & Pedidos ({store.orders?.length || 0})
        </button>
        <button
          type="button"
          className={`pos-nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Layers size={15} /> Inventario Sustratos
        </button>
        <button
          type="button"
          className={`pos-nav-tab ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          <Truck size={15} /> Órdenes de Compra (PO)
        </button>
        <button
          type="button"
          className={`pos-nav-tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          <Calendar size={15} /> Cuadre Semanal (Excel)
        </button>
        <button
          type="button"
          className={`pos-nav-tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <DollarSign size={15} /> Caja Chica
        </button>
      </div>

      {/* TAB 1: CASHIER POS */}
      {activeTab === 'cashier' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Parked Sales Bar */}
          {store.parkedSales?.length > 0 && (
            <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <PauseCircle size={14} /> Ventas en Espera:
              </span>
              {store.parkedSales.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleRestoreParkedSale(p)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #93c5fd',
                    background: '#fff',
                    color: '#1e3a8a',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <PlayCircle size={12} color="#2563eb" /> {p.customerName} (${Number(p.totalAmount).toFixed(2)})
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 0.8fr)', gap: '20px' }}>
            {/* Left Column: Customer & Product Configurator */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Customer Card */}
              <div className="pos-card" style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} style={{ color: 'var(--orange)' }} /> Datos del Cliente & Trabajo
                  </h3>
                  {customerId && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '999px' }}>
                      Cliente CRM Vinculado
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Nombre / Empresa *</label>
                    <input
                      type="text"
                      className="pos-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Escribe para buscar o ingresar nuevo..."
                    />
                    {/* Quick Suggestions from CRM */}
                    {customerName.length > 1 && !customerId && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {(store.customers || [])
                          .filter((c) => c.name.toLowerCase().includes(customerName.toLowerCase()))
                          .slice(0, 3)
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectCustomerSuggestion(c)}
                              style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              + {c.name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>RUC / Cédula</label>
                    <input
                      type="text"
                      className="pos-input"
                      value={customerIdentification}
                      onChange={(e) => setCustomerIdentification(e.target.value)}
                      placeholder="17..."
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>WhatsApp *</label>
                    <input
                      type="text"
                      className="pos-input"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="099..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Fecha Entrega</label>
                    <input
                      type="date"
                      className="pos-input"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Descripción del Trabajo</label>
                  <input
                    type="text"
                    className="pos-input"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="Ej. Lona 3x2m para inauguración farmacia"
                  />
                </div>

                {/* Cloud File Uploader for Artwork */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowUploader(!showUploader)}
                    className="pos-nav-tab"
                    style={{ fontSize: '11px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <UploadCloud size={13} /> {artUrl ? '✓ Archivo Adjunto (Cambiar)' : '+ Adjuntar Arte / Vector PDF/AI'}
                  </button>

                  {showUploader && (
                    <div style={{ marginTop: '8px' }}>
                      <SupabaseFileUploader
                        onUploadComplete={(url) => {
                          setArtUrl(url);
                          setShowUploader(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Configurator Card */}
              <div className="pos-card" style={{ display: 'grid', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} style={{ color: 'var(--orange)' }} /> Agregar Producto / Sustrato
                </h3>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Seleccionar Producto</label>
                  <select
                    className="pos-input"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    {(store.products || []).filter((p) => p.isActive !== false).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${Number(p.basePrice).toFixed(2)}/{p.unit} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct?.calcType === 'area' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Ancho (cm) *</label>
                      <input
                        type="number"
                        className="pos-input"
                        placeholder="Ej. 300"
                        value={itemWidthCm}
                        onChange={(e) => setItemWidthCm(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Alto (cm) *</label>
                      <input
                        type="number"
                        className="pos-input"
                        placeholder="Ej. 200"
                        value={itemHeightCm}
                        onChange={(e) => setItemHeightCm(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Superficie</label>
                      <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '8px', fontWeight: 900, fontSize: '13px', textAlign: 'center' }}>
                        {computedItem.areaM2} m²
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      className="pos-input"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Acabados</label>
                    <select
                      className="pos-input"
                      value={itemFinishing}
                      onChange={(e) => setItemFinishing(e.target.value)}
                    >
                      <option value="none">Sin confección / Al ras</option>
                      <option value="ojales_pequenos">Ojales Pequeños ($0.30 c/u)</option>
                      <option value="ojales_grandes">Ojales Reforzados ($0.50 c/u)</option>
                      <option value="bolsillo">Bolsillo Tubo ($4.00)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Precio Unit. ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="pos-input"
                      placeholder={String(selectedProduct?.basePrice || 7.5)}
                      value={customPriceOverride}
                      onChange={(e) => setCustomPriceOverride(e.target.value)}
                    />
                  </div>
                </div>

                {itemFinishing.includes('ojales') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Cantidad de Ojales:</label>
                    <input
                      type="number"
                      min={1}
                      style={{ width: '80px' }}
                      className="pos-input"
                      value={itemEyeletCount}
                      onChange={(e) => setItemEyeletCount(Number(e.target.value))}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--orange-dark)' }}>
                      Extra: +${((Number(itemEyeletCount) || 4) * (itemFinishing === 'ojales_grandes' ? 0.50 : 0.30)).toFixed(2)}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  className="pos-submit-order-btn"
                  onClick={handleAddToCart}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <Plus size={16} /> Agregar al Carrito — ${computedItem.totalPrice.toFixed(2)}
                </button>
              </div>
            </div>

            {/* Right Column: Cart, Financial Liquidation & Payment */}
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="pos-card" style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingBag size={16} style={{ color: 'var(--orange)' }} /> Carrito de Venta ({cartItems.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleParkSale}
                    className="pos-nav-tab"
                    style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Pausar venta para atender a otro cliente"
                  >
                    <PauseCircle size={13} /> En Espera
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
                    No hay productos en el carrito.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {cartItems.map((itm, idx) => (
                      <div
                        key={itm.id || idx}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: 'var(--bg)',
                          border: '1px solid var(--line)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{itm.productName}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {itm.widthCm ? `${itm.widthCm}x${itm.heightCm}cm (${itm.areaM2}m²) • ` : ''}
                            Cant: {itm.quantity} {itm.finishing !== 'none' ? `• ${itm.finishing}` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>${itm.totalPrice.toFixed(2)}</strong>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Financial Liquidation Box */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Subtotal Ítems:</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>

                  {/* Discount Input */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Percent size={14} style={{ color: 'var(--orange)' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>Descuento:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        style={{ width: '55px', padding: '2px 6px', fontSize: '12px' }}
                        className="pos-input"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                      />
                      <span style={{ fontSize: '12px' }}>%</span>
                    </div>
                    {discountAmount > 0 && <span style={{ color: '#dc2626', fontWeight: 800 }}>-${discountAmount.toFixed(2)}</span>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={applyIVA}
                        onChange={(e) => setApplyIVA(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--orange)' }}
                      />
                      Aplicar IVA (15%)
                    </label>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>Envío / Flete:</span>
                    <input
                      type="number"
                      step="0.01"
                      style={{ width: '80px', padding: '2px 6px', fontSize: '12px', textAlign: 'right' }}
                      className="pos-input"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                    <span>TOTAL VENTA:</span>
                    <span style={{ color: 'var(--orange)', fontFamily: 'Space Grotesk' }}>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payments Section */}
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800 }}>Forma de Cobro / Abono</label>
                  {payments.map((p, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select
                        className="pos-input"
                        value={p.method}
                        onChange={(e) => {
                          const updated = [...payments];
                          updated[idx].method = e.target.value;
                          setPayments(updated);
                        }}
                      >
                        <option value="cash">💵 Efectivo</option>
                        <option value="transfer">🏦 Transferencia</option>
                        <option value="card">💳 Tarjeta</option>
                        <option value="check">📜 Cheque</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        className="pos-input"
                        placeholder="Monto ($)"
                        value={p.amount}
                        onChange={(e) => {
                          const updated = [...payments];
                          updated[idx].amount = e.target.value;
                          setPayments(updated);
                        }}
                      />
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, padding: '4px 0' }}>
                    <span style={{ color: '#16a34a' }}>Abono Registrado: ${totalDeposited.toFixed(2)}</span>
                    <span style={{ color: balanceDue > 0 ? '#dc2626' : '#16a34a' }}>
                      Saldo: ${balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="pos-submit-order-btn"
                  onClick={handleSubmitOrder}
                  style={{ width: '100%', padding: '14px', fontSize: '15px', background: '#16a34a' }}
                >
                  <CheckCircle2 size={18} /> Registrar Venta & Generar Comprobante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTION KANBAN */}
      {activeTab === 'kanban' && (
        <POSProductionKanban
          store={store}
          advisorId={currentAdvisorId}
          onStoreUpdate={(updated) => setStore(updated)}
          onOpenWorkOrder={(order) => {
            const items = (store.orderItems || []).filter((i) => i.orderId === order.id);
            const adv = (store.advisors || []).find((a) => a.id === order.advisorId);
            setWorkOrderData({ order, items, advisor: adv });
          }}
          onOpenArtProof={(order) => setArtProofOrder(order)}
        />
      )}

      {/* TAB 3: CUSTOMER CRM 360 */}
      {activeTab === 'crm' && (
        <POSCustomerCRM
          store={store}
          onStoreUpdate={(updated) => setStore(updated)}
          onReorder={handleReorderFromCRM}
        />
      )}

      {/* TAB 4: PRODUCTS & TARIFFS SPREADSHEET MANAGER */}
      {activeTab === 'products' && (
        <POSProductManager
          store={store}
          onStoreUpdate={(updated) => setStore(updated)}
        />
      )}

      {/* TAB 5: CARTERA & PEDIDOS HISTORICOS */}
      {activeTab === 'orders' && (
        <div className="pos-card" style={{ display: 'grid', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} style={{ color: 'var(--orange)' }} />
              Cartera de Pedidos & Órdenes ({filteredOrdersList.length})
            </h2>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--muted)' }} />
                <input
                  type="text"
                  className="pos-input"
                  placeholder="Buscar orden, cliente o trabajo..."
                  style={{ paddingLeft: '32px', fontSize: '12px' }}
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                />
              </div>

              {/* Payment Filter */}
              <select
                className="pos-input"
                style={{ width: 'auto', fontSize: '12px' }}
                value={orderPaymentFilter}
                onChange={(e) => setOrderPaymentFilter(e.target.value)}
              >
                <option value="all">Todos los Pagos</option>
                <option value="paid">Pagados</option>
                <option value="partial">Con Saldo / Abono</option>
                <option value="pending">Pendientes</option>
              </select>

              {/* Stage Filter */}
              <select
                className="pos-input"
                style={{ width: 'auto', fontSize: '12px' }}
                value={orderStageFilter}
                onChange={(e) => setOrderStageFilter(e.target.value)}
              >
                <option value="all">Todas las Etapas</option>
                <option value="preprensa">Pre-prensa</option>
                <option value="aprobacion_arte">Aprobación Arte</option>
                <option value="impresion">En Impresión</option>
                <option value="acabados">Acabados</option>
                <option value="listo">Listo para Retiro</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="pos-orders-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Trabajo</th>
                  <th>Etapa Taller</th>
                  <th>Total</th>
                  <th>Abono</th>
                  <th>Saldo</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrdersList.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                      No se encontraron pedidos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredOrdersList.map((ord) => {
                    const items = (store.orderItems || []).filter((i) => i.orderId === ord.id);
                    const adv = (store.advisors || []).find((a) => a.id === ord.advisorId);
                    const cust = (store.customers || []).find((c) => c.id === ord.customerId || c.name === ord.customerName);
                    const isOverdue = ord.deliveryDate && ord.deliveryDate < toISODate() && ord.productionStage !== 'entregado';

                    return (
                      <tr key={ord.id} style={{ background: isOverdue ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                        <td><strong style={{ color: 'var(--orange)' }}>#{ord.orderNumber}</strong></td>
                        <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{ord.orderDate}</td>
                        <td><strong>{ord.customerName}</strong></td>
                        <td>{ord.jobName}</td>
                        <td>
                          <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--line)', fontSize: '11px', fontWeight: 800 }}>
                            {ord.productionStage}
                          </span>
                        </td>
                        <td><b>${Number(ord.totalAmount).toFixed(2)}</b></td>
                        <td style={{ color: '#16a34a', fontWeight: 700 }}>${Number(ord.depositAmount).toFixed(2)}</td>
                        <td>
                          <strong style={{ color: ord.balanceDue > 0 ? '#dc2626' : '#16a34a' }}>
                            ${Number(ord.balanceDue).toFixed(2)}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            {/* SRI Electronic Invoice Button */}
                            <button
                              type="button"
                              className="pos-nav-tab"
                              style={{ padding: '4px 8px', fontSize: '11px', background: '#f0fdf4', color: '#166534', fontWeight: 800 }}
                              onClick={() => setSriOrder({ order: ord, items, customer: cust, advisor: adv })}
                              title="Emitir / Ver Factura Electrónica SRI"
                            >
                              <ShieldCheck size={13} /> Factura SRI
                            </button>

                            {ord.balanceDue > 0 && (
                              <button
                                type="button"
                                className="pos-nav-tab"
                                style={{ padding: '4px 8px', fontSize: '11px', background: '#dcfce7', color: '#166534', fontWeight: 800 }}
                                onClick={() => setCollectionOrder(ord)}
                                title="Cobrar saldo pendiente"
                              >
                                <DollarSign size={12} /> Cobrar Saldo
                              </button>
                            )}

                            <button
                              type="button"
                              className="pos-nav-tab"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => setReceiptOrder(ord)}
                              title="Reimprimir Comprobante"
                            >
                              <Printer size={13} />
                            </button>

                            <button
                              type="button"
                              className="pos-nav-tab"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => setWorkOrderData({ order: ord, items, advisor: adv })}
                              title="Hoja de Taller"
                            >
                              <Wrench size={13} />
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

      {/* TAB 6: INVENTORY */}
      {activeTab === 'inventory' && (
        <POSInventoryMaterials
          store={store}
          onStoreUpdate={(updated) => setStore(updated)}
        />
      )}

      {/* TAB 7: PURCHASES TO SUPPLIERS */}
      {activeTab === 'purchases' && (
        <POSPurchaseOrdersManager
          store={store}
          onStoreUpdate={(updated) => setStore(updated)}
        />
      )}

      {/* TAB 8: WEEKLY CASH RECONCILIATION */}
      {activeTab === 'weekly' && (
        <div className="pos-card" style={{ display: 'grid', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} style={{ color: 'var(--orange)' }} />
            Cuadre Semanal de Caja (Formato Excel Lunes a Sábado)
          </h2>
          {(() => {
            const balance = calculateWeeklyBalance(store, getMondayOfWeek(), currentAdvisorId);
            return (
              <div style={{ overflowX: 'auto' }}>
                <table className="pos-orders-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Fecha</th>
                      <th>Trabajos</th>
                      <th>Venta Bruta</th>
                      <th>Cobrado</th>
                      <th>Por Cobrar</th>
                      <th>Gastos</th>
                      <th>Efectivo</th>
                      <th>Transferencias</th>
                      <th>Neto Caja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balance.days.map((d) => (
                      <tr key={d.date}>
                        <td><strong style={{ textTransform: 'capitalize' }}>{d.dayName}</strong></td>
                        <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{d.date}</td>
                        <td>{d.orderCount}</td>
                        <td><b>${d.totalSales.toFixed(2)}</b></td>
                        <td style={{ color: '#16a34a', fontWeight: 700 }}>${d.totalDeposits.toFixed(2)}</td>
                        <td style={{ color: d.totalBalanceDue > 0 ? '#dc2626' : 'var(--muted)' }}>${d.totalBalanceDue.toFixed(2)}</td>
                        <td style={{ color: '#d97706' }}>${d.totalExpenses.toFixed(2)}</td>
                        <td>${d.cashAmount.toFixed(2)}</td>
                        <td>${d.transferAmount.toFixed(2)}</td>
                        <td><strong style={{ color: '#2563eb' }}>${d.netTotal.toFixed(2)}</strong></td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--bg)', fontWeight: 900, borderTop: '2px solid var(--line)' }}>
                      <td colSpan={2}>TOTALES SEMANALES:</td>
                      <td>{balance.totals.orderCount}</td>
                      <td>${balance.totals.totalSales.toFixed(2)}</td>
                      <td style={{ color: '#16a34a' }}>${balance.totals.totalDeposits.toFixed(2)}</td>
                      <td style={{ color: '#dc2626' }}>${balance.totals.totalBalanceDue.toFixed(2)}</td>
                      <td style={{ color: '#d97706' }}>${balance.totals.totalExpenses.toFixed(2)}</td>
                      <td>${balance.totals.cashAmount.toFixed(2)}</td>
                      <td>${balance.totals.transferAmount.toFixed(2)}</td>
                      <td style={{ color: '#2563eb', fontSize: '15px' }}>${balance.totals.netTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 9: PETTY CASH EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="pos-card" style={{ display: 'grid', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} style={{ color: 'var(--orange)' }} />
            Registro de Gastos de Caja Chica
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const desc = e.target.description.value;
              const amt = e.target.amount.value;
              const cat = e.target.category.value;
              if (!desc || !amt) return;
              const res = createPOSExpense(store, {
                advisorId: currentAdvisorId,
                description: desc,
                amount: amt,
                category: cat
              });
              if (res.ok) {
                setStore(res.updatedStore);
                e.target.reset();
              }
            }}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}
          >
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800 }}>Descripción del Gasto</label>
              <input name="description" className="pos-input" placeholder="Ej. Almuerzos de taller, cinta de embalaje" required />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800 }}>Monto ($)</label>
              <input name="amount" type="number" step="0.01" className="pos-input" placeholder="0.00" required />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800 }}>Categoría</label>
              <select name="category" className="pos-input">
                <option value="Suministros">Suministros Taller</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Transporte">Transporte / Flete</option>
                <option value="Servicios">Servicios / Varios</option>
              </select>
            </div>
            <button type="submit" className="pos-submit-order-btn">
              + Registrar Gasto
            </button>
          </form>

          <table className="pos-orders-table" style={{ width: '100%', marginTop: '10px' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Monto</th>
                <th style={{ textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {(store.expenses || []).length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No hay gastos registrados</td></tr>
              ) : (
                (store.expenses || []).map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.expenseDate}</td>
                    <td><strong>{exp.description}</strong></td>
                    <td><span style={{ padding: '2px 8px', background: 'var(--bg)', borderRadius: '4px', fontSize: '11px' }}>{exp.category}</span></td>
                    <td style={{ color: '#d97706', fontWeight: 800 }}>${Number(exp.amount).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const res = deletePOSExpense(store, exp.id);
                          if (res.ok) setStore(res.updatedStore);
                        }}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
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
      )}

      {/* MODALS */}
      {receiptOrder && (
        <POSReceiptModal
          order={receiptOrder}
          items={(store.orderItems || []).filter((i) => i.orderId === receiptOrder.id)}
          advisor={(store.advisors || []).find((a) => a.id === receiptOrder.advisorId)}
          isOpen={Boolean(receiptOrder)}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      {workOrderData && (
        <POSWorkOrderModal
          order={workOrderData.order}
          items={workOrderData.items}
          advisor={workOrderData.advisor}
          isOpen={Boolean(workOrderData)}
          onClose={() => setWorkOrderData(null)}
        />
      )}

      {artProofOrder && (
        <POSArtProofModal
          order={artProofOrder}
          isOpen={Boolean(artProofOrder)}
          onClose={() => setArtProofOrder(null)}
          onSave={(updated) => setStore(updated)}
        />
      )}

      {collectionOrder && (
        <POSPaymentCollectionModal
          order={collectionOrder}
          store={store}
          advisorId={currentAdvisorId}
          onClose={() => setCollectionOrder(null)}
          onSuccess={(updatedStore, updatedOrder) => {
            setStore(updatedStore);
            setReceiptOrder(updatedOrder);
          }}
        />
      )}

      {sriOrder && (
        <POSSRIInvoiceModal
          order={sriOrder.order}
          items={sriOrder.items}
          customer={sriOrder.customer}
          advisor={sriOrder.advisor}
          isOpen={Boolean(sriOrder)}
          onClose={() => setSriOrder(null)}
        />
      )}

      {/* SHIFT OPEN/CLOSE MODAL */}
      {isShiftModalOpen && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card" style={{ maxWidth: '420px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 900 }}>
              {shiftAction === 'open' ? 'Apertura de Turno de Caja' : 'Cierre de Turno & Arqueo'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (shiftAction === 'open') {
                  const res = openCashShift(store, currentAdvisorId, shiftCashAmount, shiftNotes);
                  setStore(res.updatedStore);
                } else {
                  if (!activeShift) return;
                  const res = closeCashShift(store, activeShift.id, shiftCashAmount, shiftNotes);
                  if (res.ok) setStore(res.updatedStore);
                }
                setIsShiftModalOpen(false);
                setShiftCashAmount('');
                setShiftNotes('');
              }}
              style={{ display: 'grid', gap: '12px' }}
            >
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800 }}>
                  {shiftAction === 'open' ? 'Efectivo Inicial en Caja ($)' : 'Efectivo Físico Contado ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="pos-input"
                  value={shiftCashAmount}
                  onChange={(e) => setShiftCashAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800 }}>Observaciones / Notas</label>
                <input
                  type="text"
                  className="pos-input"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Ej. Billetes de $20 y monedas"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="pos-nav-tab" onClick={() => setIsShiftModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="pos-submit-order-btn">
                  {shiftAction === 'open' ? 'Abrir Turno' : 'Cerrar y Cuadrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
