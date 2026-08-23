import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, Store, Truck, Laptop, Maximize2, Sparkles, 
  Check, Info, Move, Layers, Eye, Compass, Ruler
} from 'lucide-react';

export function LiveScaleVisualizer({
  widthCm = 200,
  heightCm = 100,
  eyeletMode = '4-corners', // 'none', '4-corners', 'perimeter-50', 'perimeter-30', 'custom'
  customEyeletCount = 0,
  productName = 'Lona Publicitaria',
  category = 'Gran formato',
  isRollUp = false
}) {
  // Dimensions in meters
  const widthM = Math.max(0.05, Number(widthCm) / 100);
  const heightM = Math.max(0.05, Number(heightCm) / 100);
  const areaM2 = (widthM * heightM).toFixed(2);

  // Auto determine best default environment based on dimensions
  const autoDefaultMode = useMemo(() => {
    const maxDim = Math.max(widthM, heightM);
    if (maxDim < 0.45) return 'desk';
    if (widthM > 3.2 || heightM > 2.6) return 'storefront';
    return 'person';
  }, [widthM, heightM]);

  const [viewMode, setViewMode] = useState(autoDefaultMode);
  const [placement, setPlacement] = useState('wall'); // 'wall' (eye-level), 'floor' (grounded), 'centered'

  // Update mode automatically when switching between tiny and large items unless manually overridden
  useEffect(() => {
    setViewMode(autoDefaultMode);
  }, [autoDefaultMode]);

  // Aspect ratio description
  const aspectRatioText = useMemo(() => {
    const ratio = widthM / heightM;
    if (Math.abs(ratio - 1) < 0.08) return '1:1 Cuadrado';
    if (ratio >= 3.0) return `${ratio.toFixed(1)}:1 Ultra Panorámico`;
    if (ratio >= 1.7) return '16:9 Panorámico';
    if (ratio >= 1.3) return '4:3 Horizontal';
    if (ratio <= 0.55) return '1:2 Vertical / Pendón';
    if (ratio < 0.9) return 'Vertical';
    return `${ratio.toFixed(2)}:1 Proporción`;
  }, [widthM, heightM]);

  // Viewport World Dimensions (in meters) for each environment
  const envConfig = useMemo(() => {
    switch (viewMode) {
      case 'desk':
        return {
          worldWidthM: 1.4,
          worldHeightM: 0.9,
          label: 'Escritorio & Objetos (1.4m)',
          rulerTicks: [0, 0.25, 0.5, 0.75],
          baselineY: 28 // percentage from bottom
        };
      case 'storefront':
        return {
          worldWidthM: 6.0,
          worldHeightM: 3.5,
          label: 'Vitrina & Fachada Comercial (6.0m)',
          rulerTicks: [0, 1.0, 2.0, 2.8, 3.5],
          baselineY: 18
        };
      case 'vehicle':
        return {
          worldWidthM: 5.5,
          worldHeightM: 3.0,
          label: 'Vehículo / Furgoneta de Carga (5.5m)',
          rulerTicks: [0, 1.0, 2.0, 3.0],
          baselineY: 18
        };
      case 'person':
      default:
        return {
          worldWidthM: Math.max(3.2, widthM * 1.5 + 1.2),
          worldHeightM: Math.max(2.6, heightM * 1.3 + 0.6),
          label: 'Persona & Escala Humana (1.75m)',
          rulerTicks: [0, 0.5, 1.0, 1.5, 1.75, 2.0, 2.5],
          baselineY: 20
        };
    }
  }, [viewMode, widthM, heightM]);

  // Pixels Per Meter (PPM) Calculation
  const canvasHeightPx = 280;
  const canvasWidthPx = 640;
  const availableCanvasHeightPx = canvasHeightPx * 0.78;
  const availableCanvasWidthPx = canvasWidthPx * 0.82;

  const ppmY = availableCanvasHeightPx / envConfig.worldHeightM;
  const ppmX = availableCanvasWidthPx / envConfig.worldWidthM;
  const ppm = Math.min(ppmX, ppmY); // Unified proportional multiplier

  // Target item pixel sizes in exact metric scale
  const itemWidthPx = Math.max(18, Math.round(widthM * ppm));
  const itemHeightPx = Math.max(18, Math.round(heightM * ppm));

  // Reference elements pixel sizes
  const personHeightPx = Math.round(1.75 * ppm);
  const personWidthPx = Math.round(0.48 * ppm);
  const vanHeightPx = Math.round(2.0 * ppm);
  const vanWidthPx = Math.round(4.8 * ppm);
  const deskHeightPx = Math.round(0.75 * ppm);
  const deskWidthPx = Math.round(1.2 * ppm);
  const laptopWidthPx = Math.round(0.35 * ppm);
  const laptopHeightPx = Math.round(0.24 * ppm);

  // Eyelets points generation
  const eyeletPoints = useMemo(() => {
    if (eyeletMode === 'none') return [];
    if (eyeletMode === '4-corners') {
      return [
        { top: '4px', left: '4px' },
        { top: '4px', right: '4px' },
        { bottom: '4px', left: '4px' },
        { bottom: '4px', right: '4px' }
      ];
    }
    if (eyeletMode === 'perimeter-50' || eyeletMode === 'perimeter-30' || eyeletMode === 'custom') {
      const step = eyeletMode === 'perimeter-30' ? 30 : 50;
      const points = [];
      const cols = Math.max(2, Math.round(widthCm / step) + 1);
      const rows = Math.max(2, Math.round(heightCm / step) + 1);

      // Top & Bottom edges
      for (let i = 0; i < cols; i++) {
        const pct = (i / (cols - 1)) * 100;
        points.push({ top: '4px', left: `calc(${pct}% - 3px)` });
        points.push({ bottom: '4px', left: `calc(${pct}% - 3px)` });
      }
      // Left & Right edges
      for (let j = 1; j < rows - 1; j++) {
        const pct = (j / (rows - 1)) * 100;
        points.push({ top: `calc(${pct}% - 3px)`, left: '4px' });
        points.push({ top: `calc(${pct}% - 3px)`, right: '4px' });
      }
      return points;
    }
    return [];
  }, [eyeletMode, widthCm, heightCm]);

  // Style attributes based on product type
  const isLona = /lona|banner|mesh|valla|panaflex/i.test(`${productName} ${category}`);
  const isAcrylic = /acril|placa|laser|vidrio|cristal/i.test(`${productName} ${category}`);
  const isNeon = /neon|neón|luminoso|lightbox|caja de luz/i.test(`${productName} ${category}`);
  const isVinil = /vinil|adhesivo|microperforado|sticker/i.test(`${productName} ${category}`);

  const isSmallItemOnScreen = itemWidthPx < 110 || itemHeightPx < 65;

  return (
    <div className="live-scale-card" style={{
      background: 'var(--paper)',
      borderRadius: '20px',
      border: '1px solid var(--line)',
      padding: '18px',
      display: 'grid',
      gap: '14px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
    }}>
      {/* Top Header Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'var(--orange-soft)',
            color: 'var(--orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Maximize2 size={17} />
          </span>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: 'var(--ink)' }}>
              Comparador de Escala en Vivo
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Simulación métrica 1:1 proporcional en escala ambiental
            </span>
          </div>
        </div>

        {/* Environment Reference Selector Pills */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg)',
          borderRadius: '10px',
          padding: '3px',
          border: '1px solid var(--line)',
          flexWrap: 'wrap',
          gap: '2px'
        }}>
          <button
            type="button"
            onClick={() => setViewMode('person')}
            style={{
              padding: '5px 9px',
              borderRadius: '7px',
              border: 'none',
              background: viewMode === 'person' ? 'var(--orange)' : 'transparent',
              color: viewMode === 'person' ? '#fff' : 'var(--muted)',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
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
              padding: '5px 9px',
              borderRadius: '7px',
              border: 'none',
              background: viewMode === 'storefront' ? 'var(--orange)' : 'transparent',
              color: viewMode === 'storefront' ? '#fff' : 'var(--muted)',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Store size={13} /> Vitrina (3m)
          </button>

          <button
            type="button"
            onClick={() => setViewMode('vehicle')}
            style={{
              padding: '5px 9px',
              borderRadius: '7px',
              border: 'none',
              background: viewMode === 'vehicle' ? 'var(--orange)' : 'transparent',
              color: viewMode === 'vehicle' ? '#fff' : 'var(--muted)',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Truck size={13} /> Vehículo (4.8m)
          </button>

          <button
            type="button"
            onClick={() => setViewMode('desk')}
            style={{
              padding: '5px 9px',
              borderRadius: '7px',
              border: 'none',
              background: viewMode === 'desk' ? 'var(--orange)' : 'transparent',
              color: viewMode === 'desk' ? '#fff' : 'var(--muted)',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Laptop size={13} /> Escritorio (1.4m)
          </button>
        </div>
      </div>

      {/* Main Architectural Simulation Stage */}
      <div style={{
        position: 'relative',
        height: `${canvasHeightPx}px`,
        background: 'linear-gradient(180deg, #fbfcfe 0%, #f1f5f9 100%)',
        borderRadius: '16px',
        border: '1px solid var(--line)',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)'
      }}>
        {/* Architectural Blueprint Grid Lines */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: `${Math.max(16, Math.round(0.5 * ppm))}px ${Math.max(16, Math.round(0.5 * ppm))}px`,
          pointerEvents: 'none'
        }} />

        {/* Left Height Ruler with Metric Ticks */}
        <div style={{
          position: 'absolute',
          left: '10px',
          top: '12px',
          bottom: `${envConfig.baselineY}%`,
          width: '32px',
          borderRight: '1.5px solid rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column-reverse',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 4
        }}>
          {envConfig.rulerTicks.map((meter) => {
            const bottomPx = meter * ppm;
            return (
              <div
                key={meter}
                style={{
                  position: 'absolute',
                  bottom: `${bottomPx}px`,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--muted)', fontFamily: 'Space Grotesk' }}>
                  {meter}m
                </span>
                <div style={{ width: '6px', height: '1.5px', background: 'rgba(0,0,0,0.3)' }} />
              </div>
            );
          })}
        </div>

        {/* Ground Floor Datum Line */}
        <div style={{
          position: 'absolute',
          bottom: `${envConfig.baselineY}%`,
          left: '0',
          right: '0',
          height: '2px',
          background: 'linear-gradient(90deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%)',
          zIndex: 2
        }}>
          <div style={{
            position: 'absolute',
            top: '2px',
            left: 0,
            right: 0,
            height: '14px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, transparent 100%)'
          }} />
        </div>

        {/* ENVIRONMENT 1: Human (1.75m) + Banner Side-by-Side */}
        {viewMode === 'person' && (
          <>
            {/* Person Silhouette Reference */}
            <div style={{
              position: 'absolute',
              bottom: `${envConfig.baselineY}%`,
              right: '18%',
              width: `${personWidthPx}px`,
              height: `${personHeightPx}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              zIndex: 3,
              opacity: 0.88,
              transition: 'all 0.3s ease'
            }}>
              {/* Detailed Flat Human Silhouette */}
              <svg width="100%" height="100%" viewBox="0 0 50 175" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Head */}
                <circle cx="25" cy="16" r="11" fill="#1e293b" />
                {/* Neck & Torso */}
                <path d="M16 34C16 31 20 30 25 30C30 30 34 31 34 34L40 76C40 79 37 82 33 82H17C13 82 10 79 10 76L16 34Z" fill="#1e293b" />
                {/* Arms */}
                <path d="M10 38L5 80C4.5 83 7 86 10 86C12 86 14 84 14.5 81L18 42" fill="#334155" />
                <path d="M40 38L45 80C45.5 83 43 86 40 86C38 86 36 84 35.5 81L32 42" fill="#334155" />
                {/* Legs */}
                <path d="M17 82L15 168C15 172 18 175 22 175C25 175 27 172 27 168L27 96H23L23 168" fill="#1e293b" />
                <path d="M33 82L35 168C35 172 32 175 28 175C25 175 23 172 23 168L23 96H27L27 168" fill="#1e293b" />
              </svg>

              {/* Height Indicator Label */}
              <span style={{
                position: 'absolute',
                top: '-20px',
                fontSize: '10px',
                fontWeight: 800,
                color: 'var(--muted)',
                background: '#fff',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid var(--line)',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                Persona (1.75m)
              </span>
            </div>
          </>
        )}

        {/* ENVIRONMENT 2: Storefront Facade (3.0m x 6.0m) */}
        {viewMode === 'storefront' && (
          <div style={{
            position: 'absolute',
            bottom: `${envConfig.baselineY}%`,
            left: '60px',
            right: '20px',
            height: `${Math.round(2.8 * ppm)}px`,
            border: '2px solid #cbd5e1',
            borderRadius: '6px 6px 0 0',
            background: 'rgba(255, 255, 255, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px 14px',
            zIndex: 2
          }}>
            {/* Fascia Sign Board Area */}
            <div style={{
              height: `${Math.min(50, Math.round(0.7 * ppm))}px`,
              background: '#e2e8f0',
              border: '1.5px dashed #94a3b8',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 800,
              color: '#64748b',
              letterSpacing: '1px'
            }}>
              FACHADA / ÁREA DE RÓTULO COMERCIAL
            </div>

            {/* Vitrine Glass & Entrance Doors */}
            <div style={{ display: 'flex', gap: '10px', flex: 1, marginTop: '8px' }}>
              <div style={{ flex: 1.2, border: '1.5px solid #cbd5e1', borderRadius: '4px', background: 'rgba(234, 88, 12, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>Vitrina de Cristal</span>
              </div>
              <div style={{ width: `${Math.round(1.1 * ppm)}px`, border: '1.5px solid #94a3b8', borderBottom: 'none', borderRadius: '4px 4px 0 0', background: 'rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '4px' }}>
                <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 800 }}>Puerta (2.1m)</span>
              </div>
              <div style={{ flex: 1.2, border: '1.5px solid #cbd5e1', borderRadius: '4px', background: 'rgba(234, 88, 12, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>Vitrina de Cristal</span>
              </div>
            </div>
          </div>
        )}

        {/* ENVIRONMENT 3: Vehicle / Van Delivery Wrap (4.8m x 2.0m) */}
        {viewMode === 'vehicle' && (
          <div style={{
            position: 'absolute',
            bottom: `${envConfig.baselineY}%`,
            right: '10%',
            width: `${vanWidthPx}px`,
            height: `${vanHeightPx}px`,
            zIndex: 2,
            opacity: 0.85
          }}>
            {/* Vector Delivery Van Outline */}
            <svg width="100%" height="100%" viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Van Body */}
              <path d="M40 160H440C445 160 450 155 450 150V70C450 60 440 50 430 50H260L200 70H80C60 70 50 90 40 110L25 140C20 150 25 160 40 160Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
              {/* Windshield & Cabin Window */}
              <path d="M250 60L205 75H120L100 110H250V60Z" fill="#94a3b8" />
              {/* Cargo Area Wrap Zone */}
              <rect x="255" y="60" width="185" height="90" rx="4" fill="rgba(234, 88, 12, 0.08)" stroke="#ea580c" strokeDasharray="4 4" strokeWidth="1.5" />
              <text x="347" y="110" fill="#ea580c" fontSize="11" fontWeight="800" textAnchor="middle">Zona de Rotulación</text>
              {/* Wheels */}
              <circle cx="100" cy="165" r="24" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
              <circle cx="100" cy="165" r="10" fill="#94a3b8" />
              <circle cx="380" cy="165" r="24" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
              <circle cx="380" cy="165" r="10" fill="#94a3b8" />
            </svg>
            <span style={{
              position: 'absolute',
              top: '-18px',
              right: '20px',
              fontSize: '10px',
              fontWeight: 800,
              color: 'var(--muted)',
              background: '#fff',
              padding: '1px 6px',
              borderRadius: '4px',
              border: '1px solid var(--line)'
            }}>
              Furgoneta (Largo 4.8m × Alto 2.0m)
            </span>
          </div>
        )}

        {/* ENVIRONMENT 4: Desk & Objects (Small Items Close-Up) */}
        {viewMode === 'desk' && (
          <div style={{
            position: 'absolute',
            bottom: `${envConfig.baselineY}%`,
            left: '50px',
            right: '50px',
            height: `${deskHeightPx}px`,
            zIndex: 2
          }}>
            {/* Table Surface */}
            <div style={{
              width: '100%',
              height: '14px',
              background: '#cbd5e1',
              borderRadius: '4px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
            }} />
            {/* Laptop reference */}
            <div style={{
              position: 'absolute',
              top: `-${laptopHeightPx}px`,
              right: '15%',
              width: `${laptopWidthPx}px`,
              height: `${laptopHeightPx}px`,
              background: '#1e293b',
              borderRadius: '6px 6px 0 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 700
            }}>
              <Laptop size={16} />
              <span>Laptop (35cm)</span>
            </div>
            {/* Mug reference */}
            <div style={{
              position: 'absolute',
              top: '-32px',
              right: '36%',
              width: '24px',
              height: '32px',
              background: '#e2e8f0',
              border: '1px solid #94a3b8',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: '#475569'
            }}>
              Taza
            </div>
          </div>
        )}

        {/* THE TARGET PRODUCT MOCKUP (Scaled in 1:1 Metric Proportion) */}
        <div style={{
          position: 'absolute',
          bottom: viewMode === 'desk' 
            ? `calc(${envConfig.baselineY}% + 14px)` 
            : viewMode === 'storefront'
              ? `calc(${envConfig.baselineY}% + ${Math.round(0.8 * ppm)}px)`
              : `calc(${envConfig.baselineY}% + ${Math.round(0.35 * ppm)}px)`,
          left: viewMode === 'person' ? '22%' : viewMode === 'vehicle' ? '15%' : '20%',
          width: `${itemWidthPx}px`,
          height: `${itemHeightPx}px`,
          zIndex: 5,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Top CAD Dimension Line Arrow */}
          <div style={{
            position: 'absolute',
            top: '-24px',
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 900,
            color: 'var(--orange-dark)',
            fontFamily: 'Space Grotesk',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            <div style={{ flex: 1, height: '1.5px', background: 'var(--orange)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: '-3px', width: '2px', height: '8px', background: 'var(--orange)' }} />
            </div>
            <span style={{ padding: '0 6px', background: '#fff', borderRadius: '4px', border: '1px solid var(--orange-soft)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {widthCm} cm ({widthM.toFixed(2)}m)
            </span>
            <div style={{ flex: 1, height: '1.5px', background: 'var(--orange)', position: 'relative' }}>
              <div style={{ position: 'absolute', right: 0, top: '-3px', width: '2px', height: '8px', background: 'var(--orange)' }} />
            </div>
          </div>

          {/* Left CAD Dimension Line Arrow */}
          <div style={{
            position: 'absolute',
            left: '-24px',
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 900,
            color: 'var(--orange-dark)',
            fontFamily: 'Space Grotesk',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            <div style={{ flex: 1, width: '1.5px', background: 'var(--orange)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: '-3px', height: '2px', width: '8px', background: 'var(--orange)' }} />
            </div>
            <span style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              padding: '6px 0',
              background: '#fff',
              borderRadius: '4px',
              border: '1px solid var(--orange-soft)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              {heightCm} cm
            </span>
            <div style={{ flex: 1, width: '1.5px', background: 'var(--orange)', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: '-3px', height: '2px', width: '8px', background: 'var(--orange)' }} />
            </div>
          </div>

          {/* Realistic Product Material Container */}
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            borderRadius: isAcrylic ? '6px' : '4px',
            background: isNeon 
              ? 'radial-gradient(circle, #ffedd5 0%, #ea580c 100%)' 
              : isAcrylic 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.85) 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
            border: isAcrylic 
              ? '2px solid #cbd5e1' 
              : isNeon 
                ? '2px solid #ea580c' 
                : '2px solid var(--orange)',
            boxShadow: isNeon 
              ? '0 0 25px rgba(234, 88, 12, 0.6), 0 10px 20px rgba(0,0,0,0.1)' 
              : isAcrylic 
                ? '0 12px 28px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.8)' 
                : '0 10px 24px rgba(234, 88, 12, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            textAlign: 'center',
            overflow: 'hidden'
          }}>
            {/* Eyelets Renderings */}
            {eyeletPoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#64748b',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  zIndex: 6,
                  ...pt
                }}
              />
            ))}

            {/* Acrylic 4 Corner Standoff Wall Bolts */}
            {isAcrylic && (
              <>
                <div style={{ position: 'absolute', top: '5px', left: '5px', width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', border: '1px solid #475569' }} />
                <div style={{ position: 'absolute', top: '5px', right: '5px', width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', border: '1px solid #475569' }} />
                <div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', border: '1px solid #475569' }} />
                <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', border: '1px solid #475569' }} />
              </>
            )}

            {/* Roll-up Aluminum Base Stand */}
            {isRollUp && (
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '-10%',
                right: '-10%',
                height: '8px',
                background: '#475569',
                borderRadius: '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }} />
            )}

            {/* Smart Adaptive Inside Typography (Only when item is large enough) */}
            {!isSmallItemOnScreen && (
              <div style={{ display: 'grid', gap: '2px', padding: '4px', maxWidth: '94%' }}>
                <span style={{
                  fontSize: `clamp(9px, ${Math.min(13, itemWidthPx / 14)}px, 12px)`,
                  fontWeight: 900,
                  color: isNeon ? '#7c2d12' : 'var(--orange-dark)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1.1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {productName}
                </span>
                <span style={{
                  fontSize: `clamp(10px, ${Math.min(14, itemWidthPx / 12)}px, 13px)`,
                  fontWeight: 800,
                  color: 'var(--ink)',
                  fontFamily: 'Space Grotesk',
                  lineHeight: 1
                }}>
                  {widthCm} × {heightCm} cm
                </span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: 'var(--muted)'
                }}>
                  {areaM2} m²
                </span>
              </div>
            )}
          </div>

          {/* Floating Smart Badge When Item is Too Small On Screen (Zero Text Overflow Guaranteed) */}
          {isSmallItemOnScreen && (
            <div style={{
              position: 'absolute',
              top: '-38px',
              background: 'var(--ink)',
              color: '#fff',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 10
            }}>
              <span>{widthCm}×{heightCm}cm</span>
              <span style={{ color: 'var(--orange)' }}>• {areaM2}m²</span>
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid var(--ink)'
              }} />
            </div>
          )}
        </div>
      </div>

      {/* Metrics & Dimension Quick Badges Footer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px'
      }}>
        <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
          <small style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>ÁREA SUPERFICIAL</small>
          <strong style={{ fontSize: '15px', color: 'var(--ink)', fontFamily: 'Space Grotesk' }}>{areaM2} m²</strong>
        </div>

        <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
          <small style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>FORMATO VISUAL</small>
          <strong style={{ fontSize: '13px', color: 'var(--orange-dark)' }}>{aspectRatioText}</strong>
        </div>

        <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
          <small style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>ACABADO DE MONTAJE</small>
          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
            {eyeletMode === 'none' ? 'Sin ojales' : eyeletMode === '4-corners' ? '4 Esquinas' : eyeletMode === 'perimeter-50' ? 'Cada 50cm' : eyeletMode === 'perimeter-30' ? 'Cada 30cm' : `${customEyeletCount} Ojales`}
          </strong>
        </div>

        <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
          <small style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>ESCALA AMBIENTAL</small>
          <strong style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={13} style={{ color: 'var(--orange)' }} /> {envConfig.label.split('(')[0]}
          </strong>
        </div>
      </div>
    </div>
  );
}
