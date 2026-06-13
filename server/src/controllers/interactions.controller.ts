import { Request, Response } from 'express';
import { prisma } from '../config/db';
import {
  FEEDBACK_SECTIONS,
  FEEDBACK_TYPES,
  type FeedbackSection,
  type FeedbackType,
} from '../constants/domain';

interface SaveInteractionBody {
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

export async function saveInteraction(
  req: Request<unknown, unknown, SaveInteractionBody>,
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

    const trimmedContentId = contentId.trim();
    const userId = req.user.userId;

    const existing = await prisma.feedback.findUnique({
      where: {
        userId_sectionName_contentId: {
          userId,
          sectionName: section,
          contentId: trimmedContentId,
        },
      },
    });

    if (existing && existing.vote === type) {
      await prisma.feedback.delete({ where: { id: existing.id } });

      res.status(200).json({
        success: true,
        message: 'Interaction removed',
        interaction: null,
      });
      return;
    }

    const interaction = existing
      ? await prisma.feedback.update({
          where: { id: existing.id },
          data: { vote: type },
        })
      : await prisma.feedback.create({
          data: {
            userId,
            sectionName: section,
            contentId: trimmedContentId,
            vote: type,
          },
        });

    res.status(existing ? 200 : 201).json({
      success: true,
      message: 'Interaction saved successfully',
      interaction: {
        id: interaction.id,
        userId: interaction.userId,
        section: interaction.sectionName,
        contentId: interaction.contentId,
        type: interaction.vote,
        timestamp: interaction.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Interactions] saveInteraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save interaction',
    });
  }
}
