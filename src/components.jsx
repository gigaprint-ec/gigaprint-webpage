import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronRight, Camera, Mail, MapPin, Menu, MessageCircle, Minus, Moon, Plus, Search, ShoppingBag, Sparkles, Sun, X } from 'lucide-react';
import { media, money, themePresets } from './data';
import { resourceUrls } from './data/resourceManifest';
import { getProductCalcType } from './catalog';
import { useSite } from './store';
import { ContextMenu, MotionObserver, SearchCommand, SeasonalThemeLayer, ThemeToggle, ToastViewport, contextIcons } from './components/studio/Chrome';

export function Brand({ compact = false }) {
  return <Link className="brand" to="/">{compact ? <img className="brand-logo-image" src={media.logoDark} alt="Gigaprint" /> : <><span className="brand-mark">G</span><span><b>Giga</b>print<small>Tus ideas en grande</small></span></>}</Link>;
}

export function Button({ children, to, onClick, variant = 'primary', className = '', type = 'button' }) {
  const content = <>{children}<ArrowUpRight size={16} /></>;
  return to ? <Link className={`button button-${variant} ${className}`} to={to}>{content}</Link> : <button type={type} onClick={onClick} className={`button button-${variant} ${className}`}>{content}</button>;
}

export function Header() {
  const { cart, theme, setTheme } = useSite();
  const [open, setOpen] = React.useState(false);
  const items = [{ to: '/', label: 'Inicio' }, { to: '/gigaprint', label: 'Gigaprint' }, { to: '/promociones', label: 'Promociones' }, { to: '/tienda', label: 'Tienda' }, { to: '/cotizador', label: 'Cotizador' }, { to: '/contacto', label: 'Contacto' }];
  return <header className="site-header"><div className="container header-inner"><Brand /><nav className={open ? 'main-nav open' : 'main-nav'}>{items.map((item) => <NavLink key={item.to} end={item.to === '/'} to={item.to} onClick={() => setOpen(false)}>{item.label}</NavLink>)}<Link className="cart-link" to="/carrito" onClick={() => setOpen(false)}><ShoppingBag size={17} /> <span>Carrito</span><b>{cart.length}</b></Link></nav><div className="header-actions"><SearchCommand /><ThemeToggle theme={theme} onChange={setTheme} /><Link className="desktop-cart" to="/carrito" aria-label="Ver carrito"><ShoppingBag size={18} /><b>{cart.length}</b></Link><Button to="/cotizador" className="header-cta">Cotiza tu proyecto</Button><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Abrir menú">{open ? <X /> : <Menu />}</button></div></div></header>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Brand /><p>Publicidad, impresión y fabricación visual para marcas que quieren verse en grande.</p><div className="socials"><a href="https://instagram.com" aria-label="Instagram"><Camera size={17} /></a><a href="https://wa.me/593999999999" aria-label="WhatsApp"><MessageCircle size={17} /></a><a href="mailto:hola@gigaprint.ec" aria-label="Correo"><Mail size={17} /></a></div></div><div><h4>Explora</h4><Link to="/gigaprint">Nosotros</Link><Link to="/promociones">Promociones</Link><Link to="/tienda">Tienda</Link><Link to="/contacto">Contacto</Link></div><div><h4>Soluciones</h4><Link to="/cotizador">Cotizador online</Link><Link to="/tienda?categoria=Gran%20formato">Gran formato</Link><Link to="/tienda?categoria=Rótulos">Rótulos</Link><Link to="/tienda?categoria=Personalizados">Personalizados</Link></div><div className="footer-contact"><h4>Hablemos</h4><p><MapPin size={15} /> Quito, Ecuador</p><p><MessageCircle size={15} /> +593 99 999 9999</p><p><Mail size={15} /> hola@gigaprint.ec</p></div></div><div className="container footer-bottom"><span>© 2026 Gigaprint. Todos los derechos reservados.</span><Link to="/admin">Acceso admin</Link></div></footer>;
}

function GlobalContextMenu({ admin = false }) { const navigate = useNavigate(); const { theme, setTheme, siteTheme } = useSite(); const items = admin ? [{ label: 'Ir al resumen', icon: contextIcons.home, onClick: () => navigate('/admin') }, { label: 'Editar productos', icon: contextIcons.store, onClick: () => navigate('/admin/productos') }, { label: 'Editar temas', icon: contextIcons.palette, onClick: () => navigate('/admin/temas') }, { label: theme === 'dark' ? 'Usar modo claro' : 'Usar modo oscuro', icon: theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />, onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark') }, { label: siteTheme === 'default' ? 'Abrir temas de temporada' : 'Volver al tema base', icon: contextIcons.palette, onClick: () => navigate('/admin/temas') }] : [{ label: 'Ir al inicio', icon: contextIcons.home, onClick: () => navigate('/') }, { label: 'Abrir tienda', icon: contextIcons.store, onClick: () => navigate('/tienda') }, { label: 'Abrir cotizador', icon: contextIcons.quote, onClick: () => navigate('/cotizador') }, { label: theme === 'dark' ? 'Usar modo claro' : 'Usar modo oscuro', icon: theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />, onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark') }, { label: 'Volver arriba', icon: contextIcons.top, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }]; return <ContextMenu items={items} />; }

export function PageShell({ children, className = '' }) { const { toast, siteTheme } = useSite(); const preset = themePresets.find((item) => item.id === siteTheme) || themePresets[0]; return <><SeasonalThemeLayer preset={preset} /><GlobalContextMenu /><MotionObserver /><Header /><main className={className}>{children}</main><Footer /><ToastViewport items={toast ? [{ id: 'global', message: toast }] : []} /></>; }

export function SectionHeading({ eyebrow, title, text, action }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><div className="section-heading-side">{text && <p>{text}</p>}{action}</div></div>; }

export function ServiceCard({ service, index = 0 }) { return <article className={`service-card service-${index % 4}`}><div className="service-card-image"><img src={service.image} alt="" /><span>{service.tag}</span></div><div className="service-card-copy"><div className="service-number">0{index + 1}</div><h3>{service.name}</h3><p>{service.detail}</p><Link to="/cotizador">Cotizar servicio <ArrowUpRight size={15} /></Link></div></article>; }

export function ProductCard({ product, onAdd }) { const calcType = getProductCalcType(product); const label = calcType === 'm2' ? 'Por medida' : product.pricingMode === 'tier-total' ? 'Por lote' : product.priceScales?.length ? 'Por volumen' : 'Personalizable'; return <article className="product-card"><Link to={`/tienda/${product.id}`} className="product-image"><img src={product.image} alt={product.name} /><span>{product.category}</span></Link><div className="product-copy"><div className="product-meta"><span>{label}</span>{product.featured && <span className="featured-dot">Destacado</span>}</div><h3>{product.name}</h3><p>{product.description}</p><div className="product-bottom"><strong>Desde {money(product.price)} <small>/ {product.unit}</small></strong><button className="icon-button" onClick={() => onAdd(product)} aria-label={`Agregar ${product.name}`}><Plus size={18} /></button></div></div></article>; }

export function CartSummary({ compact = false }) {
  const { cart, updateCartItem, removeCartItem } = useSite();
  const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  if (!cart.length) return <div className="empty-cart"><ShoppingBag size={30} /><h3>Tu carrito está esperando ideas</h3><p>Agrega productos o configura una pieza en el cotizador.</p><Button to="/tienda">Explorar tienda</Button></div>;
  return <div className={compact ? 'cart-summary compact' : 'cart-summary'}>{cart.map((item) => <div className="cart-row" key={item.cartId}><img src={item.image} alt="" /><div><b>{item.name}</b><small>{item.variant || 'Configuración estándar'}</small><div className="qty"><button onClick={() => updateCartItem(item.cartId, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => updateCartItem(item.cartId, item.quantity + 1)}><Plus size={13} /></button></div></div><strong>{money(item.price * item.quantity)}</strong><button className="remove-link" onClick={() => removeCartItem(item.cartId)} aria-label="Eliminar"><X size={14} /></button></div>)}<div className="cart-total"><span>Estimado desde</span><strong>{money(total)}</strong></div>{!compact && <Button to="/contacto">Solicitar cotización <ChevronRight size={16} /></Button>}</div>;
}

export function AdminNav() { const location = useLocation(); const { theme, setTheme } = useSite(); const items = [['/admin','Resumen'],['/admin/editor','Editor visual'],['/admin/contenido','Contenido'],['/admin/productos','Productos'],['/admin/temas','Temas'],['/admin/promociones','Promociones'],['/admin/solicitudes','Solicitudes']]; return <aside className="admin-sidebar"><Brand compact /><div className="admin-nav-label">Panel Gigaprint</div><nav>{items.map(([path, label]) => <NavLink key={path} end={path === '/admin'} className={location.pathname === path ? 'active' : ''} to={path}>{label}</NavLink>)}</nav><div className="admin-sidebar-footer"><ThemeToggle theme={theme} onChange={setTheme} /><Link to="/" className="admin-back">← Volver al sitio</Link></div></aside>; }

export function AdminShell({ children }) { const { toast, siteTheme } = useSite(); const preset = themePresets.find((item) => item.id === siteTheme) || themePresets[0]; return <div className="admin-shell"><SeasonalThemeLayer preset={preset} /><GlobalContextMenu admin /><MotionObserver /><AdminNav /><section className="admin-content">{children}</section><ToastViewport items={toast ? [{ id: 'admin', message: toast }] : []} /></div>; }

export function AdminHeader({ eyebrow, title, text, action }) { return <header className="admin-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{text && <p>{text}</p>}</div>{action}</header>; }

export const imageLibrary = [media.lona, media.vinil, media.letrero, media.laser, media.stickers, media.workspace, ...resourceUrls.filter((item) => item.type === 'image').map((item) => item.url)];

// React is imported lazily here to keep the shared component file compact.
import React from 'react';
