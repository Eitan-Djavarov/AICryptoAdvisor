import { Request, Response } from 'express';
import { prisma } from '../config/db';
import {
  FEEDBACK_SECTIONS,
  FEEDBACK_TYPES,
  type FeedbackSection,
  type FeedbackType,
} from '../constants/domain';
import { computeDashboardLayoutSections } from '../utils/dashboardLayout';
import { resolveInvestorProfileMeta } from '../utils/investorProfileMeta';
import { parseStoredPreferences } from '../utils/preferences';
import { fetchCryptoNews } from '../services/crypto.service';
import {
  getDashboardAIInsight,
  getDashboardPrices,
  getMarqueeBenchmarkPrices,
} from '../services/dashboard-cache.service';
import { fetchFearAndGreedIndex } from '../services/fearGreed.service';
import { fetchCryptoMeme } from '../services/meme.service';

interface SubmitFeedbackBody {
  section?: string;
  contentId?: string;
  type?: string;
}

function isFeedbackSection(value: string): value is FeedbackSection {
  return (FEEDBACK_SECTIONS as readonly string[]).includes(value);
}

function isFeedbackType(value: string): value is FeedbackType {
  return (FEEDBACK_TYPES as readonly string[]).includes(value);
}

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

    const aiInsight = getDashboardAIInsight(investorType, cryptoAssets);

    const [prices, news, meme, marqueeTickers, fearAndGreed] = await Promise.all([
      getDashboardPrices(cryptoAssets),
      fetchCryptoNews(contentTypes, cryptoAssets),
      fetchCryptoMeme(),
      getMarqueeBenchmarkPrices(),
      fetchFearAndGreedIndex(),
    ]);

    const layoutSections = computeDashboardLayoutSections(contentTypes);
    const profileMeta = resolveInvestorProfileMeta(investorType, user.name);

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

export async function submitFeedback(
  req: Request<unknown, unknown, SubmitFeedbackBody>,
  res: Response
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { section, contentId, type } = req.body;

    if (!section || !isFeedbackSection(section)) {
      res.status(400).json({
        success: false,
        message: `section must be one of: ${FEEDBACK_SECTIONS.join(', ')}`,
      });
      return;
    }

    if (!contentId || typeof contentId !== 'string' || !contentId.trim()) {
      res.status(400).json({
        success: false,
        message: 'contentId is required',
      });
      return;
    }

    if (!type || !isFeedbackType(type)) {
      res.status(400).json({
        success: false,
        message: `type must be one of: ${FEEDBACK_TYPES.join(', ')}`,
      });
      return;
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user.userId,
        sectionName: section,
        contentId: contentId.trim(),
        vote: type,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Feedback recorded successfully',
      feedback: {
        id: feedback.id,
        userId: feedback.userId,
        section: feedback.sectionName,
        contentId: feedback.contentId,
        type: feedback.vote,
        timestamp: feedback.createdAt,
      },
    });
  } catch (error) {
    console.error('[Dashboard] submitFeedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save feedback',
    });
  }
}
