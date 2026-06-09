import {
  fetchCoinPrices,
  fetchMarqueeBenchmarkPrices,
  type CoinPriceData,
} from './crypto.service';
import {
  fetchAIInsight,
  getFallbackAIInsight,
  type AIInsightResult,
} from './ai.service';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const PRICE_TTL_MS = 60_000;
const AI_TTL_MS = 5 * 60_000;

const MARQUEE_CACHE_KEY = '__marquee_benchmarks__';

const priceCache = new Map<string, CacheEntry<CoinPriceData[]>>();
const aiCache = new Map<string, CacheEntry<AIInsightResult>>();

const priceRefreshInflight = new Map<string, Promise<void>>();
const aiRefreshInflight = new Map<string, Promise<void>>();

export function buildAssetsCacheKey(assets: string[]): string {
  return [...assets]
    .map((asset) => asset.trim().toUpperCase())
    .filter((asset) => asset.length > 0)
    .sort()
    .join(',');
}

export function buildAiCacheKey(
  investorType: string,
  assets: string[]
): string {
  return `${investorType}|${buildAssetsCacheKey(assets)}`;
}

function schedulePriceRefresh(key: string, assets: string[]): void {
  if (priceRefreshInflight.has(key)) {
    return;
  }

  const refresh = fetchCoinPrices(assets)
    .then((data) => {
      priceCache.set(key, {
        data,
        expiresAt: Date.now() + PRICE_TTL_MS,
      });
    })
    .catch((error) => {
      console.warn('[DashboardCache] Background price refresh failed:', error);
    })
    .finally(() => {
      priceRefreshInflight.delete(key);
    });

  priceRefreshInflight.set(key, refresh);
}

function scheduleAiRefresh(
  key: string,
  investorType: string,
  assets: string[]
): void {
  if (aiRefreshInflight.has(key)) {
    return;
  }

  const refresh = fetchAIInsight(investorType, assets)
    .then((data) => {
      aiCache.set(key, {
        data,
        expiresAt: Date.now() + AI_TTL_MS,
      });
    })
    .catch((error) => {
      console.warn('[DashboardCache] Background AI refresh failed:', error);
    })
    .finally(() => {
      aiRefreshInflight.delete(key);
    });

  aiRefreshInflight.set(key, refresh);
}

export async function getDashboardPrices(
  assets: string[]
): Promise<CoinPriceData[]> {
  const key = buildAssetsCacheKey(assets);
  const cached = priceCache.get(key);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  if (cached) {
    schedulePriceRefresh(key, assets);
    return cached.data;
  }

  const data = await fetchCoinPrices(assets);
  priceCache.set(key, {
    data,
    expiresAt: Date.now() + PRICE_TTL_MS,
  });
  return data;
}

export async function getMarqueeBenchmarkPrices(): Promise<CoinPriceData[]> {
  const cached = priceCache.get(MARQUEE_CACHE_KEY);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  if (cached) {
    if (!priceRefreshInflight.has(MARQUEE_CACHE_KEY)) {
      const refresh = fetchMarqueeBenchmarkPrices()
        .then((data) => {
          priceCache.set(MARQUEE_CACHE_KEY, {
            data,
            expiresAt: Date.now() + PRICE_TTL_MS,
          });
        })
        .catch((error) => {
          console.warn('[DashboardCache] Background marquee refresh failed:', error);
        })
        .finally(() => {
          priceRefreshInflight.delete(MARQUEE_CACHE_KEY);
        });

      priceRefreshInflight.set(MARQUEE_CACHE_KEY, refresh);
    }

    return cached.data;
  }

  const data = await fetchMarqueeBenchmarkPrices();
  priceCache.set(MARQUEE_CACHE_KEY, {
    data,
    expiresAt: Date.now() + PRICE_TTL_MS,
  });
  return data;
}

export function invalidatePriceCache(): void {
  priceCache.clear();
  priceRefreshInflight.clear();
}

export function getDashboardAIInsight(
  investorType: string,
  assets: string[]
): AIInsightResult {
  const key = buildAiCacheKey(investorType, assets);
  const cached = aiCache.get(key);

  if (cached) {
    if (Date.now() >= cached.expiresAt) {
      scheduleAiRefresh(key, investorType, assets);
    }
    return cached.data;
  }

  scheduleAiRefresh(key, investorType, assets);
  return getFallbackAIInsight(investorType, assets);
}
