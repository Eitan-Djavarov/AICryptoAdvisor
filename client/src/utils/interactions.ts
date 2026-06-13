import type { FeedbackApiSection, FeedbackType } from '../types';

export function getInteractionVote(
  interactions: Record<string, FeedbackType>,
  section: FeedbackApiSection,
  contentId: string
): FeedbackType | null {
  return interactions[`${section}:${contentId}`] ?? null;
}
