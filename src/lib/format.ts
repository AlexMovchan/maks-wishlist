const priceFormat = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });

export const formatPrice = (price: number): string => `${priceFormat.format(price)} ₴`;

/** Only http(s) links — so nothing like javascript: ends up in an href. */
export const safeUrl = (url: string | null): string | null => (url && /^https?:\/\//i.test(url) ? url : null);

export const isHttpsUrl = (url: string): boolean => /^https:\/\//i.test(url);

/** "1 500,50" → 1500.5; empty → null; not a number → NaN */
export const parsePrice = (value: string): number | null => {
  const normalized = value.replace(/\s/g, '').replace(',', '.');

  if (!normalized) return null;

  const n = Number(normalized);

  return Number.isFinite(n) && n >= 0 ? n : NaN;
};

export const formatDate = (iso: string): string => new Date(iso).toLocaleDateString('uk-UA');
