import { memo } from 'react';
import FeedbackButtons from './FeedbackButtons';
import { getInteractionVote } from '../utils/interactions';
import type { CryptoNewsItem, FeedbackType } from '../types';

export interface IntelligenceSectionProps {
  news: CryptoNewsItem[];
  interactions: Record<string, FeedbackType>;
}

interface NewsItemProps {
  item: CryptoNewsItem;
  initialVote: FeedbackType | null;
}

const NewsItem = memo(function NewsItem({ item, initialVote }: NewsItemProps) {
  return (
    <li className="rounded-lg border border-zinc-800 bg-zinc-950">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group card-interactive block px-4 py-3.5"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-sm font-medium leading-snug tracking-tight text-zinc-200 transition group-hover:text-zinc-50 sm:text-base">
            {item.title}
          </h3>
          <span className="shrink-0 text-xs text-zinc-600 transition group-hover:text-zinc-400">
            Read →
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-500">
          {item.summary}
        </p>
      </a>

      <div className="flex items-center justify-between gap-3 px-4 pb-3">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-600">
          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-medium tracking-tight text-zinc-400">
            {item.sourceLabel}
          </span>
          <span className="tracking-tight text-zinc-500">
            {item.formattedTime}
          </span>
          {item.currencies && item.currencies.length > 0 ? (
            <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-zinc-500">
              {item.currencies.join(', ')}
            </span>
          ) : null}
          {item.feedSource === 'fallback' ? (
            <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-zinc-500">
              cached
            </span>
          ) : null}
        </div>
        <FeedbackButtons
          section="market_news"
          contentId={item.id}
          initialVote={initialVote}
        />
      </div>
    </li>
  );
});

function IntelligenceSection({ news, interactions }: IntelligenceSectionProps) {
  return (
    <>
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Intelligence
        </p>
        <h2 className="mt-1.5 text-base font-semibold tracking-tight sm:text-lg">
          Market Pulse
        </h2>
        <p className="mt-1.5 text-xs text-zinc-500">
          Headlines tuned to your stack
        </p>
      </div>

      {news.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950 px-4 py-6 text-center text-sm text-zinc-600">
          Quiet news day. Enable &quot;Market News&quot; in preferences for
          headlines.
        </p>
      ) : (
        <ul className="news-scroll scrollbar-thin space-y-2 pr-1">
          {news.map((item) => (
            <NewsItem
              key={item.id}
              item={item}
              initialVote={getInteractionVote(
                interactions,
                'market_news',
                item.id
              )}
            />
          ))}
        </ul>
      )}
    </>
  );
}

export default memo(IntelligenceSection);
