import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Key,
  Target,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  X,
  Copy,
  Check,
  RefreshCw,
  MessageCircle,
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';
import {
  loadPOSStore,
  savePOSStore,
  getMondayOfWeek,
  getISOWeekCode,
  rotateAdvisorsCredentials,
  formatWeeklyCredentialsText,
  toISODate
} from '../../lib/posStore';

export function POSAdvisorsManagement() {
  const [store, setStore] = useState(loadPOSStore);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingleId, setCopiedSingleId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: '123456',
    weeklyPin: '',
    weeklyPassword: '',
    phone: '',
    role: 'asesora',
    weeklyGoal: 3200,
    isActive: true
  });

  const currentMonday = getMondayOfWeek();
  const currentWeekCode = getISOWeekCode();

  const money = (val) => `$${(Number(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const openCreateModal = () => {
    setEditingAdvisor(null);
    const tempPin = String(Math.floor(100000 + Math.random() * 900000));
    setFormData({
      name: '',
      email: '',
      pin: tempPin,
      weeklyPin: tempPin,
      weeklyPassword: `asesora-${tempPin}`,
      phone: '',
      role: 'asesora',
      weeklyGoal: 3200,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (advisor) => {
    setEditingAdvisor(advisor);
    setFormData({
      name: advisor.name || '',
      email: advisor.email || '',
      pin: advisor.weeklyPin || advisor.pin || '123456',
      weeklyPin: advisor.weeklyPin || advisor.pin || '123456',
      weeklyPassword: advisor.weeklyPassword || `${advisor.name.toLowerCase()}-${advisor.pin || '123456'}`,
      phone: advisor.phone || '',
      role: advisor.role || 'asesora',
      weeklyGoal: advisor.weeklyGoal || 3200,
      isActive: advisor.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let updatedAdvisors;
    if (editingAdvisor) {
      updatedAdvisors = store.advisors.map((a) =>
        a.id === editingAdvisor.id
          ? {
              ...a,
              ...formData,
              pin: formData.weeklyPin || formData.pin,
              weeklyPin: formData.weeklyPin || formData.pin,
              weeklyPassword: formData.weeklyPassword,
              weeklyGoal: Number(formData.weeklyGoal) || 3200
            }
          : a
      );
    } else {
      const newAdv = {
        id: `adv-${Date.now()}`,
        ...formData,
        pin: formData.weeklyPin || formData.pin,
        weeklyPin: formData.weeklyPin || formData.pin,
        weeklyPassword: formData.weeklyPassword,
        currentWeekCode,
        pinLastRotatedAt: currentMonday,
        weeklyGoal: Number(formData.weeklyGoal) || 3200
      };
      updatedAdvisors = [...store.advisors, newAdv];
    }

    const nextState = { ...store, advisors: updatedAdvisors };
    setStore(nextState);
    savePOSStore(nextState);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta asesora del sistema?')) {
      const updatedAdvisors = store.advisors.filter((a) => a.id !== id);
      const nextState = { ...store, advisors: updatedAdvisors };
      setStore(nextState);
      savePOSStore(nextState);
    }
  };

  const toggleActive = (advisor) => {
    const updatedAdvisors = store.advisors.map((a) =>
      a.id === advisor.id ? { ...a, isActive: !a.isActive } : a
    );
    const nextState = { ...store, advisors: updatedAdvisors };
    setStore(nextState);
    savePOSStore(nextState);
  };

  // Force Rotate Credentials for all advisors
  const handleForceRotate = () => {
    if (window.confirm('¿Deseas generar y rotar nuevas contraseñas y PINs para todas las asesoras ahora mismo?')) {
      const rotated = rotateAdvisorsCredentials(store.advisors, true);
      const nextState = { ...store, advisors: rotated };
      setStore(nextState);
      savePOSStore(nextState);
      alert('¡Credenciales semanales rotadas con éxito! Puedes copiarlas y compartirlas con el equipo.');
    }
  };

  // Copy All Credentials to Clipboard
  const handleCopyAll = () => {
    const text = formatWeeklyCredentialsText(store.advisors, currentMonday);
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  // Share to WhatsApp Web
  const handleShareWhatsApp = () => {
    const text = formatWeeklyCredentialsText(store.advisors, currentMonday);
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Copy Single Advisor Credential
  const handleCopySingle = (advisor, index) => {
    const text = `🔑 Credencial Gigaprint (${currentWeekCode})\n👤 Asesora: ${advisor.name}\n🔢 PIN: ${advisor.weeklyPin || advisor.pin}\n🔐 Clave: ${advisor.weeklyPassword}\n🌐 Acceso: https://gigaprint-ec.github.io/gigaprint-webpage/#/admin/pos`;
    navigator.clipboard.writeText(text);
    setCopiedSingleId(advisor.id);
    setTimeout(() => setCopiedSingleId(null), 2500);
  };

  const activeCount = store.advisors.filter((a) => a.isActive).length;
  const totalWeeklyGoal = store.advisors
    .filter((a) => a.isActive)
    .reduce((sum, a) => sum + Number(a.weeklyGoal || 0), 0);

  return (
    <div className="pos-container">
      {/* Top Banner & Stats */}
      <div className="pos-top-bar">
        <div className="pos-brand-badge">
          <h1>
            <Users size={22} style={{ color: 'var(--orange)' }} />
            Gestión de Asesoras Comerciales
          </h1>
          <span>{store.advisors.length} Asesoras Registradas</span>
        </div>

        <div className="pos-top-actions">
          <div style={{ display: 'flex', gap: '16px', marginRight: '8px', fontSize: '13px' }}>
            <span>Activas: <b>{activeCount}</b></span>
            <span>Meta Global Semanal: <b style={{ color: 'var(--orange-dark)' }}>{money(totalWeeklyGoal)}</b></span>
          </div>
          <button
            type="button"
            className="pos-submit-order-btn"
            style={{ padding: '10px 18px', fontSize: '13px' }}
            onClick={openCreateModal}
          >
            <Plus size={16} /> Nueva Asesora
          </button>
        </div>
      </div>

      {/* =========================================================================
          WEEKLY CREDENTIALS ROTATION HUB
          ========================================================================= */}
      <div className="pos-card" style={{
        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(251, 146, 60, 0.03) 100%)',
        border: '1.5px solid rgba(234, 88, 12, 0.35)',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="pos-badge-pill paid" style={{ background: 'var(--orange)', color: '#fff', fontSize: '11px', fontWeight: 800 }}>
                <Calendar size={12} /> SEMANA {currentWeekCode}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                Renovadas automáticamente el Lunes {currentMonday}
              </span>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 900, color: 'var(--ink)' }}>
              🔑 Credenciales y PINs Semanales de Acceso
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', maxWidth: '640px' }}>
              Cada lunes a las 00:00 se genera una nueva contraseña y PIN para cada asesora comercial. Copia y comparte las credenciales para que ingresen al Punto de Venta y registren sus ventas.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCopyAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1.5px solid var(--orange)',
                background: copiedAll ? '#16a34a' : 'var(--orange)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }}
            >
              {copiedAll ? <Check size={16} /> : <Copy size={16} />}
              {copiedAll ? '¡Copiado al portapapeles!' : 'Copiar Credenciales'}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1.5px solid #25D366',
                background: '#25D366',
                color: '#fff',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <MessageCircle size={16} /> Enviar a WhatsApp
            </button>

            <button
              type="button"
              onClick={handleForceRotate}
              title="Generar nuevas credenciales ahora mismo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} /> Rotar Ahora
            </button>
          </div>
        </div>

        {/* Quick Advisor Key Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '10px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px dashed rgba(234, 88, 12, 0.25)'
        }}>
          {store.advisors.map((adv, idx) => (
            <div
              key={adv.id}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <b style={{ fontSize: '13px', display: 'block', color: 'var(--ink)' }}>
                  {adv.name}
                </b>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  PIN: <code style={{ fontWeight: 800, color: 'var(--orange-dark)', background: 'var(--orange-soft)', padding: '1px 5px', borderRadius: '4px' }}>{adv.weeklyPin || adv.pin || '123456'}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopySingle(adv, idx)}
                title="Copiar credencial individual"
                style={{
                  border: 0,
                  background: copiedSingleId === adv.id ? '#dcfce7' : 'var(--bg)',
                  color: copiedSingleId === adv.id ? '#166534' : 'var(--ink)',
                  padding: '6px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {copiedSingleId === adv.id ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          ADVISORS GRID CARDS
          ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
        marginTop: '16px'
      }}>
        {store.advisors.map((advisor, idx) => {
          const initials = advisor.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
          const advisorOrders = store.orders.filter((o) => o.advisorId === advisor.id);
          const totalSales = advisorOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

          return (
            <div
              key={advisor.id}
              className="pos-card"
              style={{
                display: 'grid',
                gap: '14px',
                opacity: advisor.isActive ? 1 : 0.6,
                borderLeft: advisor.isActive ? '4px solid var(--orange)' : '4px solid var(--muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: advisor.isActive ? 'linear-gradient(135deg, var(--orange) 0%, var(--orange-dark) 100%)' : 'var(--line)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '15px'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--ink)' }}>
                      {advisor.name}
                    </h3>
                    <small style={{ color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                      Asesora Comercial #{idx + 1}
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(advisor)}
                    style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--ink)', padding: '4px' }}
                    title="Editar asesora"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(advisor.id)}
                    style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                    title="Eliminar asesora"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Weekly Credential Highlight Box */}
              <div style={{
                background: 'var(--bg)',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>
                    Credencial Semanal ({currentWeekCode})
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)' }}>
                      PIN (6d): <code style={{ color: 'var(--orange-dark)', background: 'var(--orange-soft)', padding: '2px 6px', borderRadius: '4px' }}>{advisor.weeklyPin || advisor.pin || '123456'}</code>
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Clave: <b>{advisor.weeklyPassword || `${advisor.name.toLowerCase()}-123456`}</b>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySingle(advisor, idx)}
                  style={{
                    border: 0,
                    background: copiedSingleId === advisor.id ? '#dcfce7' : 'var(--paper)',
                    color: copiedSingleId === advisor.id ? '#166534' : 'var(--orange-dark)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedSingleId === advisor.id ? <Check size={13} /> : <Copy size={13} />}
                  {copiedSingleId === advisor.id ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>

              {/* Advisor Specs & Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block' }}>Meta Semanal:</span>
                  <strong style={{ color: 'var(--orange-dark)' }}>{money(advisor.weeklyGoal || 3200)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block' }}>Ventas Registradas:</span>
                  <strong>{money(totalSales)} ({advisorOrders.length})</strong>
                </div>
              </div>

              {/* Status footer & toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '10px',
                borderTop: '1px solid var(--line)',
                fontSize: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => toggleActive(advisor)}
                  style={{
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: advisor.isActive ? '#16a34a' : 'var(--muted)',
                    fontWeight: 700
                  }}
                >
                  {advisor.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {advisor.isActive ? 'Asesora Activa' : 'Inactiva / Pausada'}
                </button>
                <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
                  {advisor.phone || advisor.email || 'Sin contacto'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          MODAL: CREATE / EDIT ADVISOR
          ========================================================================= */}
      {isModalOpen && (
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
            maxWidth: '460px',
            border: '1px solid var(--line)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>
                {editingAdvisor ? 'Editar Asesora Comercial' : 'Registrar Nueva Asesora'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gap: '12px' }}>
              <div className="pos-form-group">
                <label>Nombre Completo de la Asesora *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Vicky Morales"
                  value={formData.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    name: e.target.value,
                    weeklyPassword: `${e.target.value.split(' ')[0].toLowerCase()}-${formData.weeklyPin || '1234'}`
                  })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="pos-form-group">
                  <label>PIN de Caja (6 dígitos) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Ej. 849201"
                    value={formData.weeklyPin}
                    onChange={(e) => setFormData({
                      ...formData,
                      weeklyPin: e.target.value,
                      pin: e.target.value,
                      weeklyPassword: `${formData.name.split(' ')[0].toLowerCase() || 'asesora'}-${e.target.value}`
                    })}
                  />
                </div>
                <div className="pos-form-group">
                  <label>Contraseña Semanal</label>
                  <input
                    type="text"
                    value={formData.weeklyPassword}
                    onChange={(e) => setFormData({ ...formData, weeklyPassword: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="pos-form-group">
                  <label>Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0991234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="pos-form-group">
                  <label>Meta Semanal ($)</label>
                  <input
                    type="number"
                    step="50"
                    value={formData.weeklyGoal}
                    onChange={(e) => setFormData({ ...formData, weeklyGoal: Number(e.target.value) || 3200 })}
                  />
                </div>
              </div>

              <div className="pos-form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="asesora@gigaprint.ec"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  Guardar Asesora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
