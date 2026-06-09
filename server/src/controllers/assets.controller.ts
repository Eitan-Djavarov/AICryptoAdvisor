import { Request, Response } from 'express';
import { searchCryptoAssets } from '../services/assetSearch.service';

export async function searchAssets(req: Request, res: Response): Promise<void> {
  try {
    const rawQuery = req.query.q;
    const query = typeof rawQuery === 'string' ? rawQuery : '';

    const results = await searchCryptoAssets(query);

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('[Assets] searchAssets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search crypto assets',
      results: [],
    });
  }
}
