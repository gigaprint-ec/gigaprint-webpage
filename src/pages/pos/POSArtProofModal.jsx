import React, { useState } from 'react';
import { X, Eye, Check, MessageCircle, Link, CheckCircle2, Sparkles } from 'lucide-react';
import { approveOrderArtProof } from '../../lib/posStore';

export function POSArtProofModal({ order, store, setStore, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const [artUrl, setArtUrl] = useState(order.artUrl || '');
  const [approverName, setApproverName] = useState(order.customerName || '');

  const handleSaveAndApprove = () => {
    const nextState = approveOrderArtProof(store, order.id, artUrl, approverName);
    setStore(nextState);
    onClose();
  };

  const handleSendWhatsAppProof = () => {
    const phone = (order.customerPhone || '').replace(/[^0-9]/g, '');
    const clean = phone.startsWith('0') ? '593' + phone.substring(1) : phone.startsWith('593') ? phone : '593' + phone;
    
    let msg = '*GIGAPRINT — APROBACIÓN DE ARTE & DISEÑO*\n';
    msg += '================================\n';
    msg += 'Hola *' + order.customerName + '*, adjuntamos la vista previa / boceto para tu trabajo: *' + order.jobName + '* (Orden #' + order.orderNumber + ').\n\n';
    if (artUrl) {
      msg += '🔗 *Enlace de Revisión de Arte:* ' + artUrl + '\n\n';
    }
    msg += 'Por favor revisa que textos, teléfonos, medidas y diseño estén correctos y confírmanos con un *"APROBADO"* para iniciar la impresión.\n\n';
    msg += '¡Gracias por confiar en Gigaprint! 🚀';

    window.open('https://wa.me/' + clean + '?text=' + encodeURIComponent(msg), '_blank');
  };

  return (
    <div className="pos-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="pos-modal-content" style={{
        background: 'var(--paper)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        border: '1px solid var(--line)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        display: 'grid',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={20} color="var(--orange)" />
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'var(--ink)' }}>
              Aprobación de Arte — #{order.orderNumber}
            </h3>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div>
          <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block' }}>{order.jobName}</strong>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Cliente: {order.customerName}</span>
        </div>

        {/* Current status pill */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: order.artApproved ? '#dcfce7' : '#fef3c7',
          border: '1px solid ' + (order.artApproved ? '#86efac' : '#fde68a'),
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: order.artApproved ? '#166534' : '#92400e',
          fontWeight: '700'
        }}>
          {order.artApproved ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
          <span>
            {order.artApproved
              ? 'Arte aprobado por ' + (order.artApprovedBy || 'Cliente') + ' (' + (order.artApprovedAt ? order.artApprovedAt.substring(0, 10) : 'Registrado') + ')'
              : 'Arte pendiente de aprobación del cliente'}
          </span>
        </div>

        {/* Art URL input */}
        <div style={{ display: 'grid', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>
            URL del Arte / Boceto (Google Drive, WeTransfer, Link directo):
          </label>
          <div style={{ position: 'relative' }}>
            <Link size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--muted)' }} />
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={artUrl}
              onChange={(e) => setArtUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                fontSize: '13px',
                color: 'var(--ink)'
              }}
            />
          </div>
        </div>

        {/* Live Preview if image URL */}
        {artUrl && (artUrl.includes('.jpg') || artUrl.includes('.png') || artUrl.includes('.webp') || artUrl.includes('.jpeg')) && (
          <div style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--line)', background: '#000', display: 'flex', justifyContent: 'center' }}>
            <img src={artUrl} alt="Vista previa del arte" style={{ maxHeight: '180px', objectFit: 'contain' }} />
          </div>
        )}

        {/* Approver Name input */}
        <div style={{ display: 'grid', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>Nombre de quien aprueba el arte:</label>
          <input
            type="text"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--bg)',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={handleSendWhatsAppProof}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 0,
              background: '#25D366',
              color: '#fff',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <MessageCircle size={16} /> Enviar Boceto por WhatsApp al Cliente
          </button>

          <button
            type="button"
            onClick={handleSaveAndApprove}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: 0,
              background: 'var(--orange)',
              color: '#fff',
              fontWeight: '900',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Check size={16} /> Marcar como Arte Aprobado & Pasar a Impresión
          </button>
        </div>
      </div>
    </div>
  );
}
