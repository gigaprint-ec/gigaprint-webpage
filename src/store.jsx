import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialData, themePresets } from './data';
import { assetPath } from './data/media';

const DATA_KEY = 'gigaprint-site-v1';
const CART_KEY = 'gigaprint-cart-v1';
const SiteContext = createContext(null);
const AuthContext = createContext(null);

const uid = () => globalThis.crypto?.randomUUID?.() || `gigaprint-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

function loadSiteData() {
  const stored = load(DATA_KEY, null);
  if (!stored) return initialData;
  const catalogIsCurrent = Number(stored.catalogVersion || 0) >= Number(initialData.catalogVersion || 1);
  const next = {
    ...initialData,
    ...stored,
    settings: { ...initialData.settings, ...(stored.settings || {}) },
    services: stored.services?.length ? stored.services : initialData.services,
    products: catalogIsCurrent && stored.products?.length ? stored.products : initialData.products,
    catalogVersion: initialData.catalogVersion,
    promotions: stored.promotions?.length ? stored.promotions : initialData.promotions,
    inquiries: stored.inquiries || [],
    homeBlocks: stored.homeBlocks?.length ? stored.homeBlocks : initialData.homeBlocks,
  };
  const normalize = (value, key = '') => {
    if (Array.isArray(value)) return value.map((item) => normalize(item));
    if (!value || typeof value !== 'object') return key === 'src' || key === 'poster' || key === 'image' ? assetPath(value) : value;
    return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [entryKey, normalize(entryValue, entryKey)]));
  };
  return { ...next, services: normalize(next.services), products: normalize(next.products), homeBlocks: normalize(next.homeBlocks) };
}

export function SiteProvider({ children }) {
  const [data, setData] = useState(loadSiteData);
  const [cart, setCart] = useState(() => load(CART_KEY, []));
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('gigaprint-theme') || 'light');
  const siteTheme = data.settings?.themePreset || 'default';

  useEffect(() => localStorage.setItem(DATA_KEY, JSON.stringify(data)), [data]);
  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart]);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('gigaprint-theme', theme); }, [theme]);
  useEffect(() => {
    const preset = themePresets.find((item) => item.id === siteTheme) || themePresets[0];
    document.documentElement.dataset.siteTheme = preset.id;
    document.documentElement.style.setProperty('--brand-orange', '#ff5b1f');
    document.documentElement.style.setProperty('--orange', preset.palette.accent);
    document.documentElement.style.setProperty('--orange-dark', preset.palette.accentDark);
    document.documentElement.style.setProperty('--orange-soft', preset.palette.accentSoft);
    document.documentElement.style.setProperty('--theme-secondary', preset.palette.secondary);
  }, [siteTheme]);

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800); };
  const addToCart = (item) => {
    setCart((current) => {
      const fingerprint = item.configFingerprint || item.variant || item.id;
      const match = current.find((row) => (row.configFingerprint || row.variant || row.id) === fingerprint && row.id === item.id);
      return match ? current.map((row) => row === match ? { ...row, quantity: row.quantity + (item.quantity || 1) } : row) : [...current, { ...item, quantity: item.quantity || 1 }];
    });
    notify('Agregado a tu carrito de cotizaciones');
  };
  const updateCartItem = (id, quantity) => setCart((current) => quantity <= 0 ? current.filter((item) => item.cartId !== id) : current.map((item) => item.cartId === id ? { ...item, quantity } : item));
  const removeCartItem = (id) => setCart((current) => current.filter((item) => item.cartId !== id));
  const saveInquiry = (inquiry) => { setData((current) => ({ ...current, inquiries: [...current.inquiries, { ...inquiry, id: uid(), createdAt: new Date().toISOString(), status: 'nuevo' }] })); notify('Solicitud recibida. Te contactaremos pronto.'); };
  const updateCollectionItem = (collection, id, patch) => setData((current) => ({ ...current, [collection]: current[collection].map((item) => item.id === id ? { ...item, ...patch } : item) }));
  const addCollectionItem = (collection, item) => setData((current) => ({ ...current, [collection]: [...current[collection], item] }));
  const removeCollectionItem = (collection, id) => setData((current) => ({ ...current, [collection]: current[collection].filter((item) => item.id !== id) }));
  const resetData = () => setData(initialData);
  const setSiteTheme = (presetId) => {
    const next = themePresets.some((item) => item.id === presetId) ? presetId : 'default';
    setData((current) => ({ ...current, settings: { ...current.settings, themePreset: next } }));
    notify(next === 'default' ? 'Tema base de Gigaprint restaurado' : `Tema ${themePresets.find((item) => item.id === next)?.name || 'de temporada'} aplicado`);
  };

  const value = useMemo(() => ({ data, setData, cart, addToCart, updateCartItem, removeCartItem, saveInquiry, updateCollectionItem, addCollectionItem, removeCollectionItem, resetData, toast, notify, theme, setTheme, siteTheme, setSiteTheme }), [data, cart, toast, theme, siteTheme]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() { return useContext(SiteContext); }

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('gigaprint-admin') === 'true');
  const login = (password) => { if (password === 'gigaprint') { localStorage.setItem('gigaprint-admin', 'true'); setIsAdmin(true); return true; } return false; };
  const logout = () => { localStorage.removeItem('gigaprint-admin'); setIsAdmin(false); };
  return <AuthContext.Provider value={{ isAdmin, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
