import React, { useState, useMemo } from 'react';
import { User, Store, Maximize2, Shield, Sparkles, Check, Info } from 'lucide-react';

export function LiveScaleVisualizer({
  widthCm = 200,
  heightCm = 100,
  eyeletMode = '4-corners', // 'none', '4-corners', 'perimeter-50', 'perimeter-30', 'custom'
  customEyeletCount = 0,
  productName = 'Lona Publicitaria',
  category = 'Gran formato'
}) {
  const [viewMode, setViewMode] = useState('person'); // 'person', 'storefront', 'technical'

  // Dimensions in meters
  const widthM = Math.max(0.1, Number(widthCm) / 100);
  const heightM = Math.max(0.1, Number(heightCm) / 100);
  const areaM2 = (widthM * heightM).toFixed(2);

  // Aspect ratio description
  const aspectRatioText = useMemo(() => {
    const ratio = widthM / heightM;
    if (Math.abs(ratio - 1) < 0.1) return '1:1 Cuadrado';
    if (ratio >= 2.5) return `${ratio.toFixed(1)}:1 Ultra Panorámico`;
    if (ratio >= 1.7) return '16:9 Panorámico';
    if (ratio >= 1.3) return '4:3 Horizontal';
    if (ratio <= 0.6) return 'Vertical / Pendón';
    return `${widthM.toFixed(1)}m × ${heightM.toFixed(1)}m`;
  }, [widthM, heightM]);

  // Viewport scaling constants
  const maxViewHeightM = 3.0; // 3 meters height viewport
  const maxViewWidthM = 5.0; // 5 meters width viewport

  // Calculate proportional visual sizes
  const scalePercentY = Math.min(85, (heightM / maxViewHeightM) * 75);
  const scalePercentX = Math.min(85, (widthM / maxViewWidthM) * 75);

  // Human height scale (1.75m)
  const personHeightPercent = (1.75 / maxViewHeightM) * 75;

  // Eyelets calculation
  const eyeletPoints = useMemo(() => {
    if (eyeletMode === 'none') return [];
    if (eyeletMode === '4-corners') {
      return [
        { top: '6px', left: '6px' },
        { top: '6px', right: '6px' },
        { bottom: '6px', left: '6px' },
        { bottom: '6px', right: '6px' }
      ];
    }
    if (eyeletMode === 'perimeter-50' || eyeletMode === 'perimeter-30') {
      const step = eyeletMode === 'perimeter-50' ? 50 : 30;
      const points = [];
      const cols = Math.max(2, Math.round(widthCm / step) + 1);
      const rows = Math.max(2, Math.round(heightCm / step) + 1);

      // Top & Bottom edges
      for (let i = 0; i < cols; i++) {
        const pct = (i / (cols - 1)) * 100;
        points.push({ top: '6px', left: `calc(${pct}% - 4px)` });
        points.push({ bottom: '6px', left: `calc(${pct}% - 4px)` });
      }
      // Left & Right edges (excluding corners)
      for (let j = 1; j < rows - 1; j++) {
        const pct = (j / (rows - 1)) * 100;
        points.push({ top: `calc(${pct}% - 4px)`, left: '6px' });
        points.push({ top: `calc(${pct}% - 4px)`, right: '6px' });
      }
      return points;
    }
    return [];
  }, [eyeletMode, widthCm, heightCm]);

  return (
    <div className="live-scale-card" style={{
      background: 'var(--paper)',
      borderRadius: '20px',
      border: '1px solid var(--line)',
      padding: '20px',
      display: 'grid',
      gap: '16px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
    }}>
      {/* Visualizer Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'var(--orange-soft)',
            color: 'var(--orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Maximize2 size={16} />
          </span>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>
              Comparador de Escala en Vivo
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Proporción real en centímetros y escala ambiental
            </span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg)',
          borderRadius: '10px',
          padding: '3px',
          border: '1px solid var(--line)'
        }}>
          <button
            type="button"
            onClick={() => setViewMode('person')}
            style={{
              padding: '5px 10px',
              borderRadius: '7px',
              border: 'none',
              background: viewMode === 'person' ? 'var(--orange)' : 'transparent',
              color: viewMode === 'person' ? '#fff' : 'var(--muted)',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={13} /> Persona (1.75m)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('storefront')}
            style={{
              padding: '5px 10px',
              borderRadius: '7px',
              border: 'none',
              background: viewMode === 'storefront' ? 'var(--orange)' : 'transparent',
              color: viewMode === 'storefront' ? '#fff' : 'var(--muted)',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Store size={13} /> Vitrina Local
          </button>
        </div>
      </div>

      {/* Stage Canvas / Environment Simulation */}
      <div style={{
        position: 'relative',
        height: '240px',
        background: 'linear-gradient(180deg, rgba(234, 88, 12, 0.04) 0%, rgba(23, 23, 20, 0.03) 100%)',
        borderRadius: '16px',
        border: '1px dashed var(--line)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '20px 24px'
      }}>
        {/* Ground Floor Line */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '12px',
          right: '12px',
          height: '2px',
          background: 'var(--line)',
          zIndex: 1
        }} />

        {/* Storefront Outline Reference */}
        {viewMode === 'storefront' && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            width: '92%',
            height: '180px',
            border: '2px dashed rgba(23, 23, 20, 0.15)',
            borderRadius: '8px 8px 0 0',
            background: 'rgba(255, 255, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '8px 12px',
            zIndex: 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
              <span>Fachada Estándar (Alto 2.80m)</span>
              <span>Acceso Comercial</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', height: '90px' }}>
              <div style={{ flex: 1, border: '1px solid var(--line)', borderRadius: '4px', background: 'rgba(255,255,255,0.4)' }} />
              <div style={{ width: '40px', border: '1px solid var(--line)', borderBottom: 'none', borderRadius: '4px 4px 0 0', background: 'rgba(234,88,12,0.08)' }} />
              <div style={{ flex: 1, border: '1px solid var(--line)', borderRadius: '4px', background: 'rgba(255,255,255,0.4)' }} />
            </div>
          </div>
        )}

        {/* Dynamic Scale Banner / Signage */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          marginBottom: '20px',
          width: `${Math.max(60, Math.min(260, (widthM / maxViewWidthM) * 320))}px`,
          height: `${Math.max(40, Math.min(150, (heightM / maxViewHeightM) * 180))}px`,
          background: 'linear-gradient(135deg, #fff 0%, var(--orange-soft) 100%)',
          border: '2px solid var(--orange)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(234, 88, 12, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          textAlign: 'center',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Eyelet Renderings */}
          {eyeletPoints.map((pt, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#475569',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                ...pt
              }}
            />
          ))}

          {/* Banner Label Inside */}
          <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--orange-dark)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2 }}>
            {productName}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Space Grotesk' }}>
            {widthCm} × {heightCm} cm
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', marginTop: '2px' }}>
            {areaM2} m²
          </span>
        </div>

        {/* Human Silhouette Reference */}
        {viewMode === 'person' && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '24px',
            height: '130px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            zIndex: 2,
            opacity: 0.85
          }}>
            {/* SVG Person Silhouette */}
            <svg width="42" height="120" viewBox="0 0 40 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="14" r="9" fill="var(--ink)" />
              <path d="M12 28C12 26 15 25 20 25C25 25 28 26 28 28L32 60C32 63 29 64 26 64L26 116C26 118 24 120 22 120H18C16 120 14 118 14 116L14 64C11 64 8 63 8 60L12 28Z" fill="var(--ink)" />
            </svg>
            <span style={{
              fontSize: '9px',
              fontWeight: 800,
              color: 'var(--muted)',
              background: 'var(--paper)',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid var(--line)',
              whiteSpace: 'nowrap',
              marginTop: '4px'
            }}>
              Persona (1.75m)
            </span>
          </div>
        )}
      </div>

      {/* Metrics & Dimension Quick Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px'
      }}>
        <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
          <small style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>ÁREA TOTAL</small>
          <strong style={{ fontSize: '14px', color: 'var(--ink)', fontFamily: 'Space Grotesk' }}>{areaM2} m²</strong>
        </div>

        <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
          <small style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>PROPORCIÓN</small>
          <strong style={{ fontSize: '13px', color: 'var(--orange-dark)' }}>{aspectRatioText}</strong>
        </div>

        <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
          <small style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>ACABADO / OJALES</small>
          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
            {eyeletMode === 'none' ? 'Sin ojales' : eyeletMode === '4-corners' ? '4 Esquinas' : eyeletMode === 'perimeter-50' ? 'Cada 50cm' : eyeletMode === 'perimeter-30' ? 'Cada 30cm' : `${customEyeletCount} Ojales`}
          </strong>
        </div>
      </div>
    </div>
  );
}
