import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  ArrowUpDown,
  Tag,
  Layers,
  DollarSign
} from 'lucide-react';
import {
  upsertProduct,
  deleteProduct,
  toISODate
} from '../../lib/posStore';
import { useToast } from '../../components/studio/Toast';

export function POSProductManager({ store, onStoreUpdate }) {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkPercent, setBulkPercent] = useState('');
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Form State
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'Gran Formato',
    calcType: 'area',
    basePrice: 0,
    minPrice: 0,
    unit: 'm2',
    leadTimeDays: 2,
    isActive: true,
    description: ''
  });

  // Extract Unique Categories
  const categories = useMemo(() => {
    const set = new Set();
    (store.products || []).forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [store.products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return (store.products || []).filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [store.products, searchTerm, selectedCategory]);

  // Open Create/Edit Modal
  const handleOpenEdit = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name || '',
        sku: prod.sku || '',
        category: prod.category || 'Gran Formato',
        calcType: prod.calcType || 'area',
        basePrice: prod.basePrice || 0,
        minPrice: prod.minPrice || 0,
        unit: prod.unit || 'm2',
        leadTimeDays: prod.leadTimeDays || 2,
        isActive: prod.isActive !== false,
        description: prod.description || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        sku: `GIGA-${Math.floor(100 + Math.random() * 900)}`,
        category: selectedCategory !== 'all' ? selectedCategory : 'Gran Formato',
        calcType: 'area',
        basePrice: 0,
        minPrice: 0,
        unit: 'm2',
        leadTimeDays: 2,
        isActive: true,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      toast.warning('El nombre del producto es obligatorio.');
      return;
    }

    const payload = {
      ...(editingProduct ? { id: editingProduct.id } : {}),
      name: productForm.name.trim(),
      sku: productForm.sku.trim(),
      category: productForm.category,
      parentCategory: productForm.category,
      calcType: productForm.calcType,
      basePrice: Number(productForm.basePrice) || 0,
      minPrice: Number(productForm.minPrice) || 0,
      unit: productForm.unit,
      leadTimeDays: Number(productForm.leadTimeDays) || 2,
      isActive: productForm.isActive,
      description: productForm.description.trim()
    };

    const res = upsertProduct(store, payload);
    if (res.ok) {
      onStoreUpdate(res.updatedStore);
      setIsModalOpen(false);
      toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado en el catálogo');
    }
  };

  // Delete Product
  const handleDeleteProduct = (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto del catálogo?')) return;
    const res = deleteProduct(store, productId);
    if (res.ok) {
      onStoreUpdate(res.updatedStore);
      toast.success('Producto eliminado del catálogo');
    }
  };

  // Inline Price Edit Handler
  const handleInlinePriceChange = (prod, newPrice) => {
    const priceNum = Number(newPrice);
    if (isNaN(priceNum) || priceNum < 0) return;
    const res = upsertProduct(store, { ...prod, basePrice: priceNum });
    if (res.ok) {
      onStoreUpdate(res.updatedStore);
      toast.info(`Precio de ${prod.name} actualizado a $${priceNum.toFixed(2)}`);
    }
  };

  // Inline Active Toggle
  const handleToggleActive = (prod) => {
    const res = upsertProduct(store, { ...prod, isActive: !prod.isActive });
    if (res.ok) {
      onStoreUpdate(res.updatedStore);
      toast.info(`${prod.name} ${!prod.isActive ? 'activado' : 'desactivado'}`);
    }
  };

  // Bulk Price Adjust (e.g. +10%)
  const handleApplyBulkPercent = () => {
    const pct = Number(bulkPercent);
    if (isNaN(pct) || pct === 0) {
      toast.warning('Ingresa un porcentaje válido (ej. 10 o -5)');
      return;
    }

    if (!confirm(`¿Aplicar ajuste de ${pct}% a todos los ${filteredProducts.length} productos filtrados?`)) return;

    let updatedStore = { ...store };
    filteredProducts.forEach((p) => {
      const newPrice = Number((p.basePrice * (1 + pct / 100)).toFixed(2));
      const res = upsertProduct(updatedStore, { ...p, basePrice: newPrice });
      if (res.ok) updatedStore = res.updatedStore;
    });

    onStoreUpdate(updatedStore);
    setIsBulkOpen(false);
    setBulkPercent('');
    toast.success(`Precios ajustados (${pct > 0 ? '+' : ''}${pct}%) en ${filteredProducts.length} productos`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['SKU', 'Nombre', 'Categoria', 'Tipo Calculo', 'Precio Base ($)', 'Unidad', 'Estado'];
    const rows = filteredProducts.map((p) => [
      p.sku || '',
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      p.calcType || 'area',
      p.basePrice || 0,
      p.unit || 'm2',
      p.isActive ? 'Activo' : 'Inactivo'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `catalogo_gigaprint_${toISODate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pos-card" style={{ display: 'grid', gap: '16px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={22} style={{ color: 'var(--orange)' }} />
            Base de Datos de Productos & Tarifas ({store.products?.length || 0})
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Catálogo dinámico unificado para POS, cotizadores web y tienda.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="pos-nav-tab"
            onClick={() => setIsBulkOpen(!isBulkOpen)}
            style={{ padding: '8px 14px', fontSize: '12px' }}
          >
            <ArrowUpDown size={14} /> Ajuste Masivo (%)
          </button>
          <button
            type="button"
            className="pos-nav-tab"
            onClick={handleExportCSV}
            style={{ padding: '8px 14px', fontSize: '12px' }}
          >
            <Download size={14} /> Exportar Excel
          </button>
          <button
            type="button"
            className="pos-submit-order-btn"
            onClick={() => handleOpenEdit(null)}
            style={{ padding: '8px 14px', fontSize: '12px' }}
          >
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Bulk Adjust Drawer */}
      {isBulkOpen && (
        <div style={{ padding: '14px', background: 'var(--orange-soft)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--orange-dark)' }}>
            Ajustar precios en los {filteredProducts.length} productos filtrados:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="number"
              className="pos-input"
              style={{ width: '90px', padding: '6px 10px' }}
              placeholder="+10 o -5"
              value={bulkPercent}
              onChange={(e) => setBulkPercent(e.target.value)}
            />
            <span style={{ fontWeight: 800 }}>%</span>
          </div>
          <button
            type="button"
            className="pos-submit-order-btn"
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={handleApplyBulkPercent}
          >
            Aplicar Ajuste
          </button>
          <button
            type="button"
            className="pos-nav-tab"
            style={{ padding: '6px 10px', fontSize: '12px' }}
            onClick={() => setIsBulkOpen(false)}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Search & Category Filter Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)' }} />
          <input
            type="text"
            className="pos-input"
            placeholder="Buscar por producto, material o código SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} style={{ color: 'var(--muted)' }} />
          <select
            className="pos-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="all">Todas las Categorías ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Spreadsheet Data Grid */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: '12px' }}>
        <table className="pos-orders-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
              <th style={{ padding: '12px', fontSize: '12px' }}>SKU</th>
              <th style={{ padding: '12px', fontSize: '12px' }}>Producto / Sustrato</th>
              <th style={{ padding: '12px', fontSize: '12px' }}>Categoría</th>
              <th style={{ padding: '12px', fontSize: '12px' }}>Cálculo</th>
              <th style={{ padding: '12px', fontSize: '12px' }}>Precio Base</th>
              <th style={{ padding: '12px', fontSize: '12px' }}>Unidad</th>
              <th style={{ padding: '12px', fontSize: '12px' }}>Estado</th>
              <th style={{ padding: '12px', fontSize: '12px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
                  No se encontraron productos coincidentes.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--line)', opacity: p.isActive ? 1 : 0.6 }}>
                  <td style={{ padding: '10px 12px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--muted)' }}>
                    {p.sku || 'N/A'}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 800, color: 'var(--ink)' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--muted)' }}>
                    <span style={{ padding: '3px 8px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '11px', fontWeight: 700 }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: p.calcType === 'area' ? 'var(--orange)' : '#2563eb' }}>
                    {p.calcType === 'area' ? '📐 Superficie (m²)' : '📦 Por Unidad'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--muted)', fontSize: '13px' }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="pos-input"
                        style={{ width: '85px', padding: '4px 8px', fontSize: '13px', fontWeight: 800 }}
                        defaultValue={p.basePrice}
                        onBlur={(e) => handleInlinePriceChange(p, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleInlinePriceChange(p, e.currentTarget.value);
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>
                    /{p.unit || 'm2'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        border: 'none',
                        background: p.isActive ? '#dcfce7' : '#fee2e2',
                        color: p.isActive ? '#166534' : '#991b1b',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {p.isActive ? '● Activo' : '○ Inactivo'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="pos-nav-tab"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        title="Editar detalles"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="pos-nav-tab"
                        style={{ padding: '4px 8px', fontSize: '12px', color: '#dc2626' }}
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: CREATE / EDIT PRODUCT */}
      {isModalOpen && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card" style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>
                {editingProduct ? 'Editar Producto / Tarifa' : 'Nuevo Producto en Catálogo'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800 }}>Nombre del Producto *</label>
                  <input
                    type="text"
                    className="pos-input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Ej. Lona Frontlit 13oz Brillante"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800 }}>Código SKU</label>
                  <input
                    type="text"
                    className="pos-input"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800 }}>Familia / Categoría</label>
                  <input
                    type="text"
                    className="pos-input"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800 }}>Tipo de Cotización</label>
                  <select
                    className="pos-input"
                    value={productForm.calcType}
                    onChange={(e) => setProductForm({ ...productForm, calcType: e.target.value })}
                  >
                    <option value="area">📐 Superficie (m² - Ancho x Alto)</option>
                    <option value="unit">📦 Por Unidad / Paquete</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800 }}>Precio Base ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="pos-input"
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800 }}>Precio Mínimo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="pos-input"
                    value={productForm.minPrice}
                    onChange={(e) => setProductForm({ ...productForm, minPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800 }}>Unidad</label>
                  <input
                    type="text"
                    className="pos-input"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="m2, unid, ciento"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800 }}>Descripción y Acabados</label>
                <textarea
                  className="pos-input"
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="activeProdCheck"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--orange)' }}
                />
                <label htmlFor="activeProdCheck" style={{ fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                  Producto Activo para Ventas
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="pos-nav-tab" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="pos-submit-order-btn">
                  <Save size={16} /> Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
