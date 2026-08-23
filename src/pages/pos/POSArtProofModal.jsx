import React, { useState, useRef } from 'react';
import {
  X,
  Eye,
  Check,
  MessageCircle,
  Link,
  CheckCircle2,
  Sparkles,
  PenTool,
  RotateCcw,
  ShieldCheck,
  Download
} from 'lucide-react';
import { approveOrderArtProof } from '../../lib/posStore';

export function POSArtProofModal({ order, store, setStore, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const [artUrl, setArtUrl] = useState(order.artUrl || '');
  const [approverName, setApproverName] = useState(order.customerName || '');
  const [confirmedSpecs, setConfirmedSpecs] = useState(true);
  const [confirmedSpelling, setConfirmedSpelling] = useState(true);
  const [hasSignature, setHasSignature] = useState(false);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const startDrawing = (e) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

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
    msg += `Hola *${order.customerName}*, adjuntamos la vista previa / boceto para tu trabajo: *${order.jobName}* (Orden #${order.orderNumber}).\n\n`;
    if (artUrl) {
      msg += `🔗 *Enlace de Revisión de Arte:* ${artUrl}\n\n`;
    }
    msg += 'Por favor revisa que textos, teléfonos, medidas y diseño estén correctos y confírmanos con un *"APROBADO"* para iniciar la impresión.\n\n';
    msg += '¡Gracias por confiar en Gigaprint! 🚀';

    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
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
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        border: '1px solid var(--line)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        display: 'grid',
        gap: '14px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
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
              ? `Arte aprobado por ${order.artApprovedBy || 'Cliente'} (${order.artApprovedAt ? order.artApprovedAt.substring(0, 10) : 'Registrado'})`
              : 'Arte pendiente de aprobación del cliente'}
          </span>
        </div>

        {/* Art URL input */}
        <div style={{ display: 'grid', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)' }}>
            URL del Arte / Boceto (Cloud Storage, Drive, Enlace directo):
          </label>
          <div style={{ position: 'relative' }}>
            <Link size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--muted)' }} />
            <input
              type="text"
              value={artUrl}
              onChange={(e) => setArtUrl(e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* In-Person Verification Checklist */}
        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--line)', display: 'grid', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink)' }}>
            ✓ Checklist de Conformidad Técnica:
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={confirmedSpecs}
              onChange={(e) => setConfirmedSpecs(e.target.checked)}
            />
            <span>Medidas (m²), orientación y sustrato verificados y correctos.</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={confirmedSpelling}
              onChange={(e) => setConfirmedSpelling(e.target.checked)}
            />
            <span>Textos, números telefónicos, ortografía y colores revisados.</span>
          </label>
        </div>

        {/* Digital Signature Canvas for in-person customer approval */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PenTool size={14} color="var(--orange)" /> Firma Digital del Cliente (Táctil / Mouse):
            </label>
            <button
              type="button"
              onClick={clearSignature}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RotateCcw size={12} /> Limpiar Firma
            </button>
          </div>

          <canvas
            ref={canvasRef}
            width={480}
            height={100}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              width: '100%',
              height: '100px',
              background: '#fff',
              border: '1.5px dashed var(--line)',
              borderRadius: '10px',
              touchAction: 'none',
              cursor: 'crosshair',
              display: 'block'
            }}
          />
        </div>

        {/* Approver Name */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
            Nombre de la Persona que Aprueba:
          </label>
          <input
            type="text"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--bg)',
              fontSize: '13px',
              boxSizing: 'border-box'
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
            disabled={!confirmedSpecs || !confirmedSpelling}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: 0,
              background: confirmedSpecs && confirmedSpelling ? 'var(--orange)' : '#94a3b8',
              color: '#fff',
              fontWeight: '900',
              fontSize: '13px',
              cursor: confirmedSpecs && confirmedSpelling ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Check size={16} /> Confirmar Aprobación & Pasar a Cola de Impresión
          </button>
        </div>
      </div>
    </div>
  );
}
