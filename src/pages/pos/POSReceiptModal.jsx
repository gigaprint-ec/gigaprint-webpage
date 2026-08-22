import React from 'react';
import { X, Printer, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export function POSReceiptModal({ order, items = [], advisor, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const money = (val) => `$${(Number(val) || 0).toFixed(2)}`;

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = (phone = '') => {
    let p = (phone || '').replace(/[^0-9]/g, '');
    if (!p) return '';
    if (p.startsWith('0')) p = '593' + p.substring(1);
    if (!p.startsWith('593')) p = '593' + p;
    return p;
  };

  const getWhatsAppMessage = () => {
    const lines = [
      `*GIGAPRINT — COMPROBANTE DE VENTA # ${order.orderNumber}*`,
      `================================`,
      `*Cliente:* ${order.customerName}`,
      order.customerIdentification ? `*RUC/CI:* ${order.customerIdentification}` : null,
      `*Trabajo:* ${order.jobName}`,
      `*Fecha:* ${order.orderDate} | *Entrega:* ${order.deliveryDate || 'Por coordinar'}`,
      `*Asesora:* ${advisor?.name || 'Ventas'}`,
      `================================`,
      `*DETALLE:*`
    ];

    items.forEach((it, idx) => {
      const dim = it.width_cm && it.height_cm ? ` (${it.width_cm}x${it.height_cm} cm)` : it.widthCm && it.heightCm ? ` (${it.widthCm}x${it.heightCm} cm)` : '';
      const finish = it.finishing && it.finishing !== 'none' ? ` [${it.finishing}]` : '';
      lines.push(`${idx + 1}. ${it.product_name || it.productName}${dim} x${it.quantity || 1} -> ${money(it.total_price || it.totalPrice)}`);
    });

    lines.push(`================================`);
    lines.push(`*Total Venta:* ${money(order.totalAmount)}`);
    lines.push(`*Abonado:* ${money(order.depositAmount)}`);
    lines.push(`*Saldo por Pagar:* ${money(order.balanceDue)}`);
    lines.push(`================================`);
    lines.push(`¡Gracias por confiar en Gigaprint — Tus ideas en grande! 🚀`);

    return encodeURIComponent(lines.filter(Boolean).join('\n'));
  };

  const handleWhatsApp = () => {
    const phone = cleanPhone(order.customerPhone || '');
    const msg = getWhatsAppMessage();
    if (!phone || phone === '593') {
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    } else {
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="pos-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
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
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--line)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Top Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--line)'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--orange-dark)', textTransform: 'uppercase' }}>
            Comprobante / Proforma #{order.orderNumber}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="pos-printable-receipt" style={{ padding: '24px', background: '#fff', color: '#18181b', fontFamily: 'monospace' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#ea580c' }}>GIGAPRINT</h2>
            <p style={{ margin: '2px 0', fontSize: '11px', fontWeight: 700 }}>Tus ideas en grande</p>
            <p style={{ margin: '2px 0', fontSize: '11px' }}>Quito, Ecuador · Tel: 099 000 0000</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 800 }}>ORDEN # {order.orderNumber}</p>
          </div>

          <div style={{ borderTop: '1px dashed #71717a', borderBottom: '1px dashed #71717a', padding: '10px 0', fontSize: '11px', display: 'grid', gap: '4px' }}>
            <div><b>Cliente:</b> {order.customerName}</div>
            {order.customerIdentification && <div><b>CI/RUC:</b> {order.customerIdentification}</div>}
            {order.customerPhone && <div><b>Teléfono:</b> {order.customerPhone}</div>}
            <div><b>Trabajo:</b> {order.jobName}</div>
            <div><b>Fecha:</b> {order.orderDate} | <b>Entrega:</b> {order.deliveryDate || 'Por coordinar'}</div>
            <div><b>Asesora:</b> {advisor?.name || 'Ventas'}</div>
          </div>

          <div style={{ margin: '14px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #d4d4d8', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '6px' }}>Cant</th>
                  <th style={{ paddingBottom: '6px' }}>Descripción</th>
                  <th style={{ paddingBottom: '6px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px dotted #e4e4e7' }}>
                    <td style={{ padding: '6px 0', verticalAlign: 'top' }}>{it.quantity || 1}</td>
                    <td style={{ padding: '6px 0' }}>
                      <b>{it.product_name || it.productName}</b>
                      {it.width_cm && it.height_cm && <div style={{ fontSize: '10px', color: '#71717a' }}>{it.width_cm} × {it.height_cm} cm</div>}
                      {it.finishing && it.finishing !== 'none' && <div style={{ fontSize: '10px', color: '#ea580c' }}>Acabado: {it.finishing}</div>}
                    </td>
                    <td style={{ padding: '6px 0', textAlign: 'right', verticalAlign: 'top', fontWeight: 700 }}>
                      {money(it.total_price || it.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: '1px dashed #71717a', paddingTop: '10px', fontSize: '12px', display: 'grid', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <b>{money(order.subtotal)}</b>
            </div>
            {Number(order.taxAmount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IVA (15%):</span>
                <b>{money(order.taxAmount)}</b>
              </div>
            )}
            {Number(order.shippingCost) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Envío / Flete:</span>
                <b>{money(order.shippingCost)}</b>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, borderTop: '1px solid #18181b', paddingTop: '6px' }}>
              <span>TOTAL VENTA:</span>
              <span style={{ color: '#ea580c' }}>{money(order.totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 700 }}>
              <span>Abonado Entrada:</span>
              <span>{money(order.depositAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: Number(order.balanceDue) > 0 ? '#dc2626' : '#16a34a', fontWeight: 800 }}>
              <span>SALDO PENDIENTE:</span>
              <span>{money(order.balanceDue)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: '#71717a' }}>
            <p style={{ margin: 0 }}>Valores sujetos a confirmación de especificaciones.</p>
            <p style={{ margin: '4px 0 0', fontWeight: 700 }}>¡Gracias por su preferencia!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--line)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          background: 'var(--bg)'
        }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: '1.5px solid var(--line)',
              background: 'var(--paper)',
              color: 'var(--ink)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Printer size={16} /> Imprimir Ticket
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: 0,
              background: '#22c55e',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <MessageCircle size={16} /> Enviar a WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
