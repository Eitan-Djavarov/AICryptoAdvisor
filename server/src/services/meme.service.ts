import axios, { isAxiosError } from 'axios';
import {
  buildLocalFallbackMeme,
  buildRedditMemeResult,
  parseRedditMemes,
  type CryptoMemeResult,
  type RedditListingResponse,
} from '../mappers/meme.mapper';
import { pickRandomItem } from '../utils/random';

export type { CryptoMemeResult } from '../mappers/meme.mapper';

const REDDIT_MEME_URL =
  'https://www.reddit.com/r/cryptocurrencymemes/hot.json?limit=30';
const REQUEST_TIMEOUT_MS = 8_000;

const REDDIT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 AICryptoAdvisor/1.0.0';

const REDDIT_REQUEST_HEADERS = {
  'User-Agent': REDDIT_USER_AGENT,
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const REDDIT_FALLBACK_WARN_MESSAGE =
  'Reddit fetch failed, using internal fallback...';

export async function fetchCryptoMeme(): Promise<CryptoMemeResult> {
  try {
    const { data, status } = await axios.get<RedditListingResponse>(
      REDDIT_MEME_URL,
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: REDDIT_REQUEST_HEADERS,
      }
    );

    const redditMemes = parseRedditMemes(data);

    if (redditMemes.length === 0) {
      console.warn(REDDIT_FALLBACK_WARN_MESSAGE);
      return buildLocalFallbackMeme();
    }

    console.info(
      `[Meme] Reddit fetch succeeded (HTTP ${status}) — ${redditMemes.length} image posts parsed (preview/url/thumbnail)`
    );

    return buildRedditMemeResult(pickRandomItem(redditMemes));
  } catch (error) {
    console.warn(REDDIT_FALLBACK_WARN_MESSAGE);

    if (isAxiosError(error)) {
      console.warn('[Meme] Reddit error detail', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        code: error.code,
      });
    }

    return buildLocalFallbackMeme();
  }
}
