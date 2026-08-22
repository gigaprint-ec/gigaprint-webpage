import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Key, Target, Phone, Mail, CheckCircle2, XCircle, ShieldCheck, X } from 'lucide-react';
import { loadPOSStore, savePOSStore } from '../../lib/posStore';

export function POSAdvisorsManagement() {
  const [store, setStore] = useState(loadPOSStore);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: '1234',
    phone: '',
    role: 'asesora',
    weeklyGoal: 3200,
    isActive: true
  });

  const money = (val) => `$${(Number(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const openCreateModal = () => {
    setEditingAdvisor(null);
    setFormData({
      name: '',
      email: '',
      pin: '1234',
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
      pin: advisor.pin || '1234',
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
        a.id === editingAdvisor.id ? { ...a, ...formData, weeklyGoal: Number(formData.weeklyGoal) || 3200 } : a
      );
    } else {
      const newAdv = {
        id: `adv-${Date.now()}`,
        ...formData,
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
    if (window.confirm('¿Estás seguro de eliminar esta asesora?')) {
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
          <span>{store.advisors.length} Registradas</span>
        </div>

        <div className="pos-top-actions">
          <div style={{ display: 'flex', gap: '16px', marginRight: '8px', fontSize: '13px' }}>
            <span>Activas: <b>{activeCount}</b></span>
            <span>Meta Semanal Global: <b style={{ color: 'var(--orange-dark)' }}>{money(totalWeeklyGoal)}</b></span>
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

      {/* Advisors Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {store.advisors.map((advisor) => {
          const initials = advisor.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
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
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: advisor.isActive ? 'linear-gradient(135deg, var(--orange) 0%, var(--orange-dark) 100%)' : 'var(--line)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: '15px'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px', color: 'var(--ink)', display: 'block' }}>{advisor.name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {advisor.role === 'admin' ? 'Administradora' : 'Asesora de Ventas'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleActive(advisor)}
                  style={{
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    color: advisor.isActive ? '#16a34a' : '#94a3b8'
                  }}
                  title={advisor.isActive ? 'Desactivar asesora' : 'Activar asesora'}
                >
                  {advisor.isActive ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                </button>
              </div>

              <div style={{
                display: 'grid',
                gap: '8px',
                padding: '12px',
                borderRadius: '10px',
                background: 'var(--bg)',
                fontSize: '12px',
                color: 'var(--ink)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} style={{ color: 'var(--muted)' }} />
                  <span>{advisor.email || 'Sin correo asignado'}</span>
                </div>
                {advisor.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: 'var(--muted)' }} />
                    <span>{advisor.phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={14} style={{ color: 'var(--orange)' }} /> PIN Rápido:
                  </span>
                  <code style={{ background: 'var(--paper)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    {advisor.pin || '1234'}
                  </code>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={14} style={{ color: 'var(--orange)' }} /> Meta Semanal:
                  </span>
                  <b style={{ color: 'var(--orange-dark)' }}>{money(advisor.weeklyGoal || 3200)}</b>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => openEditModal(advisor)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit2 size={13} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(advisor.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
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
            maxWidth: '480px',
            border: '1px solid var(--line)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>
                {editingAdvisor ? 'Editar Asesora' : 'Crear Nueva Asesora'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gap: '14px' }}>
              <div className="pos-form-group">
                <label>Nombre de la Asesora *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Vicky, Karla, Mariela..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="pos-form-group">
                  <label>PIN de Acceso Rápido (4 Dígitos)</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="1234"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  />
                </div>
                <div className="pos-form-group">
                  <label>Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0991234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="pos-form-group">
                  <label>Meta Semanal ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.weeklyGoal}
                    onChange={(e) => setFormData({ ...formData, weeklyGoal: e.target.value })}
                  />
                </div>
                <div className="pos-form-group">
                  <label>Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="asesora">Asesora Comercial</option>
                    <option value="admin">Administradora</option>
                  </select>
                </div>
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
                  Guardar Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
