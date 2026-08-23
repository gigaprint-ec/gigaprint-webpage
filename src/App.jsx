import React, { lazy, Suspense, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BarChart3, Bell, Building2, Calculator, Check, ChevronDown, ChevronRight, ChevronUp, ClipboardList, Clock, Edit3, ExternalLink, FileCheck, FileText, Filter, Grid, Image, LayoutDashboard, List, MessageCircle, Minus, Package, Palette, Pencil, Plus, RefreshCw, Save, Scissors, Search, Settings2, ShieldCheck, ShoppingCart, SlidersHorizontal, Sparkles, Tag, Trash2, Truck, Users, X, Zap } from 'lucide-react';
import { categories, initialData, media, money, themePresets, assetPath } from './data';
import { calculateCatalogQuote, getProductCalcType, getPriceTiers, getTier, getVariantOptions, PARENT_CATEGORIES, getParentCategory, getLeadTimeEstimate } from './catalog';
import { AuthProvider, useAuth, useSite } from './store';
import { AdminHeader, AdminShell, Button, CartSummary, PageShell, ProductCard, SectionHeading, ServiceCard } from './components';
import { BlockRenderer } from './components/studio/BlockRenderer';
import './pos.css';
import { POSPage } from './pages/pos/POSPage';
import { POSAdminDashboard } from './pages/pos/POSAdminDashboard';
import { POSAdvisorsManagement } from './pages/pos/POSAdvisorsManagement';
import { OrderTrackingPage } from './pages/pos/OrderTrackingPage';
import { POSCustomerDisplayPage } from './pages/pos/POSCustomerDisplayPage';
import { POSArtProofPublicPage } from './pages/pos/POSArtProofPublicPage';
import { LiveScaleVisualizer } from './components/studio/LiveScaleVisualizer';
import { ToastProvider } from './components/studio/Toast';
const EditorPage = lazy(() => import('./pages/EditorPage').then((module) => ({ default: module.EditorPage })));

function HomePage() {
  const { data, addToCart } = useSite();
  const calculatorSettings = data.calculatorSettings || { taxRate: 15, designAdaptationPrice: 5, designFromScratchPrice: 15, disclaimer: 'Los valores son referenciales y pueden variar según acabados, instalación y condiciones del proyecto.' };
  return (
    <PageShell>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow orange">{data.settings.heroKicker}</span>
            <h1>{data.settings.heroTitle}<em> en grande.</em></h1>
            <p>{data.settings.heroText}</p>
            <div className="hero-buttons">
              <Button to="/cotizador">Cotiza tu proyecto</Button>
              <Button to="/tienda" variant="ghost">Ver soluciones</Button>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack"><span>G</span><span>+</span><span>∞</span></div>
              <p><strong>Hecho para destacar</strong><br />Diseño, producción e instalación en un mismo equipo.</p>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>
            <div className="hero-card card-main">
              <img src={media.hero} alt="Impresión de gran formato" />
              <span className="hero-card-label">Producción propia</span>
            </div>
            <div className="hero-float float-top">
              <Sparkles size={16} />
              <span><b>+100</b><small>ideas producidas</small></span>
            </div>
            <div className="hero-float float-bottom">
              <span className="pulse-dot"></span>
              <span><b>Tu marca</b><small>lista para verse</small></span>
            </div>
            <span className="hero-sticker">IDEAS<br />QUE<br /><b>CRECEN</b></span>
          </div>
        </div>
      </section>

      <div className="marquee">
        <div>RÓTULOS <span>✦</span> IMPRESIÓN <span>✦</span> NEONES <span>✦</span> LÁSER <span>✦</span> VINILES <span>✦</span> DISEÑO <span>✦</span> </div>
      </div>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Todo lo que tu marca necesita"
            title="Una idea. Muchas formas de hacerla visible."
            text="Nos encargamos de la parte que hace que una marca pase de verse bien a quedarse en la cabeza."
            action={<Button to="/gigaprint" variant="link">Conoce Gigaprint</Button>}
          />
          <div className="services-grid">
            {data.services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="container process-section">
          <SectionHeading
            eyebrow="Así trabajamos"
            title="Del primer mensaje a la instalación."
            text="Un proceso claro, sin vueltas y con acompañamiento en cada decisión."
          />
          <div className="process-grid">
            <div className="process-intro">
              <span className="big-number">01</span>
              <h3>Cuéntanos qué tienes en mente.</h3>
              <p>Puede ser un boceto, una foto de referencia o solo una idea. Nosotros la aterrizamos.</p>
              <Button to="/contacto" variant="outline">Hablar con el equipo</Button>
            </div>
            <div className="process-steps">
              <div><b>02</b><span><strong>Te proponemos</strong><small>Materiales, medidas y una solución que sí funciona para tu presupuesto.</small></span></div>
              <div><b>03</b><span><strong>Lo producimos</strong><small>Diseño, fabricación y acabados con atención al detalle.</small></span></div>
              <div><b>04</b><span><strong>Lo instalamos</strong><small>Te entregamos una pieza lista para ser protagonista.</small></span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Lo más pedido"
            title="Soluciones que ya están listas para despegar."
            action={<Button to="/tienda" variant="link">Ver toda la tienda</Button>}
          />
          <div className="product-grid">
            {data.products.filter((product) => product.featured).map((product) => (
              <ProductCard key={product.id} product={product} onAdd={(item) => addToCart({ ...item, cartId: `${item.id}-${Date.now()}` })} />
            ))}
          </div>
        </div>
      </section>

      <section className="section editable-home-section">
        <div className="container">
          <BlockRenderer blocks={data.homeBlocks || []} />
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <span className="eyebrow">No tienes que llegar con todo resuelto</span>
            <h2>Tu próxima gran idea<br /><em>empieza aquí.</em></h2>
          </div>
          <Button to="/cotizador">Empezar cotización</Button>
        </div>
      </section>
    </PageShell>
  );
}

function AboutPage() {
  return (
    <PageShell>
      <section className="inner-hero">
        <div className="container inner-hero-grid">
          <div>
            <span className="eyebrow orange">Gigaprint / quiénes somos</span>
            <h1>Tu marca no necesita gritar.<br /><em>Necesita presencia.</em></h1>
            <p>Somos un taller creativo y de producción visual en Quito que convierte ideas en piezas que la gente puede ver, tocar y recordar.</p>
          </div>
          <div className="inner-hero-mark">
            <span>G</span>
            <small>+<br />ideas<br />visibles</small>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div className="about-statement">
            <span className="eyebrow">Nuestra forma de ver las cosas</span>
            <h2>La publicidad empieza mucho antes de imprimir.</h2>
          </div>
          <div className="about-copy">
            <p>Empieza entendiendo qué quieres provocar. Una fachada que invite a entrar. Un empaque que se quiera llevar. Un rótulo que se reconozca desde la otra esquina.</p>
            <p>Por eso en Gigaprint juntamos estrategia, diseño, corte láser, confección y montaje. Para que la idea no se pierda entre el archivo y el resultado final.</p>
            <div className="about-points">
              <span><Check size={16} /> Trato cercano y asesoría</span>
              <span><Check size={16} /> Producción propia en taller</span>
              <span><Check size={16} /> Facturación electrónica SRI</span>
              <span><Check size={16} /> Envíos a todo el Ecuador</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section trust-pillars-section">
        <div className="container">
          <div className="trust-pillar-grid">
            <div className="trust-pillar-card">
              <div className="pillar-icon"><Building2 /></div>
              <h3>Taller Propio en Quito</h3>
              <p>Equipos industriales de gran formato, mesa láser y área de confección sin intermediarios.</p>
            </div>
            <div className="trust-pillar-card">
              <div className="pillar-icon"><ShieldCheck /></div>
              <h3>Garantía y SRI / RIMPE</h3>
              <p>Facturación electrónica transparente con desglose oficial de IVA para empresas y personas.</p>
            </div>
            <div className="trust-pillar-card">
              <div className="pillar-icon"><Truck /></div>
              <h3>Entregas e Instalación</h3>
              <p>Envíos seguros a nivel nacional e instalación profesional de rótulos en Pichincha y alrededores.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section image-split">
        <div className="container">
          <div className="split-card">
            <img src={media.workspace} alt="Equipo de Gigaprint trabajando en taller" />
            <div>
              <span className="eyebrow orange">Hecho con intención</span>
              <h2>Materiales que trabajan por tu marca.</h2>
              <p>Desde el vinil más sencillo hasta un letrero luminoso completo, elegimos cada material por cómo va a vivir en el mundo real.</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <Button to="/cotizador">Cotizar un proyecto</Button>
                <Button to="/contacto" variant="outline">Hablar con un asesor</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function PromotionsPage() {
  const { data } = useSite();
  const whatsappNumber = data.settings?.whatsapp || '593999999999';

  return (
    <PageShell>
      <section className="inner-hero promo-hero">
        <div className="container">
          <span className="eyebrow orange">Promociones activas</span>
          <h1>Más visibilidad.<br /><em>Más valor para tu inversión.</em></h1>
          <p>Paquetes pensados para que empieces con lo esencial y no tengas que elegir entre verte profesional o cuidar tu presupuesto.</p>
        </div>
      </section>

      <section className="section">
        <div className="container promo-grid">
          {data.promotions.filter((promo) => promo.active).map((promo) => {
            const promoWhatsappMessage = encodeURIComponent(
              `¡Hola Gigaprint! Me interesa la promoción *"${promo.title}"* (${money(promo.price)}). ¿Podrían brindarme más información y disponibilidad?`
            );

            return (
              <article className="promo-card" key={promo.id}>
                <div className="promo-card-top">
                  <span>{promo.eyebrow}</span>
                  <b>{promo.badge}</b>
                </div>
                <h2>{promo.title}</h2>
                <p>{promo.description}</p>
                <div className="promo-price">
                  <strong>{money(promo.price)}</strong>
                  <del>{money(promo.oldPrice)}</del>
                </div>
                <div className="promo-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <Button to={`/contacto?promo=${encodeURIComponent(promo.title)}`} variant="dark">
                    Quiero esta promo
                  </Button>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${promoWhatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-action-btn promo-whatsapp-btn"
                  >
                    <MessageCircle size={15} /> Pedir por WhatsApp
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section promo-note">
        <div className="container">
          <div className="note-card">
            <div className="note-icon"><ShieldCheck /></div>
            <div>
              <h3>¿No sabes cuál te conviene?</h3>
              <p>Escríbenos y te recomendamos una combinación basada en tu negocio, tus medidas y tu objetivo.</p>
            </div>
            <Button to="/cotizador" variant="outline">Recibir recomendación</Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

const CATEGORY_HUB_ITEMS = [
  {
    id: 'Gran formato',
    title: 'Gran Formato',
    desc: 'Lonas publicitarias, vinilos adhesivos, microperforados y roll ups.',
    icon: Image,
    highlight: 'Publicidad Exterior & Eventos'
  },
  {
    id: 'Rótulos y Fachadas',
    title: 'Rótulos & Fachadas',
    desc: 'Cajas de luz, letras 3D corpóreas, neón flex y fachadas comerciales.',
    icon: Sparkles,
    highlight: 'Identidad Comercial & 3D'
  },
  {
    id: 'Imprenta y Papelería',
    title: 'Imprenta Comercial',
    desc: 'Tarjetas de presentación, volantes, carpetas corporativas y facturas SRI.',
    icon: FileText,
    highlight: 'Papelería con SRI / RIMPE'
  },
  {
    id: 'Textil y Promocionales',
    title: 'Textil & Merchandising',
    desc: 'Camisetas sublimadas, gorras, tazas personalizadas y recuerdos corporativos.',
    icon: Package,
    highlight: 'Moda, Eventos & Regalos'
  },
  {
    id: 'Corte y Grabado Láser',
    title: 'Corte & Grabado Láser',
    desc: 'Acrílicos con separadores de aluminio, placas de reconocimiento y MDF.',
    icon: Scissors,
    highlight: 'Precisión & Señalética'
  }
];

const QUICK_SEARCH_TAGS = [
  '#Lona',
  '#Vinil',
  '#RollUp',
  '#Tarjetas',
  '#Camisetas',
  '#Luminoso',
  '#Acrilico',
  '#Tazas',
  '#Microperforado',
  '#Corporeos'
];

function ProductRowCompact({ product, onAdd }) {
  const navigate = useNavigate();
  const calcType = getProductCalcType(product);
  const label = calcType === 'm2' ? 'Por m²' : product.pricingMode === 'tier-total' ? 'Por lote' : product.priceScales?.length ? 'Por volumen' : 'Unidad';

  return (
    <div className="product-list-row">
      <img className="product-list-thumb" src={assetPath(product.image)} alt={product.name} />
      <div className="product-list-main">
        <span className="product-list-category">{product.category}</span>
        <Link to={`/tienda/${product.id}`} className="product-list-title">{product.name}</Link>
        <span className="product-list-specs">{product.description}</span>
      </div>
      <div className="product-list-badge">
        <span className="calc-pill">{label}</span>
      </div>
      <div className="product-list-pricing">
        <strong>Desde {money(product.price)}</strong>
        <small>/ {product.unit}</small>
      </div>
      <div className="product-list-actions">
        <Link to={`/tienda/${product.id}`} className="button button-sm button-ghost" style={{ padding: '6px 12px', fontSize: '11px' }}>
          Cotizar
        </Link>
        <button
          type="button"
          className="icon-button"
          onClick={(e) => {
            e.preventDefault();
            if (calcType === 'm2') {
              navigate(`/tienda/${product.id}`);
            } else {
              onAdd(product);
            }
          }}
          aria-label={calcType === 'm2' ? 'Configurar medidas' : 'Agregar al carrito'}
        >
          {calcType === 'm2' ? <ArrowUpRight size={16} /> : <Plus size={16} />}
        </button>
      </div>
    </div>
  );
}

function StorePage() {
  const { data, addToCart } = useSite();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [visibleLimit, setVisibleLimit] = useState(12);

  const activeParent = searchParams.get('familia') || 'Todos';
  const activeSub = searchParams.get('categoria') || '';

  // Get available subcategories for active parent family
  const availableSubCategories = useMemo(() => {
    if (activeParent === 'Todos') return [];
    const items = data.products.filter((p) => getParentCategory(p.category) === activeParent);
    return Array.from(new Set(items.map((p) => p.category))).filter(Boolean);
  }, [data.products, activeParent]);

  // Counts by parent category
  const categoryCounts = useMemo(() => {
    const counts = { Todos: data.products.length };
    PARENT_CATEGORIES.forEach((cat) => {
      if (cat !== 'Todos') {
        counts[cat] = data.products.filter((p) => getParentCategory(p.category) === cat).length;
      }
    });
    return counts;
  }, [data.products]);

  // Filter products by parent family, subcategory, and text search
  const filtered = useMemo(() => {
    return data.products.filter((product) => {
      const parent = getParentCategory(product.category);
      const matchParent = activeParent === 'Todos' || parent === activeParent;
      const matchSub = !activeSub || product.category === activeSub;
      const term = search.trim().toLowerCase().replace(/^#/, '');
      const matchSearch = !term || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(term);
      return matchParent && matchSub && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [data.products, activeParent, activeSub, search, sortBy]);

  // Visible sliced list for progressive loading
  const visibleProducts = useMemo(() => {
    return filtered.slice(0, visibleLimit);
  }, [filtered, visibleLimit]);

  const setParentFilter = (parent) => {
    setVisibleLimit(12);
    const next = new URLSearchParams();
    if (parent !== 'Todos') next.set('familia', parent);
    setSearchParams(next);
  };

  const setSubFilter = (sub) => {
    setVisibleLimit(12);
    const next = new URLSearchParams(searchParams);
    if (sub) next.set('categoria', sub);
    else next.delete('categoria');
    setSearchParams(next);
  };

  const handleTagClick = (tag) => {
    const cleanTag = tag.replace(/^#/, '');
    if (search.toLowerCase() === cleanTag.toLowerCase()) {
      setSearch('');
    } else {
      setSearch(cleanTag);
      setVisibleLimit(12);
    }
  };

  const add = (item) => addToCart({ ...item, cartId: `${item.id}-${Date.now()}` });

  const progressPercent = Math.min(100, Math.round((visibleProducts.length / Math.max(1, filtered.length)) * 100));

  return (
    <PageShell>
      <section className="inner-hero store-hero">
        <div className="container store-hero-grid">
          <div>
            <span className="eyebrow orange">Catálogo Inteligente Gigaprint</span>
            <h1>Soluciones Visuales.<br /><em>Directo de Taller.</em></h1>
            <p>Explora nuestras 5 familias de producción o busca el material exacto que necesitas para tu marca o negocio.</p>
          </div>
          <div className="store-badge">
            <span>CATÁLOGO<br /><b>{data.products.length}+ ÍTEMS</b></span>
          </div>
        </div>
      </section>

      <section className="section store-section">
        <div className="container">
          {/* Visual Category Hub: Shown on 'Todos' when not searching */}
          {activeParent === 'Todos' && !search && (
            <div className="category-hub-section">
              <div className="category-hub-heading">
                <h3>Familias Principales de Producción</h3>
                <span>Selecciona una categoría para explorar</span>
              </div>
              <div className="category-hub-grid">
                {CATEGORY_HUB_ITEMS.map((hub) => {
                  const IconComp = hub.icon || Package;
                  const count = categoryCounts[hub.id] || 0;
                  return (
                    <button
                      key={hub.id}
                      type="button"
                      className="category-hub-card"
                      onClick={() => setParentFilter(hub.id)}
                    >
                      <div className="category-hub-top">
                        <div className="category-hub-icon">
                          <IconComp size={20} />
                        </div>
                        <span className="category-hub-badge">{count} productos</span>
                      </div>
                      <h4 className="category-hub-title">{hub.title}</h4>
                      <p className="category-hub-desc">{hub.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Parent Category Tabs */}
          <div className="parent-category-tabs">
            {PARENT_CATEGORIES.map((category) => (
              <button
                key={category}
                className={activeParent === category ? 'active' : ''}
                onClick={() => setParentFilter(category)}
              >
                {category}
                <span className="parent-tab-badge">{categoryCounts[category] || 0}</span>
              </button>
            ))}
          </div>

          {/* Secondary Subcategory Pills */}
          {availableSubCategories.length > 1 && (
            <div className="sub-category-pills">
              <button
                className={!activeSub ? 'active' : ''}
                onClick={() => setSubFilter('')}
              >
                Todas las subcategorías ({filtered.length})
              </button>
              {availableSubCategories.map((sub) => {
                const subCount = data.products.filter((p) => p.category === sub).length;
                return (
                  <button
                    key={sub}
                    className={activeSub === sub ? 'active' : ''}
                    onClick={() => setSubFilter(sub)}
                  >
                    {sub} ({subCount})
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Tags Bar */}
          <div className="quick-tags-bar">
            <span><Tag size={12} /> Búsquedas rápidas:</span>
            {QUICK_SEARCH_TAGS.map((tag) => {
              const clean = tag.replace(/^#/, '').toLowerCase();
              const isActive = search.toLowerCase() === clean;
              return (
                <button
                  key={tag}
                  type="button"
                  className={`quick-tag-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Search, Sorting & View Mode Toolbar */}
          <div className="store-toolbar" style={{ marginTop: '16px' }}>
            <label className="search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleLimit(12);
                }}
                placeholder="Busca por material, producto o medida..."
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <div className="store-toolbar-actions">
              {/* View Mode Switcher */}
              <div className="store-view-toggle">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Vista en cuadrícula"
                  aria-label="Vista en cuadrícula"
                >
                  <Grid size={15} />
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Vista en lista compacta"
                  aria-label="Vista en lista compacta"
                >
                  <List size={15} />
                </button>
              </div>

              {/* Sorting Select */}
              <select
                className="store-sorting-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar productos"
              >
                <option value="featured">Destacados primero</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name">Nombre: A — Z</option>
              </select>

              <span className="store-count-badge">
                {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
          </div>

          {/* Product Grid / List Layout */}
          <div className="store-layout">
            {viewMode === 'grid' ? (
              <div className="product-grid full">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={add} />
                ))}
              </div>
            ) : (
              <div className="product-list-view">
                {visibleProducts.map((product) => (
                  <ProductRowCompact key={product.id} product={product} onAdd={add} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="empty-catalog-state">
                <Package size={36} />
                <h3>No encontramos productos con esos filtros</h3>
                <p>Prueba con otros términos de búsqueda o selecciona otra categoría.</p>
                <button
                  className="button button-ghost"
                  onClick={() => {
                    setSearch('');
                    setParentFilter('Todos');
                    setVisibleLimit(12);
                  }}
                >
                  Restablecer filtros
                </button>
              </div>
            )}

            {/* Progressive Loading / Pagination Bar */}
            {filtered.length > visibleProducts.length && (
              <div className="store-pagination-wrap">
                <div className="store-pagination-progress">
                  <span>Mostrando {visibleProducts.length} de {filtered.length} productos</span>
                  <div className="store-progress-track">
                    <div className="store-progress-bar" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="store-pagination-buttons">
                  <button
                    type="button"
                    className="store-load-more-btn"
                    onClick={() => setVisibleLimit((current) => current + 12)}
                  >
                    Mostrar más productos (+12)
                  </button>
                  <button
                    type="button"
                    className="store-show-all-btn"
                    onClick={() => setVisibleLimit(filtered.length)}
                  >
                    Ver todos ({filtered.length})
                  </button>
                </div>
              </div>
            )}

            {/* Custom Project Aside */}
            <aside className="store-aside" style={{ marginTop: '24px' }}>
              <div>
                <span className="eyebrow">¿Necesitas algo especial?</span>
                <h3>Si no lo ves, probablemente también lo hacemos.</h3>
                <p>Trabajamos proyectos a medida, desde un solo ejemplar hasta producciones corporativas grandes con instalación en sitio.</p>
                <Button to="/contacto" variant="outline">Pedir algo a medida</Button>
              </div>
              <img src={media.laser} alt="Corte y grabado láser" />
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function SmartProductDetailPage() {
  const { id } = useParams();
  const { data, addToCart } = useSite();
  const product = data.products.find((item) => item.id === id) || data.products[0];
  const [quantity, setQuantity] = useState(Math.max(1, Number(product?.minQuantity || 1)));
  const [widthCm, setWidthCm] = useState(100);
  const [heightCm, setHeightCm] = useState(100);
  const [selection, setSelection] = useState({});
  const [designLevel, setDesignLevel] = useState('none');
  const [finishing, setFinishing] = useState('none');
  const [eyeletPreset, setEyeletPreset] = useState('corners');
  const [customEyelets, setCustomEyelets] = useState(4);
  const [installation, setInstallation] = useState(false);
  
  const options = getVariantOptions(product);
  const safeSelection = options.reduce((result, option) => ({
    ...result,
    [option.key]: option.values?.some((value) => value.value === selection[option.key])
      ? selection[option.key]
      : option.values?.[0]?.value
  }), {});
  
  const isArea = getProductCalcType(product) === 'm2';
  const calcSettings = data.calculatorSettings || {
    taxRate: 15,
    designAdaptationPrice: 5,
    designFromScratchPrice: 15,
    eyeletSmallPrice: 0.30,
    eyeletLargePrice: 0.50
  };

  const designCost = designLevel === 'adaptation'
    ? Number(calcSettings.designAdaptationPrice || 5)
    : designLevel === 'full'
      ? Number(calcSettings.designFromScratchPrice || 15)
      : 0;

  const minQty = Math.max(1, Number(product?.minQuantity || 1));
  const effectiveQty = Math.max(minQty, quantity);

  // Dynamic eyelets calculations
  const calculatedPerimeter50 = useMemo(() => {
    const w = Math.max(1, Math.ceil(widthCm / 50));
    const h = Math.max(1, Math.ceil(heightCm / 50));
    return Math.max(4, 2 * (w + h));
  }, [widthCm, heightCm]);

  const calculatedPerimeter30 = useMemo(() => {
    const w = Math.max(1, Math.ceil(widthCm / 30));
    const h = Math.max(1, Math.ceil(heightCm / 30));
    return Math.max(4, 2 * (w + h));
  }, [widthCm, heightCm]);

  const effectiveEyeletCount = useMemo(() => {
    if (finishing === 'none' || finishing === 'bolsillo') return 0;
    if (eyeletPreset === 'corners') return 4;
    if (eyeletPreset === 'every50') return calculatedPerimeter50;
    if (eyeletPreset === 'every30') return calculatedPerimeter30;
    return Math.max(1, Number(customEyelets) || 1);
  }, [finishing, eyeletPreset, calculatedPerimeter50, calculatedPerimeter30, customEyelets]);

  const eyeletUnitPrice = finishing === 'small' ? Number(calcSettings.eyeletSmallPrice || 0.30) : finishing === 'large' ? Number(calcSettings.eyeletLargePrice || 0.50) : 0;
  const finishingCostPerPiece = finishing === 'bolsillo' ? 4.0 : (effectiveEyeletCount * eyeletUnitPrice);
  const finishingCost = isArea ? finishingCostPerPiece * effectiveQty : 0;

  const installationCost = installation && isArea && product?.price_inst
    ? Math.max(0, (Number(product.price_inst) - Number(product.price || 0)) * ((widthCm / 100) * (heightCm / 100)) * effectiveQty)
    : 0;

  const extrasList = [];
  if (finishingCost > 0) extrasList.push({ price: finishingCost, name: 'Acabados' });
  if (installationCost > 0) extrasList.push({ price: installationCost, name: 'Instalación' });

  const quote = calculateCatalogQuote(product, {
    width: widthCm / 100,
    height: heightCm / 100,
    quantity: effectiveQty,
    options: safeSelection,
    taxRate: Number(calcSettings.taxRate) || 15,
    designCost,
    extras: extrasList
  });
  
  const activeTier = quote.tier;
  const tiers = quote.tiers || [];

  const allSelectionLabels = [
    selection.sustrato ? `Sustrato: ${selection.sustrato}` : '',
    ...Object.values(safeSelection).filter(Boolean)
  ].filter(Boolean);
  const selectionText = allSelectionLabels.join(' · ');

  const readableFinishing = finishing === 'bolsillo'
    ? 'Bolsillo para tubo'
    : finishing === 'small'
      ? `${effectiveEyeletCount} ojales pequeños`
      : finishing === 'large'
        ? `${effectiveEyeletCount} ojales grandes`
        : '';

  const readableVariant = [
    selectionText,
    isArea ? `${widthCm} × ${heightCm} cm (${quote.area.toFixed(2)} m²)` : '',
    `${effectiveQty} ${product.pricingMode === 'tier-total' ? 'unidades (lote)' : product.unit || 'unidades'}`,
    readableFinishing ? `Acabado: ${readableFinishing}` : '',
    installation ? 'Instalación incluida' : '',
    designLevel === 'adaptation' ? 'Ajuste de diseño' : designLevel === 'full' ? 'Diseño profesional' : ''
  ].filter(Boolean).join(' · ');

  const add = () => {
    const fingerprint = `${product.id}:${JSON.stringify({ safeSelection, sustrato: selection.sustrato || null, widthCm: isArea ? widthCm : null, heightCm: isArea ? heightCm : null, quantity: effectiveQty, designLevel, finishing, installation })}`;
    addToCart({
      ...product,
      price: quote.total,
      quantity: 1,
      cartId: `${product.id}-${Date.now()}`,
      configFingerprint: fingerprint,
      variant: readableVariant,
      quoteBreakdown: quote
    });
  };

  return (
    <PageShell>
      <section className="section detail-section">
        <div className="container detail-grid">
          <div className="detail-image">
            <img src={assetPath(product.image)} alt={product.name} />
          </div>
          <div className="detail-copy">
            <span className="eyebrow orange">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="detail-description">{product.description}</p>
            <div className="detail-price">
              Estimado con IVA (15%): <strong>{money(quote.total)}</strong>
              <span> / {isArea ? `${(quote.area * effectiveQty).toFixed(2)} m²` : product.pricingMode === 'tier-total' ? 'lote' : `${effectiveQty} ${product.unit}`}</span>
            </div>

            {options.length > 0 && (
              <div className="detail-options">
                {options.map((option) => (
                  <label key={option.key}>
                    {option.label}
                    <select
                      value={safeSelection[option.key] || ''}
                      onChange={(event) => setSelection((current) => ({ ...current, [option.key]: event.target.value }))}
                    >
                      {option.values?.map((value) => (
                        <option key={value.id} value={value.value}>{value.label}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}

            {isArea && (
              <div className="detail-inline-dimensions">
                <h4>📐 Medidas en centímetros</h4>
                <div className="fields two">
                  <label>
                    Ancho (cm)
                    <input
                      type="number"
                      min="1"
                      value={widthCm}
                      onChange={(e) => setWidthCm(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </label>
                  <label>
                    Alto (cm)
                    <input
                      type="number"
                      min="1"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </label>
                </div>
                <div className="detail-area-tag">
                  Área unitaria: {quote.area.toFixed(2)} m² · Tarifa activa: {money(quote.rate)} / m²
                </div>
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <LiveScaleVisualizer
                    widthCm={widthCm}
                    heightCm={heightCm}
                    eyeletMode={finishing === 'none' || finishing === 'bolsillo' ? 'none' : eyeletPreset === 'corners' ? '4-corners' : eyeletPreset === 'every50' ? 'perimeter-50' : eyeletPreset === 'every30' ? 'perimeter-30' : 'custom'}
                    customEyeletCount={effectiveEyeletCount}
                    productName={product.name}
                    category={product.category}
                  />
                </div>

                {/* Finishing & Confección (Only for Banners / Lonas / Gran Formato) */}
                {(/lona|banner|mesh|valla|gran formato/i.test(product?.category || '') || /lona|banner|mesh|valla/i.test(product?.name || '')) && (
                  <div className="finishing-select-group" style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink)' }}>Acabados y confección:</label>
                    <div className="design-options-grid" style={{ marginTop: '8px' }}>
                      <label className={`design-option-card ${finishing === 'none' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="detail-finishing"
                          checked={finishing === 'none'}
                          onChange={() => setFinishing('none')}
                        />
                        <div className="design-option-copy">
                          <b>Corte al ras</b>
                          <small>Sin ojales ni bolsillos.</small>
                        </div>
                        <span className="design-option-price">$0</span>
                      </label>

                      <label className={`design-option-card ${finishing === 'small' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="detail-finishing"
                          checked={finishing === 'small'}
                          onChange={() => setFinishing('small')}
                        />
                        <div className="design-option-copy">
                          <b>Ojales Pequeños</b>
                          <small>10 mm estándar.</small>
                        </div>
                        <span className="design-option-price">$0.30 c/u</span>
                      </label>

                      <label className={`design-option-card ${finishing === 'large' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="detail-finishing"
                          checked={finishing === 'large'}
                          onChange={() => setFinishing('large')}
                        />
                        <div className="design-option-copy">
                          <b>Ojales Grandes Reforzados</b>
                          <small>15 mm exterior / alto viento.</small>
                        </div>
                        <span className="design-option-price">$0.50 c/u</span>
                      </label>

                      <label className={`design-option-card ${finishing === 'bolsillo' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="detail-finishing"
                          checked={finishing === 'bolsillo'}
                          onChange={() => setFinishing('bolsillo')}
                        />
                        <div className="design-option-copy">
                          <b>Bolsillo para tubo</b>
                          <small>Superior e inferior.</small>
                        </div>
                        <span className="design-option-price">+$4.00</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tiers.length > 1 && !isArea && (
              <div className="quote-tiers" style={{ marginTop: '12px', marginBottom: '16px' }}>
                {tiers.slice(0, 6).map((tier) => (
                  <button
                    key={tier.qty}
                    type="button"
                    onClick={() => setQuantity(Math.max(minQty, Number(tier.qty)))}
                    className={effectiveQty >= Number(tier.qty) && activeTier.qty === tier.qty ? 'active' : ''}
                  >
                    <span>Desde {tier.qty} {product.pricingMode === 'tier-total' ? 'uds' : product.unit}</span>
                    <b>{money(tier.price)}{product.pricingMode === 'tier-total' ? ' / lote' : ' / u'}</b>
                  </button>
                ))}
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="detail-size-list">
                <span>Tamaños disponibles</span>
                <div>{product.sizes.map((size) => <b key={size.id || size.label}>{size.label || size}</b>)}</div>
              </div>
            )}

            <ul className="spec-list">
              {(product.specs || []).map((spec) => (
                <li key={spec}><Check size={16} /> {spec}</li>
              ))}
            </ul>

            <div className="lead-time-badge" style={{ marginBottom: '16px' }}>
              <Clock size={15} /> Producción estimada: <b>{quote.leadTime}</b>
            </div>

            <div className="detail-actions">
              <div className="qty large">
                <button type="button" onClick={() => setQuantity(Math.max(minQty, effectiveQty - 1))} disabled={effectiveQty <= minQty} aria-label="Disminuir cantidad">
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={minQty}
                  value={effectiveQty}
                  onChange={(e) => setQuantity(Math.max(minQty, parseInt(e.target.value, 10) || minQty))}
                  style={{ width: '60px', border: '0', background: 'transparent', textAlign: 'center', fontWeight: '800', fontSize: '16px', color: 'var(--ink)' }}
                  aria-label="Cantidad exacta"
                />
                <button type="button" onClick={() => setQuantity(effectiveQty + 1)} aria-label="Aumentar cantidad">
                  <Plus size={16} />
                </button>
              </div>
              <Button onClick={add}>Agregar a cotización ({money(quote.total)})</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <a
                href={`https://wa.me/${data.settings?.whatsapp || '593999999999'}?text=${encodeURIComponent(`¡Hola Gigaprint! Deseo cotizar *${product.name}*:\n• Detalle: ${readableVariant}\n• Subtotal: ${money(quote.subtotal)}\n• Total con IVA (15%): ${money(quote.total)}\n¿Tienen disponibilidad y entrega en Quito / Ecuador?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-action-btn"
              >
                <MessageCircle size={16} /> Cotizar este producto por WhatsApp
              </a>

              <Link to={`/cotizador`} className="detail-link">
                ¿Quieres personalizar con acabados, instalación o diseño completo? Abrir cotizador general <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function SmartQuotePage() {
  const { data, addToCart } = useSite();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'medidas';
  const initialCategory = searchParams.get('categoria') || 'Todos';

  const [mode, setMode] = useState(initialMode);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [widthCm, setWidthCm] = useState(100);
  const [heightCm, setHeightCm] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [designLevel, setDesignLevel] = useState('none');
  const [finishing, setFinishing] = useState('none'); // 'none' | 'small' | 'large' | 'bolsillo'
  const [eyeletPreset, setEyeletPreset] = useState('corners'); // 'corners' | 'every50' | 'every30' | 'custom'
  const [customEyelets, setCustomEyelets] = useState(4);
  const [installation, setInstallation] = useState(false);
  const [selection, setSelection] = useState({});

  const calcSettings = data.calculatorSettings || {
    taxRate: 15,
    designAdaptationPrice: 5,
    designFromScratchPrice: 15,
    eyeletSmallPrice: 0.30,
    eyeletLargePrice: 0.50,
    disclaimer: 'Los valores son referenciales y se confirman con especificaciones y arte final.'
  };

  const areaProducts = useMemo(() => data.products.filter((p) => getProductCalcType(p) === 'm2'), [data.products]);
  const lotProducts = useMemo(() => data.products.filter((p) => p.pricingMode === 'tier-total'), [data.products]);
  const unitProducts = useMemo(() => data.products.filter((p) => getProductCalcType(p) !== 'm2' && p.pricingMode !== 'tier-total'), [data.products]);

  const sourceProducts = mode === 'medidas' ? areaProducts : mode === 'lotes' ? lotProducts : unitProducts;
  
  const filteredProducts = sourceProducts.filter((product) => {
    const parent = getParentCategory(product.category);
    const matchCategory = categoryFilter === 'Todos' || product.category === categoryFilter || parent === categoryFilter ||
      (categoryFilter === 'Gran formato' && /lona|vinil|microperforado|banner/i.test(`${product.category} ${product.name}`)) ||
      (categoryFilter === 'Textil' && /camiseta|polo|body|sublimacion|dtf/i.test(`${product.category} ${product.name}`)) ||
      (categoryFilter === 'Imprenta' && /imprenta|tarjeta|volante|factura|carpeta|credencial/i.test(`${product.category} ${product.name}`)) ||
      (categoryFilter === 'Promocionales' && /taza|souvenir|gorra|almohada|bolso|mochila/i.test(`${product.category} ${product.name}`)) ||
      (categoryFilter === 'Rótulos' && /rotulo|letrero|neon|luminoso|acrilico|laser|placa/i.test(`${product.category} ${product.name}`));
    const matchSearch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const selectedProduct = sourceProducts.find((p) => p.id === selectedId) || filteredProducts[0] || sourceProducts[0] || data.products[0];
  const variantOptions = getVariantOptions(selectedProduct);
  const safeSelection = variantOptions.reduce((result, option) => {
    const selected = selection[option.key];
    result[option.key] = option.values?.some((value) => value.value === selected) ? selected : option.values?.[0]?.value;
    return result;
  }, {});

  const isArea = getProductCalcType(selectedProduct) === 'm2';
  const minQuantity = Math.max(1, Number(selectedProduct?.minQuantity || 1));
  const effectiveQuantity = Math.max(minQuantity, quantity);
  const tiers = getPriceTiers(selectedProduct, safeSelection);

  // Dynamic eyelet perimeter calculations
  const calculatedPerimeter50 = useMemo(() => {
    const w = Math.max(1, Math.ceil(widthCm / 50));
    const h = Math.max(1, Math.ceil(heightCm / 50));
    return Math.max(4, 2 * (w + h));
  }, [widthCm, heightCm]);

  const calculatedPerimeter30 = useMemo(() => {
    const w = Math.max(1, Math.ceil(widthCm / 30));
    const h = Math.max(1, Math.ceil(heightCm / 30));
    return Math.max(4, 2 * (w + h));
  }, [widthCm, heightCm]);

  const effectiveEyeletCount = useMemo(() => {
    if (finishing === 'none' || finishing === 'bolsillo') return 0;
    if (eyeletPreset === 'corners') return 4;
    if (eyeletPreset === 'every50') return calculatedPerimeter50;
    if (eyeletPreset === 'every30') return calculatedPerimeter30;
    return Math.max(1, Number(customEyelets) || 1);
  }, [finishing, eyeletPreset, calculatedPerimeter50, calculatedPerimeter30, customEyelets]);

  const eyeletUnitPrice = finishing === 'small' ? Number(calcSettings.eyeletSmallPrice || 0.30) : finishing === 'large' ? Number(calcSettings.eyeletLargePrice || 0.50) : 0;
  const finishingCostPerPiece = finishing === 'bolsillo' ? 4.0 : (effectiveEyeletCount * eyeletUnitPrice);
  const finishingCost = isArea ? finishingCostPerPiece * effectiveQuantity : 0;
  const totalEyeletsAllPieces = effectiveEyeletCount * effectiveQuantity;

  // 2D Canvas dynamic grommets positioning
  const canvasGrommets = useMemo(() => {
    if (finishing !== 'small' && finishing !== 'large') return [];
    if (effectiveEyeletCount === 4) {
      return [
        { key: 'tl', className: 'top-left' },
        { key: 'tr', className: 'top-right' },
        { key: 'bl', className: 'bottom-left' },
        { key: 'br', className: 'bottom-right' }
      ];
    }
    const list = [
      { key: 'tl', className: 'top-left' },
      { key: 'tr', className: 'top-right' },
      { key: 'bl', className: 'bottom-left' },
      { key: 'br', className: 'bottom-right' }
    ];
    const remaining = Math.max(0, effectiveEyeletCount - 4);
    const horizEach = Math.max(0, Math.round((remaining * (widthCm / Math.max(1, widthCm + heightCm))) / 2));
    const vertEach = Math.max(0, Math.round((remaining - (horizEach * 2)) / 2));

    for (let i = 1; i <= horizEach; i++) {
      const pct = (i / (horizEach + 1)) * 100;
      list.push({ key: `t-${i}`, style: { top: '7px', left: `${pct}%`, transform: 'translateX(-50%)' } });
      list.push({ key: `b-${i}`, style: { bottom: '7px', left: `${pct}%`, transform: 'translateX(-50%)' } });
    }
    for (let j = 1; j <= vertEach; j++) {
      const pct = (j / (vertEach + 1)) * 100;
      list.push({ key: `l-${j}`, style: { top: `${pct}%`, left: '7px', transform: 'translateY(-50%)' } });
      list.push({ key: `r-${j}`, style: { top: `${pct}%`, right: '7px', transform: 'translateY(-50%)' } });
    }
    return list;
  }, [finishing, effectiveEyeletCount, widthCm, heightCm]);

  const designCost = designLevel === 'adaptation'
    ? Number(calcSettings.designAdaptationPrice || 5)
    : designLevel === 'full'
      ? Number(calcSettings.designFromScratchPrice || 15)
      : 0;

  const installationCost = installation && isArea && selectedProduct?.price_inst
    ? Math.max(0, (Number(selectedProduct.price_inst) - Number(selectedProduct.price || 0)) * ((widthCm / 100) * (heightCm / 100)) * effectiveQuantity)
    : 0;

  const extrasList = [];
  if (finishingCost > 0) extrasList.push({ price: finishingCost, name: 'Acabados' });
  if (installationCost > 0) extrasList.push({ price: installationCost, name: 'Instalación' });

  const quote = calculateCatalogQuote(selectedProduct, {
    width: widthCm / 100,
    height: heightCm / 100,
    quantity: effectiveQuantity,
    options: safeSelection,
    taxRate: Number(calcSettings.taxRate) || 15,
    designCost,
    extras: extrasList
  });

  const activeTier = quote.tier;
  const allSelectionLabels = [
    selection.sustrato ? `Sustrato: ${selection.sustrato}` : '',
    ...Object.values(safeSelection).filter(Boolean)
  ].filter(Boolean);
  const selectionText = allSelectionLabels.join(' · ');

  const chooseMode = (nextMode) => {
    setMode(nextMode);
    setSearch('');
    setSelectedId('');
    setCategoryFilter('Todos');
    setSelection({});
    setFinishing('none');
    setEyeletPreset('corners');
    setCustomEyelets(4);
    setInstallation(false);
    setDesignLevel('none');
    setIsDropdownOpen(false);
    setQuantity(nextMode === 'medidas' ? 1 : nextMode === 'lotes' ? 1000 : 12);
  };

  const chooseProduct = (product) => {
    setSelectedId(product.id);
    setSelection({});
    setQuantity(Math.max(1, Number(product.minQuantity || 1), mode === 'lotes' ? 1000 : mode === 'unidades' ? 12 : 1));
    setDesignLevel('none');
    setFinishing('none');
    setEyeletPreset('corners');
    setCustomEyelets(4);
    setInstallation(false);
    setIsDropdownOpen(false);
  };

  const setDimensionPreset = (w, h) => {
    setWidthCm(w);
    setHeightCm(h);
  };

  const readableDimensions = isArea
    ? `${widthCm} × ${heightCm} cm (${quote.area.toFixed(2)} m²)`
    : `${effectiveQuantity} ${selectedProduct?.pricingMode === 'tier-total' ? 'unidades (lote)' : selectedProduct?.unit || 'unidades'}`;

  const readableDesign = designLevel === 'adaptation'
    ? 'Adaptación / Ajuste de medidas'
    : designLevel === 'full'
      ? 'Diseño profesional desde cero'
      : 'Arte listo del cliente';

  const readableFinishing = finishing === 'bolsillo'
    ? 'Bolsillo para tubo'
    : finishing === 'small'
      ? `${effectiveEyeletCount} ojales pequeños ($${eyeletUnitPrice.toFixed(2)} c/u)`
      : finishing === 'large'
        ? `${effectiveEyeletCount} ojales grandes ($${eyeletUnitPrice.toFixed(2)} c/u)`
        : 'Corte al ras / Sin ojales';

  const add = () => {
    if (!selectedProduct) return;
    const readableVariant = [
      selectionText,
      readableDimensions,
      designLevel !== 'none' ? readableDesign : '',
      isArea && finishing !== 'none' ? `Acabado: ${readableFinishing}` : '',
      installation ? 'Instalación incluida' : ''
    ].filter(Boolean).join(' · ');

    const fingerprint = `${selectedProduct.id}:${JSON.stringify({ safeSelection, sustrato: selection.sustrato || null, widthCm: isArea ? widthCm : null, heightCm: isArea ? heightCm : null, quantity: effectiveQuantity, designLevel, finishing, installation })}`;
    addToCart({
      ...selectedProduct,
      price: quote.total,
      cartId: `quote-${Date.now()}`,
      quantity: 1,
      variant: readableVariant,
      configFingerprint: fingerprint,
      quoteBreakdown: quote
    });
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola Gigaprint! Deseo solicitar una cotización con los siguientes datos:\n\n` +
    `• *Producto:* ${selectedProduct?.name} (${selectedProduct?.category})\n` +
    (selectionText ? `• *Especificaciones:* ${selectionText}\n` : '') +
    `• *Medidas / Cantidad:* ${readableDimensions}\n` +
    `• *Diseño:* ${readableDesign}\n` +
    (isArea && finishing !== 'none' ? `• *Acabado:* ${readableFinishing}\n` : '') +
    (installation ? `• *Instalación:* Sí (en sitio)\n` : '') +
    `• *Subtotal estimado:* ${money(quote.subtotal)}\n` +
    `• *Total con IVA (15%):* ${money(quote.total)}\n\n` +
    `¿Podrían confirmarme disponibilidad y tiempo de entrega?`
  );

  return (
    <PageShell>
      <section className="inner-hero quote-hero">
        <div className="container quote-hero-grid">
          <div>
            <span className="eyebrow orange">Cotizador Inteligente</span>
            <h1>Calcula tu proyecto<br /><em>en segundos y con precisión.</em></h1>
            <p>Elige tu tipo de producto, define medidas o volumen y obtén de inmediato tarifas con IVA y desglose oficial.</p>
          </div>
          <div className="quote-badge">
            <span>TARIFA SRI<br /><b>IVA 15%</b></span>
          </div>
        </div>
      </section>

      <section className="section quote-section">
        <div className="container quote-layout">
          <div className="quote-form-card">
            {/* Mode Switcher */}
            <div className="mode-toggle three-cols">
              <button
                type="button"
                className={mode === 'medidas' ? 'active' : ''}
                onClick={() => chooseMode('medidas')}
              >
                📐 Por medidas (m²)
              </button>
              <button
                type="button"
                className={mode === 'unidades' ? 'active' : ''}
                onClick={() => chooseMode('unidades')}
              >
                👕 Por volumen / unidades
              </button>
              <button
                type="button"
                className={mode === 'lotes' ? 'active' : ''}
                onClick={() => chooseMode('lotes')}
              >
                📦 Por lotes / imprenta
              </button>
            </div>

            {/* Step 1: Product Selection */}
            <div className="quote-step">
              <span>01</span>
              <div className="step-content">
                <div className="step-heading">
                  <div>
                    <h3>Producto base del cotizador</h3>
                    <p>
                      {mode === 'medidas'
                        ? 'Lonas, viniles, rótulos y displays calculados por metro cuadrado.'
                        : mode === 'lotes'
                          ? 'Papelería, tarjetas, volantes, carpetas y fundas por millar.'
                          : 'Textiles, gorras, tazas, souvenirs y productos con escala por volumen.'}
                    </p>
                  </div>
                </div>

                <div className="smart-product-selector">
                  {/* Selected Product Showcase Card */}
                  {selectedProduct && (
                    <div className="selected-product-showcase">
                      <div className="showcase-media">
                        <img src={assetPath(selectedProduct.image)} alt={selectedProduct.name} />
                        <span className="showcase-badge">
                          {isArea ? 'Por m²' : selectedProduct.pricingMode === 'tier-total' ? 'Por lote' : 'Por volumen'}
                        </span>
                      </div>
                      <div className="showcase-info">
                        <div className="showcase-header">
                          <span className="showcase-category">{selectedProduct.category}</span>
                        </div>
                        <h4 className="showcase-title">{selectedProduct.name}</h4>
                        <p className="showcase-desc">{selectedProduct.description}</p>
                        <div className="showcase-meta">
                          <span className="showcase-price-tag">
                            Desde {money(selectedProduct.price)} <small>/ {selectedProduct.unit}</small>
                          </span>
                          {selectedProduct.specs?.slice(0, 2).map((spec, i) => (
                            <span key={i} className="showcase-spec-pill">{spec}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="showcase-change-btn"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        aria-expanded={isDropdownOpen}
                      >
                        {isDropdownOpen ? (
                          <>Cerrar lista <ChevronUp size={15} /></>
                        ) : (
                          <>Cambiar producto <ChevronDown size={15} /></>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Smart Dropdown Panel / Search Combobox */}
                  {isDropdownOpen && (
                    <div className="smart-dropdown-panel">
                      <div className="dropdown-header-bar">
                        <h4>Selecciona un producto del catálogo ({filteredProducts.length})</h4>
                        <button
                          type="button"
                          className="dropdown-close-btn"
                          onClick={() => setIsDropdownOpen(false)}
                          aria-label="Cerrar lista"
                        >
                          <X size={17} />
                        </button>
                      </div>

                      {/* Category Pills Filter */}
                      <div className="quote-category-pills">
                        {['Todos', 'Gran formato', 'Textil', 'Imprenta', 'Promocionales', 'Rótulos'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            className={categoryFilter === cat ? 'active' : ''}
                            onClick={() => setCategoryFilter(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Live Search Input */}
                      <div className="dropdown-search-wrap">
                        <Search size={16} />
                        <input
                          autoFocus
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Buscar producto por nombre o material (ej. lona, camiseta, tarjeta, jarro)..."
                          className="dropdown-search-input"
                        />
                        {search && (
                          <button
                            type="button"
                            className="dropdown-search-clear"
                            onClick={() => setSearch('')}
                            aria-label="Limpiar búsqueda"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Compact Scrollable List */}
                      <div className="dropdown-items-scroll">
                        {filteredProducts.map((product) => {
                          const isSelected = selectedProduct?.id === product.id;
                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => chooseProduct(product)}
                              className={`dropdown-item-row ${isSelected ? 'active' : ''}`}
                            >
                              <img className="dropdown-item-thumb" src={assetPath(product.image)} alt="" />
                              <div className="dropdown-item-info">
                                <span className="dropdown-item-title">{product.name}</span>
                                <span className="dropdown-item-cat">{product.category}</span>
                              </div>
                              <div className="dropdown-item-right">
                                <span className="dropdown-item-price">Desde {money(product.price)}</span>
                                {isSelected && <Check size={16} className="dropdown-item-check" />}
                              </div>
                            </button>
                          );
                        })}
                        {filteredProducts.length === 0 && (
                          <div className="smart-empty" style={{ padding: '24px 12px', textAlign: 'center' }}>
                            <p>No encontramos productos que coincidan con tu búsqueda.</p>
                            <button
                              type="button"
                              className="button button-outline"
                              style={{ marginTop: '10px' }}
                              onClick={() => { setSearch(''); setCategoryFilter('Todos'); }}
                            >
                              Restablecer filtros
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Variant Selection */}
            {selectedProduct && variantOptions.length > 0 && (
              <div className="quote-step">
                <span>02</span>
                <div className="step-content">
                  <h3>Especificaciones del producto</h3>
                  {variantOptions.map((option) => (
                    <label className="quote-option" key={option.key}>
                      <span>{option.label}</span>
                      <select
                        value={safeSelection[option.key] || ''}
                        onChange={(event) => setSelection((current) => ({ ...current, [option.key]: event.target.value }))}
                      >
                        {option.values?.map((value) => (
                          <option key={value.id} value={value.value}>{value.label}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Dimensions / Quantity / Tiers */}
            {isArea ? (
              <div className="quote-step">
                <span>{variantOptions.length ? '03' : '02'}</span>
                <div className="step-content">
                  <h3>Define las medidas exactas</h3>

                  <div className="dimension-presets">
                    <span>Tamaños comunes:</span>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(100, 100)}>100 × 100 cm</button>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(200, 100)}>200 × 100 cm</button>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(300, 100)}>300 × 100 cm</button>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(200, 200)}>200 × 200 cm</button>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(400, 150)}>400 × 150 cm</button>
                  </div>

                  <div className="fields two">
                    <label>
                      Ancho (cm)
                      <input
                        type="number"
                        min="1"
                        value={widthCm}
                        onChange={(event) => setWidthCm(Math.max(1, Number(event.target.value) || 1))}
                      />
                    </label>
                    <label>
                      Alto (cm)
                      <input
                        type="number"
                        min="1"
                        value={heightCm}
                        onChange={(event) => setHeightCm(Math.max(1, Number(event.target.value) || 1))}
                      />
                    </label>
                  </div>

                  {/* Interactive Scale Visualizer */}
                  <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                    <LiveScaleVisualizer
                      widthCm={widthCm}
                      heightCm={heightCm}
                      eyeletMode={finishing === 'none' || finishing === 'bolsillo' ? 'none' : eyeletPreset === 'corners' ? '4-corners' : eyeletPreset === 'every50' ? 'perimeter-50' : eyeletPreset === 'every30' ? 'perimeter-30' : 'custom'}
                      customEyeletCount={effectiveEyeletCount}
                      productName={selectedProduct?.name}
                      category={selectedProduct?.category}
                    />
                  </div>

                  <div className="quote-insight">
                    <span>Área calculada</span>
                    <strong>{quote.area.toFixed(2)} m² <small>por pieza</small></strong>
                    <small>Área total del pedido: {(quote.area * effectiveQuantity).toFixed(2)} m² · Tarifa activa: {money(activeTier.price)} / m²</small>
                  </div>

                  <div className="smart-quantity-controller">
                    <div className="quantity-controller-head">
                      <label>Cantidad de piezas</label>
                      <span>Área total: {(quote.area * effectiveQuantity).toFixed(2)} m²</span>
                    </div>

                    <div className="quantity-stepper-row">
                      <div className="quantity-stepper-box">
                        <button
                          type="button"
                          className="quantity-stepper-btn"
                          onClick={() => setQuantity(Math.max(minQuantity, effectiveQuantity - 1))}
                          disabled={effectiveQuantity <= minQuantity}
                          aria-label="Disminuir una pieza"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          min={minQuantity}
                          value={effectiveQuantity}
                          onChange={(event) => setQuantity(Math.max(minQuantity, parseInt(event.target.value, 10) || minQuantity))}
                          className="quantity-stepper-input"
                          aria-label="Cantidad exacta de piezas"
                        />
                        <button
                          type="button"
                          className="quantity-stepper-btn"
                          onClick={() => setQuantity(effectiveQuantity + 1)}
                          aria-label="Aumentar una pieza"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="quantity-quick-increments">
                        <button type="button" className="quick-inc-btn" onClick={() => setQuantity(effectiveQuantity + 1)}>+1</button>
                        <button type="button" className="quick-inc-btn" onClick={() => setQuantity(effectiveQuantity + 5)}>+5</button>
                        <button type="button" className="quick-inc-btn" onClick={() => setQuantity(effectiveQuantity + 10)}>+10</button>
                      </div>
                    </div>

                    <div className="quantity-quick-presets">
                      <span>Sugeridos:</span>
                      {[1, 2, 3, 5, 10, 20, 50].map((qtyVal) => (
                        <button
                          key={qtyVal}
                          type="button"
                          className={`qty-preset-btn ${effectiveQuantity === qtyVal ? 'active' : ''}`}
                          onClick={() => setQuantity(qtyVal)}
                        >
                          {qtyVal} {qtyVal === 1 ? 'pieza' : 'piezas'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Finishing & Custom Eyelets Options (Only for Banners / Lonas / Gran Formato) */}
                  {isArea && (/lona|banner|mesh|valla|gran formato/i.test(selectedProduct?.category || '') || /lona|banner|mesh|valla/i.test(selectedProduct?.name || '')) && (
                    <div className="finishing-select-group">
                      <label>Acabados y confección</label>
                      <div className="design-options-grid">
                        <label className={`design-option-card ${finishing === 'none' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="finishing"
                            checked={finishing === 'none'}
                            onChange={() => setFinishing('none')}
                          />
                          <div className="design-option-copy">
                            <b>Corte al ras / Sin ojales</b>
                            <small>Listo para enmarcar, montar o tensar.</small>
                          </div>
                          <span className="design-option-price">$0</span>
                        </label>

                        <label className={`design-option-card ${finishing === 'small' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="finishing"
                            checked={finishing === 'small'}
                            onChange={() => {
                              setFinishing('small');
                              if (eyeletPreset === 'custom' && customEyelets < 4) setCustomEyelets(4);
                            }}
                          />
                          <div className="design-option-copy">
                            <b>Ojales Pequeños (10 mm)</b>
                            <small>Ojales metálicos estándar para colgar o tensar.</small>
                          </div>
                          <span className="design-option-price">$0.30 c/u</span>
                        </label>

                        <label className={`design-option-card ${finishing === 'large' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="finishing"
                            checked={finishing === 'large'}
                            onChange={() => {
                              setFinishing('large');
                              if (eyeletPreset === 'custom' && customEyelets < 4) setCustomEyelets(4);
                            }}
                          />
                          <div className="design-option-copy">
                            <b>Ojales Grandes Reforzados (15 mm)</b>
                            <small>Ojales industriales para exterior y alto viento.</small>
                          </div>
                          <span className="design-option-price">$0.50 c/u</span>
                        </label>

                        <label className={`design-option-card ${finishing === 'bolsillo' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="finishing"
                            checked={finishing === 'bolsillo'}
                            onChange={() => setFinishing('bolsillo')}
                          />
                          <div className="design-option-copy">
                            <b>Bolsillo para tubo</b>
                            <small>Confección superior e inferior para colgar con tubo.</small>
                          </div>
                          <span className="design-option-price">+$4.00</span>
                        </label>
                      </div>

                      {/* Interactive Eyelet Customizer Panel */}
                      {(finishing === 'small' || finishing === 'large') && (
                        <div className="eyelet-customizer-panel">
                          <div className="eyelet-panel-head">
                            <label>Configuración de Ojales {finishing === 'small' ? 'Pequeños ($0.30 c/u)' : 'Grandes ($0.50 c/u)'}</label>
                            <span>{effectiveEyeletCount} ojales por pieza</span>
                          </div>

                          {/* Distribution Presets */}
                          <div className="eyelet-presets-row">
                            <button
                              type="button"
                              className={`eyelet-preset-btn ${eyeletPreset === 'corners' ? 'active' : ''}`}
                              onClick={() => setEyeletPreset('corners')}
                            >
                              4 Esquinas (4 ojales)
                            </button>
                            <button
                              type="button"
                              className={`eyelet-preset-btn ${eyeletPreset === 'every50' ? 'active' : ''}`}
                              onClick={() => setEyeletPreset('every50')}
                            >
                              Perimetral c/50 cm ({calculatedPerimeter50} ojales)
                            </button>
                            <button
                              type="button"
                              className={`eyelet-preset-btn ${eyeletPreset === 'every30' ? 'active' : ''}`}
                              onClick={() => setEyeletPreset('every30')}
                            >
                              Perimetral c/30 cm ({calculatedPerimeter30} ojales)
                            </button>
                            <button
                              type="button"
                              className={`eyelet-preset-btn ${eyeletPreset === 'custom' ? 'active' : ''}`}
                              onClick={() => {
                                setEyeletPreset('custom');
                                setCustomEyelets(effectiveEyeletCount);
                              }}
                            >
                              Personalizado
                            </button>
                          </div>

                          {/* Custom Stepper */}
                          <div className="eyelet-stepper-row">
                            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                              Cantidad por pieza:
                            </span>
                            <div className="eyelet-stepper-box">
                              <button
                                type="button"
                                className="pos-stepper-btn"
                                onClick={() => {
                                  setEyeletPreset('custom');
                                  setCustomEyelets(Math.max(2, effectiveEyeletCount - 1));
                                }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="2"
                                max="100"
                                className="eyelet-stepper-input"
                                value={effectiveEyeletCount}
                                onChange={(e) => {
                                  setEyeletPreset('custom');
                                  setCustomEyelets(Math.max(2, parseInt(e.target.value, 10) || 2));
                                }}
                                aria-label="Cantidad exacta de ojales"
                              />
                              <button
                                type="button"
                                className="pos-stepper-btn"
                                onClick={() => {
                                  setEyeletPreset('custom');
                                  setCustomEyelets(effectiveEyeletCount + 1);
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="eyelet-calc-badge">
                            <Sparkles size={14} style={{ color: 'var(--orange)' }} />
                            <span>
                              Costo de acabados: <strong>{effectiveEyeletCount} ojales × ${eyeletUnitPrice.toFixed(2)} = {money(effectiveEyeletCount * eyeletUnitPrice)} por pieza</strong>
                              {effectiveQuantity > 1 && ` (Total ${totalEyeletsAllPieces} ojales = ${money(finishingCost)})`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Installation Option */}
                  {selectedProduct?.price_inst && (
                    <label className="check-option" style={{ marginTop: '16px' }}>
                      <input
                        type="checkbox"
                        checked={installation}
                        onChange={(event) => setInstallation(event.target.checked)}
                      />
                      <span>
                        <b>Incluir instalación en sitio (Quito y alrededores)</b>
                        <small>Personal técnico realiza el montaje en tu local o estructura.</small>
                      </span>
                    </label>
                  )}
                </div>
              </div>
            ) : mode === 'lotes' ? (
              <div className="quote-step">
                <span>{variantOptions.length ? '03' : '02'}</span>
                <div className="step-content">
                  <h3>Selecciona el tamaño del lote</h3>
                  <p>Precios por paquete cerrado de imprenta. A mayor tiraje, menor costo por unidad.</p>

                  <div className="quote-tiers-grid">
                    {tiers.map((tier) => {
                      const isActive = activeTier.qty === tier.qty;
                      const unitCost = Number(tier.price) / Math.max(1, Number(tier.qty));
                      return (
                        <button
                          key={tier.qty}
                          type="button"
                          className={`tier-card ${isActive ? 'active' : ''}`}
                          onClick={() => setQuantity(Number(tier.qty))}
                        >
                          <div className="tier-card-qty">
                            <strong>{tier.qty}</strong>
                            <span>unidades</span>
                          </div>
                          <div className="tier-card-pricing">
                            <b>{money(tier.price)}</b>
                            <small>{money(unitCost)} c/u</small>
                          </div>
                          {isActive && <span className="tier-badge">Seleccionado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="quote-step">
                <span>{variantOptions.length ? '03' : '02'}</span>
                <div className="step-content">
                  <h3>Cantidad y escalas de descuento</h3>
                  <p>Escoge o escribe la cantidad deseada. Los descuentos por volumen aplican automáticamente.</p>

                  <div className="smart-quantity-controller">
                    <div className="quantity-controller-head">
                      <label>Cantidad ({selectedProduct?.unit || 'unidades'})</label>
                      <span>Tarifa actual: {money(quote.rate)} / {selectedProduct?.unit || 'u'}</span>
                    </div>

                    <div className="quantity-stepper-row">
                      <div className="quantity-stepper-box">
                        <button
                          type="button"
                          className="quantity-stepper-btn"
                          onClick={() => setQuantity(Math.max(minQuantity, effectiveQuantity - 1))}
                          disabled={effectiveQuantity <= minQuantity}
                          aria-label="Disminuir una unidad"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          min={minQuantity}
                          value={effectiveQuantity}
                          onChange={(event) => setQuantity(Math.max(minQuantity, parseInt(event.target.value, 10) || minQuantity))}
                          className="quantity-stepper-input"
                          aria-label="Cantidad exacta"
                        />
                        <button
                          type="button"
                          className="quantity-stepper-btn"
                          onClick={() => setQuantity(effectiveQuantity + 1)}
                          aria-label="Aumentar una unidad"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="quantity-quick-increments">
                        <button type="button" className="quick-inc-btn" onClick={() => setQuantity(effectiveQuantity + 6)}>+6</button>
                        <button type="button" className="quick-inc-btn" onClick={() => setQuantity(effectiveQuantity + 12)}>+12</button>
                        <button type="button" className="quick-inc-btn" onClick={() => setQuantity(effectiveQuantity + 24)}>+24</button>
                      </div>

                      {quote.savingsPercent > 0 && (
                        <span className="tier-discount-badge" style={{ marginLeft: 'auto' }}>
                          ¡Ahorras {quote.savingsPercent}% por volumen!
                        </span>
                      )}
                    </div>

                    <div className="quantity-quick-presets">
                      <span>Sugeridos:</span>
                      {[1, 6, 12, 24, 50, 100, 200, 500].map((qtyVal) => (
                        <button
                          key={qtyVal}
                          type="button"
                          className={`qty-preset-btn ${effectiveQuantity === qtyVal ? 'active' : ''}`}
                          onClick={() => setQuantity(qtyVal)}
                        >
                          {qtyVal} {selectedProduct?.unit || 'uds'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {tiers.length > 1 && (
                    <div className="quote-tiers-table">
                      <span>Tabla de precios por volumen:</span>
                      <div className="tiers-pills">
                        {tiers.map((tier) => (
                          <button
                            key={tier.qty}
                            type="button"
                            className={`tier-pill ${activeTier.qty === tier.qty ? 'active' : ''}`}
                            onClick={() => setQuantity(Number(tier.qty))}
                          >
                            <span>Desde {tier.qty} {selectedProduct?.unit || 'uds'}</span>
                            <b>{money(tier.price)}/u</b>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Design Services */}
            <div className="quote-step">
              <span>{variantOptions.length ? '04' : '03'}</span>
              <div className="step-content">
                <h3>Servicio de diseño y preparación de archivos</h3>
                <p>Si ya tienes tu archivo listo, no cobramos preparación.</p>

                <div className="design-options-grid">
                  <label className={`design-option-card ${designLevel === 'none' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="designLevel"
                      checked={designLevel === 'none'}
                      onChange={() => setDesignLevel('none')}
                    />
                    <div className="design-option-copy">
                      <b>Tengo mi arte listo para imprimir</b>
                      <small>Envías tu PDF, AI, CDR o imagen en alta resolución.</small>
                    </div>
                    <span className="design-option-price">$0</span>
                  </label>

                  <label className={`design-option-card ${designLevel === 'adaptation' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="designLevel"
                      checked={designLevel === 'adaptation'}
                      onChange={() => setDesignLevel('adaptation')}
                    />
                    <div className="design-option-copy">
                      <b>Adaptación / Ajuste de medidas</b>
                      <small>Tienes logo e imágenes; nosotros armamos proporciones y sangrías.</small>
                    </div>
                    <span className="design-option-price">+{money(Number(calcSettings.designAdaptationPrice || 5))}</span>
                  </label>

                  <label className={`design-option-card ${designLevel === 'full' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="designLevel"
                      checked={designLevel === 'full'}
                      onChange={() => setDesignLevel('full')}
                    />
                    <div className="design-option-copy">
                      <b>Diseño profesional desde cero</b>
                      <small>Propuesta creativa completa con cambios y bocetos incluidos.</small>
                    </div>
                    <span className="design-option-price">+{money(Number(calcSettings.designFromScratchPrice || 15))}</span>
                  </label>
                </div>

                {designLevel === 'none' && (
                  <div className="file-guidelines-box">
                    <FileCheck size={16} />
                    <div>
                      <b>Recomendaciones de archivo:</b>
                      <small>PDF / AI / CDR / JPG en modo de color CMYK, resolución mínima de 150 DPI y sangría de 2 cm.</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Summary Sidebar */}
          <aside className="quote-summary-card">
            <span className="eyebrow orange">Resumen de cotización</span>
            <h2>{money(quote.total)}</h2>
            <p className="summary-tax-note">Precio final con IVA ({quote.taxRate}%) incluido</p>

            <div className="lead-time-badge" style={{ marginBottom: '14px' }}>
              <Clock size={15} /> Producción estimada: <b>{quote.leadTime}</b>
            </div>

            {quote.savingsPercent > 0 && (
              <div className="savings-banner">
                <Sparkles size={16} /> ¡Estás ahorrando un <b>{quote.savingsPercent}%</b> por escala de volumen!
              </div>
            )}

            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Producto</span>
                <b>{selectedProduct?.name}</b>
              </div>

              {selectionText && (
                <div className="summary-row">
                  <span>Variante</span>
                  <b>{selectionText}</b>
                </div>
              )}

              <div className="summary-row">
                <span>{isArea ? 'Medidas' : 'Cantidad'}</span>
                <b>{readableDimensions}</b>
              </div>

              {isArea && (
                <div className="summary-row">
                  <span>Área total</span>
                  <b>{(quote.area * effectiveQuantity).toFixed(2)} m²</b>
                </div>
              )}

              <div className="summary-row">
                <span>Tarifa unitaria</span>
                <b>{money(quote.rate)} {isArea ? '/ m²' : mode === 'lotes' ? '/ lote' : ` / ${selectedProduct?.unit || 'u'}`}</b>
              </div>
            </div>

            <div className="summary-line">
              <span>Material y producción</span>
              <b>{money(quote.material)}</b>
            </div>

            {designCost > 0 && (
              <div className="summary-line">
                <span>Diseño gráfico</span>
                <b>+{money(designCost)}</b>
              </div>
            )}

            {finishingCost > 0 && (
              <div className="summary-line">
                <span>Acabados</span>
                <b>+{money(finishingCost)}</b>
              </div>
            )}

            {installationCost > 0 && (
              <div className="summary-line">
                <span>Instalación en sitio</span>
                <b>+{money(installationCost)}</b>
              </div>
            )}

            <div className="summary-line" style={{ borderTop: '2px solid rgba(255,255,255,0.2)', marginTop: '8px' }}>
              <span>Subtotal (sin IVA)</span>
              <b>{money(quote.subtotal)}</b>
            </div>

            <div className="summary-line">
              <span>IVA ({quote.taxRate}%)</span>
              <b>{money(quote.tax)}</b>
            </div>

            <div className="summary-note">
              <Check size={15} /> Factura electrónica oficial SRI con desglose completo.
            </div>

            <button
              type="button"
              className="button button-primary full-button"
              onClick={add}
            >
              Agregar al carrito de cotizaciones <ArrowRight size={16} />
            </button>

            <a
              href={`https://wa.me/${data.settings?.whatsapp || '593999999999'}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-action-btn"
            >
              <MessageCircle size={17} /> Cotizar directo por WhatsApp
            </a>

            <Link to="/contacto" className="summary-contact">
              ¿Requieres medidas o acabados especiales? <u>Contáctanos</u>
            </Link>
          </aside>
        </div>
      </section>

      {/* Mobile Sticky Bottom Bar */}
      <div className="mobile-quote-sticky-bar">
        <div className="mobile-sticky-info">
          <small>Total con IVA</small>
          <strong>{money(quote.total)}</strong>
          {quote.savingsPercent > 0 && <span className="mobile-savings-tag">-{quote.savingsPercent}%</span>}
        </div>
        <div className="mobile-sticky-actions">
          <button type="button" className="button button-primary compact-btn" onClick={add} title="Agregar al carrito">
            <Plus size={16} /> Carrito
          </button>
          <a
            href={`https://wa.me/${data.settings?.whatsapp || '593999999999'}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-sticky-btn"
            aria-label="Cotizar por WhatsApp"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  const { data, cart, saveInquiry, saveQuoteRequest } = useSite();
  const [searchParams] = useSearchParams();
  const promoParam = searchParams.get('promo');

  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: promoParam ? `Hola, deseo solicitar la promoción: "${promoParam}". ¿Podrían indicarme los pasos para coordinar el diseño y la entrega?` : ''
  });

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await saveInquiry(form);
      if (cart.length) {
        const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
        const subtotal = cart.reduce((sum, item) => sum + (Number(item.quoteBreakdown?.subtotal ?? item.price) || 0) * (Number(item.quantity) || 1), 0);
        const taxAmount = Math.max(0, total - subtotal);
        await saveQuoteRequest({
          customerName: form.name,
          customerCompany: form.company,
          customerEmail: form.email,
          customerPhone: form.phone,
          items: cart,
          subtotal,
          taxRate: Number(data.calculatorSettings?.taxRate) || 15,
          taxAmount,
          total,
          notes: form.message
        });
      }
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  return (
    <PageShell>
      <section className="inner-hero contact-hero">
        <div className="container">
          <span className="eyebrow orange">Contacto</span>
          <h1>Hablemos de lo que<br /><em>quieres hacer visible.</em></h1>
          <p>Cuéntanos un poco de tu idea. Si ya tienes medidas, referencias o un presupuesto en mente, mucho mejor.</p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-layout">
          <div className="contact-info">
            <span className="eyebrow">Resolvemos rápido</span>
            <h2>Una conversación puede ahorrar muchos intentos.</h2>
            <div className="contact-list">
              <a href={`https://wa.me/${data.settings.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle />
                <span><b>WhatsApp Directo</b><small>{data.settings.phone}</small></span>
              </a>
              <a href={`mailto:${data.settings.email}`}>
                <FileText />
                <span><b>Correo</b><small>{data.settings.email}</small></span>
              </a>
              <div>
                <Building2 />
                <span><b>Taller y Showroom</b><small>{data.settings.address}</small></span>
              </div>
            </div>
            <div className="contact-mini">
              <span>Horario de atención</span>
              <b>Lun — Vie / 09:00 — 18:00</b>
            </div>
          </div>

          <div className="contact-form-card">
            {sent ? (
              <div className="success-state">
                <div className="success-icon"><Check /></div>
                <h2>¡Gracias por escribirnos!</h2>
                <p>Recibimos tu solicitud con todos los detalles. Nos comunicaremos contigo muy pronto para revisar muestras y coordinar.</p>
                <Button to="/">Volver al inicio</Button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="form-heading">
                  <span className="eyebrow orange">Cuéntanos</span>
                  <h2>¿Qué tienes en mente?</h2>
                </div>

                {/* Embedded Cart Preview when arriving with items */}
                {cart.length > 0 && (
                  <div className="contact-cart-preview">
                    <div className="contact-cart-preview-header">
                      <span><Package size={16} /> Cotización adjunta ({cart.length} ítem{cart.length > 1 ? 's' : ''})</span>
                      <b>{money(cartTotal)} con IVA</b>
                    </div>
                    <div className="contact-cart-list">
                      {cart.map((item) => (
                        <div key={item.cartId} className="contact-cart-item">
                          <span>• <b>{item.name}</b> (x{item.quantity})</span>
                          <small>{item.variant}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="fields two">
                  <label>Tu nombre
                    <input required value={form.name} onChange={update('name')} placeholder="Nombre y apellido" />
                  </label>
                  <label>Empresa (opcional)
                    <input value={form.company} onChange={update('company')} placeholder="Nombre de tu marca" />
                  </label>
                </div>

                <div className="fields two">
                  <label>Correo
                    <input required type="email" value={form.email} onChange={update('email')} placeholder="tu@correo.com" />
                  </label>
                  <label>WhatsApp
                    <input required value={form.phone} onChange={update('phone')} placeholder="+593..." />
                  </label>
                </div>

                <label>Cuéntanos sobre el proyecto
                  <textarea required value={form.message} onChange={update('message')} rows="4" placeholder="Quiero un rótulo para..." />
                </label>

                <button type="submit" className="button button-primary" disabled={busy}>
                  {busy ? 'Enviando solicitud…' : 'Enviar solicitud'} {!busy && <ArrowRight size={16} />}
                </button>

                <small className="form-footnote">También puedes escribirnos directo por WhatsApp. Respondemos en horario laboral.</small>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function CartPage() { const { cart } = useSite(); return <PageShell><section className="inner-hero cart-hero"><div className="container"><span className="eyebrow orange">Carrito de cotizaciones</span><h1>Tus ideas, listas<br /><em>para conversar.</em></h1><p>Aquí guardamos lo que te interesa. Todavía no es una compra: revisamos contigo medidas, materiales y tiempos antes de confirmar.</p></div></section><section className="section"><div className="container cart-page-grid"><div><div className="cart-title-row"><h2>{cart.length ? `${cart.length} solución${cart.length > 1 ? 'es' : ''} guardada${cart.length > 1 ? 's' : ''}` : 'Tu selección'}</h2>{cart.length > 0 && <span>Estimación preliminar</span>}</div><CartSummary /></div><aside className="cart-aside"><div className="cart-aside-icon"><MessageCircle /></div><h3>¿Listo para darle forma?</h3><p>Envíanos tu selección y un asesor te ayudará a convertirla en una cotización final.</p><Button to="/contacto">Solicitar revisión</Button><Link to="/cotizador">Seguir cotizando</Link></aside></div></section></PageShell>; }

function AdminLogin() { const { login, authMode } = useAuth(); const navigate = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const submit = async (event) => { event.preventDefault(); setBusy(true); const result = await login({ email, password }); setBusy(false); if (result.ok) navigate('/admin'); else setError(result.error || 'No se pudo iniciar sesión.'); }; return <div className="admin-login"><div className="login-card"><div className="login-mark"><img src={media.logoMark} alt="Gigaprint" /></div><span className="eyebrow orange">Área privada</span><h1>Panel Gigaprint</h1><p>Edita contenidos, productos, promociones y revisa tus solicitudes.</p><form onSubmit={submit}>{authMode === 'supabase' && <label>Correo del administrador<input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@tudominio.com" required /></label>}<label>{authMode === 'supabase' ? 'Contraseña' : 'Contraseña de demostración'}<input autoFocus={authMode !== 'supabase'} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></label>{error && <small className="form-error">{error}</small>}<button className="button button-primary full-button" type="submit" disabled={busy}>{busy ? 'Validando…' : 'Entrar al panel'} {!busy && <ArrowRight size={16} />}</button></form>{authMode === 'supabase' && <small className="login-note">Acceso protegido por Supabase Auth. El usuario debe tener rol admin o super admin.</small>}<Link to="/" className="login-back">← Volver al sitio público</Link></div></div>; }

function AdminGuard({ children }) { const { isAdmin } = useAuth(); return isAdmin ? children : <Navigate to="/admin/login" replace />; }

function AdminDashboard() { const { data } = useSite(); const { logout } = useAuth(); return <AdminShell><AdminHeader eyebrow="Resumen" title="Buenos días, equipo." text="Aquí tienes una vista rápida de lo que está pasando en Gigaprint." action={<button className="admin-logout" onClick={logout}>Cerrar sesión</button>} /><div className="metric-grid"><div><span><ShoppingCart size={17} style={{ color: 'var(--orange)' }} /> Punto de Venta</span><strong>POS Activo</strong><small>Cobros, proformas y caja</small></div><div><span><ClipboardList size={17} /> Solicitudes</span><strong>{data.inquiries.length}</strong><small>Guardadas en este dispositivo</small></div><div><span><Package size={17} /> Productos</span><strong>{data.products.length}</strong><small>En tu catálogo actual</small></div><div><span><Sparkles size={17} /> Promociones</span><strong>{data.promotions.filter((p) => p.active).length}</strong><small>Activas ahora</small></div></div><div className="admin-dashboard-grid"><div className="admin-card"><div className="admin-card-heading"><div><span className="eyebrow">Atajos Operativos</span><h2>¿Qué quieres hacer hoy?</h2></div><Settings2 size={20} /></div><div className="quick-grid"><Link to="/admin/pos" style={{ border: '1.5px solid var(--orange)', background: 'var(--orange-soft)' }}><ShoppingCart style={{ color: 'var(--orange-dark)' }} /><span><b>Punto de Venta (POS)</b><small>Cajero rápido & proformas</small></span></Link><Link to="/admin/pos/dashboard"><BarChart3 /><span><b>Cuadre Semanal</b><small>Balance e ingresos netos</small></span></Link><Link to="/admin/pos/asesoras"><Users /><span><b>Equipo Asesoras</b><small>Metas, PINs y comisiones</small></span></Link><Link to="/admin/productos"><Package /><span><b>Productos</b><small>Catálogo y precios</small></span></Link><Link to="/admin/contenido"><Pencil /><span><b>Contenido</b><small>Textos de inicio y datos</small></span></Link><Link to="/admin/solicitudes"><MessageCircle /><span><b>Solicitudes</b><small>Leads del sitio</small></span></Link></div></div><div className="admin-card checklist"><div className="admin-card-heading"><div><span className="eyebrow">Estado del proyecto</span><h2>Todo listo para conectar</h2></div><ShieldCheck size={20} /></div><p><Check size={15} /> Punto de venta & CRM comercial activado</p><p><Check size={15} /> Cuadre de caja diaria y semanal idéntico a Excel</p><p><Check size={15} /> Gestión multi-asesora con metas semanales</p><p><Check size={15} /> Cotizador inteligente y carrito funcionando</p><p className="pending"><Bell size={15} /> Sincronización Supabase lista con RLS</p></div></div><div className="admin-card recent-card"><div className="admin-card-heading"><div><span className="eyebrow">Últimas solicitudes</span><h2>Lo que tus clientes están pidiendo</h2></div><Link to="/admin/solicitudes">Ver todas →</Link></div>{data.inquiries.length ? data.inquiries.slice(-5).reverse().map((item) => <div className="inquiry-row" key={item.id}><span>{item.name?.[0] || 'G'}</span><div><b>{item.name}</b><small>{item.company || item.email}</small></div><small>{item.status}</small></div>) : <div className="admin-empty">Todavía no hay solicitudes. Cuando alguien use el formulario, aparecerán aquí.</div>}</div></AdminShell>; }

function AdminContent() { const { data, setData } = useSite(); const [draft, setDraft] = useState(data.settings); const save = () => setData((current) => ({ ...current, settings: draft })); return <AdminShell><AdminHeader eyebrow="Contenido" title="La voz de Gigaprint" text="Edita los textos principales que ven tus clientes." /><div className="admin-card editor-card"><div className="editor-section"><span className="eyebrow">Inicio / Hero</span><h2>Primera impresión</h2><div className="fields"><label>Frase superior<input value={draft.heroKicker} onChange={(e) => setDraft({ ...draft, heroKicker: e.target.value })} /></label><label>Título principal<input value={draft.heroTitle} onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })} /></label><label>Descripción<textarea value={draft.heroText} onChange={(e) => setDraft({ ...draft, heroText: e.target.value })} rows="4" /></label></div></div><div className="editor-section"><span className="eyebrow">Contacto</span><h2>Datos que convierten</h2><div className="fields two"><label>Teléfono<input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label><label>Correo<input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label><label>WhatsApp sin símbolos<input value={draft.whatsapp} onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })} /></label><label>Ubicación<input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></label></div></div><button className="button button-primary" onClick={save}>Guardar cambios <Save size={16} /></button></div></AdminShell>; }

function SmartProductEditor({ product, onClose }) {
  const { data, updateCollectionItem, addCollectionItem } = useSite();
  const isNew = !data.products.find((item) => item.id === product.id);
  const [draft, setDraft] = useState(() => ({ variantOptions: [], priceScales: [], colors: [], sizes: [], ...product }));
  const [sizesText, setSizesText] = useState((product.sizes || []).map((size) => size.label || size).join(', '));
  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const updateOption = (index, patch) => update({ variantOptions: draft.variantOptions.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  const save = () => {
    const next = { ...draft, type: draft.calcType || draft.type || 'unit', calcType: draft.calcType || draft.type || 'unit', sizes: sizesText.split(',').map((label) => label.trim()).filter(Boolean).map((label) => ({ id: `size-${label.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`, label })), source: draft.source || 'manual' };
    if (isNew) addCollectionItem('products', next); else updateCollectionItem('products', draft.id, next);
    onClose();
  };
  return <div className="modal-backdrop"><div className="admin-modal smart-product-modal"><div className="modal-heading"><div><span className="eyebrow orange">Producto inteligente</span><h2>{isNew ? 'Añadir producto' : draft.name}</h2><small>Configura variables, variantes y reglas sin tocar código.</small></div><button onClick={onClose}><X /></button></div><div className="smart-product-form"><div className="fields two"><label>Nombre<input value={draft.name || ''} onChange={(event) => update({ name: event.target.value })} /></label><label>Categoría<input value={draft.category || ''} onChange={(event) => update({ category: event.target.value })} /></label><label>Tipo de cálculo<select value={draft.calcType || draft.type || 'unit'} onChange={(event) => update({ calcType: event.target.value, type: event.target.value })}><option value="m2">Por medidas / m²</option><option value="scale">Por unidad con escalas</option><option value="scale-total">Por lote / precio total</option><option value="unit">Por unidad fija</option></select></label><label>Precio base<input type="number" min="0" step="0.01" value={draft.price ?? 0} onChange={(event) => update({ price: Number(event.target.value) })} /></label><label>Unidad<input value={draft.unit || 'unidad'} onChange={(event) => update({ unit: event.target.value })} /></label><label>Imagen<select value={draft.image || media.stickers} onChange={(event) => update({ image: event.target.value })}>{[media.lona, media.vinil, media.letrero, media.laser, media.stickers].map((image) => <option key={image} value={image}>{image.split('/').pop()}</option>)}</select></label></div><label>Descripción<textarea rows="3" value={draft.description || ''} onChange={(event) => update({ description: event.target.value })} /></label><section className="smart-editor-section"><div className="smart-editor-section-heading"><div><span className="eyebrow">Variables</span><h3>Colores, tamaños y opciones</h3><p>Las opciones aparecen como selectores en la tienda y el cotizador.</p></div><button className="button button-ghost compact" onClick={() => update({ variantOptions: [...draft.variantOptions, { id: `option-${Date.now()}`, key: `option_${draft.variantOptions.length + 1}`, label: 'Nueva opción', type: 'select', values: [{ id: `value-${Date.now()}`, label: 'Primera opción', value: 'Primera opción' }] }] })}>+ Añadir variable</button></div>{draft.variantOptions.length === 0 && <div className="smart-empty">Todavía no hay variables. Añade color, talla, acabado, material o cualquier selector que necesites.</div>}{draft.variantOptions.map((option, index) => <div className="variable-row" key={option.id || index}><input value={option.label || ''} onChange={(event) => updateOption(index, { label: event.target.value, key: option.key || `option_${index}` })} placeholder="Ej. Color, tamaño, acabado" /><input value={(option.values || []).map((value) => value.label || value.value).join(', ')} onChange={(event) => updateOption(index, { values: event.target.value.split(',').map((label) => label.trim()).filter(Boolean).map((label) => ({ id: `value-${label.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`, label, value: label })) })} placeholder="Opciones separadas por coma" /><button className="icon-button danger" onClick={() => update({ variantOptions: draft.variantOptions.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={15} /></button></div>)}<label>Tamaños / medidas predefinidas<input value={sizesText} onChange={(event) => setSizesText(event.target.value)} placeholder="Ej. A4, A3, 20 × 30 cm, S, M, L, XL" /></label></section><section className="smart-editor-section"><div className="smart-editor-section-heading"><div><span className="eyebrow">Escalas de precio</span><h3>Precio automático por volumen</h3><p>El cotizador toma la última escala alcanzada por la cantidad.</p></div><button className="button button-ghost compact" onClick={() => update({ priceScales: [...(draft.priceScales || []), { qty: 1, price: Number(draft.price || 0) }] })}>+ Añadir escala</button></div>{(draft.priceScales || []).map((tier, index) => <div className="variable-row price-row" key={`${tier.qty}-${index}`}><label>Desde<input type="number" min="1" value={tier.qty} onChange={(event) => update({ priceScales: draft.priceScales.map((row, rowIndex) => rowIndex === index ? { ...row, qty: Number(event.target.value) } : row) })} /></label><label>Precio<input type="number" min="0" step="0.01" value={tier.price ?? tier.pvp ?? 0} onChange={(event) => update({ priceScales: draft.priceScales.map((row, rowIndex) => rowIndex === index ? { ...row, price: Number(event.target.value), pvp: Number(event.target.value) } : row) })} /></label><button className="icon-button danger" onClick={() => update({ priceScales: draft.priceScales.filter((_, rowIndex) => rowIndex !== index) })}><Trash2 size={15} /></button></div>)}</section><section className="smart-editor-section"><div className="smart-editor-section-heading"><div><span className="eyebrow">Colores</span><h3>Paleta visual del producto</h3><p>Se guarda para swatches y variantes visuales futuras.</p></div><button className="button button-ghost compact" onClick={() => update({ colors: [...(draft.colors || []), { id: `color-${Date.now()}`, label: 'Nuevo color', hex: '#F45B18' }] })}>+ Añadir color</button></div>{(draft.colors || []).map((color, index) => <div className="variable-row color-row" key={color.id || index}><input type="color" value={color.hex || '#F45B18'} onChange={(event) => update({ colors: draft.colors.map((item, itemIndex) => itemIndex === index ? { ...item, hex: event.target.value } : item) })} /><input value={color.label || ''} onChange={(event) => update({ colors: draft.colors.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) })} placeholder="Nombre del color" /><button className="icon-button danger" onClick={() => update({ colors: draft.colors.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={15} /></button></div>)}</section><div className="fields two"><label className="check-option"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => update({ featured: event.target.checked })} /><span><b>Mostrar como destacado</b><small>Aparece en el inicio y en la tienda.</small></span></label><label className="check-option"><input type="checkbox" checked={draft.isPublished !== false} onChange={(event) => update({ isPublished: event.target.checked })} /><span><b>Visible al público</b><small>Oculta temporalmente sin eliminarlo.</small></span></label></div></div><div className="modal-actions"><button className="button button-ghost" onClick={onClose}>Cancelar</button><button className="button button-primary" onClick={save}>Guardar producto <Save size={16} /></button></div></div></div>;
}

function SmartAdminProducts() { const { data, removeCollectionItem } = useSite(); const [selected, setSelected] = useState(null); const [search, setSearch] = useState(''); const [category, setCategory] = useState('Todos'); const visible = data.products.filter((product) => { const term = search.toLowerCase(); return (category === 'Todos' || product.category === category) && `${product.name} ${product.category}`.toLowerCase().includes(term); }).slice(0, 180); const fresh = { id: `product-${Date.now()}`, name: 'Nuevo producto', category: 'Gran formato', type: 'unit', calcType: 'unit', price: 0, unit: 'unidad', image: media.lona, description: 'Descripción del producto', featured: false, isPublished: true, specs: [], variantOptions: [], priceScales: [], colors: [], sizes: [] }; return <AdminShell><AdminHeader eyebrow="Catálogo inteligente" title="Productos, variantes y precios" text={`${data.products.length} productos listos. Edita variables y escalas desde una sola pantalla.`} action={<Button onClick={() => setSelected(fresh)}>Añadir producto</Button>} /><div className="admin-card catalog-toolbar"><div className="fields two"><label>Buscar producto<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ej. lona, camiseta, tarjeta" /></label><label>Categoría<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div><p>Mostrando {visible.length} de {data.products.length}. El catálogo importado conserva precios por m², unidad, lote y volumen.</p></div><div className="admin-card table-card"><div className="data-table-head"><span>Producto</span><span>Categoría / regla</span><span>Desde</span><span>Acciones</span></div>{visible.map((product) => <div className="data-table-row" key={product.id}><div className="table-product"><img src={product.image} alt="" /><span><b>{product.name}</b><small>{product.variantOptions?.length ? `${product.variantOptions.length} variables · ` : ''}{product.priceScales?.length || 0} escalas</small></span></div><span>{product.category}<br /><small>{getProductCalcType(product) === 'm2' ? 'Por medidas' : product.pricingMode === 'tier-total' ? 'Por lote' : 'Por unidad'}</small></span><strong>{money(product.price)} / {product.unit}</strong><div className="row-actions"><button onClick={() => setSelected(product)} title="Editar variables"><Edit3 size={15} /></button><button className="danger" onClick={() => removeCollectionItem('products', product.id)} title="Eliminar"><Trash2 size={15} /></button></div></div>)}{visible.length === 0 && <div className="admin-empty">No hay productos con esos filtros.</div>}</div>{selected && <SmartProductEditor product={selected} onClose={() => setSelected(null)} />}</AdminShell>; }


function AdminPromos() { const { data, updateCollectionItem, removeCollectionItem } = useSite(); return <AdminShell><AdminHeader eyebrow="Campañas" title="Promociones" text="Activa o ajusta ofertas para mover la conversación." /><div className="admin-promo-grid">{data.promotions.map((promo) => <article className={`admin-promo ${promo.active ? '' : 'inactive'}`} key={promo.id}><div><span>{promo.eyebrow}</span><button onClick={() => updateCollectionItem('promotions', promo.id, { active: !promo.active })}>{promo.active ? 'Activa' : 'Pausada'}</button></div><h2>{promo.title}</h2><p>{promo.description}</p><div><strong>{money(promo.price)}</strong><del>{money(promo.oldPrice)}</del><button className="danger-text" onClick={() => removeCollectionItem('promotions', promo.id)}><Trash2 size={14} /></button></div></article>)}</div></AdminShell>; }

function AdminInquiries() { const { data } = useSite(); return <AdminShell><AdminHeader eyebrow="CRM ligero" title="Solicitudes" text="Cada contacto del sitio queda guardado aquí mientras no conectes Supabase." /><div className="admin-card table-card inquiry-table"><div className="data-table-head"><span>Cliente</span><span>Contacto</span><span>Mensaje</span><span>Estado</span></div>{data.inquiries.length ? data.inquiries.map((item) => <div className="data-table-row" key={item.id}><div><b>{item.name}</b><small>{item.company || 'Sin empresa'}</small></div><span>{item.phone}<br />{item.email}</span><span className="message-preview">{item.message}</span><span className="status-pill">{item.status}</span></div>) : <div className="admin-empty">No hay solicitudes todavía.</div>}</div></AdminShell>; }

function AdminThemes() { const { siteTheme, setSiteTheme } = useSite(); return <AdminShell><AdminHeader eyebrow="Sistema visual" title="Temas y temporadas" text="Cambia el ambiente de Gigaprint con un botón. El naranja del logo permanece como color de marca." action={<Button to="/admin/editor" variant="ghost">Abrir editor visual <Palette size={16} /></Button>} /><div className="theme-studio-grid">{themePresets.map((preset) => { const active = preset.id === siteTheme; return <article className={`theme-studio-card ${active ? '' : ''}`} key={preset.id} style={{ '--theme-preview': preset.palette.accent, '--theme-preview-secondary': preset.palette.secondary }}><div className="theme-preview"><div className="theme-preview-brand"><span>G</span><b>Gigaprint</b></div><div className="theme-preview-symbols">{preset.decorations.map((symbol, index) => <i key={`${symbol}-${index}`}>{symbol}</i>)}</div><span>{preset.label}</span></div><div className="theme-studio-copy"><div><span className="eyebrow">{preset.eyebrow}</span><h2>{preset.name}</h2></div><p>{preset.description}</p><div className="theme-swatches"><i style={{ background: '#ff5b1f' }} title="Naranja de marca" /><i style={{ background: preset.palette.accent }} title="Color de temporada" /><i style={{ background: preset.palette.secondary }} title="Color secundario" /></div><button className={`button ${active ? 'button-dark' : 'button-primary'}`} onClick={() => setSiteTheme(preset.id)}>{active ? 'Tema activo' : preset.id === 'default' ? 'Quitar temporada' : 'Aplicar tema'} {active ? <Check size={16} /> : <ArrowRight size={16} />}</button></div></article>; })}</div><div className="admin-card theme-studio-note"><div className="theme-note-icon"><Palette /></div><div><h3>Diseño preparado para campañas</h3><p>Los temas solo cambian variables visuales, acentos y decoraciones. El contenido, la tienda, los productos y el cotizador se mantienen intactos.</p></div></div></AdminShell>; }

function AdminRoutes() {
  const { pathname } = useLocation();
  if (pathname === '/admin/login') return <AdminLogin />;
  const pages = {
    '/admin': <AdminDashboard />,
    '/admin/pos': <POSPage initialTab="cashier" />,
    '/admin/crm': <POSPage initialTab="crm" />,
    '/admin/taller': <POSPage initialTab="billboard" />,
    '/admin/despacho': <POSPage initialTab="billboard" />,
    '/admin/pos/cartelera': <POSPage initialTab="billboard" />,
    '/admin/pos/estaciones': <POSPage initialTab="stations" />,
    '/admin/estaciones': <POSPage initialTab="stations" />,
    '/admin/pos/dashboard': <POSAdminDashboard />,
    '/admin/pos/asesoras': <POSAdvisorsManagement />,
    '/admin/pos/asesores': <POSAdvisorsManagement />,
    '/admin/asesores': <POSAdvisorsManagement />,
    '/admin/equipo': <POSAdvisorsManagement />,
    '/admin/pos/display': <POSCustomerDisplayPage />,
    '/admin/pos/cliente': <POSCustomerDisplayPage />,
    '/admin/pos/productos': <POSPage initialTab="products" />,
    '/admin/pos/inventario': <POSPage initialTab="inventory" />,
    '/admin/pos/pedidos': <POSPage initialTab="orders" />,
    '/admin/pos/kanban': <POSPage initialTab="kanban" />,
    '/admin/pos/compras': <POSPage initialTab="purchases" />,
    '/admin/editor': <EditorPage />,
    '/admin/contenido': <AdminContent />,
    '/admin/productos': <SmartAdminProducts />,
    '/admin/temas': <AdminThemes />,
    '/admin/promociones': <AdminPromos />,
    '/admin/solicitudes': <AdminInquiries />
  };
  return <AdminGuard>{pages[pathname] || <Navigate to="/admin" replace />}</AdminGuard>;
}

function PublicRoutes() { return <Routes><Route path="/" element={<HomePage />} /><Route path="/gigaprint" element={<AboutPage />} /><Route path="/promociones" element={<PromotionsPage />} /><Route path="/tienda" element={<StorePage />} /><Route path="/tienda/:id" element={<SmartProductDetailPage />} /><Route path="/cotizador" element={<SmartQuotePage />} /><Route path="/contacto" element={<ContactPage />} /><Route path="/carrito" element={<CartPage />} /><Route path="/pos" element={<POSPage />} /><Route path="/pos/display" element={<POSCustomerDisplayPage />} /><Route path="/pos/cliente" element={<POSCustomerDisplayPage />} /><Route path="/display" element={<POSCustomerDisplayPage />} /><Route path="/pos/*" element={<POSPage />} /><Route path="/caja" element={<POSPage />} /><Route path="/terminal" element={<POSPage />} /><Route path="/prueba-arte/:orderId" element={<POSArtProofPublicPage />} /><Route path="/aprobacion/:orderId" element={<POSArtProofPublicPage />} /><Route path="/seguimiento" element={<OrderTrackingPage />} /><Route path="/seguimiento/:trackingToken" element={<OrderTrackingPage />} /><Route path="/track" element={<OrderTrackingPage />} /><Route path="/track/:trackingToken" element={<OrderTrackingPage />} /><Route path="/rastreo" element={<OrderTrackingPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>; }

export default function App() { return <BrowserRouter basename={import.meta.env.BASE_URL}><ToastProvider><AuthProvider><Suspense fallback={<div className="page-loading"><span className="brand-mark">G</span><p>Cargando editor…</p></div>}><Routes><Route path="/admin/*" element={<AdminRoutes />} /><Route path="*" element={<PublicRoutes />} /></Routes></Suspense></AuthProvider></ToastProvider></BrowserRouter>; }
