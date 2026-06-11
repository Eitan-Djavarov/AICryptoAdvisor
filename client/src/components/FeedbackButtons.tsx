import { memo, useState, type MouseEvent } from 'react';
import { api } from '../services/api';
import type { FeedbackApiSection, FeedbackType } from '../types';

interface FeedbackButtonsProps {
  section: FeedbackApiSection;
  contentId: string;
  variant?: 'default' | 'compact';
}

const BUTTON_SHARED =
  'pointer-events-auto flex cursor-pointer items-center justify-center rounded-lg border p-2 transition-all duration-200 active:scale-95';

const BUTTON_LIKE_IDLE =
  'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400';

const BUTTON_LIKE_ACTIVE =
  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]';

const BUTTON_DISLIKE_IDLE =
  'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400';

const BUTTON_DISLIKE_ACTIVE =
  'border-rose-500/30 bg-rose-500/10 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]';

function LikeIcon({ compact }: { compact: boolean }) {
  const size = compact ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={size}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 11v8a1 1 0 001 1h2a1 1 0 001-1v-1h4v1a1 1 0 001 1h2a1 1 0 001-1v-8l-4-4-4 4zM12 3v4"
      />
    </svg>
  );
}

function DislikeIcon({ compact }: { compact: boolean }) {
  const size = compact ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={size}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 13V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v1H9V5a1 1 0 00-1-1H6a1 1 0 00-1 1v8l4 4 4-4zM12 21v-4"
      />
    </svg>
  );
}

async function submitFeedback(
  section: FeedbackApiSection,
  contentId: string,
  type: FeedbackType
): Promise<void> {
  try {
    console.log('Feedback submitted:', { section, contentId, type });
    await api.post('/feedback', { section, contentId, type });
  } catch {
    // Fire-and-forget: no UI state or blocking on failure.
  }
}

function FeedbackButtons({
  section,
  contentId,
  variant = 'default',
}: FeedbackButtonsProps) {
  const [activeVote, setActiveVote] = useState<'LIKE' | 'DISLIKE' | null>(null);

  const compact = variant === 'compact';
  const gap = compact ? 'gap-1' : 'gap-1.5';

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActiveVote((current) => (current === 'LIKE' ? null : 'LIKE'));
    void submitFeedback(section, contentId, 'LIKE');
  };

  const handleDislikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActiveVote((current) => (current === 'DISLIKE' ? null : 'DISLIKE'));
    void submitFeedback(section, contentId, 'DISLIKE');
  };

  return (
    <div
      className={`relative z-10 flex items-center ${gap}`}
      role="group"
      aria-label="Content feedback"
    >
      <button
        type="button"
        onClick={handleLikeClick}
        className={`${BUTTON_SHARED} ${
          activeVote === 'LIKE' ? BUTTON_LIKE_ACTIVE : BUTTON_LIKE_IDLE
        }`}
        aria-label="Like"
        aria-pressed={activeVote === 'LIKE'}
      >
        <LikeIcon compact={compact} />
      </button>

      <button
        type="button"
        onClick={handleDislikeClick}
        className={`${BUTTON_SHARED} ${
          activeVote === 'DISLIKE' ? BUTTON_DISLIKE_ACTIVE : BUTTON_DISLIKE_IDLE
        }`}
        aria-label="Dislike"
        aria-pressed={activeVote === 'DISLIKE'}
      >
        <DislikeIcon compact={compact} />
      </button>
    </div>
  );
}

export default memo(FeedbackButtons);
