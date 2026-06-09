import { Request, Response } from 'express';
import { prisma } from '../config/db';
import {
  SUGGESTED_CRYPTO_ASSETS,
  type ContentType,
  type InvestorType,
} from '../constants/domain';
import { invalidatePriceCache } from '../services/dashboard-cache.service';
import {
  parseStoredPreferences,
  serializeStringArray,
} from '../utils/preferences';
import { validatePreferencesBody } from '../utils/preferencesValidation';

interface PreferencesBody {
  name?: string;
  cryptoAssets?: string[];
  investorType?: string;
  contentTypes?: string[];
}

interface SanitizedPreferences {
  name: string;
  cryptoAssets: string[];
  investorType: InvestorType;
  contentTypes: ContentType[];
}

function formatPreferencesResponse(
  preferences: {
    id: string;
    userId: string;
    cryptoAssets: string;
    investorType: string;
    contentTypes: string;
    createdAt: Date;
    updatedAt: Date;
  },
  user: {
    id: string;
    name: string;
    email: string;
    onboardingCompleted: boolean;
  }
) {
  const parsed = parseStoredPreferences(
    preferences.cryptoAssets,
    preferences.investorType,
    preferences.contentTypes
  );

  return {
    preferences: {
      id: preferences.id,
      userId: preferences.userId,
      cryptoAssets: parsed.cryptoAssets,
      investorType: parsed.investorType,
      contentTypes: parsed.contentTypes,
      suggestedAssets: [...SUGGESTED_CRYPTO_ASSETS],
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      onboardingCompleted: user.onboardingCompleted,
    },
  };
}

async function persistPreferences(
  userId: string,
  data: SanitizedPreferences,
  markOnboardingComplete: boolean
) {
  const serializedAssets = serializeStringArray(data.cryptoAssets);
  const serializedContentTypes = serializeStringArray(data.contentTypes);

  const preferences = await prisma.userPreferences.upsert({
    where: { userId },
    update: {
      cryptoAssets: serializedAssets,
      investorType: data.investorType,
      contentTypes: serializedContentTypes,
    },
    create: {
      userId,
      cryptoAssets: serializedAssets,
      investorType: data.investorType,
      contentTypes: serializedContentTypes,
    },
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      ...(markOnboardingComplete ? { onboardingCompleted: true } : {}),
    },
  });

  invalidatePriceCache();

  return formatPreferencesResponse(preferences, user);
}

export async function getPreferences(req: Request, res: Response): Promise<void> {
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

    const storedPreferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!storedPreferences) {
      res.status(404).json({
        success: false,
        message: 'Onboarding preferences not found. Please complete onboarding first.',
      });
      return;
    }

    const formatted = formatPreferencesResponse(storedPreferences, user);

    res.status(200).json({
      success: true,
      ...formatted,
    });
  } catch (error) {
    console.error('[Onboarding] getPreferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch onboarding preferences',
    });
  }
}

export async function savePreferences(
  req: Request<unknown, unknown, PreferencesBody>,
  res: Response
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validated = validatePreferencesBody(req.body);

    if (!validated.ok) {
      res.status(400).json({
        success: false,
        validationErrors: validated.validationErrors,
      });
      return;
    }

    const result = await persistPreferences(
      req.user.userId,
      validated.data,
      true
    );

    res.status(200).json({
      success: true,
      message: 'Onboarding preferences saved successfully',
      ...result,
    });
  } catch (error) {
    console.error('[Onboarding] savePreferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save onboarding preferences',
    });
  }
}

export async function updatePreferences(
  req: Request<unknown, unknown, PreferencesBody>,
  res: Response
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const existing = await prisma.userPreferences.findUnique({
      where: { userId: req.user.userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Onboarding preferences not found. Please complete onboarding first.',
      });
      return;
    }

    const validated = validatePreferencesBody(req.body);

    if (!validated.ok) {
      res.status(400).json({
        success: false,
        validationErrors: validated.validationErrors,
      });
      return;
    }

    const result = await persistPreferences(
      req.user.userId,
      validated.data,
      false
    );

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      ...result,
    });
  } catch (error) {
    console.error('[Onboarding] updatePreferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
    });
  }
}
