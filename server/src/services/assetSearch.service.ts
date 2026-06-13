import {
  ASSET_SEARCH_MAX_RESULTS,
  SEARCHABLE_CRYPTO_ASSETS,
  type SearchableCryptoAsset,
} from '../constants/searchableAssets';
import {
  formatAssetSearchChange,
  formatAssetSearchPrice,
} from '../utils/priceFormat';
import { getDashboardPrices } from './dashboard-cache.service';

export interface AssetSearchResult {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  formattedPrice: string;
  formattedChange24h: string;
  isChangePositive: boolean;
}

export function filterSearchableAssets(query: string): SearchableCryptoAsset[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return SEARCHABLE_CRYPTO_ASSETS.slice(0, ASSET_SEARCH_MAX_RESULTS);
  }

  return SEARCHABLE_CRYPTO_ASSETS.filter((asset) => {
    const symbol = asset.symbol.toLowerCase();
    const name = asset.name.toLowerCase();

    return (
      symbol.includes(normalizedQuery) ||
      name.includes(normalizedQuery) ||
      name.split(' ').some((word) => word.startsWith(normalizedQuery))
    );
  }).slice(0, ASSET_SEARCH_MAX_RESULTS);
}

export async function searchCryptoAssets(
  query: string
): Promise<AssetSearchResult[]> {
  const matches = filterSearchableAssets(query);

  if (matches.length === 0) {
    return [];
  }

  const symbols = matches.map((asset) => asset.symbol);
  const priceRows = await getDashboardPrices(symbols);
  const priceBySymbol = new Map(
    priceRows.map((row) => [row.symbol.toUpperCase(), row])
  );

  return matches.map((asset) => {
    const priceData = priceBySymbol.get(asset.symbol);
    const price = priceData?.currentPrice ?? Number.NaN;
    const change24h = priceData?.priceChange24h ?? Number.NaN;

    return {
      symbol: asset.symbol,
      name: asset.name,
      price,
      change24h,
      formattedPrice:
        priceData?.formattedCurrentPrice ?? formatAssetSearchPrice(price),
      formattedChange24h:
        priceData?.priceChangePercent ?? formatAssetSearchChange(change24h),
      isChangePositive: priceData?.isPriceChangePositive ?? change24h >= 0,
    };
  });
}
