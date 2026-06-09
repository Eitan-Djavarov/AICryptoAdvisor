import axios, { isAxiosError } from 'axios';
import { pickRandomFallbackQuote } from '../constants/memeQuotes';
import {
  buildMemeProxyUrl,
  isAllowedMemeImageUrl,
} from '../utils/memeProxy';
import { pickRandomItem } from '../utils/random';

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

const INVALID_THUMBNAIL_TOKENS = new Set([
  'self',
  'default',
  'nsfw',
  'spoiler',
  'image',
  'hosted:video',
  'rich:video',
]);

const LOCAL_MEME_FALLBACKS = [
  {
    id: 'fallback-hodl-immunity',
    title: 'HODL Immunity Test',
    url: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  {
    id: 'fallback-gas-fees',
    title: 'Gas Fees vs. Lunch Money',
    url: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  {
    id: 'fallback-solana-summer',
    title: 'Solana Summer Survivor',
    url: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
  {
    id: 'fallback-stablecoin-paranoia',
    title: 'Stablecoin Paranoia Hour',
    url: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  },
  {
    id: 'fallback-bnb-loyalty',
    title: 'BNB Chain Loyalty Program',
    url: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  },
  {
    id: 'fallback-cardano-roadmap',
    title: 'Cardano Roadmap Enthusiast',
    url: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  },
] as const;

export interface CryptoMemeResult {
  id: string;
  title: string;
  url: string;
  source: 'reddit' | 'fallback';
  fallbackQuote: string;
}

interface RedditMemePost {
  id: string;
  title: string;
  url: string;
}

interface RedditPreviewImage {
  source?: {
    url?: string;
  };
}

interface RedditPostData {
  id?: string;
  title?: string;
  url?: string;
  thumbnail?: string;
  over_18?: boolean;
  preview?: {
    images?: RedditPreviewImage[];
  };
}

interface RedditListingChild {
  data?: RedditPostData;
}

interface RedditListingResponse {
  data?: {
    children?: RedditListingChild[];
  };
}

function decodeRedditUrl(url: string): string {
  return url.replace(/&amp;/g, '&').trim();
}

function isUsableProxyImageUrl(url: string): boolean {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }

  return isAllowedMemeImageUrl(url);
}

function resolveRedditPostImageUrl(post: RedditPostData): string | null {
  const previewUrl = post.preview?.images?.[0]?.source?.url;

  if (previewUrl) {
    const decodedPreviewUrl = decodeRedditUrl(previewUrl);

    if (isUsableProxyImageUrl(decodedPreviewUrl)) {
      return decodedPreviewUrl;
    }
  }

  const postUrl = post.url?.trim();

  if (postUrl) {
    const decodedPostUrl = decodeRedditUrl(postUrl);

    if (isUsableProxyImageUrl(decodedPostUrl)) {
      return decodedPostUrl;
    }
  }

  const thumbnail = post.thumbnail?.trim();

  if (thumbnail && !INVALID_THUMBNAIL_TOKENS.has(thumbnail.toLowerCase())) {
    const decodedThumbnail = decodeRedditUrl(thumbnail);

    if (isUsableProxyImageUrl(decodedThumbnail)) {
      return decodedThumbnail;
    }
  }

  return null;
}

function parseRedditMemes(payload: RedditListingResponse): RedditMemePost[] {
  const children = payload.data?.children ?? [];
  const memes: RedditMemePost[] = [];

  for (const child of children) {
    const post = child.data;
    const title = post?.title?.trim();

    if (!title || post?.over_18) {
      continue;
    }

    const imageUrl = post ? resolveRedditPostImageUrl(post) : null;

    if (!imageUrl) {
      continue;
    }

    const postId = post?.id?.trim();
    const id = postId ? `reddit-${postId}` : `reddit-${title.toLowerCase().replace(/\s+/g, '-')}`;

    memes.push({ id, title, url: imageUrl });
  }

  return memes;
}

function buildRedditMemeResult(meme: RedditMemePost): CryptoMemeResult {
  return {
    id: meme.id,
    title: meme.title,
    url: buildMemeProxyUrl(meme.url),
    source: 'reddit',
    fallbackQuote: pickRandomFallbackQuote(),
  };
}

function buildLocalFallbackMeme(): CryptoMemeResult {
  const fallback = pickRandomItem(LOCAL_MEME_FALLBACKS);

  return {
    id: fallback.id,
    title: fallback.title,
    url: fallback.url,
    source: 'fallback',
    fallbackQuote: pickRandomFallbackQuote(),
  };
}

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
