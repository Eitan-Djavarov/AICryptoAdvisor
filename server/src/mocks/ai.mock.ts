import type { InvestorType } from '../constants/domain';

export const SYSTEM_PROMPT = `You are a professional crypto financial advisor embedded in a personalized dashboard app.
Your role is to deliver concise, actionable market insights tailored to each investor's profile.
Rules:
- Stay factual and balanced; never guarantee returns or provide explicit buy/sell instructions.
- Reference the user's investor type and assets directly.
- Keep responses to exactly two sharp sentences.
- Use clear, confident language suitable for a daily briefing card.
- If live market data is unavailable, provide general strategic perspective instead of inventing precise prices.`;

export const FALLBACK_INSIGHTS: Record<InvestorType, string> = {
  'HODLer':
    'Long-term holders should focus on accumulation zones and ignore short-term noise while core assets consolidate. Patience and disciplined DCA remain the highest-probability edge in the current macro environment.',
  'Day Trader':
    'Intraday traders should watch liquidity pockets and volatility spikes around major support/resistance levels for tactical entries. Tight risk management and quick profit-taking are essential while momentum remains choppy.',
  'NFT Collector':
    'NFT collectors may find better opportunities by tracking blue-chip floor stability and community engagement rather than speculative mints. Diversifying across proven collections can reduce downside while preserving upside optionality.',
};

export const GENERIC_FALLBACK_INSIGHT =
  'Crypto markets are showing mixed signals today, with majors holding key levels while altcoins rotate selectively. Stay focused on your strategy, manage risk tightly, and let your time horizon guide every decision.';
