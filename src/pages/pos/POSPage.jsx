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
  UploadCloud,
  Minus,
  Sparkles,
  ArrowRight,
  Hash,
  FileCheck
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
import { POSAdvisorsManagement } from './POSAdvisorsManagement';
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

  // Product Category & Search in Configurator
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productSearch, setProductSearch] = useState('');

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

  // Unique product categories
  const productCategories = useMemo(() => {
    const set = new Set();
    (store.products || []).forEach((p) => {
      if (p.category && p.isActive !== false) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [store.products]);

  // Filtered products for dropdown
  const filteredProductOptions = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    return (store.products || []).filter((p) => {
      if (p.isActive === false) return false;
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [store.products, selectedCategory, productSearch]);

  // Selected Product Reference
  const selectedProduct = useMemo(() => {
    if (selectedProductId) {
      const found = (store.products || []).find((p) => p.id === selectedProductId);
      if (found) return found;
    }
    return filteredProductOptions[0] || (store.products || [])[0] || null;
  }, [store.products, selectedProductId, filteredProductOptions]);

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
  const changeDue = Number(Math.max(0, totalDeposited - totalAmount).toFixed(2));

  // Quick cash amount helper
  const handleQuickCash = (amount) => {
    const updated = [...payments];
    updated[0].method = 'cash';
    updated[0].amount = String(amount);
    setPayments(updated);
  };

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
    <div className="pos-container">
      {/* ----------------------------------------------------------------------
          TOP HEADER BAR
          ---------------------------------------------------------------------- */}
      <header className="pos-top-bar">
        <div className="pos-brand-badge">
          <div className="pos-brand-logo-mark">G</div>
          <div>
            <h1 className="pos-brand-title">
              Gigaprint POS <span style={{ color: 'var(--pos-primary)', fontWeight: 400 }}>&</span> CRM
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pos-advisor-pill">
                <Users size={12} /> {session.name} ({session.role})
              </span>
              <div className={`pos-sync-pill ${syncStatus}`}>
                <span className="pos-pulse-dot" />
                <span>{syncStatus === 'synced' ? 'Nube Sincronizada' : (syncStatus === 'syncing' ? 'Sincronizando...' : 'Modo Local')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pos-top-actions">
          {activeShift ? (
            <button
              type="button"
              className="pos-shift-btn open"
              onClick={() => { setShiftAction('close'); setIsShiftModalOpen(true); }}
              title="Arqueo y cierre de caja"
            >
              <DollarSign size={15} /> Turno Abierto (Arqueo)
            </button>
          ) : (
            <button
              type="button"
              className="pos-shift-btn closed"
              onClick={() => { setShiftAction('open'); setIsShiftModalOpen(true); }}
              title="Abrir nuevo turno"
            >
              <DollarSign size={15} /> Abrir Turno de Caja
            </button>
          )}

          <button
            type="button"
            className="pos-lock-btn"
            onClick={() => { logoutPOSSession(); setSession(null); }}
            title="Bloquear terminal o cambiar de asesora"
          >
            <Lock size={14} /> Bloquear
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------------------------
          DUE DATE ALERT BANNER
          ---------------------------------------------------------------------- */}
      {(dueAlerts.overdueCount > 0 || dueAlerts.dueTodayCount > 0) && (
        <div className={`pos-alert-banner ${dueAlerts.overdueCount > 0 ? 'urgent' : 'warning'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '13px', fontWeight: 800 }}>
              {dueAlerts.overdueCount > 0 ? `⚠️ ¡Atención! Hay ${dueAlerts.overdueCount} trabajo(s) vencido(s) en taller.` : ''}
              {dueAlerts.dueTodayCount > 0 ? ` 📦 ${dueAlerts.dueTodayCount} trabajo(s) con entrega programada para hoy.` : ''}
            </span>
          </div>
          <button
            type="button"
            className="pos-alert-btn"
            onClick={() => setActiveTab('kanban')}
          >
            Ver en Tablero Kanban ➔
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          SEGMENTED NAVIGATION TABS
          ---------------------------------------------------------------------- */}
      <div className="pos-nav-tabs-wrapper">
        <nav className="pos-nav-tabs">
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'cashier' ? 'active' : ''}`}
            onClick={() => setActiveTab('cashier')}
          >
            <ShoppingBag size={16} /> Cajero POS
          </button>
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'kanban' ? 'active' : ''}`}
            onClick={() => setActiveTab('kanban')}
          >
            <Layers size={16} /> Tablero de Taller (Kanban)
          </button>
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'crm' ? 'active' : ''}`}
            onClick={() => setActiveTab('crm')}
          >
            <Users size={16} /> Clientes & CRM 360°
          </button>
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={16} /> Productos & Tarifas
          </button>
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FileText size={16} /> Cartera & Pedidos
            <span className="pos-nav-badge">{store.orders?.length || 0}</span>
          </button>
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Layers size={16} /> Inventario Sustratos
          </button>
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            <Truck size={16} /> Órdenes de Compra (PO)
          </button>
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <Calendar size={16} /> Cuadre Semanal (Excel)
          </button>
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <DollarSign size={16} /> Caja Chica
          </button>
          <button
            type="button"
            className={`pos-nav-tab ${activeTab === 'advisors' ? 'active' : ''}`}
            onClick={() => setActiveTab('advisors')}
          >
            <Users size={16} /> Equipo & PINs
          </button>
        </nav>
      </div>

      {/* ----------------------------------------------------------------------
          TAB 1: CASHIER POS
          ---------------------------------------------------------------------- */}
      {activeTab === 'cashier' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Parked Sales Bar */}
          {store.parkedSales?.length > 0 && (
            <div className="pos-parked-strip">
              <span className="pos-parked-title">
                <PauseCircle size={15} /> Ventas en Espera ({store.parkedSales.length}):
              </span>
              {store.parkedSales.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleRestoreParkedSale(p)}
                  className="pos-parked-pill"
                >
                  <PlayCircle size={13} style={{ color: 'var(--pos-blue)' }} />
                  <span>{p.customerName}</span>
                  <strong style={{ color: 'var(--pos-primary)' }}>${Number(p.totalAmount).toFixed(2)}</strong>
                </button>
              ))}
            </div>
          )}

          <div className="pos-cashier-grid">
            {/* ----------------- LEFT COLUMN: Customer & Product Configurator ----------------- */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Card 1: Customer & Job Information */}
              <div className="pos-card">
                <div className="pos-card-header">
                  <h3 className="pos-card-title">
                    <Users size={17} /> Datos del Cliente & Trabajo
                  </h3>
                  {customerId && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--pos-success-dark)', background: 'var(--pos-success-soft)', padding: '3px 10px', borderRadius: '999px', border: '1px solid var(--pos-success-border)' }}>
                      ✓ Cliente CRM Vinculado
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="pos-label required">Nombre / Empresa</label>
                    <div className="pos-input-group">
                      <div className="pos-input-icon-left"><Users size={14} /></div>
                      <input
                        type="text"
                        className="pos-input pos-input-with-icon"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Escribe para buscar o nuevo cliente..."
                      />
                    </div>
                    {/* Quick CRM Auto-suggestions */}
                    {customerName.length > 1 && !customerId && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {(store.customers || [])
                          .filter((c) => c.name.toLowerCase().includes(customerName.toLowerCase()))
                          .slice(0, 3)
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectCustomerSuggestion(c)}
                              className="pos-cat-pill"
                              style={{ padding: '3px 8px', fontSize: '11px' }}
                            >
                              + {c.name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="pos-label">RUC / Cédula</label>
                    <div className="pos-input-group">
                      <div className="pos-input-icon-left"><Hash size={14} /></div>
                      <input
                        type="text"
                        className="pos-input pos-input-with-icon"
                        value={customerIdentification}
                        onChange={(e) => setCustomerIdentification(e.target.value)}
                        placeholder="17..."
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="pos-label required">WhatsApp de Contacto</label>
                    <div className="pos-input-group">
                      <div className="pos-input-icon-left"><Phone size={14} /></div>
                      <input
                        type="text"
                        className="pos-input pos-input-with-icon"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="099... o +593"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="pos-label">Fecha de Entrega</label>
                    <div className="pos-input-group">
                      <div className="pos-input-icon-left"><Calendar size={14} /></div>
                      <input
                        type="date"
                        className="pos-input pos-input-with-icon"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="pos-label">Descripción del Trabajo / Rótulo</label>
                  <div className="pos-input-group">
                    <div className="pos-input-icon-left"><FileText size={14} /></div>
                    <input
                      type="text"
                      className="pos-input pos-input-with-icon"
                      value={jobName}
                      onChange={(e) => setJobName(e.target.value)}
                      placeholder="Ej. Lona 3x2m para inauguración farmacia con ojales"
                    />
                  </div>
                </div>

                {/* Cloud File Uploader for Artwork */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowUploader(!showUploader)}
                    className="pos-cat-pill"
                    style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px' }}
                  >
                    <UploadCloud size={14} />
                    {artUrl ? '✓ Archivo Adjunto (Clic para cambiar)' : '+ Adjuntar Arte / Vector PDF / AI'}
                  </button>

                  {showUploader && (
                    <div style={{ marginTop: '10px' }}>
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

              {/* Card 2: Product & Substrate Configurator */}
              <div className="pos-card">
                <div className="pos-card-header">
                  <h3 className="pos-card-title">
                    <Package size={17} /> Agregar Producto / Sustrato
                  </h3>
                </div>

                {/* Category Pills Filter */}
                <div>
                  <label className="pos-label">Filtrar por Categoría</label>
                  <div className="pos-cat-pills-row">
                    {productCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`pos-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat === 'all' ? '✦ Todos' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Dropdown Selector */}
                <div>
                  <label className="pos-label required">Seleccionar Producto</label>
                  <select
                    className="pos-select"
                    value={selectedProductId || selectedProduct?.id || ''}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    {filteredProductOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${Number(p.basePrice).toFixed(2)}/{p.unit} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dimension Inputs (When calcType === 'area') */}
                {selectedProduct?.calcType === 'area' && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px', alignItems: 'end' }}>
                      <div>
                        <label className="pos-label required">Ancho (cm)</label>
                        <div className="pos-input-group">
                          <input
                            type="number"
                            className="pos-input"
                            placeholder="Ej. 300"
                            value={itemWidthCm}
                            onChange={(e) => setItemWidthCm(e.target.value)}
                          />
                          <span className="pos-input-suffix">cm</span>
                        </div>
                      </div>
                      <div>
                        <label className="pos-label required">Alto (cm)</label>
                        <div className="pos-input-group">
                          <input
                            type="number"
                            className="pos-input"
                            placeholder="Ej. 200"
                            value={itemHeightCm}
                            onChange={(e) => setItemHeightCm(e.target.value)}
                          />
                          <span className="pos-input-suffix">cm</span>
                        </div>
                      </div>
                      <div>
                        <label className="pos-label">Superficie Total</label>
                        <div className="pos-calc-box">
                          <span style={{ fontSize: '11.5px', color: 'var(--pos-text-muted)', fontWeight: 700 }}>Área:</span>
                          <span className="pos-calc-badge">{computedItem.areaM2} m²</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--pos-text-subtle)', fontWeight: 800 }}>Medidas Frecuentes:</span>
                      {[
                        { label: '1x1 m', w: 100, h: 100 },
                        { label: '2x1 m', w: 200, h: 100 },
                        { label: '3x2 m', w: 300, h: 200 },
                        { label: '0.8x1.2 m', w: 80, h: 120 }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className="pos-cat-pill"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => {
                            setItemWidthCm(preset.w);
                            setItemHeightCm(preset.h);
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity, Finishings & Unit Price Override */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '12px', alignItems: 'end' }}>
                  <div>
                    <label className="pos-label">Cantidad</label>
                    <div className="pos-stepper">
                      <button
                        type="button"
                        className="pos-stepper-btn"
                        onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        className="pos-stepper-input"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value)))}
                      />
                      <button
                        type="button"
                        className="pos-stepper-btn"
                        onClick={() => setItemQuantity(itemQuantity + 1)}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="pos-label">Acabados / Confección</label>
                    <select
                      className="pos-select"
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
                    <label className="pos-label">Precio Unit. ($)</label>
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

                {/* Eyelet Quantity Adjuster */}
                {itemFinishing.includes('ojales') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '11px', border: '1px solid var(--pos-border)' }}>
                    <label className="pos-label" style={{ margin: 0 }}>Cantidad de Ojales:</label>
                    <input
                      type="number"
                      min={1}
                      style={{ width: '80px' }}
                      className="pos-input"
                      value={itemEyeletCount}
                      onChange={(e) => setItemEyeletCount(Number(e.target.value))}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pos-primary)' }}>
                      Recargo Acabado: +${((Number(itemEyeletCount) || 4) * (itemFinishing === 'ojales_grandes' ? 0.50 : 0.30)).toFixed(2)}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  className="pos-add-cart-btn"
                  onClick={handleAddToCart}
                >
                  <Plus size={17} /> Agregar al Carrito — ${computedItem.totalPrice.toFixed(2)}
                </button>
              </div>
            </div>

            {/* ----------------- RIGHT COLUMN: Shopping Cart & Checkout ----------------- */}
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="pos-card">
                <div className="pos-card-header">
                  <h3 className="pos-card-title">
                    <ShoppingBag size={17} /> Carrito de Venta ({cartItems.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleParkSale}
                    className="pos-cat-pill"
                    style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    title="Pausar venta para atender a otro cliente"
                  >
                    <PauseCircle size={13} /> En Espera
                  </button>
                </div>

                {/* Cart Items List */}
                {cartItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--pos-text-subtle)' }}>
                    <ShoppingBag size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>El carrito está vacío</p>
                    <small style={{ fontSize: '11.5px' }}>Selecciona productos en el panel izquierdo para cotizar</small>
                  </div>
                ) : (
                  <div className="pos-cart-list">
                    {cartItems.map((itm, idx) => (
                      <div key={itm.id || idx} className="pos-cart-item">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="pos-cart-item-title">{itm.productName}</div>
                          <div className="pos-cart-item-meta">
                            {itm.widthCm ? <span className="pos-cart-item-badge">{itm.widthCm}x{itm.heightCm}cm ({itm.areaM2}m²)</span> : null}
                            <span className="pos-cart-item-badge">Cant: {itm.quantity}</span>
                            {itm.finishing !== 'none' && <span className="pos-cart-item-badge" style={{ color: 'var(--pos-primary)' }}>{itm.finishing}</span>}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="pos-cart-item-price">${itm.totalPrice.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            className="pos-trash-btn"
                            title="Eliminar ítem"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Financial Liquidation Sheet */}
                <div className="pos-financial-sheet">
                  <div className="pos-fin-row">
                    <span>Subtotal Ítems:</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>

                  {/* Discount Control */}
                  <div className="pos-fin-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Percent size={13} style={{ color: 'var(--pos-primary)' }} />
                      <span>Descuento:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        style={{ width: '56px', padding: '3px 6px', fontSize: '12px' }}
                        className="pos-input"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                      />
                      <span>%</span>
                    </div>
                    {discountAmount > 0 ? (
                      <strong style={{ color: 'var(--pos-danger)' }}>-${discountAmount.toFixed(2)}</strong>
                    ) : (
                      <span>$0.00</span>
                    )}
                  </div>

                  {/* IVA (15%) Toggle Switch */}
                  <div className="pos-fin-row">
                    <label className="pos-toggle-switch">
                      <input
                        type="checkbox"
                        className="pos-toggle-input"
                        checked={applyIVA}
                        onChange={(e) => setApplyIVA(e.target.checked)}
                      />
                      <span className="pos-toggle-track" />
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--pos-text-main)' }}>Aplicar IVA (15%)</span>
                    </label>
                    <strong>${taxAmount.toFixed(2)}</strong>
                  </div>

                  {/* Shipping / Freight Input */}
                  <div className="pos-fin-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={13} />
                      <span>Envío / Flete:</span>
                    </div>
                    <div style={{ width: '90px' }}>
                      <input
                        type="number"
                        step="0.01"
                        style={{ padding: '3px 8px', fontSize: '12px', textAlign: 'right' }}
                        className="pos-input"
                        placeholder="0.00"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Grand Total */}
                  <div className="pos-grand-total-row">
                    <span className="pos-grand-total-label">TOTAL VENTA:</span>
                    <span className="pos-grand-total-val">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Multi-Tender Payment Methods */}
                <div style={{ display: 'grid', gap: '10px' }}>
                  <label className="pos-label">Forma de Cobro / Abono</label>
                  {payments.map((p, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                      <select
                        className="pos-select"
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
                      <div className="pos-input-group">
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
                    </div>
                  ))}

                  {/* Quick Cash Buttons */}
                  <div className="pos-quick-cash-row">
                    <span style={{ fontSize: '11px', color: 'var(--pos-text-subtle)', fontWeight: 800, alignSelf: 'center' }}>Cobro Rápido:</span>
                    <button type="button" className="pos-quick-cash-btn" onClick={() => handleQuickCash(totalAmount)}>
                      Exacto (${totalAmount.toFixed(2)})
                    </button>
                    <button type="button" className="pos-quick-cash-btn" onClick={() => handleQuickCash(10)}>$10</button>
                    <button type="button" className="pos-quick-cash-btn" onClick={() => handleQuickCash(20)}>$20</button>
                    <button type="button" className="pos-quick-cash-btn" onClick={() => handleQuickCash(50)}>$50</button>
                    <button type="button" className="pos-quick-cash-btn" onClick={() => handleQuickCash(100)}>$100</button>
                  </div>

                  {/* Balance / Change Status Banner */}
                  <div className={`pos-balance-card ${balanceDue === 0 ? 'paid' : 'has-balance'}`}>
                    <span>Abono: ${totalDeposited.toFixed(2)}</span>
                    <span>
                      {balanceDue > 0 ? `Saldo por cobrar: $${balanceDue.toFixed(2)}` : (changeDue > 0 ? `Vuelto: $${changeDue.toFixed(2)}` : '✓ Pagado Completo')}
                    </span>
                  </div>
                </div>

                {/* Main Submit Action Button */}
                <button
                  type="button"
                  className="pos-checkout-btn"
                  onClick={handleSubmitOrder}
                  disabled={cartItems.length === 0}
                >
                  <CheckCircle2 size={19} /> Registrar Venta & Generar Comprobante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 2: PRODUCTION KANBAN
          ---------------------------------------------------------------------- */}
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

      {/* ----------------------------------------------------------------------
          TAB 3: CUSTOMER CRM 360
          ---------------------------------------------------------------------- */}
      {activeTab === 'crm' && (
        <POSCustomerCRM
          store={store}
          onStoreUpdate={(updated) => setStore(updated)}
          onReorder={handleReorderFromCRM}
        />
      )}

      {/* ----------------------------------------------------------------------
          TAB 4: PRODUCTS & TARIFFS SPREADSHEET MANAGER
          ---------------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <POSProductManager
          store={store}
          onStoreUpdate={(updated) => setStore(updated)}
        />
      )}

      {/* ----------------------------------------------------------------------
          TAB 5: CARTERA & PEDIDOS HISTORICOS
          ---------------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="pos-card">
          <div className="pos-card-header">
            <h2 className="pos-card-title" style={{ fontSize: '17px' }}>
              <FileText size={19} />
              Cartera de Pedidos & Órdenes ({filteredOrdersList.length})
            </h2>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div className="pos-input-group" style={{ width: '220px' }}>
                <div className="pos-input-icon-left"><Search size={14} /></div>
                <input
                  type="text"
                  className="pos-input pos-input-with-icon"
                  placeholder="Buscar orden o cliente..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                />
              </div>

              {/* Payment Filter */}
              <select
                className="pos-select"
                style={{ width: '150px' }}
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
                className="pos-select"
                style={{ width: '160px' }}
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
            <table className="pos-orders-table">
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
                    <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--pos-text-subtle)' }}>
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
                        <td><strong style={{ color: 'var(--pos-primary)' }}>#{ord.orderNumber}</strong></td>
                        <td style={{ fontSize: '12px', color: 'var(--pos-text-muted)' }}>{ord.orderDate}</td>
                        <td><strong>{ord.customerName}</strong></td>
                        <td>{ord.jobName}</td>
                        <td>
                          <span className={`pos-status-badge ${ord.productionStage || 'preprensa'}`}>
                            {ord.productionStage}
                          </span>
                        </td>
                        <td><b>${Number(ord.totalAmount).toFixed(2)}</b></td>
                        <td style={{ color: 'var(--pos-success)', fontWeight: 700 }}>${Number(ord.depositAmount).toFixed(2)}</td>
                        <td>
                          <strong style={{ color: ord.balanceDue > 0 ? 'var(--pos-danger)' : 'var(--pos-success)' }}>
                            ${Number(ord.balanceDue).toFixed(2)}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            {/* SRI Electronic Invoice Button */}
                            <button
                              type="button"
                              className="pos-cat-pill"
                              style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--pos-success-soft)', color: 'var(--pos-success-dark)', border: '1px solid var(--pos-success-border)' }}
                              onClick={() => setSriOrder({ order: ord, items, customer: cust, advisor: adv })}
                              title="Emitir / Ver Factura Electrónica SRI"
                            >
                              <ShieldCheck size={13} /> SRI
                            </button>

                            {ord.balanceDue > 0 && (
                              <button
                                type="button"
                                className="pos-cat-pill"
                                style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--pos-warning-soft)', color: 'var(--pos-warning-dark)', border: '1px solid var(--pos-warning-border)' }}
                                onClick={() => setCollectionOrder(ord)}
                                title="Cobrar saldo pendiente"
                              >
                                <DollarSign size={12} /> Cobrar
                              </button>
                            )}

                            <button
                              type="button"
                              className="pos-cat-pill"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => setReceiptOrder(ord)}
                              title="Reimprimir Comprobante Térmico"
                            >
                              <Printer size={13} />
                            </button>

                            <button
                              type="button"
                              className="pos-cat-pill"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => setWorkOrderData({ order: ord, items, advisor: adv })}
                              title="Hoja de Taller para Operarios"
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

      {/* ----------------------------------------------------------------------
          TAB 6: INVENTORY
          ---------------------------------------------------------------------- */}
      {activeTab === 'inventory' && (
        <POSInventoryMaterials
          store={store}
          onStoreUpdate={(updated) => setStore(updated)}
        />
      )}

      {/* ----------------------------------------------------------------------
          TAB 7: PURCHASES TO SUPPLIERS
          ---------------------------------------------------------------------- */}
      {activeTab === 'purchases' && (
        <POSPurchaseOrdersManager
          store={store}
          onStoreUpdate={(updated) => setStore(updated)}
        />
      )}

      {/* ----------------------------------------------------------------------
          TAB 8: WEEKLY CASH RECONCILIATION
          ---------------------------------------------------------------------- */}
      {activeTab === 'weekly' && (
        <div className="pos-card">
          <div className="pos-card-header">
            <h2 className="pos-card-title" style={{ fontSize: '17px' }}>
              <Calendar size={19} />
              Cuadre Semanal de Caja (Formato Excel Lunes a Sábado)
            </h2>
          </div>
          {(() => {
            const balance = calculateWeeklyBalance(store, getMondayOfWeek(), currentAdvisorId);
            return (
              <div style={{ overflowX: 'auto' }}>
                <table className="pos-daily-excel-table">
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
                        <td style={{ fontSize: '12px', color: 'var(--pos-text-muted)' }}>{d.date}</td>
                        <td>{d.orderCount}</td>
                        <td><b>${d.totalSales.toFixed(2)}</b></td>
                        <td style={{ color: 'var(--pos-success)', fontWeight: 700 }}>${d.totalDeposits.toFixed(2)}</td>
                        <td style={{ color: d.totalBalanceDue > 0 ? 'var(--pos-danger)' : 'var(--pos-text-muted)' }}>${d.totalBalanceDue.toFixed(2)}</td>
                        <td style={{ color: 'var(--pos-warning-dark)' }}>${d.totalExpenses.toFixed(2)}</td>
                        <td>${d.cashAmount.toFixed(2)}</td>
                        <td>${d.transferAmount.toFixed(2)}</td>
                        <td><strong style={{ color: 'var(--pos-blue-dark)' }}>${d.netTotal.toFixed(2)}</strong></td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--pos-primary-soft)', fontWeight: 900, borderTop: '2px solid var(--pos-primary)' }}>
                      <td colSpan={2} style={{ color: 'var(--pos-primary)' }}>TOTALES SEMANALES:</td>
                      <td>{balance.totals.orderCount}</td>
                      <td>${balance.totals.totalSales.toFixed(2)}</td>
                      <td style={{ color: 'var(--pos-success)' }}>${balance.totals.totalDeposits.toFixed(2)}</td>
                      <td style={{ color: 'var(--pos-danger)' }}>${balance.totals.totalBalanceDue.toFixed(2)}</td>
                      <td style={{ color: 'var(--pos-warning-dark)' }}>${balance.totals.totalExpenses.toFixed(2)}</td>
                      <td>${balance.totals.cashAmount.toFixed(2)}</td>
                      <td>${balance.totals.transferAmount.toFixed(2)}</td>
                      <td style={{ color: 'var(--pos-primary)', fontSize: '16px' }}>${balance.totals.netTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 9: PETTY CASH EXPENSES
          ---------------------------------------------------------------------- */}
      {activeTab === 'expenses' && (
        <div className="pos-card">
          <div className="pos-card-header">
            <h2 className="pos-card-title" style={{ fontSize: '17px' }}>
              <DollarSign size={19} />
              Registro de Gastos de Caja Chica
            </h2>
          </div>

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
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}
          >
            <div>
              <label className="pos-label required">Descripción del Gasto</label>
              <input name="description" className="pos-input" placeholder="Ej. Cinta de embalaje, almuerzo taller" required />
            </div>
            <div>
              <label className="pos-label required">Monto ($)</label>
              <input name="amount" type="number" step="0.01" className="pos-input" placeholder="0.00" required />
            </div>
            <div>
              <label className="pos-label">Categoría</label>
              <select name="category" className="pos-select">
                <option value="Suministros">Suministros Taller</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Transporte">Transporte / Flete</option>
                <option value="Servicios">Servicios / Varios</option>
              </select>
            </div>
            <button type="submit" className="pos-add-cart-btn" style={{ padding: '10px 18px' }}>
              + Registrar Gasto
            </button>
          </form>

          <table className="pos-orders-table" style={{ marginTop: '14px' }}>
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
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--pos-text-subtle)' }}>No hay gastos registrados en caja chica</td></tr>
              ) : (
                (store.expenses || []).map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.expenseDate}</td>
                    <td><strong>{exp.description}</strong></td>
                    <td><span className="pos-nav-badge">{exp.category}</span></td>
                    <td style={{ color: 'var(--pos-warning-dark)', fontWeight: 800 }}>${Number(exp.amount).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const res = deletePOSExpense(store, exp.id);
                          if (res.ok) setStore(res.updatedStore);
                        }}
                        className="pos-trash-btn"
                        title="Eliminar gasto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 10: ADVISORS & CREDENTIALS MANAGEMENT
          ---------------------------------------------------------------------- */}
      {activeTab === 'advisors' && (
        <POSAdvisorsManagement store={store} setStore={setStore} />
      )}

      {/* ----------------------------------------------------------------------
          MODALS & OVERLAYS
          ---------------------------------------------------------------------- */}
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
          <div className="pos-modal-card" style={{ maxWidth: '440px' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 900 }}>
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
              style={{ display: 'grid', gap: '14px' }}
            >
              <div>
                <label className="pos-label required">
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
                <label className="pos-label">Observaciones / Billetes</label>
                <input
                  type="text"
                  className="pos-input"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Ej. Billetes de $20 y sueltos"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="pos-cat-pill" onClick={() => setIsShiftModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="pos-add-cart-btn" style={{ width: 'auto', padding: '10px 18px' }}>
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
