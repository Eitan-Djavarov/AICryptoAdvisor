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
}

function formatUsdAmount(
  value: number,
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): string {
  const maximumFractionDigits =
    options?.maximumFractionDigits ?? (value >= 1 ? 2 : 6);
  const minimumFractionDigits =
    options?.minimumFractionDigits ?? (value >= 1 ? 2 : 2);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

function formatSignedUsdAmount(value: number): string {
  if (value === 0) {
    return formatUsdAmount(0);
  }

  const absoluteValue = Math.abs(value);
  const formatted = formatUsdAmount(absoluteValue, {
    maximumFractionDigits: absoluteValue >= 1 ? 2 : 6,
    minimumFractionDigits: absoluteValue >= 1 ? 2 : 2,
  });

  return value > 0 ? `+${formatted}` : `-${formatted}`;
}

function formatMarketCapLabel(marketCap: number): string {
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
  return currentPrice * (changePercent / 100);
}

export function enrichCoinPriceData(row: CoinPriceCore): CoinPriceData {
  const fiatChange = calculatePriceChangeFiat(row.currentPrice, row.priceChange24h);

  return {
    ...row,
    formattedCurrentPrice: formatUsdAmount(row.currentPrice),
    formattedMarketCap: formatMarketCapLabel(row.marketCap),
    priceChangePercent: formatPriceChangePercent(row.priceChange24h),
    priceChangeFiat: formatSignedUsdAmount(fiatChange),
    isPriceChangePositive: row.priceChange24h >= 0,
  };
}
