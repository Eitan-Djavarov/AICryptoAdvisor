import { Request, Response } from 'express';
import axios from 'axios';
import {
  isAllowedMemeImageUrl,
  resolveSafeImageContentType,
} from '../utils/memeProxy';

const PROXY_TIMEOUT_MS = 10_000;

export async function proxyMemeImage(req: Request, res: Response): Promise<void> {
  const urlParam = req.query.url;

  if (typeof urlParam !== 'string' || !urlParam.trim()) {
    res.status(400).json({
      success: false,
      message: 'url query parameter is required',
    });
    return;
  }

  const targetUrl = urlParam.trim();

  if (!isAllowedMemeImageUrl(targetUrl)) {
    res.status(400).json({
      success: false,
      message: 'Only approved Reddit or Imgur image URLs are allowed',
    });
    return;
  }

  try {
    const upstream = await axios.get(targetUrl, {
      responseType: 'stream',
      timeout: PROXY_TIMEOUT_MS,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'AI-Crypto-Advisor/1.0 (Meme Image Proxy)',
        Accept: 'image/*',
      },
      validateStatus: (status) => status >= 200 && status < 300,
    });

    const contentType = resolveSafeImageContentType(
      typeof upstream.headers['content-type'] === 'string'
        ? upstream.headers['content-type']
        : undefined
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=300');

    upstream.data.on('error', () => {
      if (!res.headersSent) {
        res.status(502).end();
        return;
      }

      res.end();
    });

    upstream.data.pipe(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[Meme] Image proxy failed (${message})`);

    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: 'Failed to fetch meme image',
      });
    }
  }
}
