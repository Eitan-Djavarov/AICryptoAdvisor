import { CRYPTO_ASSET_SYMBOL_PATTERN } from '../constants/domain';

export function isValidCryptoAssetSymbol(symbol: string): boolean {
  return CRYPTO_ASSET_SYMBOL_PATTERN.test(symbol);
}

export function normalizeCryptoAssets(assets: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const asset of assets) {
    const symbol = asset.trim().toUpperCase();

    if (!symbol || seen.has(symbol)) {
      continue;
    }

    seen.add(symbol);
    normalized.push(symbol);
  }

  return normalized;
}

export function validateCryptoAssets(assets: string[]): string | null {
  if (assets.length === 0) {
    return 'cryptoAssets must contain at least one valid symbol';
  }

  const invalidSymbol = assets.find((asset) => !isValidCryptoAssetSymbol(asset));

  if (invalidSymbol) {
    return `Invalid crypto asset symbol "${invalidSymbol}". Each symbol must be 2 to 6 uppercase alphanumeric characters (e.g. BTC, DOGE, AVAX).`;
  }

  return null;
}
