import { SEARCHABLE_CRYPTO_ASSETS } from '../constants/searchableAssets';
import {
  FALLBACK_NEWS,
  FALLBACK_PRICES,
  SYMBOL_TO_ICON_IMAGE,
} from '../mocks/crypto.mock';
import {
  enrichCoinPriceData,
  type CoinPriceData,
} from '../utils/priceFormat';
import {
  enrichNewsItems,
  type EnrichedNewsItem,
  type NewsItemDraft,
} from '../utils/newsFormat';

export const NEWS_MIN_ITEMS = 5;
export const NEWS_MAX_ITEMS = 8;

export const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  LTC: 'litecoin',
  NEAR: 'near',
  SHIB: 'shiba-inu',
  USDT: 'tether',
} as const;

export const COINGECKO_ID_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(SYMBOL_TO_COINGECKO_ID).map(([symbol, id]) => [id, symbol])
) as Record<string, string>;

export interface CoinGeckoMarketRow {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  price_change_percentage_24h: number | null;
}

export interface CryptoPanicPost {
  id: number;
  title: string;
  url: string;
  published_at: string;
  source?: {
    title?: string;
    domain?: string;
  };
  metadata?: {
    description?: string;
  };
  currencies?: Array<{ code: string }>;
}

export interface CryptoPanicResponse {
  results: CryptoPanicPost[];
}

export type CryptoNewsItem = EnrichedNewsItem;

export function normalizeAssetSymbol(asset: string): string {
  return asset.trim().toUpperCase();
}

export function resolveCoinGeckoIds(assets: string[]): string[] {
  const ids = assets.map((asset) => {
    const symbol = normalizeAssetSymbol(asset);
    return SYMBOL_TO_COINGECKO_ID[symbol] ?? symbol.toLowerCase();
  });

  return [...new Set(ids)];
}

export function resolveCoinImage(symbol: string, image?: string): string {
  const normalized = normalizeAssetSymbol(symbol);

  if (image?.trim()) {
    return image.trim();
  }

  return SYMBOL_TO_ICON_IMAGE[normalized as keyof typeof SYMBOL_TO_ICON_IMAGE] ?? '';
}

export function mapGeckoRowToPrice(row: CoinGeckoMarketRow): CoinPriceData {
  const symbol =
    COINGECKO_ID_TO_SYMBOL[row.id] ?? normalizeAssetSymbol(row.symbol);

  return enrichCoinPriceData({
    symbol,
    name: row.name,
    image: resolveCoinImage(symbol, row.image),
    currentPrice: row.current_price ?? Number.NaN,
    marketCap: row.market_cap ?? Number.NaN,
    priceChange24h: row.price_change_percentage_24h ?? Number.NaN,
    currency: 'usd',
    source: 'live',
  });
}

const SYMBOL_DISPLAY_NAMES = Object.fromEntries(
  SEARCHABLE_CRYPTO_ASSETS.map((asset) => [asset.symbol, asset.name])
) as Record<string, string>;

export function buildFallbackPriceRow(symbol: string): CoinPriceData {
  const normalized = normalizeAssetSymbol(symbol);
  const presetFallback = FALLBACK_PRICES.find((item) => item.symbol === normalized);

  if (presetFallback) {
    return presetFallback;
  }

  return enrichCoinPriceData({
    symbol: normalized,
    name: SYMBOL_DISPLAY_NAMES[normalized] ?? normalized,
    image: resolveCoinImage(normalized),
    currentPrice: Number.NaN,
    marketCap: Number.NaN,
    priceChange24h: Number.NaN,
    currency: 'usd',
    source: 'fallback',
  });
}

export function alignPricesToAssets(
  requestedAssets: string[],
  priceRows: CoinPriceData[]
): CoinPriceData[] {
  const bySymbol = new Map<string, CoinPriceData>();

  for (const row of priceRows) {
    bySymbol.set(row.symbol.toUpperCase(), row);
  }

  return requestedAssets.map((asset) => {
    const normalized = normalizeAssetSymbol(asset);
    return bySymbol.get(normalized) ?? buildFallbackPriceRow(normalized);
  });
}

function truncateSummary(text: string, maxLength = 220): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}

function buildSummaryFromPost(
  post: CryptoPanicPost,
  currencies: string[]
): string {
  const description = post.metadata?.description?.trim();
  if (description) {
    return truncateSummary(description);
  }

  const assetLabel =
    currencies.length > 0 ? currencies.join(', ') : 'crypto markets';

  return `Latest coverage on ${assetLabel}: ${truncateSummary(post.title, 180)}`;
}

export function mapCryptoPanicPost(post: CryptoPanicPost): NewsItemDraft {
  const currencies =
    post.currencies?.map((currency) => currency.code.toUpperCase()) ?? [];

  return {
    id: String(post.id),
    title: post.title.trim(),
    source:
      post.source?.title?.trim() ||
      post.source?.domain?.trim() ||
      'CryptoPanic',
    time: post.published_at,
    summary: buildSummaryFromPost(post, currencies),
    url: post.url,
    feedSource: 'live',
    currencies,
  };
}

function prioritizeNewsForAssets(
  items: NewsItemDraft[],
  assets: string[]
): NewsItemDraft[] {
  if (assets.length === 0) {
    return items;
  }

  const normalized = new Set(assets.map(normalizeAssetSymbol));

  const matched = items.filter((item) =>
    item.currencies?.some((currency) => normalized.has(currency.toUpperCase()))
  );

  const unmatched = items.filter(
    (item) =>
      !item.currencies?.some((currency) =>
        normalized.has(currency.toUpperCase())
      )
  );

  return [...matched, ...unmatched];
}

export function finalizeNewsList(
  items: NewsItemDraft[],
  assets: string[]
): NewsItemDraft[] {
  const prioritized = prioritizeNewsForAssets(items, assets);
  const unique: NewsItemDraft[] = [];
  const seen = new Set<string>();

  for (const item of prioritized) {
    const key = `${item.title.toLowerCase()}|${item.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= NEWS_MAX_ITEMS) break;
  }

  if (unique.length >= NEWS_MIN_ITEMS) {
    return unique;
  }

  for (const fallbackItem of FALLBACK_NEWS) {
    const key = `${fallbackItem.title.toLowerCase()}|${fallbackItem.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(fallbackItem);
    if (unique.length >= NEWS_MIN_ITEMS) break;
  }

  return unique.slice(0, NEWS_MAX_ITEMS);
}

export function getFallbackNews(assets: string[]): CryptoNewsItem[] {
  const normalized = new Set(assets.map(normalizeAssetSymbol));
  const matched =
    assets.length === 0
      ? FALLBACK_NEWS
      : FALLBACK_NEWS.filter((item) =>
          item.currencies?.some((currency) =>
            normalized.has(currency.toUpperCase())
          )
        );

  const pool = matched.length >= NEWS_MIN_ITEMS ? matched : FALLBACK_NEWS;
  return enrichNewsItems(finalizeNewsList(pool, assets));
}
