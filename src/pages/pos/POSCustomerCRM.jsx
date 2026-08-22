import React, { useState, useMemo } from 'react';
import { 
  Users, Search, UserPlus, Phone, Mail, MapPin, Building2, Tag, 
  Clock, DollarSign, ShoppingBag, ArrowUpRight, MessageCircle, 
  Edit3, Check, Star, AlertCircle, RefreshCw
} from 'lucide-react';
import { upsertCustomer, toISODate, clonePOSOrder } from '../../lib/posStore';

export function POSCustomerCRM({ store, setStore, onReorder }) {
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [filterTag, setFilterTag] = useState('all');

  const today = toISODate();

  // Calculate rich customer statistics
  const customerStats = useMemo(() => {
    const map = {};
    (store.customers || []).forEach((c) => {
      const orders = (store.orders || []).filter((o) => (o.customerId === c.id || o.customerIdentification === c.identification) && o.status !== 'anulado');
      const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const totalBalanceDue = orders.reduce((sum, o) => sum + Number(o.balanceDue || 0), 0);
      const lastOrder = orders.sort((a, b) => (b.orderDate || '').localeCompare(a.orderDate || ''))[0];
      
      let isInactive = false;
      if (lastOrder?.orderDate) {
        const diffDays = Math.floor((new Date(today) - new Date(lastOrder.orderDate)) / (1000 * 60 * 60 * 24));
        if (diffDays > 30) isInactive = true;
      }

      map[c.id] = {
        orders,
        orderCount: orders.length,
        totalSpent,
        totalBalanceDue,
        lastOrderDate: lastOrder?.orderDate || null,
        isInactive
      };
    });
    return map;
  }, [store.customers, store.orders, today]);

  // All unique tags across customers
  const allTags = useMemo(() => {
    const set = new Set();
    (store.customers || []).forEach((c) => {
      (c.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [store.customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return (store.customers || []).filter((c) => {
      const q = search.toLowerCase();
      const matchText = (c.name || '').toLowerCase().includes(q) ||
        (c.identification || '').includes(q) ||
        (c.phone || '').includes(q) ||
        (c.companyName || '').toLowerCase().includes(q);

      const matchTag = filterTag === 'all' || (c.tags || []).includes(filterTag);
      return matchText && matchTag;
    });
  }, [store.customers, search, filterTag]);

  const selectedCustomer = useMemo(() => {
    return (store.customers || []).find((c) => c.id === selectedCustomerId) || filteredCustomers[0] || null;
  }, [store.customers, selectedCustomerId, filteredCustomers]);

  const selectedStats = selectedCustomer ? customerStats[selectedCustomer.id] : null;

  // Handle open modal for new or edit
  const handleOpenEdit = (cust = null) => {
    if (cust) {
      setEditingCustomer({ ...cust, tagsString: (cust.tags || []).join(', ') });
    } else {
      setEditingCustomer({
        name: '',
        identification: '',
        phone: '',
        email: '',
        address: '',
        city: 'Quito',
        companyName: '',
        isVip: false,
        creditLimit: 0,
        creditDays: 0,
        notes: '',
        tagsString: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!editingCustomer?.name) return;

    const tagsArray = (editingCustomer.tagsString || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { state, customer } = upsertCustomer(store, {
      ...editingCustomer,
      tags: tagsArray
    });

    setStore(state);
    setIsModalOpen(false);
    setSelectedCustomerId(customer.id);
  };

  const handleWhatsAppReactivate = (customer) => {
    const phone = (customer.phone || '').replace(/[^0-9]/g, '');
    const clean = phone.startsWith('0') ? '593' + phone.substring(1) : phone.startsWith('593') ? phone : '593' + phone;
    const msg = encodeURIComponent(
      `¡Hola ${customer.name}! 👋 Te saludamos de Gigaprint. ¿Cómo te encuentras?\n\nQueríamos recordarte que tenemos promociones especiales en gigantografías, viniles y rótulos para tu empresa. ¿Tienes algún trabajo o impresión pendiente que podamos cotizarte hoy mismo? 🚀`
    );
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  return (
    <div className="pos-crm-container" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>
      {/* Left Column: Customer Directory List */}
      <div style={{
        background: 'var(--paper)',
        borderRadius: '16px',
        border: '1px solid var(--line)',
        padding: '16px',
        display: 'grid',
        gap: '14px',
        maxHeight: 'calc(100vh - 160px)',
        overflowY: 'auto'
      }}>
        {/* Header & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--orange)" /> Clientes ({filteredCustomers.length})
          </h3>
          <button
            onClick={() => handleOpenEdit(null)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 0,
              background: 'var(--orange)',
              color: '#fff',
              fontWeight: '800',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <UserPlus size={14} /> Nuevo
          </button>
        </div>

        {/* Search & Tag Filter */}
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Buscar por Nombre, RUC o Teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                fontSize: '12px',
                color: 'var(--ink)'
              }}
            />
          </div>

          {allTags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                onClick={() => setFilterTag('all')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  border: '1px solid var(--line)',
                  background: filterTag === 'all' ? 'var(--orange-soft)' : 'var(--bg)',
                  color: filterTag === 'all' ? 'var(--orange-dark)' : 'var(--muted)',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Todos
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTag(t)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '999px',
                    border: '1px solid var(--line)',
                    background: filterTag === t ? 'var(--orange-soft)' : 'var(--bg)',
                    color: filterTag === t ? 'var(--orange-dark)' : 'var(--muted)',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Customer Cards List */}
        <div style={{ display: 'grid', gap: '8px' }}>
          {filteredCustomers.map((cust) => {
            const stats = customerStats[cust.id] || { orderCount: 0, totalSpent: 0, totalBalanceDue: 0 };
            const isSelected = selectedCustomer?.id === cust.id;

            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerId(cust.id)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--orange)' : '1px solid var(--line)',
                  background: isSelected ? 'var(--orange-soft)' : 'var(--bg)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'grid',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{cust.name}</strong>
                    {cust.isVip && <Star size={13} fill="#f59e0b" color="#f59e0b" />}
                  </div>

                  {stats.totalBalanceDue > 0 ? (
                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: '#fee2e2', color: '#dc2626' }}>
                      Debe: ${stats.totalBalanceDue.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--orange-dark)' }}>
                      ${stats.totalSpent.toFixed(2)}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
                  <span>{cust.identification || cust.companyName || 'Sin RUC'}</span>
                  <span>{stats.orderCount} {stats.orderCount === 1 ? 'pedido' : 'pedidos'}</span>
                </div>

                {stats.isInactive && (
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> Sin compras hace &gt;30 días
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Customer 360° Profile & Order Timeline */}
      {selectedCustomer ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Customer Top Header Profile Card */}
          <div style={{
            background: 'var(--paper)',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            padding: '20px',
            display: 'grid',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'var(--ink)' }}>
                    {selectedCustomer.name}
                  </h2>
                  {selectedCustomer.isVip && (
                    <span style={{ padding: '2px 8px', borderRadius: '999px', background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} fill="#b45309" /> VIP
                    </span>
                  )}
                </div>
                {selectedCustomer.companyName && (
                  <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Building2 size={14} /> {selectedCustomer.companyName}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleOpenEdit(selectedCustomer)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Edit3 size={14} /> Editar Datos
                </button>

                <button
                  onClick={() => handleWhatsAppReactivate(selectedCustomer)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: 0,
                    background: '#25D366',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={15} /> WhatsApp Directo
                </button>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              background: 'var(--bg)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--line)'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700', display: 'block' }}>RUC / CÉDULA</span>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{selectedCustomer.identification || 'No registrado'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700', display: 'block' }}>TELÉFONO</span>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{selectedCustomer.phone || 'No registrado'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700', display: 'block' }}>CORREO ELECTRÓNICO</span>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{selectedCustomer.email || 'No registrado'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700', display: 'block' }}>DIRECCIÓN & CIUDAD</span>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{selectedCustomer.address ? `${selectedCustomer.address}, ${selectedCustomer.city}` : selectedCustomer.city}</strong>
              </div>
            </div>

            {/* KPI Financials Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--paper)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700' }}>TOTAL HISTÓRICO (LTV)</span>
                <strong style={{ display: 'block', fontSize: '18px', fontWeight: '900', color: 'var(--orange-dark)', marginTop: '4px' }}>
                  ${(selectedStats?.totalSpent || 0).toFixed(2)}
                </strong>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--paper)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700' }}>PEDIDOS TOTALES</span>
                <strong style={{ display: 'block', fontSize: '18px', fontWeight: '900', color: 'var(--ink)', marginTop: '4px' }}>
                  {selectedStats?.orderCount || 0}
                </strong>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', background: (selectedStats?.totalBalanceDue || 0) > 0 ? '#fee2e2' : '#dcfce7', border: '1px solid var(--line)', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: (selectedStats?.totalBalanceDue || 0) > 0 ? '#991b1b' : '#166534', fontWeight: '700' }}>DEUDA PENDIENTE</span>
                <strong style={{ display: 'block', fontSize: '18px', fontWeight: '900', color: (selectedStats?.totalBalanceDue || 0) > 0 ? '#dc2626' : '#16a34a', marginTop: '4px' }}>
                  ${(selectedStats?.totalBalanceDue || 0).toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Internal Notes & Tags */}
            {selectedCustomer.notes && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
                <strong>📌 Nota de Asesoría:</strong> {selectedCustomer.notes}
              </div>
            )}
          </div>

          {/* Customer Orders History Timeline */}
          <div style={{
            background: 'var(--paper)',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            padding: '20px',
            display: 'grid',
            gap: '14px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--ink)' }}>
              Historial de Trabajos y Pedidos ({selectedStats?.orders?.length || 0})
            </h3>

            {selectedStats?.orders?.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Este cliente no tiene pedidos registrados aún.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {selectedStats.orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', background: 'var(--orange-soft)', color: 'var(--orange-dark)' }}>
                          #{ord.orderNumber}
                        </span>
                        <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{ord.jobName}</strong>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        Fecha: {ord.orderDate} {ord.deliveryDate ? `| Entrega: ${ord.deliveryDate}` : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block' }}>
                          ${Number(ord.totalAmount || 0).toFixed(2)}
                        </strong>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: ord.balanceDue > 0 ? '#dc2626' : '#16a34a' }}>
                          {ord.balanceDue > 0 ? `Saldo: ${Number(ord.balanceDue).toFixed(2)}` : 'Pagado 100%'}
                        </span>
                      </div>

                      <button
                        onClick={() => onReorder && onReorder(ord)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--line)',
                          background: 'var(--paper)',
                          color: 'var(--orange-dark)',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RefreshCw size={13} /> Reordenar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
          Selecciona un cliente para ver su ficha 360°
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && editingCustomer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <form onSubmit={handleSaveCustomer} style={{
            background: 'var(--paper)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '540px',
            width: '100%',
            border: '1px solid var(--line)',
            display: 'grid',
            gap: '14px'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--ink)' }}>
              {editingCustomer.id ? 'Editar Ficha de Cliente' : 'Registrar Nuevo Cliente'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)' }}
                />
              </div>

              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>RUC / Cédula</label>
                <input
                  type="text"
                  value={editingCustomer.identification}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, identification: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)' }}
                />
              </div>

              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)' }}
                />
              </div>

              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>Razón Social / Empresa</label>
                <input
                  type="text"
                  value={editingCustomer.companyName}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)' }}
                />
              </div>

              <div style={{ display: 'grid', gap: '4px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>Dirección</label>
                <input
                  type="text"
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)' }}
                />
              </div>

              <div style={{ display: 'grid', gap: '4px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>Etiquetas (separadas por coma)</label>
                <input
                  type="text"
                  placeholder="Empresarial, VIP, Factura, Crédito 15d"
                  value={editingCustomer.tagsString}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, tagsString: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)' }}
                />
              </div>

              <div style={{ display: 'grid', gap: '4px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>Notas Internas para Asesoras</label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones especiales de acabados, entrega o facturación..."
                  value={editingCustomer.notes}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer', fontWeight: '700' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ padding: '8px 16px', borderRadius: '8px', border: 0, background: 'var(--orange)', color: '#fff', cursor: 'pointer', fontWeight: '800' }}
              >
                Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
