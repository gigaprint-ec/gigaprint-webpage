import React, { useState, useMemo } from 'react';
import {
  Printer,
  Scissors,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Zap,
  Flame,
  Shirt,
  Box,
  Cpu,
  Radio,
  Plus,
  Trash2,
  Eye,
  Check,
  X
} from 'lucide-react';
import {
  filterOrdersByWorkstationArea,
  updateOrderStationStage,
  logMaterialScrap,
  toISODate
} from '../../lib/posStore';

export function POSStationWorkspaces({
  store,
  setStore,
  session,
  activeStation = 'impresion', // 'impresion' | 'sublimacion' | 'corte_laser'
  onStationChange,
  onOpenWorkOrder
}) {
  const [station, setStation] = useState(activeStation);
  const [scrapModalOrder, setScrapModalOrder] = useState(null);
  const [scrapMaterialId, setScrapMaterialId] = useState(store.materials?.[0]?.id || '');
  const [scrapQuantityM2, setScrapQuantityM2] = useState('1.5');
  const [scrapReason, setScrapReason] = useState('Atasco de cabezal / Falla inyección');
  const [scrapNotes, setScrapNotes] = useState('');

  const currentStation = onStationChange ? activeStation : station;
  const setStationTab = onStationChange || setStation;

  // Filter orders for the active station
  const stationOrders = useMemo(() => {
    return filterOrdersByWorkstationArea(store.orders || [], currentStation);
  }, [store.orders, currentStation]);

  // Handle stage transition
  const handleUpdateStationStage = (orderId, stageName, note) => {
    const res = updateOrderStationStage(store, orderId, stageName, note, session?.id);
    if (res.ok) {
      setStore(res.updatedStore);
    }
  };

  // Handle Scrap Submit
  const handleSaveScrap = (e) => {
    e.preventDefault();
    const res = logMaterialScrap(store, {
      materialId: scrapMaterialId,
      quantityM2: Number(scrapQuantityM2),
      reason: scrapReason,
      notes: scrapNotes,
      advisorId: session?.id || ''
    });
    if (res.ok) {
      setStore(res.updatedStore);
      setScrapModalOrder(null);
      setScrapNotes('');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Station Selector Header */}
      <div className="pos-card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentStation === 'impresion' && <Printer size={22} style={{ color: '#2563eb' }} />}
              {currentStation === 'sublimacion' && <Flame size={22} style={{ color: '#db2777' }} />}
              {currentStation === 'corte_laser' && <Zap size={22} style={{ color: '#7c3aed' }} />}
              <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: 'var(--ink)' }}>
                {currentStation === 'impresion' && 'Estación de Impresión (Gran Formato & Digital)'}
                {currentStation === 'sublimacion' && 'Estación de Sublimación & Textil DTF'}
                {currentStation === 'corte_laser' && 'Estación de Corte Láser, CNC & Neón LED'}
              </h1>
              <span className="pos-nav-badge" style={{ background: '#f1f5f9', color: 'var(--ink)', fontSize: '11.5px', fontWeight: 800 }}>
                {stationOrders.length} en cola
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              Terminal de taller para operarios con avance de etapas táctil y parámetros técnicos en pantalla.
            </p>
          </div>

          {/* Station Switcher Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setStationTab('impresion')}
              style={{
                background: currentStation === 'impresion' ? '#2563eb' : '#fff',
                color: currentStation === 'impresion' ? '#fff' : 'var(--ink)',
                border: currentStation === 'impresion' ? '1px solid #2563eb' : '1px solid var(--line)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} /> Impresión
            </button>
            <button
              type="button"
              onClick={() => setStationTab('sublimacion')}
              style={{
                background: currentStation === 'sublimacion' ? '#db2777' : '#fff',
                color: currentStation === 'sublimacion' ? '#fff' : 'var(--ink)',
                border: currentStation === 'sublimacion' ? '1px solid #db2777' : '1px solid var(--line)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Flame size={14} /> Sublimación & DTF
            </button>
            <button
              type="button"
              onClick={() => setStationTab('corte_laser')}
              style={{
                background: currentStation === 'corte_laser' ? '#7c3aed' : '#fff',
                color: currentStation === 'corte_laser' ? '#fff' : 'var(--ink)',
                border: currentStation === 'corte_laser' ? '1px solid #7c3aed' : '1px solid var(--line)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={14} /> Corte Láser & CNC
            </button>
          </div>
        </div>
      </div>

      {/* Orders Station Queue */}
      <div style={{ display: 'grid', gap: '14px' }}>
        {stationOrders.length === 0 ? (
          <div className="pos-card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            <Box size={40} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--ink)' }}>No hay trabajos en cola para esta estación</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Los pedidos cotizados aparecerán aquí automáticamente según su sustrato.</p>
          </div>
        ) : (
          stationOrders.map((order) => {
            const isUrgent = order.productionPriority === 'urgente' || order.priority === 'urgente';

            return (
              <div
                key={order.id}
                className="pos-card"
                style={{
                  padding: '16px 20px',
                  borderLeft: `6px solid ${
                    currentStation === 'impresion' ? '#2563eb' : currentStation === 'sublimacion' ? '#db2777' : '#7c3aed'
                  }`
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--ink)' }}>
                        Orden #{order.orderNumber}
                      </span>
                      {isUrgent && (
                        <span style={{ fontSize: '10.5px', background: '#dc2626', color: '#fff', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                          🔥 URGENTE
                        </span>
                      )}
                      <span style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 700 }}>
                        · Cliente: <strong>{order.customerName}</strong>
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
                      {order.jobName || 'Trabajo Publicitario'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onOpenWorkOrder && onOpenWorkOrder(order)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={13} /> Ver OT
                    </button>
                    {order.artUrl && (
                      <a
                        href={order.artUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'var(--orange-soft)',
                          border: '1px solid var(--orange)',
                          color: 'var(--orange-dark)',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ExternalLink size={13} /> Vector Arte
                      </a>
                    )}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '12px 0' }} />

                {/* -----------------------------------------------------------
                    STATION-SPECIFIC TECHNICAL BOX
                    ----------------------------------------------------------- */}
                {currentStation === 'impresion' && (
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'grid',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#1e40af', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Printer size={14} /> Parámetros RIP & Impresión
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', fontSize: '12px', color: '#1e3a8a' }}>
                      <div><strong>Plotter Asignado:</strong> {order.machineAssigned || 'Flora 3.20m'}</div>
                      <div><strong>Perfil RIP:</strong> Generic Solvent Banner</div>
                      <div><strong>Resolución:</strong> 720 x 720 DPI (4 Pass)</div>
                      <div><strong>Margen Bastidor:</strong> +4cm blanco perimetral</div>
                    </div>
                  </div>
                )}

                {currentStation === 'sublimacion' && (
                  <div style={{
                    background: '#fdf2f8',
                    border: '1px solid #fbcfe8',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'grid',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#9d174d', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Flame size={14} /> Ficha Técnica de Termofijado & Confección
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', fontSize: '12px', color: '#831843' }}>
                      <div>🌡️ <strong>Temperatura:</strong> 185°C - 200°C</div>
                      <div>⏱️ <strong>Tiempo Plancha:</strong> 60 seg (Subli) / 15 seg (DTF)</div>
                      <div>🏋️ <strong>Presión:</strong> Media-Alta (5 Bar)</div>
                      <div>🧵 <strong>Relleno/Cierre:</strong> Plumón siliconado antialérgico</div>
                    </div>
                  </div>
                )}

                {currentStation === 'corte_laser' && (
                  <div style={{
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'grid',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#5b21b6', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Zap size={14} /> Parámetros Láser, Ruteado CNC & Test Neón LED
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', fontSize: '12px', color: '#4c1d95' }}>
                      <div>⚙️ <strong>Espesor Plancha:</strong> 3mm / 5mm Acrílico Cristal</div>
                      <div>⚡ <strong>Potencia / Velocidad:</strong> 65% Potencia / 14 mm/s</div>
                      <div>🔌 <strong>Transformador 12V:</strong> Probar continuidad y carga 15 min</div>
                      <div>🔩 <strong>Herrajes:</strong> Separadores Standoff 19x25mm</div>
                    </div>
                  </div>
                )}

                {/* Workflow Progression Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--muted)' }}>Avance Rápido:</span>
                    
                    {currentStation === 'impresion' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStationStage(order.id, 'en_maquina', 'Iniciado en plotter de impresión')}
                          style={{
                            background: order.stationStage === 'en_maquina' ? '#2563eb' : '#fff',
                            color: order.stationStage === 'en_maquina' ? '#fff' : '#2563eb',
                            border: '1px solid #2563eb',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          ▶ 1. En Máquina / RIP
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStationStage(order.id, 'en_secado', 'Impresión completada, en reposo/secado')}
                          style={{
                            background: order.stationStage === 'en_secado' ? '#0891b2' : '#fff',
                            color: order.stationStage === 'en_secado' ? '#fff' : '#0891b2',
                            border: '1px solid #0891b2',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          ⏳ 2. En Secado
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStationStage(order.id, 'armado', 'Enviado a mesa de acabados y ojetes')}
                          style={{
                            background: order.stationStage === 'armado' ? '#7c3aed' : '#fff',
                            color: order.stationStage === 'armado' ? '#fff' : '#7c3aed',
                            border: '1px solid #7c3aed',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          ✂️ 3. A Acabados / Ojetes
                        </button>
                      </>
                    )}

                    {currentStation === 'sublimacion' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStationStage(order.id, 'en_maquina', 'En plancha térmica / calandra')}
                          style={{
                            background: order.stationStage === 'en_maquina' ? '#db2777' : '#fff',
                            color: order.stationStage === 'en_maquina' ? '#fff' : '#db2777',
                            border: '1px solid #db2777',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          🔥 1. Planchando
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStationStage(order.id, 'armado', 'En costura, relleno y confección')}
                          style={{
                            background: order.stationStage === 'armado' ? '#9333ea' : '#fff',
                            color: order.stationStage === 'armado' ? '#fff' : '#9333ea',
                            border: '1px solid #9333ea',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          🧵 2. Confección / Relleno
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStationStage(order.id, 'aprobado_qc', 'Empaque individual listo')}
                          style={{
                            background: order.stationStage === 'aprobado_qc' ? '#16a34a' : '#fff',
                            color: order.stationStage === 'aprobado_qc' ? '#fff' : '#16a34a',
                            border: '1px solid #16a34a',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          📦 3. Empaque Listo
                        </button>
                      </>
                    )}

                    {currentStation === 'corte_laser' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStationStage(order.id, 'en_maquina', 'En mesa de corte láser / CNC')}
                          style={{
                            background: order.stationStage === 'en_maquina' ? '#7c3aed' : '#fff',
                            color: order.stationStage === 'en_maquina' ? '#fff' : '#7c3aed',
                            border: '1px solid #7c3aed',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          ⚙️ 1. En Láser / CNC
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStationStage(order.id, 'armado', 'En pulido y soldadura Neón')}
                          style={{
                            background: order.stationStage === 'armado' ? '#d97706' : '#fff',
                            color: order.stationStage === 'armado' ? '#fff' : '#d97706',
                            border: '1px solid #d97706',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          💡 2. Pulido / Armado
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStationStage(order.id, 'aprobado_qc', 'Test eléctrico aprobado')}
                          style={{
                            background: order.stationStage === 'aprobado_qc' ? '#16a34a' : '#fff',
                            color: order.stationStage === 'aprobado_qc' ? '#fff' : '#16a34a',
                            border: '1px solid #16a34a',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          ✅ 3. Calidad Aprobada
                        </button>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setScrapModalOrder(order)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                      title="Registrar merma o fallo técnico"
                    >
                      ⚠️ Merma / Scrap
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ----------------------------------------------------------------------
          MODAL: REGISTRAR MERMA / SCRAP TÉCNICO
          ---------------------------------------------------------------------- */}
      {scrapModalOrder && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} style={{ color: '#dc2626' }} />
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 900 }}>
                  Registrar Merma Técnica
                </h2>
              </div>
              <button type="button" onClick={() => setScrapModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveScrap} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label className="pos-label">Sustrato Afectado</label>
                <select
                  className="pos-select"
                  value={scrapMaterialId}
                  onChange={(e) => setScrapMaterialId(e.target.value)}
                >
                  {(store.materials || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.currentStock} {m.unit} en stock)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px' }}>
                <div>
                  <label className="pos-label">Cantidad (m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="pos-input"
                    value={scrapQuantityM2}
                    onChange={(e) => setScrapQuantityM2(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="pos-label">Causa del Desperdicio</label>
                  <select
                    className="pos-select"
                    value={scrapReason}
                    onChange={(e) => setScrapReason(e.target.value)}
                  >
                    <option value="Atasco de cabezal / Falla inyección">Atasco de cabezal / Falla inyección</option>
                    <option value="Arruga en sustrato / Tensión">Arruga en sustrato / Tensión</option>
                    <option value="Error de archivo / Medidas">Error de archivo / Medidas</option>
                    <option value="Falla en termo-fijado / Temperatura">Falla en termo-fijado / Temperatura</option>
                    <option value="Corte láser descalibrado">Corte láser descalibrado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="pos-label">Notas Adicionales</label>
                <textarea
                  className="pos-input"
                  rows={2}
                  value={scrapNotes}
                  onChange={(e) => setScrapNotes(e.target.value)}
                  placeholder="Detalle técnico de lo ocurrido..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="pos-nav-tab"
                  onClick={() => setScrapModalOrder(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="pos-submit-order-btn"
                  style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                >
                  Descontar Merma de Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
