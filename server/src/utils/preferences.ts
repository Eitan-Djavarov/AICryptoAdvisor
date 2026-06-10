import {
  CONTENT_TYPES,
  LEGACY_CONTENT_TYPE_ALIASES,
  type ContentType,
} from '../constants/domain';

function normalizeContentType(value: string): ContentType | null {
  if ((CONTENT_TYPES as readonly string[]).includes(value)) {
    return value as ContentType;
  }

  return LEGACY_CONTENT_TYPE_ALIASES[value] ?? null;
}

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
    contentTypes: parseStringArray(contentTypes)
      .map(normalizeContentType)
      .filter((type): type is ContentType => type !== null),
  };
}
