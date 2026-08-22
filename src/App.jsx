import React, { lazy, Suspense, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, BarChart3, Bell, Building2, Calculator, Check, ChevronDown, ClipboardList, Edit3, FileText, Image, LayoutDashboard, MessageCircle, Package, Palette, Pencil, Plus, Save, Search, Settings2, ShieldCheck, Sparkles, Trash2, Users, X } from 'lucide-react';
import { categories, initialData, media, money, themePresets } from './data';
import { calculateCatalogQuote, getProductCalcType, getPriceTiers, getTier, getVariantOptions } from './catalog';
import { AuthProvider, useAuth, useSite } from './store';
import { AdminHeader, AdminShell, Button, CartSummary, PageShell, ProductCard, SectionHeading, ServiceCard } from './components';
import { BlockRenderer } from './components/studio/BlockRenderer';
const EditorPage = lazy(() => import('./pages/EditorPage').then((module) => ({ default: module.EditorPage })));

function HomePage() {
  const { data, addToCart } = useSite();
  const calculatorSettings = data.calculatorSettings || { taxRate: 15, designAdaptationPrice: 5, designFromScratchPrice: 15, disclaimer: 'Los valores son referenciales y pueden variar según acabados, instalación y condiciones del proyecto.' };
  return <PageShell><section className="hero"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow orange">{data.settings.heroKicker}</span><h1>{data.settings.heroTitle}<em> en grande.</em></h1><p>{data.settings.heroText}</p><div className="hero-buttons"><Button to="/cotizador">Cotiza tu proyecto</Button><Button to="/tienda" variant="ghost">Ver soluciones <ArrowRight size={16} /></Button></div><div className="hero-proof"><div className="avatar-stack"><span>G</span><span>+</span><span>∞</span></div><p><strong>Hecho para destacar</strong><br />Diseño, producción e instalación en un mismo equipo.</p></div></div><div className="hero-art"><div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div><div className="hero-card card-main"><img src={media.hero} alt="Impresión de gran formato" /><span className="hero-card-label">Producción propia</span></div><div className="hero-float float-top"><Sparkles size={16} /><span><b>+100</b><small>ideas producidas</small></span></div><div className="hero-float float-bottom"><span className="pulse-dot"></span><span><b>Tu marca</b><small>lista para verse</small></span></div><span className="hero-sticker">IDEAS<br />QUE<br /><b>CRECEN</b></span></div></div></section><div className="marquee"><div>RÓTULOS <span>✦</span> IMPRESIÓN <span>✦</span> NEONES <span>✦</span> LÁSER <span>✦</span> VINILES <span>✦</span> DISEÑO <span>✦</span> </div></div><section className="section"><div className="container"><SectionHeading eyebrow="Todo lo que tu marca necesita" title="Una idea. Muchas formas de hacerla visible." text="Nos encargamos de la parte que hace que una marca pase de verse bien a quedarse en la cabeza." action={<Button to="/gigaprint" variant="link">Conoce Gigaprint <ArrowRight size={15} /></Button>} /><div className="services-grid">{data.services.map((service, index) => <ServiceCard key={service.id} service={service} index={index} />)}</div></div></section><section className="section dark-section"><div className="container process-section"><SectionHeading eyebrow="Así trabajamos" title="Del primer mensaje a la instalación." text="Un proceso claro, sin vueltas y con acompañamiento en cada decisión." /><div className="process-grid"><div className="process-intro"><span className="big-number">01</span><h3>Cuéntanos qué tienes en mente.</h3><p>Puede ser un boceto, una foto de referencia o solo una idea. Nosotros la aterrizamos.</p><Button to="/contacto" variant="outline">Hablar con el equipo</Button></div><div className="process-steps"><div><b>02</b><span><strong>Te proponemos</strong><small>Materiales, medidas y una solución que sí funciona para tu presupuesto.</small></span></div><div><b>03</b><span><strong>Lo producimos</strong><small>Diseño, fabricación y acabados con atención al detalle.</small></span></div><div><b>04</b><span><strong>Lo instalamos</strong><small>Te entregamos una pieza lista para ser protagonista.</small></span></div></div></div></div></section><section className="section"><div className="container"><SectionHeading eyebrow="Lo más pedido" title="Soluciones que ya están listas para despegar." action={<Button to="/tienda" variant="link">Ver toda la tienda <ArrowRight size={15} /></Button>} /><div className="product-grid">{data.products.filter((product) => product.featured).map((product) => <ProductCard key={product.id} product={product} onAdd={(item) => addToCart({ ...item, cartId: `${item.id}-${Date.now()}` })} />)}</div></div></section><section className="section editable-home-section"><div className="container"><BlockRenderer blocks={data.homeBlocks || []} /></div></section><section className="cta-section"><div className="container cta-card"><div><span className="eyebrow">No tienes que llegar con todo resuelto</span><h2>Tu próxima gran idea<br /><em>empieza aquí.</em></h2></div><Button to="/cotizador">Empezar cotización</Button></div></section></PageShell>;
}

function AboutPage() { return <PageShell><section className="inner-hero"><div className="container inner-hero-grid"><div><span className="eyebrow orange">Gigaprint / quiénes somos</span><h1>Tu marca no necesita gritar.<br /><em>Necesita presencia.</em></h1><p>Somos un taller creativo y de producción visual que convierte ideas en piezas que la gente puede ver, tocar y recordar.</p></div><div className="inner-hero-mark"><span>G</span><small>+<br />ideas<br />visibles</small></div></div></section><section className="section"><div className="container about-grid"><div className="about-statement"><span className="eyebrow">Nuestra forma de ver las cosas</span><h2>La publicidad empieza mucho antes de imprimir.</h2></div><div className="about-copy"><p>Empieza entendiendo qué quieres provocar. Una fachada que invite a entrar. Un empaque que se quiera llevar. Un rótulo que se reconozca desde la otra esquina.</p><p>Por eso en Gigaprint juntamos estrategia, diseño y producción. Para que la idea no se pierda entre el archivo y el resultado final.</p><div className="about-points"><span><Check size={16} /> Trato cercano</span><span><Check size={16} /> Producción responsable</span><span><Check size={16} /> Soluciones a medida</span></div></div></div></section><section className="section image-split"><div className="container"><div className="split-card"><img src={media.workspace} alt="Equipo de Gigaprint trabajando" /><div><span className="eyebrow orange">Hecho con intención</span><h2>Materiales que trabajan por tu marca.</h2><p>Desde el vinil más sencillo hasta un letrero luminoso completo, elegimos cada material por cómo va a vivir en el mundo real.</p><Button to="/contacto">Cuéntanos tu proyecto</Button></div></div></div></section></PageShell>; }

function PromotionsPage() { const { data } = useSite(); return <PageShell><section className="inner-hero promo-hero"><div className="container"><span className="eyebrow orange">Promociones activas</span><h1>Más visibilidad.<br /><em>Más valor para tu inversión.</em></h1><p>Paquetes pensados para que empieces con lo esencial y no tengas que elegir entre verte profesional o cuidar tu presupuesto.</p></div></section><section className="section"><div className="container promo-grid">{data.promotions.filter((promo) => promo.active).map((promo) => <article className="promo-card" key={promo.id}><div className="promo-card-top"><span>{promo.eyebrow}</span><b>{promo.badge}</b></div><h2>{promo.title}</h2><p>{promo.description}</p><div className="promo-price"><strong>{money(promo.price)}</strong><del>{money(promo.oldPrice)}</del></div><Button to="/contacto" variant="dark">Quiero esta promo</Button></article>)}</div></section><section className="section promo-note"><div className="container"><div className="note-card"><div className="note-icon"><ShieldCheck /></div><div><h3>¿No sabes cuál te conviene?</h3><p>Escríbenos y te recomendamos una combinación basada en tu negocio, tus medidas y tu objetivo.</p></div><Button to="/cotizador" variant="outline">Recibir recomendación</Button></div></div></section></PageShell>; }

function StorePage() { const { data, addToCart } = useSite(); const [searchParams, setSearchParams] = useSearchParams(); const [search, setSearch] = useState(''); const activeCategory = searchParams.get('categoria') || 'Todos'; const filtered = data.products.filter((p) => (activeCategory === 'Todos' || p.category === activeCategory) && `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())); const add = (item) => addToCart({ ...item, cartId: `${item.id}-${Date.now()}` }); return <PageShell><section className="inner-hero store-hero"><div className="container store-hero-grid"><div><span className="eyebrow orange">Tienda Gigaprint</span><h1>Elige una base.<br /><em>Hazla tuya.</em></h1><p>Productos listos para personalizar, producir y llevar tu comunicación al siguiente nivel.</p></div><div className="store-badge"><span>CATÁLOGO<br /><b>2026</b></span></div></div></section><section className="section store-section"><div className="container"><div className="store-toolbar"><div className="category-tabs">{categories.map((category) => <button key={category} className={activeCategory === category ? 'active' : ''} onClick={() => setSearchParams(category === 'Todos' ? {} : { categoria: category })}>{category}</button>)}</div><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busca una solución" /></label></div><div className="store-layout"><div className="product-grid full">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={add} />)}</div><aside className="store-aside"><div><span className="eyebrow">¿Necesitas algo especial?</span><h3>Si no lo ves, probablemente también lo hacemos.</h3><p>Trabajamos proyectos a medida, desde un solo ejemplar hasta producciones grandes.</p><Button to="/contacto" variant="outline">Pedir algo a medida</Button></div><img src={media.laser} alt="Corte láser" /></aside></div></div></section></PageShell>; }

function SmartProductDetailPage() {
  const { id } = useParams();
  const { data, addToCart } = useSite();
  const product = data.products.find((item) => item.id === id) || data.products[0];
  const [quantity, setQuantity] = useState(Math.max(1, Number(product?.minQuantity || 1)));
  const [widthCm, setWidthCm] = useState(100);
  const [heightCm, setHeightCm] = useState(100);
  const [selection, setSelection] = useState({});
  const [designLevel, setDesignLevel] = useState('none');
  
  const options = getVariantOptions(product);
  const safeSelection = options.reduce((result, option) => ({
    ...result,
    [option.key]: option.values?.some((value) => value.value === selection[option.key])
      ? selection[option.key]
      : option.values?.[0]?.value
  }), {});
  
  const isArea = getProductCalcType(product) === 'm2';
  const calcSettings = data.calculatorSettings || { taxRate: 15, designAdaptationPrice: 5, designFromScratchPrice: 15 };
  const designCost = designLevel === 'adaptation'
    ? Number(calcSettings.designAdaptationPrice || 5)
    : designLevel === 'full'
      ? Number(calcSettings.designFromScratchPrice || 15)
      : 0;

  const minQty = Math.max(1, Number(product?.minQuantity || 1));
  const effectiveQty = Math.max(minQty, quantity);
  const quote = calculateCatalogQuote(product, {
    width: widthCm / 100,
    height: heightCm / 100,
    quantity: effectiveQty,
    options: safeSelection,
    taxRate: Number(calcSettings.taxRate) || 15,
    designCost
  });
  
  const activeTier = quote.tier;
  const tiers = quote.tiers || [];
  const selectionText = Object.values(safeSelection).filter(Boolean).join(' · ');
  const readableVariant = [
    selectionText,
    isArea ? `${widthCm} × ${heightCm} cm` : '',
    `${effectiveQty} ${product.pricingMode === 'tier-total' ? 'unidades (lote)' : product.unit}`,
    designLevel === 'adaptation' ? 'Ajuste de diseño' : designLevel === 'full' ? 'Diseño profesional' : ''
  ].filter(Boolean).join(' · ');

  const add = () => {
    const fingerprint = `${product.id}:${JSON.stringify({ safeSelection, widthCm: isArea ? widthCm : null, heightCm: isArea ? heightCm : null, quantity: effectiveQty, designLevel })}`;
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
            <img src={product.image} alt={product.name} />
          </div>
          <div className="detail-copy">
            <span className="eyebrow orange">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="detail-description">{product.description}</p>
            <div className="detail-price">
              Estimado: <strong>{money(quote.total)}</strong>
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
                  Área unitaria: {quote.area.toFixed(2)} m² · Tarifa: {money(quote.rate)} / m²
                </div>
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

            <div className="detail-actions">
              <div className="qty large">
                <button type="button" onClick={() => setQuantity(Math.max(minQty, effectiveQty - 1))}><X size={16} /></button>
                <span>{effectiveQty}</span>
                <button type="button" onClick={() => setQuantity(effectiveQty + 1)}><Plus size={16} /></button>
              </div>
              <Button onClick={add}>Agregar a cotización ({money(quote.total)})</Button>
            </div>

            <Link to={`/cotizador`} className="detail-link">
              ¿Quieres personalizar con acabados, instalación o diseño? Abrir cotizador completo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function SmartQuotePage() {
  const { data, addToCart } = useSite();
  const [mode, setMode] = useState('medidas');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [widthCm, setWidthCm] = useState(100);
  const [heightCm, setHeightCm] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [designLevel, setDesignLevel] = useState('none');
  const [finishing, setFinishing] = useState('none');
  const [installation, setInstallation] = useState(false);
  const [selection, setSelection] = useState({});

  const calcSettings = data.calculatorSettings || {
    taxRate: 15,
    designAdaptationPrice: 5,
    designFromScratchPrice: 15,
    eyeletSmallPrice: 1.5,
    eyeletLargePrice: 3.5,
    disclaimer: 'Los valores son referenciales y se confirman con especificaciones y arte final.'
  };

  const areaProducts = useMemo(() => data.products.filter((p) => getProductCalcType(p) === 'm2'), [data.products]);
  const lotProducts = useMemo(() => data.products.filter((p) => p.pricingMode === 'tier-total'), [data.products]);
  const unitProducts = useMemo(() => data.products.filter((p) => getProductCalcType(p) !== 'm2' && p.pricingMode !== 'tier-total'), [data.products]);

  const sourceProducts = mode === 'medidas' ? areaProducts : mode === 'lotes' ? lotProducts : unitProducts;
  
  const filteredProducts = sourceProducts.filter((product) => {
    const matchCategory = categoryFilter === 'Todos' || product.category === categoryFilter ||
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

  const designCost = designLevel === 'adaptation'
    ? Number(calcSettings.designAdaptationPrice || 5)
    : designLevel === 'full'
      ? Number(calcSettings.designFromScratchPrice || 15)
      : 0;

  const finishingCost = isArea && finishing === 'esquinas'
    ? Number(calcSettings.eyeletSmallPrice || 1.5) * effectiveQuantity
    : isArea && finishing === 'perimetral'
      ? Number(calcSettings.eyeletLargePrice || 3.5) * effectiveQuantity
      : isArea && finishing === 'bolsillo'
        ? 4.0 * effectiveQuantity
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
  const selectionText = Object.values(safeSelection).filter(Boolean).join(' · ');

  const chooseMode = (nextMode) => {
    setMode(nextMode);
    setSearch('');
    setSelectedId('');
    setCategoryFilter('Todos');
    setSelection({});
    setQuantity(nextMode === 'medidas' ? 1 : nextMode === 'lotes' ? 1000 : 12);
  };

  const chooseProduct = (product) => {
    setSelectedId(product.id);
    setSelection({});
    setQuantity(Math.max(1, Number(product.minQuantity || 1), mode === 'lotes' ? 1000 : mode === 'unidades' ? 12 : 1));
    setDesignLevel('none');
    setFinishing('none');
    setInstallation(false);
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

  const add = () => {
    if (!selectedProduct) return;
    const readableVariant = [
      selectionText,
      readableDimensions,
      designLevel !== 'none' ? readableDesign : '',
      finishing !== 'none' ? `Acabado: ${finishing}` : '',
      installation ? 'Instalación incluida' : ''
    ].filter(Boolean).join(' · ');

    const fingerprint = `${selectedProduct.id}:${JSON.stringify({ safeSelection, widthCm: isArea ? widthCm : null, heightCm: isArea ? heightCm : null, quantity: effectiveQuantity, designLevel, finishing, installation })}`;
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
    (selectionText ? `• *Variante:* ${selectionText}\n` : '') +
    `• *Medidas / Cantidad:* ${readableDimensions}\n` +
    `• *Diseño:* ${readableDesign}\n` +
    (finishing !== 'none' ? `• *Acabado:* ${finishing}\n` : '') +
    (installation ? `• *Instalación:* Sí\n` : '') +
    `• *Subtotal estimado:* ${money(quote.subtotal)}\n` +
    `• *Total con IVA:* ${money(quote.total)}\n\n` +
    `¿Podrían confirmarme disponibilidad y tiempo de entrega?`
  );

  return (
    <PageShell>
      <section className="inner-hero quote-hero">
        <div className="container">
          <span className="eyebrow orange">Cotizador Inteligente · Gigaprint</span>
          <h1>Calcula tu proyecto<br /><em>en segundos y con precisión.</em></h1>
          <p>Elige tu producto, variante, dimensiones o volumen. Tarifas automáticas con escalas reales y transparencia total.</p>
        </div>
      </section>

      <section className="section quote-section">
        <div className="container quote-layout">
          <div className="quote-main">
            {/* Mode Toggle */}
            <div className="mode-toggle three-cols">
              <button
                type="button"
                className={mode === 'medidas' ? 'active' : ''}
                onClick={() => chooseMode('medidas')}
              >
                <Calculator size={17} /> Por medidas (m²)
              </button>
              <button
                type="button"
                className={mode === 'unidades' ? 'active' : ''}
                onClick={() => chooseMode('unidades')}
              >
                <Package size={17} /> Por volumen / unidades
              </button>
              <button
                type="button"
                className={mode === 'lotes' ? 'active' : ''}
                onClick={() => chooseMode('lotes')}
              >
                <Layers size={17} /> Por lotes / imprenta
              </button>
            </div>

            {/* Step 1: Product Selection */}
            <div className="quote-step">
              <span>01</span>
              <div className="step-content">
                <h3>Elige lo que vas a producir</h3>
                <p>Filtra por categoría o busca directamente en nuestro catálogo.</p>

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

                <label className="search-box quote-search">
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar producto (ej. Lona, Camiseta, Tarjetas, Neón, Roll up...)"
                  />
                </label>

                <div className="quote-products">
                  {filteredProducts.slice(0, 40).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className={selectedProduct?.id === product.id ? 'quote-product active' : 'quote-product'}
                      onClick={() => chooseProduct(product)}
                    >
                      <img src={product.image} alt="" />
                      <span>
                        <b>{product.name}</b>
                        <small>
                          {product.category} · {getProductCalcType(product) === 'm2' ? 'Precio por m²' : product.pricingMode === 'tier-total' ? 'Precio por lote' : 'Escala por volumen'}
                        </small>
                      </span>
                      {selectedProduct?.id === product.id && <Check size={17} />}
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="smart-empty" style={{ gridColumn: '1 / -1' }}>
                      No encontramos productos con ese filtro. Prueba otra categoría o término de búsqueda.
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
                  <p>Selecciona variante, tipo de tela, acabado o caras impresas.</p>
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
                  <p>Ingresa dimensiones en centímetros o elige un formato habitual.</p>

                  <div className="dimension-presets">
                    <span>Tamaños comunes:</span>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(100, 100)}>100 × 100 cm</button>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(200, 100)}>200 × 100 cm</button>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(300, 100)}>300 × 100 cm</button>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(200, 200)}>200 × 200 cm</button>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(300, 200)}>300 × 200 cm</button>
                    <button type="button" className="preset-chip" onClick={() => setDimensionPreset(400, 150)}>400 × 150 cm</button>
                  </div>

                  <div className="fields two">
                    <label>
                      Ancho (cm)
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={widthCm}
                        onChange={(event) => setWidthCm(Math.max(1, Number(event.target.value) || 1))}
                      />
                    </label>
                    <label>
                      Alto (cm)
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={heightCm}
                        onChange={(event) => setHeightCm(Math.max(1, Number(event.target.value) || 1))}
                      />
                    </label>
                  </div>

                  <div className="quote-insight">
                    <span>Área calculada</span>
                    <strong>{quote.area.toFixed(2)} m² <small>por pieza</small></strong>
                    <small>Área total del pedido: {(quote.area * effectiveQuantity).toFixed(2)} m² · Tarifa activa: {money(activeTier.price)} / m²</small>
                  </div>

                  <label className="range-label">
                    Cantidad de piezas <span>{effectiveQuantity}</span>
                  </label>
                  <input
                    className="range"
                    type="range"
                    min={minQuantity}
                    max={Math.max(minQuantity + 20, 50)}
                    value={effectiveQuantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                  />

                  {/* Finishing Options for Area Products */}
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
                          <b>Corte al ras / Sin ojaletes</b>
                          <small>Listo para enmarcar, montar o clavar.</small>
                        </div>
                        <span className="design-option-price">$0</span>
                      </label>

                      <label className={`design-option-card ${finishing === 'esquinas' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="finishing"
                          checked={finishing === 'esquinas'}
                          onChange={() => setFinishing('esquinas')}
                        />
                        <div className="design-option-copy">
                          <b>Ojaletes en las 4 esquinas</b>
                          <small>Para templar en postes o vallas pequeñas.</small>
                        </div>
                        <span className="design-option-price">+{money(calcSettings.eyeletSmallPrice || 1.50)}</span>
                      </label>

                      <label className={`design-option-card ${finishing === 'perimetral' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="finishing"
                          checked={finishing === 'perimetral'}
                          onChange={() => setFinishing('perimetral')}
                        />
                        <div className="design-option-copy">
                          <b>Ojaletes perimetrales cada 50 cm</b>
                          <small>Máxima resistencia al viento y tensión uniforme.</small>
                        </div>
                        <span className="design-option-price">+{money(calcSettings.eyeletLargePrice || 3.50)}</span>
                      </label>

                      <label className={`design-option-card ${finishing === 'bolsillo' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="finishing"
                          checked={finishing === 'bolsillo'}
                          onChange={() => setFinishing('bolsillo')}
                        />
                        <div className="design-option-copy">
                          <b>Bolsillo superior e inferior para tubo</b>
                          <small>Para colgar como pasacalle o banner colgante.</small>
                        </div>
                        <span className="design-option-price">+$4.00</span>
                      </label>
                    </div>
                  </div>

                  {selectedProduct?.price_inst && (
                    <label className="check-option" style={{ marginTop: '14px' }}>
                      <input
                        type="checkbox"
                        checked={installation}
                        onChange={(event) => setInstallation(event.target.checked)}
                      />
                      <span>
                        <b>Incluir servicio de instalación profesional</b>
                        <small>Un equipo técnico de Gigaprint se encarga del montaje en sitio.</small>
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
                  <p>En imprenta y empaques, los lotes mayores optimizan drásticamente el costo por unidad.</p>
                  
                  <div className="quote-tiers">
                    {tiers.map((tier) => {
                      const qty = Number(tier.qty) || 1000;
                      const unitCost = Number(tier.price) / qty;
                      const isActive = effectiveQuantity === qty;
                      return (
                        <button
                          key={tier.qty}
                          type="button"
                          onClick={() => setQuantity(qty)}
                          className={isActive ? 'active' : ''}
                        >
                          <span>Lote de {qty.toLocaleString()} uds</span>
                          <b>{money(tier.price)}</b>
                          <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                            ≈ {unitCost < 0.1 ? `$${unitCost.toFixed(3)}` : money(unitCost)} / u
                          </small>
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
                  <h3>¿Cuántas unidades necesitas?</h3>
                  <p>A mayor volumen, obtienes mejores tarifas automáticas por escala.</p>

                  <div className="quantity-picker">
                    <button type="button" onClick={() => setQuantity(Math.max(minQuantity, effectiveQuantity - 1))}>
                      <X size={16} />
                    </button>
                    <strong>{effectiveQuantity}</strong>
                    <button type="button" onClick={() => setQuantity(effectiveQuantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="qty-quick-buttons">
                    <button type="button" onClick={() => setQuantity(1)}>1</button>
                    <button type="button" onClick={() => setQuantity(6)}>6</button>
                    <button type="button" onClick={() => setQuantity(12)}>12</button>
                    <button type="button" onClick={() => setQuantity(24)}>24</button>
                    <button type="button" onClick={() => setQuantity(50)}>50</button>
                    <button type="button" onClick={() => setQuantity(100)}>100</button>
                  </div>

                  {tiers.length > 1 && (
                    <div className="quote-tiers">
                      {tiers.slice(0, 8).map((tier) => {
                        const tierQty = Number(tier.qty);
                        const isActive = effectiveQuantity >= tierQty && activeTier.qty === tier.qty;
                        const basePrice = Number(tiers[0]?.price) || 0;
                        const discount = basePrice > Number(tier.price) ? Math.round(((basePrice - Number(tier.price)) / basePrice) * 100) : 0;
                        return (
                          <button
                            key={tier.qty}
                            type="button"
                            onClick={() => setQuantity(Math.max(minQuantity, tierQty))}
                            className={isActive ? 'active' : ''}
                          >
                            <span>Desde {tier.qty} {selectedProduct?.unit}</span>
                            <b>{money(tier.price)} / u</b>
                            {discount > 0 && <span className="tier-discount-badge">-{discount}% dto.</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Design Services */}
            <div className="quote-step">
              <span>{isArea || variantOptions.length ? '04' : '03'}</span>
              <div className="step-content">
                <h3>Servicio de Diseño Gráfico</h3>
                <p>Garantiza que tus archivos tengan la resolución, sangría y perfil de color óptimos.</p>

                <div className="design-options-grid">
                  <label className={`design-option-card ${designLevel === 'none' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="designLevel"
                      checked={designLevel === 'none'}
                      onChange={() => setDesignLevel('none')}
                    />
                    <div className="design-option-copy">
                      <b>Tengo mi arte listo para producción</b>
                      <small>Revisión técnica de resolución y proporciones incluida sin costo.</small>
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
                      <b>Adaptación y retoque de archivo existente</b>
                      <small>Ajustamos medidas, textos o formato de tu archivo previo.</small>
                    </div>
                    <span className="design-option-price">+{money(calcSettings.designAdaptationPrice || 5)}</span>
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
                      <small>Un diseñador de Gigaprint crea tu propuesta desde tu idea o referencia.</small>
                    </div>
                    <span className="design-option-price">+{money(calcSettings.designFromScratchPrice || 15)}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Summary Card */}
          <aside className="quote-summary-card">
            <span className="eyebrow">Resumen de Cotización</span>
            <h2>{money(quote.total)}</h2>
            <p>{calcSettings.disclaimer || 'Valores referenciales con IVA (15%) incluido.'}</p>

            {quote.savingsPercent > 0 && (
              <div className="savings-banner">
                <Sparkles size={16} />
                <span>¡Estás ahorrando {quote.savingsPercent}% por volumen!</span>
              </div>
            )}

            <div className="summary-line">
              <span>Producto</span>
              <b>{selectedProduct?.name}</b>
            </div>

            {selectionText && (
              <div className="summary-line">
                <span>Variante / Acabado</span>
                <b>{selectionText}</b>
              </div>
            )}

            <div className="summary-line">
              <span>{isArea ? 'Medidas y cantidad' : 'Cantidad total'}</span>
              <b>{readableDimensions}</b>
            </div>

            <div className="summary-line">
              <span>Tarifa aplicada</span>
              <b>
                {quote.mode === 'area'
                  ? `${money(quote.rate)} / m²`
                  : quote.mode === 'tier-total'
                    ? `${money(quote.rate)} / lote`
                    : `${money(quote.rate)} / unidad`}
              </b>
            </div>

            {designCost > 0 && (
              <div className="summary-line">
                <span>Diseño gráfico</span>
                <b>+{money(designCost)}</b>
              </div>
            )}

            {finishingCost > 0 && (
              <div className="summary-line">
                <span>Acabados / Ojaletes</span>
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
              <Check size={15} /> Cotización inmediata lista para producción o revisión.
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
    </PageShell>
  );
}

function ContactPage() { const { data, cart, saveInquiry, saveQuoteRequest } = useSite(); const [sent, setSent] = useState(false); const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' }); const update = (key) => (event) => setForm({ ...form, [key]: event.target.value }); const submit = async (event) => { event.preventDefault(); await saveInquiry(form); if (cart.length) { const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0); const subtotal = cart.reduce((sum, item) => sum + (Number(item.quoteBreakdown?.subtotal ?? item.price) || 0) * (Number(item.quantity) || 1), 0); const taxAmount = Math.max(0, total - subtotal); await saveQuoteRequest({ customerName: form.name, customerCompany: form.company, customerEmail: form.email, customerPhone: form.phone, items: cart, subtotal, taxRate: Number(data.calculatorSettings?.taxRate) || 15, taxAmount, total, notes: form.message }); } setSent(true); }; return <PageShell><section className="inner-hero contact-hero"><div className="container"><span className="eyebrow orange">Contacto</span><h1>Hablemos de lo que<br /><em>quieres hacer visible.</em></h1><p>Cuéntanos un poco de tu idea. Si ya tienes medidas, referencias o un presupuesto en mente, mucho mejor.</p></div></section><section className="section contact-section"><div className="container contact-layout"><div className="contact-info"><span className="eyebrow">Resolvemos rápido</span><h2>Una conversación puede ahorrar muchos intentos.</h2><div className="contact-list"><a href={`https://wa.me/${data.settings.whatsapp}`}><MessageCircle /><span><b>WhatsApp</b><small>{data.settings.phone}</small></span></a><a href={`mailto:${data.settings.email}`}><FileText /><span><b>Correo</b><small>{data.settings.email}</small></span></a><div><Building2 /><span><b>Visítanos</b><small>{data.settings.address}</small></span></div></div><div className="contact-mini"><span>Horario de atención</span><b>Lun — Vie / 09:00 — 18:00</b></div></div><div className="contact-form-card">{sent ? <div className="success-state"><div className="success-icon"><Check /></div><h2>¡Gracias por escribirnos!</h2><p>Recibimos tu solicitud y te responderemos muy pronto con los siguientes pasos.</p><Button to="/">Volver al inicio</Button></div> : <form onSubmit={submit}><div className="form-heading"><span className="eyebrow orange">Cuéntanos</span><h2>¿Qué tienes en mente?</h2></div><div className="fields two"><label>Tu nombre<input required value={form.name} onChange={update('name')} placeholder="Nombre y apellido" /></label><label>Empresa (opcional)<input value={form.company} onChange={update('company')} placeholder="Nombre de tu marca" /></label></div><div className="fields two"><label>Correo<input required type="email" value={form.email} onChange={update('email')} placeholder="tu@correo.com" /></label><label>WhatsApp<input required value={form.phone} onChange={update('phone')} placeholder="+593..." /></label></div><label>Cuéntanos sobre el proyecto<textarea required value={form.message} onChange={update('message')} rows="5" placeholder="Quiero un rótulo para..." /></label><button type="submit" className="button button-primary">Enviar solicitud <ArrowRight size={16} /></button><small className="form-footnote">También puedes escribirnos directo por WhatsApp. Respondemos en horario laboral.</small></form>}</div></div></section></PageShell>; }

function CartPage() { const { cart } = useSite(); return <PageShell><section className="inner-hero cart-hero"><div className="container"><span className="eyebrow orange">Carrito de cotizaciones</span><h1>Tus ideas, listas<br /><em>para conversar.</em></h1><p>Aquí guardamos lo que te interesa. Todavía no es una compra: revisamos contigo medidas, materiales y tiempos antes de confirmar.</p></div></section><section className="section"><div className="container cart-page-grid"><div><div className="cart-title-row"><h2>{cart.length ? `${cart.length} solución${cart.length > 1 ? 'es' : ''} guardada${cart.length > 1 ? 's' : ''}` : 'Tu selección'}</h2>{cart.length > 0 && <span>Estimación preliminar</span>}</div><CartSummary /></div><aside className="cart-aside"><div className="cart-aside-icon"><MessageCircle /></div><h3>¿Listo para darle forma?</h3><p>Envíanos tu selección y un asesor te ayudará a convertirla en una cotización final.</p><Button to="/contacto">Solicitar revisión</Button><Link to="/cotizador">Seguir cotizando</Link></aside></div></section></PageShell>; }

function AdminLogin() { const { login, authMode } = useAuth(); const navigate = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const submit = async (event) => { event.preventDefault(); setBusy(true); const result = await login({ email, password }); setBusy(false); if (result.ok) navigate('/admin'); else setError(result.error || 'No se pudo iniciar sesión.'); }; return <div className="admin-login"><div className="login-card"><div className="login-mark"><img src={media.logoMark} alt="Gigaprint" /></div><span className="eyebrow orange">Área privada</span><h1>Panel Gigaprint</h1><p>Edita contenidos, productos, promociones y revisa tus solicitudes.</p><form onSubmit={submit}>{authMode === 'supabase' && <label>Correo del administrador<input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@tudominio.com" required /></label>}<label>{authMode === 'supabase' ? 'Contraseña' : 'Contraseña de demostración'}<input autoFocus={authMode !== 'supabase'} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></label>{error && <small className="form-error">{error}</small>}<button className="button button-primary full-button" type="submit" disabled={busy}>{busy ? 'Validando…' : 'Entrar al panel'} {!busy && <ArrowRight size={16} />}</button></form>{authMode === 'supabase' && <small className="login-note">Acceso protegido por Supabase Auth. El usuario debe tener rol admin o super admin.</small>}<Link to="/" className="login-back">← Volver al sitio público</Link></div></div>; }

function AdminGuard({ children }) { const { isAdmin } = useAuth(); return isAdmin ? children : <Navigate to="/admin/login" replace />; }

function AdminDashboard() { const { data } = useSite(); const { logout } = useAuth(); return <AdminShell><AdminHeader eyebrow="Resumen" title="Buenos días, equipo." text="Aquí tienes una vista rápida de lo que está pasando en Gigaprint." action={<button className="admin-logout" onClick={logout}>Cerrar sesión</button>} /><div className="metric-grid"><div><span><ClipboardList size={17} /> Solicitudes</span><strong>{data.inquiries.length}</strong><small>Guardadas en este dispositivo</small></div><div><span><Package size={17} /> Productos</span><strong>{data.products.length}</strong><small>En tu catálogo actual</small></div><div><span><Sparkles size={17} /> Promociones</span><strong>{data.promotions.filter((p) => p.active).length}</strong><small>Activas ahora</small></div><div><span><Users size={17} /> Visibilidad</span><strong>24/7</strong><small>Tu catálogo trabaja siempre</small></div></div><div className="admin-dashboard-grid"><div className="admin-card"><div className="admin-card-heading"><div><span className="eyebrow">Atajos</span><h2>¿Qué quieres editar?</h2></div><Settings2 size={20} /></div><div className="quick-grid"><Link to="/admin/contenido"><Pencil /><span><b>Contenido</b><small>Textos de inicio y datos</small></span></Link><Link to="/admin/productos"><Package /><span><b>Productos</b><small>Catálogo y precios</small></span></Link><Link to="/admin/promociones"><Sparkles /><span><b>Promociones</b><small>Ofertas visibles</small></span></Link><Link to="/admin/solicitudes"><MessageCircle /><span><b>Solicitudes</b><small>Leads del sitio</small></span></Link></div></div><div className="admin-card checklist"><div className="admin-card-heading"><div><span className="eyebrow">Estado del proyecto</span><h2>Todo listo para conectar</h2></div><ShieldCheck size={20} /></div><p><Check size={15} /> Persistencia local activada</p><p><Check size={15} /> Cotizador y carrito funcionando</p><p><Check size={15} /> Supabase listo para credenciales</p><p className="pending"><Bell size={15} /> Configurar autenticación antes de publicar</p></div></div><div className="admin-card recent-card"><div className="admin-card-heading"><div><span className="eyebrow">Últimas solicitudes</span><h2>Lo que tus clientes están pidiendo</h2></div><Link to="/admin/solicitudes">Ver todas →</Link></div>{data.inquiries.length ? data.inquiries.slice(-5).reverse().map((item) => <div className="inquiry-row" key={item.id}><span>{item.name?.[0] || 'G'}</span><div><b>{item.name}</b><small>{item.company || item.email}</small></div><small>{item.status}</small></div>) : <div className="admin-empty">Todavía no hay solicitudes. Cuando alguien use el formulario, aparecerán aquí.</div>}</div></AdminShell>; }

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

function AdminThemes() { const { siteTheme, setSiteTheme } = useSite(); return <AdminShell><AdminHeader eyebrow="Sistema visual" title="Temas y temporadas" text="Cambia el ambiente de Gigaprint con un botón. El naranja del logo permanece como color de marca." action={<Button to="/admin/editor" variant="ghost">Abrir editor visual <Palette size={16} /></Button>} /><div className="theme-studio-grid">{themePresets.map((preset) => { const active = preset.id === siteTheme; return <article className={`theme-studio-card ${active ? 'active' : ''}`} key={preset.id} style={{ '--theme-preview': preset.palette.accent, '--theme-preview-secondary': preset.palette.secondary }}><div className="theme-preview"><div className="theme-preview-brand"><span>G</span><b>Gigaprint</b></div><div className="theme-preview-symbols">{preset.decorations.map((symbol, index) => <i key={`${symbol}-${index}`}>{symbol}</i>)}</div><span>{preset.label}</span></div><div className="theme-studio-copy"><div><span className="eyebrow">{preset.eyebrow}</span><h2>{preset.name}</h2></div><p>{preset.description}</p><div className="theme-swatches"><i style={{ background: '#ff5b1f' }} title="Naranja de marca" /><i style={{ background: preset.palette.accent }} title="Color de temporada" /><i style={{ background: preset.palette.secondary }} title="Color secundario" /></div><button className={`button ${active ? 'button-dark' : 'button-primary'}`} onClick={() => setSiteTheme(preset.id)}>{active ? 'Tema activo' : preset.id === 'default' ? 'Quitar temporada' : 'Aplicar tema'} {active ? <Check size={16} /> : <ArrowRight size={16} />}</button></div></article>; })}</div><div className="admin-card theme-studio-note"><div className="theme-note-icon"><Palette /></div><div><h3>Diseño preparado para campañas</h3><p>Los temas solo cambian variables visuales, acentos y decoraciones. El contenido, la tienda, los productos y el cotizador se mantienen intactos.</p></div></div></AdminShell>; }

function AdminRoutes() { const { pathname } = useLocation(); if (pathname === '/admin/login') return <AdminLogin />; const pages = { '/admin': <AdminDashboard />, '/admin/editor': <EditorPage />, '/admin/contenido': <AdminContent />, '/admin/productos': <SmartAdminProducts />, '/admin/temas': <AdminThemes />, '/admin/promociones': <AdminPromos />, '/admin/solicitudes': <AdminInquiries /> }; return <AdminGuard>{pages[pathname] || <Navigate to="/admin" replace />}</AdminGuard>; }

function PublicRoutes() { return <Routes><Route path="/" element={<HomePage />} /><Route path="/gigaprint" element={<AboutPage />} /><Route path="/promociones" element={<PromotionsPage />} /><Route path="/tienda" element={<StorePage />} /><Route path="/tienda/:id" element={<SmartProductDetailPage />} /><Route path="/cotizador" element={<SmartQuotePage />} /><Route path="/contacto" element={<ContactPage />} /><Route path="/carrito" element={<CartPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>; }

export default function App() { return <BrowserRouter basename={import.meta.env.BASE_URL}><AuthProvider><Suspense fallback={<div className="page-loading"><span className="brand-mark">G</span><p>Cargando editor…</p></div>}><Routes><Route path="/admin/*" element={<AdminRoutes />} /><Route path="*" element={<PublicRoutes />} /></Routes></Suspense></AuthProvider></BrowserRouter>; }
