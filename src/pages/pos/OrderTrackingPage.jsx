import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layout,
  Eye,
  Printer,
  Scissors,
  CheckSquare,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  MessageCircle,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  loadPOSStore,
  fetchRemotePOSStore,
  getOrderPublicTracking,
  approveOrderArtProof
} from '../../lib/posStore';

export function OrderTrackingPage() {
  const { trackingToken } = useParams();
  const [store, setStore] = useState(loadPOSStore());
  const [isApproving, setIsApproving] = useState(false);
  const [approvalName, setApprovalName] = useState('');
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  useEffect(() => {
    fetchRemotePOSStore().then(setStore);
  }, []);

  const orderData = useMemo(() => {
    return getOrderPublicTracking(store, trackingToken);
  }, [store, trackingToken]);

  const stages = [
    { id: 'preprensa', label: '1. Diseño & Pre-prensa', icon: Layout, desc: 'Revisión técnica de archivos y preparación para máquinas' },
    { id: 'aprobacion_arte', label: '2. Aprobación de Boceto', icon: Eye, desc: 'Esperando visto bueno de arte o boceto digital' },
    { id: 'impresion', label: '3. En Cola de Impresión', icon: Printer, desc: 'Imprimiendo en plotter gran formato / cama plana' },
    { id: 'acabados', label: '4. Acabados & Confección', icon: Scissors, desc: 'Ojales, dobladillos, laminado o corte' },
    { id: 'control_calidad', label: '5. Control de Calidad', icon: CheckSquare, desc: 'Inspección de color, medidas y embalaje' },
    { id: 'listo', label: '6. Listo para Retirar', icon: Package, desc: 'Disponible en mostrador o preparado para despacho' },
    { id: 'entregado', label: '7. Entregado con Éxito', icon: CheckCircle2, desc: 'Trabajo retirado o entregado a satisfacción' }
  ];

  const currentStageIndex = orderData ? stages.findIndex((s) => s.id === orderData.productionStage) : 0;
  const isReady = orderData?.productionStage === 'listo' || orderData?.productionStage === 'entregado';

  const handleApproveArt = (e) => {
    e.preventDefault();
    if (!approvalName.trim()) return alert('Por favor ingresa tu nombre para registrar la aprobación.');

    const order = (store.orders || []).find(
      (o) => String(o.trackingToken).toLowerCase() === String(trackingToken).toLowerCase() || String(o.orderNumber) === String(trackingToken)
    );

    if (!order) return;

    const res = approveOrderArtProof(store, order.id, approvalName.trim());
    if (res.ok) {
      setStore(res.updatedStore);
      setApprovedSuccess(true);
      setIsApproving(false);
    }
  };

  if (!orderData) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '450px', textAlign: 'center', background: 'var(--paper)', padding: '30px', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <AlertCircle size={48} style={{ color: 'var(--orange)', margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--ink)', margin: '0 0 8px' }}>
            Trabajo no encontrado
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
            No pudimos encontrar un pedido con el código <b>{trackingToken}</b>. Verifica el enlace enviado por WhatsApp o consulta a tu asesora.
          </p>
          <Link to="/" style={{ display: 'inline-flex', marginTop: '16px', color: 'var(--orange)', fontWeight: 800, textDecoration: 'none' }}>
            Volver a Gigaprint.ec
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 16px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--paper)', padding: '8px 20px', borderRadius: '999px', border: '1px solid var(--line)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px' }}>G</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--ink)' }}>Gigaprint • Seguimiento de Trabajo</span>
          </div>
        </div>

        {/* Hero Order Status Card */}
        <div style={{
          background: 'var(--paper)',
          borderRadius: '20px',
          border: '1px solid var(--line)',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          display: 'grid',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Orden de Producción #{orderData.orderNumber}
              </span>
              <h1 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 900, color: 'var(--ink)' }}>
                {orderData.jobName}
              </h1>
              <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>
                Cliente: <b>{orderData.customerName}</b> • Asesora: <b>{orderData.advisorName}</b>
              </span>
            </div>

            <div style={{
              padding: '8px 16px',
              borderRadius: '999px',
              background: isReady ? '#dcfce7' : 'var(--orange-soft)',
              color: isReady ? '#166534' : 'var(--orange-dark)',
              fontSize: '13px',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {isReady ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              <span>{stages[currentStageIndex]?.label || orderData.productionStage}</span>
            </div>
          </div>

          {/* Delivery Date & Pickup Alert Banner */}
          {isReady ? (
            <div style={{ padding: '16px 20px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Package size={32} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '15px', color: '#166534', display: 'block' }}>
                  🎉 ¡Tu trabajo ya está listo para retirar!
                </strong>
                <span style={{ fontSize: '13px', color: '#15803d' }}>
                  Puedes pasar a retirarlo en nuestro local con tu <b>PIN #{orderData.pickupPin || '1234'}</b> o presentar esta pantalla en caja.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--orange)' }} />
                <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 700 }}>
                  Fecha Estimada de Entrega:
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--ink)', fontFamily: 'Space Grotesk' }}>
                {orderData.deliveryDate || 'Hoy'}
              </strong>
            </div>
          )}

          {/* Stepper Timeline */}
          <div style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              Progreso en Taller
            </h3>

            <div style={{ display: 'grid', gap: '10px' }}>
              {stages.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const IconComponent = stage.icon;

                return (
                  <div
                    key={stage.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isCurrent ? 'var(--orange-soft)' : (isPassed ? '#f8fafc' : 'transparent'),
                      border: isCurrent ? '1.5px solid var(--orange)' : '1px solid var(--line)',
                      opacity: (isPassed || isCurrent) ? 1 : 0.45,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isCurrent ? 'var(--orange)' : (isPassed ? '#16a34a' : 'var(--bg)'),
                      color: (isCurrent || isPassed) ? '#fff' : 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent size={18} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: isCurrent ? 'var(--orange-dark)' : 'var(--ink)' }}>
                        {stage.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {stage.desc}
                      </div>
                    </div>

                    {isPassed && <CheckCircle2 size={18} style={{ color: '#16a34a' }} />}
                    {isCurrent && (
                      <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--orange-dark)', textTransform: 'uppercase' }}>
                        En curso
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Artwork Proof Approval Card (If applicable) */}
        {orderData.artUrl && (
          <div style={{
            background: 'var(--paper)',
            borderRadius: '20px',
            border: '1px solid var(--line)',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            display: 'grid',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} style={{ color: 'var(--orange)' }} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: 'var(--ink)' }}>
                  Boceto & Arte para Aprobación
                </h3>
              </div>

              {orderData.artApproved ? (
                <span style={{ padding: '4px 12px', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <FileCheck size={15} /> Arte Aprobado
                </span>
              ) : (
                <span style={{ padding: '4px 12px', borderRadius: '999px', background: '#fef3c7', color: '#b45309', fontSize: '12px', fontWeight: 900 }}>
                  ⚠️ Requiere tu Aprobación
                </span>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: '1.5' }}>
              Por favor revisa cuidadosamente ortografía, teléfonos, colores y medidas antes de autorizar la impresión.
            </p>

            {/* Art Preview */}
            <div style={{ textAlign: 'center', background: '#000', borderRadius: '12px', overflow: 'hidden', padding: '10px', maxHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={orderData.artUrl}
                alt="Boceto Gigaprint"
                style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={orderData.artUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={15} /> Ver Arte en Alta Resolución
              </a>

              {!orderData.artApproved && (
                <button
                  type="button"
                  onClick={() => setIsApproving(true)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileCheck size={16} /> ✅ Aprobar Boceto Ahora
                </button>
              )}
            </div>

            {/* Approval Modal Prompt */}
            {isApproving && (
              <form onSubmit={handleApproveArt} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1.5px solid #16a34a', display: 'grid', gap: '12px' }}>
                <strong style={{ fontSize: '14px', color: '#166534' }}>Confirmación de Aprobación de Arte:</strong>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                  Al presionar confirmar, autorizas a Gigaprint a mandar tu archivo a las máquinas de impresión sin modificaciones posteriores.
                </p>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Tu Nombre y Apellido:</label>
                  <input
                    type="text"
                    className="pos-input"
                    value={approvalName}
                    onChange={(e) => setApprovalName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" className="pos-nav-tab" onClick={() => setIsApproving(false)}>
                    Cancelar
                  </button>
                  <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                    Confirmar y Autorizar
                  </button>
                </div>
              </form>
            )}

            {approvedSuccess && (
              <div style={{ padding: '12px', borderRadius: '10px', background: '#dcfce7', color: '#166534', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> ¡Excelente! Tu visto bueno ha sido registrado y el taller iniciará la impresión.
              </div>
            )}
          </div>
        )}

        {/* Work Details & Products */}
        <div style={{
          background: 'var(--paper)',
          borderRadius: '20px',
          border: '1px solid var(--line)',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          display: 'grid',
          gap: '14px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: 'var(--ink)' }}>
            Detalle del Trabajo
          </h3>

          <div style={{ display: 'grid', gap: '10px' }}>
            {orderData.items.map((itm, idx) => (
              <div key={idx} style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{itm.productName}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    {itm.widthCm && itm.heightCm ? `📐 Medidas: ${itm.widthCm}cm x ${itm.heightCm}cm • ` : ''}
                    {itm.finishing ? `✂️ ${itm.finishing}` : ''}
                  </div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)' }}>
                  Cantidad: {itm.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup Location & Contact */}
        <div style={{
          background: 'var(--paper)',
          borderRadius: '20px',
          border: '1px solid var(--line)',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          display: 'grid',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} style={{ color: 'var(--orange)' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: 'var(--ink)' }}>
              Lugar de Retiro & Horarios
            </h3>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--ink)', margin: 0, fontWeight: 700 }}>
            📍 {orderData.pickupLocation}
          </p>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            🕒 Horario de atención: Lunes a Viernes de 8:30 a 18:00 • Sábados de 9:00 a 14:00
          </span>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <a
              href="https://maps.google.com/?q=Gigaprint+Quito"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                fontSize: '12px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MapPin size={14} /> Abrir en Google Maps
            </a>
            <a
              href={`https://wa.me/593987654321?text=${encodeURIComponent(`Hola, quisiera consultar sobre mi orden #${orderData.orderNumber}`)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                background: '#16a34a',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageCircle size={14} /> Contactar a mi Asesora
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
