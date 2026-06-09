import { CURATED_MEME_VAULT, pickRandomVaultQuote } from './memeVault';

export const FALLBACK_MEME_QUOTES = CURATED_MEME_VAULT.map((entry) => entry.quote);

export function pickRandomFallbackQuote(): string {
  return pickRandomVaultQuote();
}
