import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { computeDashboardLayoutSections } from '../utils/dashboardLayout';
import { formatUserInteractions } from '../utils/interactions';
import { resolveInvestorProfileMeta } from '../utils/investorProfileMeta';
import { parseStoredPreferences } from '../utils/preferences';
import { getFallbackNews } from '../mappers/crypto.mapper';
import {
  getDashboardAIInsight,
  getDashboardPrices,
  getMarqueeBenchmarkPrices,
} from '../services/dashboard-cache.service';
import { fetchFearAndGreedIndex } from '../services/fearGreed.service';
import { fetchCryptoMeme } from '../services/meme.service';

export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.onboardingCompleted) {
      res.status(400).json({
        success: false,
        message: 'Onboarding must be completed before accessing the dashboard',
      });
      return;
    }

    const storedPreferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!storedPreferences) {
      res.status(400).json({
        success: false,
        message: 'User preferences not found. Please complete onboarding first.',
      });
      return;
    }

    const { cryptoAssets, investorType, contentTypes } = parseStoredPreferences(
      storedPreferences.cryptoAssets,
      storedPreferences.investorType,
      storedPreferences.contentTypes
    );

    const news = contentTypes.includes('Market News')
      ? getFallbackNews(cryptoAssets)
      : [];

    const [
      aiInsight,
      prices,
      meme,
      marqueeTickers,
      fearAndGreed,
      savedInteractions,
    ] = await Promise.all([
      getDashboardAIInsight(investorType, cryptoAssets),
      getDashboardPrices(cryptoAssets),
      fetchCryptoMeme(),
      getMarqueeBenchmarkPrices(),
      fetchFearAndGreedIndex(),
      prisma.feedback.findMany({
        where: { userId: user.id },
        select: {
          sectionName: true,
          contentId: true,
          vote: true,
        },
      }),
    ]);

    const layoutSections = computeDashboardLayoutSections(contentTypes);
    const profileMeta = resolveInvestorProfileMeta(investorType, user.name);
    const interactions = formatUserInteractions(savedInteractions);

    res.status(200).json({
      success: true,
      dashboard: {
        prices,
        news,
        aiInsight,
        meme,
        marqueeTickers,
        profileMeta,
        fearAndGreed,
      },
      preferences: {
        cryptoAssets,
        investorType,
        contentTypes,
      },
      interactions,
      layoutSections,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Dashboard] getDashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
    });
  }
}
