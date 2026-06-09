/** Suggested onboarding pills — custom symbols are also allowed (2–6 alphanumeric). */
export const SUGGESTED_CRYPTO_ASSETS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'] as const;

/** Global bottom marquee — always fetched for the dashboard ribbon. */
export const MARQUEE_BENCHMARK_ASSETS = [
  'BTC',
  'ETH',
  'SOL',
  'BNB',
  'USDT',
] as const;

export const CRYPTO_ASSET_SYMBOL_PATTERN = /^[A-Z0-9]{2,6}$/;

export const INVESTOR_TYPES = ['HODLer', 'Day Trader', 'NFT Collector'] as const;
export type InvestorType = (typeof INVESTOR_TYPES)[number];

export const CONTENT_TYPES = [
  'Market News',
  'Charts',
  'Social',
  'Fun',
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const FEEDBACK_SECTIONS = [
  'ai_insight',
  'market_news',
  'meme',
  'coin_prices',
] as const;
export type FeedbackSection = (typeof FEEDBACK_SECTIONS)[number];

export const FEEDBACK_TYPES = ['LIKE', 'DISLIKE'] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];
