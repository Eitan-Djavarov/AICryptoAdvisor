import axios from 'axios';
import {
  MARQUEE_BENCHMARK_ASSETS,
  type ContentType,
} from '../constants/domain';
import { FALLBACK_PRICES } from '../mocks/crypto.mock';
import {
  alignPricesToAssets,
  finalizeNewsList,
  getFallbackNews,
  mapCryptoPanicPost,
  mapGeckoRowToPrice,
  normalizeAssetSymbol,
  resolveCoinGeckoIds,
  type CoinGeckoMarketRow,
  type CryptoNewsItem,
  type CryptoPanicResponse,
  NEWS_MAX_ITEMS,
} from '../mappers/crypto.mapper';
import { enrichNewsItems } from '../utils/newsFormat';
import type { CoinPriceData } from '../utils/priceFormat';

export type { CoinPriceData } from '../utils/priceFormat';
export type { CryptoNewsItem };

const COINGECKO_BASE =
  process.env.COINGECKO_API_BASE ?? 'https://api.coingecko.com/api/v3';

const CRYPTOPANIC_BASE = 'https://cryptopanic.com/api/v1';
const REQUEST_TIMEOUT_MS = 8_000;

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
