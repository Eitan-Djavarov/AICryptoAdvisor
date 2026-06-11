import { SYSTEM_PROMPT } from '../mocks/ai.mock';
import {
  AI_INSIGHT_CONTENT_ID,
  buildLiveAIInsight,
  buildUserPrompt,
  extractMessageContent,
  getFallbackAIInsight,
  getStaticFallback,
  type AIInsightResult,
} from '../mappers/ai.mapper';

export {
  AI_INSIGHT_CONTENT_ID,
  getStaticFallback,
  getFallbackAIInsight,
};
export type { AIInsightResult };

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

    return buildLiveAIInsight(insight, model, generatedAt);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[AI] OpenRouter request failed (${message}) — using fallback insight`);
    return getFallbackAIInsight(investorType, assets);
  }
}
