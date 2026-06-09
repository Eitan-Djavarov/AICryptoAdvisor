import { PRESET_CRYPTO_ASSETS } from '../constants/onboarding';

export function splitCryptoAssets(allAssets: string[]): {
  presetSelected: string[];
  customAssets: string[];
} {
  const presetSet = new Set<string>(PRESET_CRYPTO_ASSETS);

  const presetSelected = allAssets.filter((asset) => presetSet.has(asset));
  const customAssets = allAssets.filter((asset) => !presetSet.has(asset));

  return { presetSelected, customAssets };
}

export function buildCryptoAssets(
  selectedPresetAssets: string[],
  isOtherSelected: boolean,
  customAssets: string[]
): string[] {
  const includeCustomAssets =
    isOtherSelected || customAssets.length > 0;

  const otherAssets = includeCustomAssets
    ? customAssets.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean)
    : [];

  return [...new Set([...selectedPresetAssets, ...otherAssets])];
}

export function validateCryptoAssetSelection(
  selectedPresetAssets: string[],
  isOtherSelected: boolean,
  customAssets: string[]
): string | null {
  const merged = buildCryptoAssets(
    selectedPresetAssets,
    isOtherSelected,
    customAssets
  );

  if (merged.length === 0) {
    return 'Select at least one crypto asset or add custom symbols under Other +';
  }

  if (
    isOtherSelected &&
    customAssets.length === 0 &&
    selectedPresetAssets.length === 0
  ) {
    return 'Add at least one custom symbol or select a preset asset.';
  }

  return null;
}
