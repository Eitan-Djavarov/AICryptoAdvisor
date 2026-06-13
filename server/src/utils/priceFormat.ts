export interface CoinPriceCore {
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  priceChange24h: number;
  currency: 'usd';
  source: 'live' | 'fallback';
}

export interface CoinPriceData extends CoinPriceCore {
  formattedCurrentPrice: string;
  formattedMarketCap: string;
  priceChangePercent: string;
  priceChangeFiat: string;
  isPriceChangePositive: boolean;
  hasValidPrice: boolean;
}

const MISSING_VALUE = '--';

function isValidPrice(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function isValidPercent(value: number): boolean {
  return Number.isFinite(value);
}

function sanitizeNumber(value: number | null | undefined, fallback = 0): number {
  if (value == null || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
}

function resolveUsdFractionDigits(value: number): {
  minimumFractionDigits: number;
  maximumFractionDigits: number;
} {
  if (value < 10) {
    return { minimumFractionDigits: 4, maximumFractionDigits: 4 };
  }

  return { minimumFractionDigits: 2, maximumFractionDigits: 2 };
}

function formatUsdAmount(value: number): string {
  if (!isValidPrice(value)) {
    return MISSING_VALUE;
  }

  const { minimumFractionDigits, maximumFractionDigits } =
    resolveUsdFractionDigits(value);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

function formatSignedUsdAmount(value: number, basePrice: number): string {
  if (!isValidPrice(basePrice) || !isValidPercent(value)) {
    return MISSING_VALUE;
  }

  if (value === 0) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(0);
  }

  const absoluteValue = Math.abs(value);
  const { minimumFractionDigits, maximumFractionDigits } =
    resolveUsdFractionDigits(absoluteValue);

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(absoluteValue);

  return value > 0 ? `+${formatted}` : `-${formatted}`;
}

function formatMarketCapLabel(marketCap: number): string {
  if (!isValidPrice(marketCap)) {
    return MISSING_VALUE;
  }

  if (marketCap >= 1_000_000_000_000) {
    return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
  }

  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  }

  if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  }

  return formatUsdAmount(marketCap);
}

function formatPriceChangePercent(changePercent: number): string {
  if (!isValidPercent(changePercent)) {
    return MISSING_VALUE;
  }

  if (changePercent === 0) {
    return '0.00%';
  }

  const sign = changePercent > 0 ? '+' : '-';
  return `${sign}${Math.abs(changePercent).toFixed(2)}%`;
}

function calculatePriceChangeFiat(
  currentPrice: number,
  changePercent: number
): number {
  if (!isValidPrice(currentPrice) || !isValidPercent(changePercent)) {
    return Number.NaN;
  }

  return currentPrice * (changePercent / 100);
}

export function enrichCoinPriceData(row: CoinPriceCore): CoinPriceData {
  const currentPrice = sanitizeNumber(row.currentPrice);
  const marketCap = sanitizeNumber(row.marketCap);
  const priceChange24h = sanitizeNumber(row.priceChange24h);
  const hasValidPrice = isValidPrice(currentPrice);
  const fiatChange = calculatePriceChangeFiat(currentPrice, priceChange24h);

  return {
    ...row,
    currentPrice,
    marketCap,
    priceChange24h,
    formattedCurrentPrice: formatUsdAmount(currentPrice),
    formattedMarketCap: formatMarketCapLabel(marketCap),
    priceChangePercent: formatPriceChangePercent(priceChange24h),
    priceChangeFiat: formatSignedUsdAmount(fiatChange, currentPrice),
    isPriceChangePositive: priceChange24h >= 0,
    hasValidPrice,
  };
}

export function formatAssetSearchPrice(value: number): string {
  return formatUsdAmount(sanitizeNumber(value));
}

export function formatAssetSearchChange(value: number): string {
  return formatPriceChangePercent(sanitizeNumber(value));
}
