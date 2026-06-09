export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AdvisorRequest {
  question: string;
  coinIds?: string[];
}

export interface AdvisorResponse {
  answer: string;
  sources?: string[];
  generatedAt: string;
}

export interface DashboardResponse {
  prices: import('../services/crypto.service').CoinPriceData[];
  news: import('../services/crypto.service').CryptoNewsItem[];
  aiInsight: import('../services/ai.service').AIInsightResult;
  meme: import('../services/meme.service').CryptoMemeResult;
}
