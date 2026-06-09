const SOURCE_LABEL_OVERRIDES: Record<string, string> = {
  coindesk: 'CoinDesk',
  cointelegraph: 'Cointelegraph',
  'the block': 'The Block',
  theblock: 'The Block',
  cryptopanic: 'CryptoPanic',
  decrypt: 'Decrypt',
  bitcoinmagazine: 'Bitcoin Magazine',
  'bitcoin magazine': 'Bitcoin Magazine',
};

export function normalizeSourceLabel(rawSource: string): string {
  const trimmed = rawSource.trim();

  if (!trimmed) {
    return 'Unknown Source';
  }

  const normalizedKey = trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    ?.split('.')[0]
    ?.toLowerCase();

  if (normalizedKey && SOURCE_LABEL_OVERRIDES[normalizedKey]) {
    return SOURCE_LABEL_OVERRIDES[normalizedKey];
  }

  const lowerTrimmed = trimmed.toLowerCase();
  if (SOURCE_LABEL_OVERRIDES[lowerTrimmed]) {
    return SOURCE_LABEL_OVERRIDES[lowerTrimmed];
  }

  return trimmed;
}

export function formatTimeAgo(
  isoTime: string,
  referenceDate: Date = new Date()
): string {
  const published = new Date(isoTime);

  if (Number.isNaN(published.getTime())) {
    return 'Recently';
  }

  const diffMs = referenceDate.getTime() - published.getTime();

  if (diffMs < 0) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return published.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export interface NewsItemDraft {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  url: string;
  feedSource?: 'live' | 'fallback';
  currencies?: string[];
}

export interface EnrichedNewsItem extends NewsItemDraft {
  formattedTime: string;
  sourceLabel: string;
}

export function enrichNewsItems(
  items: NewsItemDraft[],
  referenceDate: Date = new Date()
): EnrichedNewsItem[] {
  return items.map((item) => ({
    ...item,
    sourceLabel: normalizeSourceLabel(item.source),
    formattedTime: formatTimeAgo(item.time, referenceDate),
  }));
}
