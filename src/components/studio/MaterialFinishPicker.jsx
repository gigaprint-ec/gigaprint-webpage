import React from 'react';
import { ShieldCheck, Zap, Sparkles, Sun, Eye, Layers } from 'lucide-react';

export const PRINT_MATERIALS = [
  {
    id: 'lona-13oz',
    name: 'Lona Frontlit 13oz Reforzada',
    category: 'Gran formato',
    badge: 'MÁS VENDIDO',
    badgeColor: 'var(--orange)',
    durability: 'Exterior 24 Meses',
    description: 'Acabado mate industrial de alta resistencia al viento, lluvia y rayos UV.',
    textureStyle: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    attributes: ['1440 DPI Ultra HD', 'Antidesgarro', 'Apta para ojales']
  },
  {
    id: 'vinil-brillante',
    name: 'Vinil Adhesivo Brillante + Laminado',
    category: 'Viniles',
    badge: 'COLORES VIVOS',
    badgeColor: '#2563eb',
    durability: 'Exterior 36 Meses',
    description: 'Brillo satinado con protección UV que realza la intensidad de los colores.',
    textureStyle: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #eff6ff 100%)',
    attributes: ['Protección UV', 'Lavable', 'Adhesivo permanente']
  },
  {
    id: 'vinil-mate',
    name: 'Vinil Adhesivo Mate Antirreflejo',
    category: 'Viniles',
    badge: 'ELEGANTE',
    badgeColor: '#475569',
    durability: 'Interior / Exterior',
    description: 'Superficie suave sin reflejos molestos. Ideal para ferias, vitrinas y fotos.',
    textureStyle: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
    attributes: ['Sin brillos', 'Alta nitidez', 'Acabado premium']
  },
  {
    id: 'microperforado',
    name: 'Vinil Microperforado (One-Way Vision)',
    category: 'Gran formato',
    badge: 'VITRINAS & VEHÍCULOS',
    badgeColor: '#16a34a',
    durability: 'Exterior 18 Meses',
    description: 'Permite ver hacia afuera desde el interior manteniendo privacidad y publicidad.',
    textureStyle: 'radial-gradient(#94a3b8 15%, #f8fafc 16%) 0 0/8px 8px',
    attributes: ['Visión exterior', 'Pasa luz natural', 'Fácil remoción']
  },
  {
    id: 'backlit-film',
    name: 'Backlit Translúcido (Cajas de Luz)',
    category: 'Rótulos',
    badge: 'RETROILUMINADO',
    badgeColor: '#d97706',
    durability: 'Uso con Luz LED',
    description: 'Difusión de luz homogénea para paneles luminosos, menús y cajas de luz.',
    textureStyle: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    attributes: ['Difusión LED', 'Alto contraste nocturno', 'Colores brillantes']
  },
  {
    id: 'lona-mesh',
    name: 'Lona Mesh Micro-Porosa Antiviento',
    category: 'Gran formato',
    badge: 'ALTURAS & FACHADAS',
    badgeColor: '#7c3aed',
    durability: 'Alta Resistencia',
    description: 'Estructura micro-perforada que deja pasar el aire sin rasgarse en edificios.',
    textureStyle: 'radial-gradient(#64748b 20%, #f1f5f9 21%) 0 0/6px 6px',
    attributes: ['Paso de viento 40%', 'Ligera', 'Ideal edificios']
  }
];

export function MaterialFinishPicker({ selectedMaterialId = 'lona-13oz', onSelectMaterial }) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Sustrato & Tipo de Material
          </label>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
            Selecciona el sustrato según la ubicación (interior / exterior) y acabado visual
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '10px'
      }}>
        {PRINT_MATERIALS.map((mat) => {
          const isSelected = selectedMaterialId === mat.id;

          return (
            <div
              key={mat.id}
              onClick={() => onSelectMaterial && onSelectMaterial(mat)}
              style={{
                borderRadius: '14px',
                border: isSelected ? '2px solid var(--orange)' : '1px solid var(--line)',
                background: isSelected ? 'var(--orange-soft)' : 'var(--paper)',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? '0 4px 15px rgba(234, 88, 12, 0.12)' : 'none',
                position: 'relative',
                display: 'grid',
                gap: '8px'
              }}
            >
              {/* Badge & Category */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '9px',
                  fontWeight: 900,
                  background: mat.badgeColor,
                  color: '#fff',
                  letterSpacing: '0.04em'
                }}>
                  {mat.badge}
                </span>

                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)' }}>
                  {mat.durability}
                </span>
              </div>

              {/* Title & Texture Swatch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: mat.textureStyle,
                  border: '1px solid rgba(0,0,0,0.15)',
                  flexShrink: 0,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                }} />
                <div>
                  <strong style={{ fontSize: '13px', color: isSelected ? 'var(--orange-dark)' : 'var(--ink)', display: 'block', lineHeight: 1.2 }}>
                    {mat.name}
                  </strong>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4 }}>
                {mat.description}
              </p>

              {/* Attributes Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                {mat.attributes.map((attr, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      background: 'var(--bg)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--line)'
                    }}
                  >
                    ✓ {attr}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
