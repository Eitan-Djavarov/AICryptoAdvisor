import type { ContentType, InvestorType } from '../types';

export const PRESET_CRYPTO_ASSETS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'] as const;

export const OTHER_ASSET_LABEL = 'Other +';

export const INVESTOR_TYPE_OPTIONS: Array<{
  value: InvestorType;
  title: string;
  description: string;
}> = [
  {
    value: 'HODLer',
    title: 'HODLer',
    description: 'Long-term conviction, accumulation mindset, macro patience.',
  },
  {
    value: 'Day Trader',
    title: 'Day Trader',
    description: 'Short-term momentum, active entries, tight risk control.',
  },
  {
    value: 'NFT Collector',
    title: 'NFT Collector',
    description: 'Culture, communities, and collectible digital assets.',
  },
];

export const CONTENT_TYPE_OPTIONS: Array<{
  value: ContentType;
  title: string;
  description: string;
}> = [
  {
    value: 'Market News',
    title: 'Market News',
    description: 'Headlines, catalysts, and macro developments.',
  },
  {
    value: 'Charts',
    title: 'Charts',
    description: 'Price action, levels, and technical context.',
  },
  {
    value: 'Social',
    title: 'Social',
    description: 'Community sentiment and trending narratives.',
  },
  {
    value: 'Fun',
    title: 'Fun',
    description: 'Memes and lighter crypto culture moments.',
  },
];
