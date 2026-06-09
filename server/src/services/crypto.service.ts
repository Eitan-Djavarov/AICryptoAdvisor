import axios from 'axios';
import {
  MARQUEE_BENCHMARK_ASSETS,
  type ContentType,
} from '../constants/domain';
import { SEARCHABLE_CRYPTO_ASSETS } from '../constants/searchableAssets';
import {
  enrichCoinPriceData,
  type CoinPriceCore,
  type CoinPriceData,
} from '../utils/priceFormat';
import {
  enrichNewsItems,
  type EnrichedNewsItem,
  type NewsItemDraft,
} from '../utils/newsFormat';

export type { CoinPriceData } from '../utils/priceFormat';

const COINGECKO_BASE =
  process.env.COINGECKO_API_BASE ?? 'https://api.coingecko.com/api/v3';

const CRYPTOPANIC_BASE = 'https://cryptopanic.com/api/v1';
const REQUEST_TIMEOUT_MS = 8_000;
const NEWS_MIN_ITEMS = 5;
const NEWS_MAX_ITEMS = 8;

const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
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
};

export type CryptoNewsItem = EnrichedNewsItem;

interface CoinGeckoMarketRow {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

interface CryptoPanicPost {
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

interface CryptoPanicResponse {
  results: CryptoPanicPost[];
}

const FALLBACK_PRICES_RAW: CoinPriceCore[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    currentPrice: 67_420,
    marketCap: 1_320_000_000_000,
    priceChange24h: 1.85,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    currentPrice: 3_540,
    marketCap: 425_000_000_000,
    priceChange24h: -0.42,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    currentPrice: 148.25,
    marketCap: 68_500_000_000,
    priceChange24h: 3.12,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    currentPrice: 592.1,
    marketCap: 86_200_000_000,
    priceChange24h: 0.76,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    currentPrice: 0.62,
    marketCap: 34_100_000_000,
    priceChange24h: -1.15,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    currentPrice: 1.0,
    marketCap: 95_000_000_000,
    priceChange24h: 0.01,
    currency: 'usd',
    source: 'fallback',
  },
];

const FALLBACK_PRICES: CoinPriceData[] =
  FALLBACK_PRICES_RAW.map(enrichCoinPriceData);

const FALLBACK_NEWS: NewsItemDraft[] = [
  {
    id: 'fallback-1',
    title:
      "Bitcoin's market got calmer in 2025 thanks to yield-hungry institutional investors",
    source: 'CoinDesk',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    summary:
      'Institutions increasingly used derivatives to harvest yield from BTC holdings, helping push implied volatility lower through much of the year.',
    url: 'https://www.coindesk.com/markets/2025/12/31/bitcoin-market-calmed-in-2025-thanks-to-yield-hungry-institutions',
    feedSource: 'fallback',
    currencies: ['BTC'],
  },
  {
    id: 'fallback-2',
    title:
      'Analysts claim crypto capital rotation is driving Ethereum, Cardano and Solana gains',
    source: 'The Block',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    summary:
      'QCP Capital analysts say capital is rotating from bitcoin into altcoins, with Ethereum, Cardano, and Solana posting notable 24-hour gains.',
    url: 'https://www.theblock.co/post/328472/crypto-capital-rotation-ethereum-cardano-solana',
    feedSource: 'fallback',
    currencies: ['ETH', 'ADA', 'SOL'],
  },
  {
    id: 'fallback-3',
    title: 'Solana and Ethereum can coexist in tokenization race: Dragonfly',
    source: 'Cointelegraph',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    summary:
      'Dragonfly partner Rob Hadick argues multiple blockchains can thrive as tokenization expands, with Ethereum leading stablecoin activity and Solana optimizing for trading flow.',
    url: 'https://cointelegraph.com/news/solana-ethereum-blockchain-tokenization-race-dragonfly-crypto-vc',
    feedSource: 'fallback',
    currencies: ['SOL', 'ETH'],
  },
  {
    id: 'fallback-4',
    title: 'Ethereum closes gap with Solana as DEX volumes converge near $45 billion',
    source: 'The Block',
    time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    summary:
      'Monthly decentralized exchange volumes on Ethereum and Solana have converged near parity, reversing Solana\'s earlier dominance in relative trading activity.',
    url: 'https://www.theblock.co/post/400806/ethereum-closes-gap-solana-dex-volumes-converge-45-billion',
    feedSource: 'fallback',
    currencies: ['ETH', 'SOL'],
  },
  {
    id: 'fallback-5',
    title: 'The 5 busiest blockchains of 2025 and what powered their growth',
    source: 'Cointelegraph',
    time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    summary:
      'Nansen data shows Solana, BNB Chain, Base, Tron, and NEAR led transaction activity in 2025 as users chased high-throughput, low-fee networks.',
    url: 'https://cointelegraph.com/news/these-5-blockchains-led-2025',
    feedSource: 'fallback',
    currencies: ['SOL', 'BNB'],
  },
  {
    id: 'fallback-6',
    title: 'Polkadot vs. Ethereum: Two equal chances to dominate the Web3 world',
    source: 'Cointelegraph',
    time: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    summary:
      'A look at how Polkadot\'s parachain architecture and Substrate framework compare with Ethereum\'s roadmap in the race toward decentralized web infrastructure.',
    url: 'https://cointelegraph.com/news/polkadot-vs-ethereum-two-equal-chances-to-dominate-the-web3-world',
    feedSource: 'fallback',
    currencies: ['DOT', 'ETH'],
  },
  {
    id: 'fallback-7',
    title:
      "Bitcoin's $732B inflows signal strength, not 'crypto winter,' analysts say",
    source: 'CoinDesk',
    time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    summary:
      'Glassnode and Fasanara argue record capital inflows and falling volatility point to a mid-cycle reset rather than the start of a prolonged bear market.',
    url: 'https://www.coindesk.com/markets/2025/12/03/this-bitcoin-led-institutionally-anchored-cycle-shows-the-three-month-drop-isn-t-a-winter-glassnode',
    feedSource: 'fallback',
    currencies: ['BTC', 'ETH'],
  },
  {
    id: 'fallback-8',
    title: 'XRP steadies above $1.10 to bounce from four-month lows',
    source: 'CoinDesk',
    time: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    summary:
      'XRP recovered from multi-month lows as buyers defended the $1.09 area, though the token remains below key resistance despite ETF inflows and exchange outflows.',
    url: 'https://www.coindesk.com/markets/2026/06/08/xrp-steadies-above-usd1-10-as-oversold-bounce-meets-lingering-bearish-pressure',
    feedSource: 'fallback',
    currencies: ['XRP'],
  },
];

function normalizeAssetSymbol(asset: string): string {
  return asset.trim().toUpperCase();
}

function resolveCoinGeckoIds(assets: string[]): string[] {
  const ids = assets.map((asset) => {
    const symbol = normalizeAssetSymbol(asset);
    return SYMBOL_TO_COINGECKO_ID[symbol] ?? symbol.toLowerCase();
  });

  return [...new Set(ids)];
}

function mapGeckoRowToPrice(row: CoinGeckoMarketRow): CoinPriceData {
  return enrichCoinPriceData({
    symbol: row.symbol.toUpperCase(),
    name: row.name,
    currentPrice: row.current_price,
    marketCap: row.market_cap,
    priceChange24h: row.price_change_percentage_24h,
    currency: 'usd',
    source: 'live',
  });
}

const SYMBOL_DISPLAY_NAMES = Object.fromEntries(
  SEARCHABLE_CRYPTO_ASSETS.map((asset) => [asset.symbol, asset.name])
) as Record<string, string>;

function buildFallbackPriceRow(symbol: string): CoinPriceData {
  const normalized = normalizeAssetSymbol(symbol);
  const presetFallback = FALLBACK_PRICES.find((item) => item.symbol === normalized);

  if (presetFallback) {
    return presetFallback;
  }

  return enrichCoinPriceData({
    symbol: normalized,
    name: SYMBOL_DISPLAY_NAMES[normalized] ?? normalized,
    currentPrice: 0,
    marketCap: 0,
    priceChange24h: 0,
    currency: 'usd',
    source: 'fallback',
  });
}

function alignPricesToAssets(
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

function mapCryptoPanicPost(post: CryptoPanicPost): NewsItemDraft {
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

function finalizeNewsList(
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

function getFallbackNews(assets: string[]): CryptoNewsItem[] {
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

export function normalizeMarqueeTickers(prices: CoinPriceData[]): CoinPriceData[] {
  return alignPricesToAssets([...MARQUEE_BENCHMARK_ASSETS], prices);
}

export async function fetchMarqueeBenchmarkPrices(): Promise<CoinPriceData[]> {
  const prices = await fetchCoinPrices([...MARQUEE_BENCHMARK_ASSETS]);
  return normalizeMarqueeTickers(prices);
}

export async function fetchCoinPrices(assets: string[]): Promise<CoinPriceData[]> {
  const normalizedAssets = [
    ...new Set(assets.map(normalizeAssetSymbol).filter((asset) => asset.length > 0)),
  ];

  if (normalizedAssets.length === 0) {
    console.warn('[Crypto] No assets provided — returning fallback price data');
    return FALLBACK_PRICES;
  }

  const coinIds = resolveCoinGeckoIds(normalizedAssets);
  let liveRows: CoinPriceData[] = [];

  try {
    const { data } = await axios.get<CoinGeckoMarketRow[]>(
      `${COINGECKO_BASE}/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          ids: coinIds.join(','),
          order: 'market_cap_desc',
          per_page: Math.max(coinIds.length, normalizedAssets.length),
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[Crypto] CoinGecko returned empty data — using fallback prices');
    } else {
      liveRows = data.map(mapGeckoRowToPrice);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[Crypto] CoinGecko request failed (${message}) — using fallback prices`);
  }

  return alignPricesToAssets(normalizedAssets, liveRows);
}

export async function fetchCryptoNews(
  contentTypes: ContentType[],
  assets: string[] = []
): Promise<CryptoNewsItem[]> {
  const wantsMarketNews = contentTypes.includes('Market News');

  if (!wantsMarketNews) {
    return [];
  }

  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  const normalizedAssets = assets.map(normalizeAssetSymbol);

  if (!apiKey) {
    console.warn('[Crypto] CRYPTOPANIC_API_KEY is missing — using fallback news');
    return getFallbackNews(normalizedAssets);
  }

  try {
    const { data } = await axios.get<CryptoPanicResponse>(
      `${CRYPTOPANIC_BASE}/posts/`,
      {
        params: {
          auth_token: apiKey,
          public: true,
          filter: 'hot',
          ...(normalizedAssets.length > 0 && {
            currencies: normalizedAssets.join(','),
          }),
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    if (!data.results || data.results.length === 0) {
      console.warn('[Crypto] CryptoPanic returned no results — using fallback news');
      return getFallbackNews(normalizedAssets);
    }

    const liveNews = data.results
      .slice(0, NEWS_MAX_ITEMS)
      .map(mapCryptoPanicPost);

    return enrichNewsItems(finalizeNewsList(liveNews, normalizedAssets));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[Crypto] CryptoPanic request failed (${message}) — using fallback news`);
    return getFallbackNews(normalizedAssets);
  }
}
