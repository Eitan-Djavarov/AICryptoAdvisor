import type { ContentType } from '../constants/domain';

export function serializeStringArray(values: string[]): string {
  return values.join(',');
}

export function parseStringArray(value: string): string[] {
  if (!value.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export interface ParsedPreferences {
  cryptoAssets: string[];
  investorType: string;
  contentTypes: ContentType[];
}

export function parseStoredPreferences(
  cryptoAssets: string,
  investorType: string,
  contentTypes: string
): ParsedPreferences {
  return {
    cryptoAssets: parseStringArray(cryptoAssets),
    investorType,
    contentTypes: parseStringArray(contentTypes) as ContentType[],
  };
}
