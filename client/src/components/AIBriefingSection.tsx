import { memo } from 'react';
import FeedbackButtons from './FeedbackButtons';
import { getInteractionVote } from '../utils/interactions';
import type { AIInsightResult, FeedbackType } from '../types';

export interface AIBriefingSectionProps {
  aiInsight: AIInsightResult;
  calibratedLabel: string;
  interactions: Record<string, FeedbackType>;
}

function SparklesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-zinc-400"
      aria-hidden="true"
    >
      <path d="M12 2l1.2 4.2L17.5 7.5 13.2 8.7 12 13l-1.2-4.3L6.5 7.5l4.3-1.3L12 2zm7 9l.8 2.8L22.5 15l-2.7.8L19 18.5l-.8-2.7L15.5 15l2.7-.8L19 11zm-14 1l.6 2.1L8 15.2l-2.4.7L5 18l-.6-2.1L2 15.2l2.4-.7L5 12z" />
    </svg>
  );
}

function AIBriefingSection({
  aiInsight,
  calibratedLabel,
  interactions,
}: AIBriefingSectionProps) {
  return (
    <>
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <SparklesIcon />
          AI Briefing
        </div>
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
          Daily Alpha Brief
        </h2>
        <p className="mt-2 text-sm text-zinc-500">{calibratedLabel}</p>
      </div>

      <div className="relative rounded-lg border border-zinc-800 bg-zinc-950/60 px-5 py-5">
        <p className="text-base leading-relaxed text-zinc-300">
          {aiInsight.insight}
        </p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
            <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1">
              {aiInsight.model}
            </span>
            <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1">
              {aiInsight.source === 'fallback' ? 'cached brief' : 'live brief'}
            </span>
          </div>
          <FeedbackButtons
            section="ai_insight"
            contentId={aiInsight.contentId}
            initialVote={getInteractionVote(
              interactions,
              'ai_insight',
              aiInsight.contentId
            )}
          />
        </div>
      </div>
    </>
  );
}

export default memo(AIBriefingSection);
