export function assetPath(value) {
  if (!value || /^(?:https?:|data:|blob:|#)/i.test(value)) return value;
  const base = import.meta.env.BASE_URL || '/';
  if (value.startsWith(base)) return value;
  return `${base}${String(value).replace(/^\/+/, '')}`;
}

export const media = {
  hero: assetPath('/images/gigaprint/galaxy_printer.png'),
  lona: assetPath('/images/gigaprint/lona_banner.png'),
  vinil: assetPath('/images/gigaprint/vinil_adhesivo.png'),
  laser: assetPath('/images/gigaprint/laser_acrilico.png'),
  letrero: assetPath('/images/gigaprint/letras_corporeas.png'),
  stickers: assetPath('/images/gigaprint/stickers.png'),
  workspace: assetPath('/images/gigaprint/disenador_workspace.png'),
};
