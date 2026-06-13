import { api } from './api';
import type { FeedbackApiSection, FeedbackType } from '../types';

interface SaveInteractionResponse {
  success: boolean;
  message: string;
  interaction: {
    id: string;
    userId: string;
    section: FeedbackApiSection;
    contentId: string;
    type: FeedbackType;
    timestamp: string;
  } | null;
}

export async function saveInteraction(
  section: FeedbackApiSection,
  contentId: string,
  type: FeedbackType
): Promise<SaveInteractionResponse> {
  const { data } = await api.post<SaveInteractionResponse>('/interactions/interact', {
    section,
    contentId,
    type,
  });

  return data;
}
