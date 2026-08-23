import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  Sparkles,
  Maximize2,
  Plus,
  Check,
  Tag,
  Scissors,
  Wrench,
  Eye,
  FileText
} from 'lucide-react';
import { calculatePrintItemPrice } from '../../../lib/posStore';
import { LiveScaleVisualizer } from '../../../components/studio/LiveScaleVisualizer';
import { playAddSound } from '../../../lib/posAudio';

export function POSProductQuickMatrix({
  products = [],
  selectedProduct,
  onSelectProduct,
  onAddToCart,
  customerVipTier = null
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dimension & Finishing State
  const [widthCm, setWidthCm] = useState(300);
  const [heightCm, setHeightCm] = useState(200);
  const [quantity, setQuantity] = useState(1);
  const [finishingType, setFinishingType] = useState('ojales_pequenos');
  const [eyeletCount, setEyeletCount] = useState(4);
  const [customUnitPrice, setCustomUnitPrice] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [showVisualScale, setShowVisualScale] = useState(false);

  const categories = [
    { id: 'all', label: '✦ Todo el Catálogo', icon: '✨' },
    { id: 'Gran Formato', label: 'Lonas & Gran Formato', icon: '🖼️' },
    { id: 'Viniles y Adhesivos', label: 'Viniles & Stickers', icon: '🏷️' },
    { id: 'Rótulos y Cajas de Luz', label: 'Rótulos & Cajas', icon: '💡' },
    { id: 'Rígidos y Estructuras', label: 'Sintra, PVC & Acrílico', icon: '📐' },
    { id: 'Textil y DTF', label: 'Textil & DTF', icon: '👕' },
    { id: 'Imprenta Digital', label: 'Imprenta & Papelería', icon: '📄' }
  ];

  const standardPresets = [
    { label: '1.00 × 1.00 m (Cuadrado)', w: 100, h: 100 },
    { label: '2.00 × 1.00 m (Estándar)', w: 200, h: 100 },
    { label: '3.00 × 2.00 m (Valla)', w: 300, h: 200 },
    { label: '0.85 × 2.00 m (Roll-Up)', w: 85, h: 200 },
    { label: '0.60 × 1.60 m (Banner X)', w: 60, h: 160 }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const currentProduct = selectedProduct || products[0] || null;

  const calculated = useMemo(() => {
    if (!currentProduct) return { totalItemPrice: 0, areaM2: 0 };
    return calculatePrintItemPrice({
      product: currentProduct,
      widthCm,
      heightCm,
      quantity,
      finishingType,
      eyeletCount,
      customUnitPrice: customUnitPrice ? Number(customUnitPrice) : null,
      customerVipTier
    });
  }, [
    currentProduct,
    widthCm,
    heightCm,
    quantity,
    finishingType,
    eyeletCount,
    customUnitPrice,
    customerVipTier
  ]);

  const money = (val) => `$${(Number(val) || 0).toFixed(2)}`;

  const handleAdd = () => {
    if (!currentProduct) return;
    playAddSound();
    onAddToCart({
      productId: currentProduct.id,
      productName: currentProduct.name,
      category: currentProduct.category,
      calcType: currentProduct.calcType,
      unitPrice: calculated.effectiveUnitPrice,
      widthCm: currentProduct.calcType === 'area' ? Number(widthCm) : null,
      heightCm: currentProduct.calcType === 'area' ? Number(heightCm) : null,
      areaM2: currentProduct.calcType === 'area' ? Number(calculated.areaM2) : null,
      quantity: Number(quantity),
      finishing: finishingType !== 'none' ? finishingType.replace(/_/g, ' ') : 'Sin acabados',
      eyeletCount: finishingType.includes('ojales') ? Number(eyeletCount) : 0,
      totalPrice: Number(calculated.totalItemPrice),
      notes: itemNotes.trim()
    });
    // Reset item notes after adding
    setItemNotes('');
  };

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {/* Search & Category Pills Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Buscar material o sustrato..."
          className="pos-input"
          style={{ maxWidth: '240px', padding: '6px 12px', fontSize: '12px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', flex: 1 }}>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className="pos-cat-pill"
              style={{
                background: activeCategory === c.id ? 'var(--orange)' : '#fff',
                color: activeCategory === c.id ? '#fff' : 'var(--ink)',
                borderColor: activeCategory === c.id ? 'var(--orange)' : 'var(--line)',
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                fontWeight: activeCategory === c.id ? 800 : 600,
                cursor: 'pointer'
              }}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Substrate Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: '8px',
        maxHeight: '175px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {filteredProducts.map((p) => {
          const isSelected = currentProduct?.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProduct && onSelectProduct(p)}
              style={{
                background: isSelected ? 'var(--orange-soft)' : '#fff',
                border: isSelected ? '2px solid var(--orange)' : '1px solid var(--line)',
                borderRadius: '10px',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isSelected ? '0 2px 8px rgba(234, 88, 12, 0.15)' : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                    {p.category}
                  </span>
                  {isSelected && <Check size={14} color="var(--orange)" />}
                </div>
                <div style={{ fontWeight: 800, fontSize: '12px', color: 'var(--ink)', marginTop: '2px', lineHeight: '1.2' }}>
                  {p.name}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  {p.calcType === 'area' ? 'Tarifa m²' : 'Unidad'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--orange-dark)', fontFamily: 'Space Grotesk' }}>
                  {money(p.basePrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Product Configurator & Area Calculator */}
      {currentProduct && (
        <div style={{
          background: 'var(--bg)',
          borderRadius: '14px',
          border: '1.5px solid var(--line)',
          padding: '12px 16px',
          display: 'grid',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'var(--orange)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 900 }}>
                CONFIGURANDO
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{currentProduct.name}</strong>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                (Base: {money(currentProduct.basePrice)} / {currentProduct.calcType === 'area' ? 'm²' : 'u'})
              </span>
            </div>

            {/* Scale Visualizer Toggle */}
            {currentProduct.calcType === 'area' && (
              <button
                type="button"
                onClick={() => setShowVisualScale(!showVisualScale)}
                style={{
                  background: showVisualScale ? 'var(--orange)' : '#fff',
                  color: showVisualScale ? '#fff' : 'var(--orange-dark)',
                  border: '1px solid var(--orange)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Eye size={13} /> {showVisualScale ? 'Ocultar Escala' : '📐 Escala y Proporción en Vivo'}
              </button>
            )}
          </div>

          {/* Optional Live Scale & Human Proportion Visualizer */}
          {showVisualScale && currentProduct.calcType === 'area' && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '10px', border: '1px solid var(--line)', animation: 'pos-fade-in 0.2s ease' }}>
              <LiveScaleVisualizer
                widthCm={widthCm}
                heightCm={heightCm}
                productName={currentProduct.name}
                category={currentProduct.category}
                eyeletMode={finishingType.includes('ojales') ? '4-corners' : 'none'}
              />
            </div>
          )}

          {/* Quick Presets for Signage & Banners */}
          {currentProduct.calcType === 'area' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>Medidas Rápidas:</span>
              {standardPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setWidthCm(preset.w);
                    setHeightCm(preset.h);
                  }}
                  style={{
                    background: widthCm === preset.w && heightCm === preset.h ? 'var(--orange-soft)' : '#fff',
                    border: widthCm === preset.w && heightCm === preset.h ? '1.5px solid var(--orange)' : '1px solid var(--line)',
                    color: widthCm === preset.w && heightCm === preset.h ? 'var(--orange-dark)' : 'var(--ink)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Dimensions, Quantity and Finishings */}
          <div style={{ display: 'grid', gridTemplateColumns: currentProduct.calcType === 'area' ? '1fr 1fr 0.8fr 1.4fr' : '1fr 1.5fr', gap: '10px' }}>
            {currentProduct.calcType === 'area' ? (
              <>
                <div>
                  <label className="pos-label" style={{ fontSize: '11px' }}>Ancho (cm)</label>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    className="pos-input"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value)}
                    style={{ fontSize: '13px', padding: '6px 8px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label className="pos-label" style={{ fontSize: '11px' }}>Alto (cm)</label>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    className="pos-input"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    style={{ fontSize: '13px', padding: '6px 8px', fontWeight: 700 }}
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="pos-label" style={{ fontSize: '11px' }}>Cantidad</label>
              <input
                type="number"
                min="1"
                step="1"
                className="pos-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{ fontSize: '13px', padding: '6px 8px', fontWeight: 700, textAlign: 'center' }}
              />
            </div>

            <div>
              <label className="pos-label" style={{ fontSize: '11px' }}>Acabados / Confección</label>
              <select
                className="pos-select"
                value={finishingType}
                onChange={(e) => setFinishingType(e.target.value)}
                style={{ fontSize: '12px', padding: '6px 8px' }}
              >
                <option value="none">Sin acabados extra</option>
                <option value="ojales_pequenos">Ojales estándar (+$0.30 c/u)</option>
                <option value="ojales_reforzados">Ojales reforzados (+$0.50 c/u)</option>
                <option value="dobladillo_perimetral">Dobladillo termosellado (+$0.75/m)</option>
                <option value="laminado_protector">Laminado UV protector (+$3.50/m²)</option>
                <option value="bolsillo_tubo">Bolsillo para tubo (+$4.00)</option>
              </select>
            </div>
          </div>

          {/* Technical Line-Item Notes */}
          <div>
            <input
              type="text"
              className="pos-input"
              placeholder="✏️ Nota técnica opcional para el taller (ej. Dejar 5cm blanco alrededor para tensar en bastidor...)"
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              style={{ fontSize: '11.5px', padding: '6px 10px', background: '#fff' }}
            />
          </div>

          {/* Result Bar & Add Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
            borderRadius: '10px',
            padding: '8px 14px',
            border: '1px solid var(--line)'
          }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px' }}>
              {currentProduct.calcType === 'area' && (
                <span><strong>Área:</strong> {calculated.areaM2} m²</span>
              )}
              <span><strong>Subtotal:</strong> {money(calculated.baseItemSubtotal)}</span>
              {calculated.finishingSubtotal > 0 && (
                <span><strong>Acabados:</strong> +{money(calculated.finishingSubtotal)}</span>
              )}
              <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--orange-dark)', fontFamily: 'Space Grotesk' }}>
                Total: {money(calculated.totalItemPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              style={{
                background: 'var(--orange)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
              }}
            >
              <Plus size={16} /> Agregar al Carrito (↵)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
