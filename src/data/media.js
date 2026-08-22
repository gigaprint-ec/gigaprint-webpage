export function assetPath(value) {
  if (!value || typeof value !== 'string' || /^(?:https?:|data:|blob:|#)/i.test(value)) return value;
  const base = import.meta.env?.BASE_URL || '/';
  if (base !== '/' && value.startsWith(base)) return value;
  const clean = value.replace(/^\/+/, '');
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
}

export const media = {
  hero: assetPath('/media/showcase/publicidad-creativa-impresora-1.webp'),
  lona: assetPath('/images/gigaprint/lona_banner.png'),
  vinil: assetPath('/images/gigaprint/vinil_adhesivo.png'),
  laser: assetPath('/images/gigaprint/laser_acrilico.png'),
  letrero: assetPath('/images/gigaprint/letras_corporeas.png'),
  stickers: assetPath('/images/gigaprint/stickers.png'),
  workspace: assetPath('/images/gigaprint/disenador_workspace.png'),
  neon: assetPath('/media/products/neon.webp'),
  luminoso: assetPath('/media/products/luminoso.webp'),
  rollupProduct: assetPath('/media/products/rollup.webp'),
  mascot: assetPath('/brand/mascot/chatgpt-image-3-ago-2026-11-51-23.webp'),
  logoDark: assetPath('/brand/logos/logo-gigaprint-dark.svg'),
  logoLight: assetPath('/brand/logos/logo-gigaprint-light.svg'),
  logoMark: assetPath('/brand/logos/recurso-2-logo-giga.svg'),
  logoVertical: assetPath('/brand/logos/recurso-6-logo-giga.svg'),
  logoWordmark: assetPath('/brand/logos/recurso-5-logo-giga.svg'),
  showcaseMampara: assetPath('/media/showcase/0-mampara-5.webp'),
  showcaseDesigns: assetPath('/media/showcase/disenos-varios-1.webp'),
  showcaseDesignsTwo: assetPath('/media/showcase/disenos-varios-2.webp'),
  showcaseHorarios: assetPath('/media/showcase/horarios.webp'),
  showcaseCampaign: assetPath('/media/showcase/publicidad-creativa-impresora-1.webp'),
  resourcePrices: assetPath('/media/resources/precios-bomba.webp'),
  milagroFlag: assetPath('/media/seasonal/milagro/bandera-milagro-g01.webp'),
  taza: assetPath('/media/products/tazita.webp'),
  camiseta: assetPath('/media/products/camiseta.webp'),
  camiseta1: assetPath('/media/products/camiseta-01.webp'),
  gorra: assetPath('/media/products/gorra-ejemplo-1.webp'),
  gorraEcuador: assetPath('/media/products/gorra-ecuador.webp'),
  placa: assetPath('/media/products/placa-de-vidrio.webp'),
  stand: assetPath('/media/products/stand.webp'),
  bannerX: assetPath('/media/products/banner-x.webp'),
  bolso: assetPath('/media/products/funda-para-stand-publicitario.webp'),
  rolloLona: assetPath('/media/resources/rollo-de-lona-3d.webp'),
};
