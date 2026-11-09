/**
 * Precise Financial Arithmetic Helper
 * Prevents floating-point inaccuracy (e.g. 0.1 + 0.2 = 0.30000000000000004)
 * Stores calculations with 2 decimal precision (cents/centimes).
 */

const FACTOR = 100;

export const toCents = (amount: number): number => {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round(amount * FACTOR);
};

export const fromCents = (cents: number): number => {
  return cents / FACTOR;
};

export const addMoney = (a: number, b: number): number => {
  return fromCents(toCents(a) + toCents(b));
};

export const subtractMoney = (a: number, b: number): number => {
  return fromCents(toCents(a) - toCents(b));
};

export const multiplyMoney = (amount: number, factor: number): number => {
  return fromCents(Math.round(toCents(amount) * factor));
};

export const divideMoney = (amount: number, divisor: number): number => {
  if (divisor === 0) return 0;
  return fromCents(Math.round(toCents(amount) / divisor));
};

/**
 * Safe currency formatter with multi-language and RTL support
 */
export const formatMoney = (
  amount: number,
  currencyCode: string = 'MAD',
  language: string = 'ar'
): string => {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const formattedNumber = new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : (language === 'fr' ? 'fr-FR' : 'en-US'), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeAmount);

  const currencySymbols: Record<string, string> = {
    MAD: language === 'ar' ? 'د.م.' : 'MAD',
    USD: '$',
    EUR: '€',
    GBP: '£',
    SAR: language === 'ar' ? 'ر.س' : 'SAR',
    AED: language === 'ar' ? 'د.إ' : 'AED',
    CAD: 'C$'
  };

  const symbol = currencySymbols[currencyCode] || currencyCode;

  if (language === 'ar') {
    return `${formattedNumber} ${symbol}`;
  }
  return `${formattedNumber} ${symbol}`;
};

/**
 * Format percentage safely
 */
export const formatPercentage = (value: number, language: string = 'ar'): string => {
  const safeValue = isNaN(value) ? 0 : Math.round(value * 10) / 10;
  return language === 'ar' ? `${safeValue}%` : `${safeValue}%`;
};
