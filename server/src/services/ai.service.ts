import type { InvestorType } from '../constants/domain';

const SYSTEM_PROMPT = `You are a professional crypto financial advisor embedded in a personalized dashboard app.
Your role is to deliver concise, actionable market insights tailored to each investor's profile.
Rules:
- Stay factual and balanced; never guarantee returns or provide explicit buy/sell instructions.
- Reference the user's investor type and assets directly.
- Keep responses to exactly two sharp sentences.
- Use clear, confident language suitable for a daily briefing card.
- If live market data is unavailable, provide general strategic perspective instead of inventing precise prices.`;

const FALLBACK_INSIGHTS: Record<InvestorType, string> = {
  'HODLer':
    'Long-term holders should focus on accumulation zones and ignore short-term noise while core assets consolidate. Patience and disciplined DCA remain the highest-probability edge in the current macro environment.',
  'Day Trader':
    'Intraday traders should watch liquidity pockets and volatility spikes around major support/resistance levels for tactical entries. Tight risk management and quick profit-taking are essential while momentum remains choppy.',
  'NFT Collector':
    'NFT collectors may find better opportunities by tracking blue-chip floor stability and community engagement rather than speculative mints. Diversifying across proven collections can reduce downside while preserving upside optionality.',
};

const GENERIC_FALLBACK_INSIGHT =
  'Crypto markets are showing mixed signals today, with majors holding key levels while altcoins rotate selectively. Stay focused on your strategy, manage risk tightly, and let your time horizon guide every decision.';

function buildUserPrompt(investorType: string, assets: string[]): string {
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

function extractMessageContent(content: unknown): string | null {
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

export const AI_INSIGHT_CONTENT_ID = 'today_insight';

export interface AIInsightResult {
  contentId: string;
  insight: string;
  model: string;
  source: 'live' | 'fallback';
  generatedAt: string;
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

export async function fetchAIInsight(
  investorType: string,
  assets: string[]
): Promise<AIInsightResult> {
  const model = process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini';
  const generatedAt = new Date().toISOString();
  const userPrompt = buildUserPrompt(investorType, assets);

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn('[AI] OPENROUTER_API_KEY is missing — using fallback insight');
    return getFallbackAIInsight(investorType, assets);
  }

  try {
    const { OpenRouter } = await import('@openrouter/sdk');
    const client = new OpenRouter({ apiKey });

    const response = await client.chat.send({
      chatRequest: {
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 180,
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    const insight = extractMessageContent(rawContent);

    if (!insight) {
      console.warn('[AI] OpenRouter returned empty content — using fallback insight');
      return getFallbackAIInsight(investorType, assets);
    }

    return {
      contentId: AI_INSIGHT_CONTENT_ID,
      insight,
      model,
      source: 'live',
      generatedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[AI] OpenRouter request failed (${message}) — using fallback insight`);
    return getFallbackAIInsight(investorType, assets);
  }
}
