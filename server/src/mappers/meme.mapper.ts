import { pickRandomFallbackQuote } from '../constants/memeQuotes';
import {
  INVALID_THUMBNAIL_TOKENS,
  LOCAL_MEME_FALLBACKS,
} from '../mocks/meme.mock';
import {
  buildMemeProxyUrl,
  isAllowedMemeImageUrl,
} from '../utils/memeProxy';
import { pickRandomItem } from '../utils/random';

export interface CryptoMemeResult {
  id: string;
  title: string;
  url: string;
  source: 'reddit' | 'fallback';
  fallbackQuote: string;
}

export interface RedditMemePost {
  id: string;
  title: string;
  url: string;
}

interface RedditPreviewImage {
  source?: {
    url?: string;
  };
}

export interface RedditPostData {
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

export interface RedditListingResponse {
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

export function resolveRedditPostImageUrl(post: RedditPostData): string | null {
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

export function parseRedditMemes(payload: RedditListingResponse): RedditMemePost[] {
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
    const id = postId
      ? `reddit-${postId}`
      : `reddit-${title.toLowerCase().replace(/\s+/g, '-')}`;

    memes.push({ id, title, url: imageUrl });
  }

  return memes;
}

export function buildRedditMemeResult(meme: RedditMemePost): CryptoMemeResult {
  return {
    id: meme.id,
    title: meme.title,
    url: buildMemeProxyUrl(meme.url),
    source: 'reddit',
    fallbackQuote: pickRandomFallbackQuote(),
  };
}

export function buildLocalFallbackMeme(): CryptoMemeResult {
  const fallback = pickRandomItem(LOCAL_MEME_FALLBACKS);

  return {
    id: fallback.id,
    title: fallback.title,
    url: fallback.url,
    source: 'fallback',
    fallbackQuote: pickRandomFallbackQuote(),
  };
}
