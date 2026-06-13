import { memo } from 'react';
import MemeCard from './MemeCard';
import { getInteractionVote } from '../utils/interactions';
import type { CryptoMemeResult, FeedbackType } from '../types';

export interface MemeSectionProps {
  meme: CryptoMemeResult;
  interactions: Record<string, FeedbackType>;
}

function MemeSection({ meme, interactions }: MemeSectionProps) {
  return (
    <>
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Culture
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
          Market Sentiment
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Curated community perspective
        </p>
      </div>

      <MemeCard
        id={meme.id}
        url={meme.url}
        title={meme.title}
        source={meme.source}
        fallbackQuote={meme.fallbackQuote}
        initialVote={getInteractionVote(interactions, 'meme', meme.id)}
      />
    </>
  );
}

export default memo(MemeSection);
