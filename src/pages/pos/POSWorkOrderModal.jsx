import React from 'react';
import { X, Printer, Wrench } from 'lucide-react';

export function POSWorkOrderModal({ order, items = [], advisor, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const trackingToken = order.trackingToken || order.orderNumber;
  const trackingUrl = `https://gigaprint-ec.github.io/gigaprint-webpage/seguimiento/${trackingToken}`;
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(trackingUrl)}&size=90&margin=1`;

  const handlePrint = () => {
    window.print();
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
        background: '#fff',
        color: '#000',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        display: 'grid',
        gap: '16px'
      }}>
        {/* Top Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="#ea580c" />
            <strong style={{ fontSize: '16px', color: '#0f172a' }}>Hoja de Producción de Taller (Work Order)</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 0,
                background: '#ea580c',
                color: '#fff',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={15} /> Imprimir Hoja
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Production Sheet */}
        <div className="printable-work-order" style={{ display: 'grid', gap: '14px', fontFamily: 'Arial, sans-serif' }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>GIGAPRINT — TALLER</h1>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold' }}>ORDEN DE TRABAJO & ESPECIFICACIONES TÉCNICAS</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={qrCodeUrl}
                alt="QR Tracking"
                style={{ width: '65px', height: '65px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px' }}
              />
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>NRO. DE ORDEN</span>
                <strong style={{ fontSize: '22px', fontWeight: '900', color: '#ea580c' }}>#{order.orderNumber}</strong>
              </div>
            </div>
          </div>

          {/* Job Details Meta Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>TRABAJO</span>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{order.jobName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>CLIENTE</span>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{order.customerName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>FECHA DE INGRESO</span>
              <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{order.orderDate}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>FECHA DE ENTREGA COMPROMETIDA</span>
              <strong style={{ fontSize: '14px', color: '#dc2626' }}>{order.deliveryDate || 'Por coordinar'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>ASESORA COMERCIAL</span>
              <span style={{ fontSize: '13px', color: '#0f172a' }}>{advisor?.name || 'Ventas'}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>ESTADO DE ARTE</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: order.artApproved ? '#16a34a' : '#d97706' }}>
                {order.artApproved ? '✓ ARTE APROBADO' : '⚠ ARTE PENDIENTE DE REVISIÓN'}
              </span>
            </div>
          </div>

          {/* Technical Items Table */}
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase' }}>
              Productos & Acabados a Fabricar:
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#fff' }}>
                  <th style={{ padding: '8px', border: '1px solid #0f172a' }}>#</th>
                  <th style={{ padding: '8px', border: '1px solid #0f172a' }}>Producto / Sustrato</th>
                  <th style={{ padding: '8px', border: '1px solid #0f172a' }}>Medidas (cm)</th>
                  <th style={{ padding: '8px', border: '1px solid #0f172a' }}>Área m²</th>
                  <th style={{ padding: '8px', border: '1px solid #0f172a' }}>Cant.</th>
                  <th style={{ padding: '8px', border: '1px solid #0f172a' }}>Acabados / Confección</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{idx + 1}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                      {it.product_name || it.productName}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                      {it.width_cm && it.height_cm ? it.width_cm + ' x ' + it.height_cm + ' cm' : it.widthCm && it.heightCm ? it.widthCm + ' x ' + it.heightCm + ' cm' : 'Unidad'}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                      {it.area_m2 ? Number(it.area_m2).toFixed(2) + ' m²' : it.areaM2 ? Number(it.areaM2).toFixed(2) + ' m²' : '-'}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                      {it.quantity || 1}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#ea580c' }}>
                      {it.finishing === 'ojales_pequenos' ? 'Ojales Pequeños (' + (it.eyelet_count || it.eyeletCount || 4) + ' unid)' :
                       it.finishing === 'ojales_grandes' ? 'Ojales Grandes (' + (it.eyelet_count || it.eyeletCount || 4) + ' unid)' :
                       it.finishing === 'bolsillo' ? 'Bolsillo para Tubo (Arriba y Abajo)' :
                       it.finishing === 'none' || !it.finishing ? 'Al ras / Sin confección' : it.finishing}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Technical Production Notes */}
          {order.productionNotes && (
            <div style={{ padding: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '12px' }}>
              <strong>Instrucciones Especiales del Taller:</strong> {order.productionNotes}
            </div>
          )}

          {/* Machine Operator Sign-off checkboxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '2px dashed #cbd5e1', fontSize: '11px' }}>
            <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontWeight: 'bold' }}>1. IMPRESIÓN</span>
              <div style={{ height: '24px' }}></div>
              <span style={{ color: '#64748b' }}>Firma / Operador</span>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontWeight: 'bold' }}>2. ACABADOS / OJALES</span>
              <div style={{ height: '24px' }}></div>
              <span style={{ color: '#64748b' }}>Firma / Confección</span>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontWeight: 'bold' }}>3. CONTROL CALIDAD</span>
              <div style={{ height: '24px' }}></div>
              <span style={{ color: '#64748b' }}>Firma / Inspector</span>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontWeight: 'bold' }}>4. ENTREGA / DESPACHO</span>
              <div style={{ height: '24px' }}></div>
              <span style={{ color: '#64748b' }}>Firma / Despacho</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
