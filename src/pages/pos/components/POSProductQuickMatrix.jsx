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
  Wrench
} from 'lucide-react';
import { calculatePrintItemPrice } from '../../../lib/posStore';

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

  // Filter products by category and query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchQuery = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [products, activeCategory, searchQuery]);

  // Active chosen product or first
  const currentProduct = selectedProduct || filteredProducts[0] || products[0] || null;

  // Real-time calculation
  const calculated = useMemo(() => {
    return calculatePrintItemPrice({
      product: currentProduct,
      widthCm,
      heightCm,
      quantity,
      finishingType,
      eyeletCount,
      customUnitPrice,
      customerVipTier
    });
  }, [currentProduct, widthCm, heightCm, quantity, finishingType, eyeletCount, customUnitPrice, customerVipTier]);

  const handleApplyPreset = (preset) => {
    setWidthCm(preset.w);
    setHeightCm(preset.h);
  };

  const handleAdd = () => {
    if (!currentProduct) return;
    const itemData = {
      productId: currentProduct.id,
      productName: currentProduct.name,
      category: currentProduct.category,
      unit: currentProduct.unit,
      calcType: currentProduct.calcType,
      widthCm: currentProduct.calcType === 'area' ? Number(widthCm) : null,
      heightCm: currentProduct.calcType === 'area' ? Number(heightCm) : null,
      areaM2: calculated.areaM2,
      quantity: Number(quantity),
      unitPrice: calculated.unitRate,
      finishingType,
      eyeletCount: finishingType.includes('ojales') ? Number(eyeletCount) : 0,
      finishingSubtotal: calculated.finishingSubtotal,
      totalPrice: calculated.totalItemPrice
    };

    onAddToCart(itemData);
  };

  const money = (val) => `$${(Number(val) || 0).toFixed(2)}`;

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      
      {/* Category Pills Bar */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: isActive ? 'var(--orange)' : 'var(--paper)',
                color: isActive ? '#fff' : 'var(--ink)',
                border: `1px solid ${isActive ? 'var(--orange)' : 'var(--line)'}`,
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isActive ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'none'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Product Grid (Touch-friendly cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: '10px',
        maxHeight: '230px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {filteredProducts.map((p) => {
          const isSelected = currentProduct?.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p)}
              style={{
                background: isSelected ? '#fff7ed' : 'var(--paper)',
                border: `1.5px solid ${isSelected ? 'var(--orange)' : 'var(--line)'}`,
                borderRadius: '12px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 0 2px rgba(234,88,12,0.2)' : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                    {p.category}
                  </span>
                  {isSelected && (
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>
                      ✓
                    </span>
                  )}
                </div>
                <h5 style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 800, color: 'var(--ink)', lineHeight: '1.2' }}>
                  {p.name}
                </h5>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px dashed var(--line)', paddingTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{p.calcType === 'area' ? 'm²' : 'unid'}</span>
                <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--orange-dark)', fontFamily: 'Space Grotesk' }}>
                  {money(p.basePrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Product Calculator Strip */}
      {currentProduct && (
        <div style={{
          background: '#f8fafc',
          borderRadius: '14px',
          padding: '14px',
          border: '1px solid var(--line)',
          display: 'grid',
          gap: '12px'
        }}>
          {/* Active Product Banner & Presets */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} style={{ color: 'var(--orange)' }} />
              <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                {currentProduct.name} ({money(calculated.unitRate)}/{currentProduct.unit})
              </strong>
            </div>

            {/* Presets Bar if area */}
            {currentProduct.calcType === 'area' && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 800, alignSelf: 'center' }}>Presets:</span>
                {standardPresets.map((pr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(pr)}
                    style={{
                      background: widthCm === pr.w && heightCm === pr.h ? '#e2e8f0' : '#fff',
                      border: '1px solid var(--line)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {pr.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Inputs Matrix: Dimensions + Quantity + Acabados */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: currentProduct.calcType === 'area' ? '1fr 1fr 1fr 1.5fr' : '1fr 1.5fr',
            gap: '10px',
            alignItems: 'end'
          }}>
            {currentProduct.calcType === 'area' && (
              <>
                <div>
                  <label className="pos-label required" style={{ fontSize: '11px' }}>Ancho (cm)</label>
                  <input
                    type="number"
                    min="1"
                    className="pos-input"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value)}
                    style={{ fontSize: '13px', padding: '6px 8px' }}
                  />
                </div>
                <div>
                  <label className="pos-label required" style={{ fontSize: '11px' }}>Alto (cm)</label>
                  <input
                    type="number"
                    min="1"
                    className="pos-input"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    style={{ fontSize: '13px', padding: '6px 8px' }}
                  />
                </div>
              </>
            )}

            <div>
              <label className="pos-label required" style={{ fontSize: '11px' }}>Cantidad</label>
              <input
                type="number"
                min="1"
                className="pos-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{ fontSize: '13px', padding: '6px 8px', fontWeight: 800 }}
              />
            </div>

            <div>
              <label className="pos-label" style={{ fontSize: '11px' }}>Acabado / Refuerzo</label>
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
