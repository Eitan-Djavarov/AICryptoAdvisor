const ALLOWED_MEME_IMAGE_HOSTS = new Set([
  'i.redd.it',
  'preview.redd.it',
  'external-preview.redd.it',
  'i.imgur.com',
  'redditmedia.com',
]);

const SAFE_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export function getApiPublicBaseUrl(): string {
  const configured = process.env.API_PUBLIC_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const port = process.env.PORT ?? '5000';
  return `http://localhost:${port}`;
}

export function isAllowedMemeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      ALLOWED_MEME_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

export function resolveSafeImageContentType(
  contentType: string | undefined
): string {
  if (!contentType) {
    return 'image/jpeg';
  }

  const normalized = contentType.split(';')[0]?.trim().toLowerCase();

  if (normalized && SAFE_IMAGE_CONTENT_TYPES.has(normalized)) {
    return normalized;
  }

  return 'image/jpeg';
}

export function buildMemeProxyUrl(rawImageUrl: string): string {
  const baseUrl = getApiPublicBaseUrl();
  return `${baseUrl}/api/meme/proxy?url=${encodeURIComponent(rawImageUrl)}`;
}
