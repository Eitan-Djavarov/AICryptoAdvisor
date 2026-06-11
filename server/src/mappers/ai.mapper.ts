import type { InvestorType } from '../constants/domain';
import {
  FALLBACK_INSIGHTS,
  GENERIC_FALLBACK_INSIGHT,
} from '../mocks/ai.mock';

export const AI_INSIGHT_CONTENT_ID = 'today_insight';

export interface AIInsightResult {
  contentId: string;
  insight: string;
  model: string;
  source: 'live' | 'fallback';
  generatedAt: string;
}

export function buildUserPrompt(investorType: string, assets: string[]): string {
  const assetList =
    assets.length > 0 ? assets.join(', ') : 'major cryptocurrencies';

  return `Generate a sharp, 2-sentence daily market insight for a ${investorType} investor interested in ${assetList}.`;
}

export function getStaticFallback(investorType: string, assets: string[]): string {
  const typedInvestor = investorType as InvestorType;

  if (typedInvestor in FALLBACK_INSIGHTS) {
    const base = FALLBACK_INSIGHTS[typedInvestor];
    if (assets.length > 0) {
      return `${base} Keep a close eye on ${assets.join(', ')} for relative strength today.`;
    }
    return base;
  }

  return GENERIC_FALLBACK_INSIGHT;
}

export function extractMessageContent(content: unknown): string | null {
  if (typeof content === 'string' && content.trim().length > 0) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const textPart = content.find(
      (part): part is { type: string; text: string } =>
        typeof part === 'object' &&
        part !== null &&
        'text' in part &&
        typeof (part as { text: unknown }).text === 'string'
    );

    if (textPart?.text.trim()) {
      return textPart.text.trim();
    }
  }

  return null;
}

export function buildLiveAIInsight(
  insight: string,
  model: string,
  generatedAt: string
): AIInsightResult {
  return {
    contentId: AI_INSIGHT_CONTENT_ID,
    insight,
    model,
    source: 'live',
    generatedAt,
  };
}

export function getFallbackAIInsight(
  investorType: string,
  assets: string[]
): AIInsightResult {
  const model = process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini';

  return {
    contentId: AI_INSIGHT_CONTENT_ID,
    insight: getStaticFallback(investorType, assets),
    model,
    source: 'fallback',
    generatedAt: new Date().toISOString(),
  };
}
