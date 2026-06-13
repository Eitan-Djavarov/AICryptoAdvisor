export interface User {
  id: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type InvestorType = 'HODLer' | 'Day Trader' | 'NFT Collector';

export type ContentType = 'Market News' | 'Coin Prices' | 'AI Insights' | 'Fun';

export type DashboardSectionId = 'news' | 'prices' | 'aiInsight' | 'meme';

export type FeedbackApiSection =
  | 'ai_insight'
  | 'market_news'
  | 'meme'
  | 'coin_prices';

export type FeedbackType = 'LIKE' | 'DISLIKE' | 'FAVORITE';

export type DashboardLayoutWidth = 'full' | 'half';

export interface DashboardLayoutSection {
  id: DashboardSectionId;
  visible: boolean;
  width: DashboardLayoutWidth;
}

export interface UserPreferences {
  id?: string;
  userId?: string;
  cryptoAssets: string[];
  investorType: InvestorType;
  contentTypes: ContentType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface MeResponse {
  success: boolean;
  user: User;
  preferences: UserPreferences | null;
  message?: string;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  preferences: UserPreferences;
  user: User;
}

export interface GetOnboardingResponse {
  success: boolean;
  preferences: UserPreferences & {
    suggestedAssets?: string[];
  };
  user: User;
  message?: string;
}

export interface UpdateOnboardingResponse {
  success: boolean;
  message: string;
  preferences: UserPreferences;
  user: User;
}

export interface AssetSearchResult {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export interface AssetSearchResponse {
  success: boolean;
  results: AssetSearchResult[];
  message?: string;
}

export interface CoinPriceData {
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  priceChange24h: number;
  currency: 'usd';
  source: 'live' | 'fallback';
  formattedCurrentPrice: string;
  formattedMarketCap: string;
  priceChangePercent: string;
  priceChangeFiat: string;
  isPriceChangePositive: boolean;
}

export interface CryptoNewsItem {
  id: string;
  title: string;
  source: string;
  sourceLabel: string;
  time: string;
  formattedTime: string;
  summary: string;
  url: string;
  feedSource?: 'live' | 'fallback';
  currencies?: string[];
}

export interface AIInsightResult {
  contentId: string;
  insight: string;
  model: string;
  source: 'live' | 'fallback';
  generatedAt: string;
}

export interface CryptoMemeResult {
  id: string;
  title: string;
  url: string;
  source: 'reddit' | 'fallback';
  fallbackQuote: string;
}

export interface InvestorProfileMeta {
  welcomeMessage: string;
  terminalTitle: string;
  calibratedLabel: string;
}

export type ValidationErrors = Record<string, string>;

export interface ValidationErrorResponse {
  success: false;
  validationErrors: ValidationErrors;
  message?: string;
}

export type FearGreedColorType = 'fear' | 'neutral' | 'greed';

export interface FearAndGreedIndex {
  value: number;
  classification: string;
  colorType: FearGreedColorType;
}

export interface DashboardData {
  prices: CoinPriceData[];
  news: CryptoNewsItem[];
  aiInsight: AIInsightResult;
  meme: CryptoMemeResult;
  marqueeTickers: CoinPriceData[];
  profileMeta: InvestorProfileMeta;
  fearAndGreed: FearAndGreedIndex;
}

export interface DashboardResponse {
  success: boolean;
  dashboard: DashboardData;
  preferences: {
    cryptoAssets: string[];
    investorType: InvestorType;
    contentTypes: ContentType[];
  };
  interactions: Record<string, FeedbackType>;
  layoutSections: DashboardLayoutSection[];
  generatedAt: string;
  message?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback: {
    id: string;
    userId: string;
    section: FeedbackApiSection;
    contentId: string;
    type: FeedbackType;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
}
