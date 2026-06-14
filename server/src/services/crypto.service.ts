import axios, { type AxiosRequestConfig } from 'axios';
import { MARQUEE_BENCHMARK_ASSETS } from '../constants/domain';
import { FALLBACK_PRICES } from '../mocks/crypto.mock';
import {
  alignPricesToAssets,
  mapGeckoRowToPrice,
  normalizeAssetSymbol,
  resolveCoinGeckoIds,
  type CoinGeckoMarketRow,
} from '../mappers/crypto.mapper';
import type { CoinPriceData } from '../utils/priceFormat';

export type { CoinPriceData } from '../utils/priceFormat';

const DEFAULT_COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const REQUEST_TIMEOUT_MS = 8_000;const COINGECKO_MAX_ATTEMPTS = 3;
const COINGECKO_RETRY_BASE_DELAY_MS = 500;

const APP_USER_AGENT = 'AICryptoAdvisor/1.0 (+https://github.com/ai-crypto-advisor)';

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function looksLikeCoinGeckoApiKey(value: string): boolean {
  return /^CG-[A-Za-z0-9]+$/i.test(value.trim());
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveCoinGeckoConfig(): { baseUrl: string; apiKey?: string } {
  const rawBase = process.env.COINGECKO_API_BASE?.trim() ?? '';
  const rawKey = process.env.COINGECKO_API_KEY?.trim();

  let apiKey = rawKey;

  if (!apiKey && rawBase && looksLikeCoinGeckoApiKey(rawBase)) {
    apiKey = rawBase;
    console.warn(
      '[Crypto] COINGECKO_API_BASE looks like an API key — using it as COINGECKO_API_KEY and default base URL'
    );
  }

  let baseUrl = DEFAULT_COINGECKO_BASE;

  if (rawBase && isValidHttpUrl(rawBase) && !looksLikeCoinGeckoApiKey(rawBase)) {
    baseUrl = rawBase.replace(/\/+$/, '');
  } else if (rawBase && !looksLikeCoinGeckoApiKey(rawBase)) {
    console.warn(
      `[Crypto] COINGECKO_API_BASE is not a valid URL ("${rawBase}") — using ${DEFAULT_COINGECKO_BASE}`
    );
  }

  return { baseUrl, apiKey };
}

const { baseUrl: COINGECKO_BASE, apiKey: COINGECKO_API_KEY } =
  resolveCoinGeckoConfig();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCoinGeckoUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${COINGECKO_BASE}${normalizedPath}`;
}

function buildCoinGeckoHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': APP_USER_AGENT,
  };

  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }

  return headers;
}

function isRetryableCoinGeckoError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return true;
  }

  if (
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ERR_INVALID_URL'
  ) {
    return true;
  }

  const status = error.response?.status;
  return status != null && RETRYABLE_STATUS_CODES.has(status);
}

function resolveRetryDelayMs(error: unknown, attempt: number): number {
  if (axios.isAxiosError(error) && error.response?.status === 429) {
    const retryAfterHeader = error.response.headers['retry-after'];
    const retryAfterSeconds = Number(retryAfterHeader);
    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      return retryAfterSeconds * 1000;
    }
  }

  return COINGECKO_RETRY_BASE_DELAY_MS * 2 ** attempt;
}

async function axiosGetWithRetry<T>(
  url: string,
  config: AxiosRequestConfig
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < COINGECKO_MAX_ATTEMPTS; attempt++) {
    try {
      const { data } = await axios.get<T>(url, config);
      return data;
    } catch (error) {
      lastError = error;

      if (attempt >= COINGECKO_MAX_ATTEMPTS - 1 || !isRetryableCoinGeckoError(error)) {
        break;
      }

      const delayMs = resolveRetryDelayMs(error, attempt);
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const message = error instanceof Error ? error.message : 'Unknown error';

      console.warn(
        `[Crypto/CoinGecko] Request failed (attempt ${attempt + 1}/${COINGECKO_MAX_ATTEMPTS}, status=${status ?? 'n/a'}): ${message} — retrying in ${delayMs}ms`
      );

      await sleep(delayMs);
    }
  }

  throw lastError;
}

function normalizeMarqueeTickers(prices: CoinPriceData[]): CoinPriceData[] {
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
    const data = await axiosGetWithRetry<CoinGeckoMarketRow[]>(
      buildCoinGeckoUrl('/coins/markets'),
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
        headers: buildCoinGeckoHeaders(),
      }
    );

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[Crypto] CoinGecko returned empty data — using fallback prices');
    } else {
      liveRows = data.map(mapGeckoRowToPrice);
    }
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(
      `[Crypto] CoinGecko request failed after ${COINGECKO_MAX_ATTEMPTS} attempts (status=${status ?? 'n/a'}): ${message} — using fallback prices`
    );
  }

  return alignPricesToAssets(normalizedAssets, liveRows);
}