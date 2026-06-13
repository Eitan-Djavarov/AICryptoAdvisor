import type { FeedbackType } from '../constants/domain';

export function buildInteractionKey(
  section: string,
  contentId: string
): string {
  return `${section}:${contentId}`;
}

export function formatUserInteractions(
  feedbacks: Array<{
    sectionName: string;
    contentId: string;
    vote: string;
  }>
): Record<string, FeedbackType> {
  const interactions: Record<string, FeedbackType> = {};

  for (const feedback of feedbacks) {
    interactions[buildInteractionKey(feedback.sectionName, feedback.contentId)] =
      feedback.vote as FeedbackType;
  }

  return interactions;
}
