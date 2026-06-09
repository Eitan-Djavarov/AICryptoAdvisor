import { useEffect, useState } from 'react';
import FeedbackButtons from './FeedbackButtons';

interface MemeCardProps {
  id: string;
  url: string;
  title: string;
  source: 'reddit' | 'fallback';
  fallbackQuote: string;
}

export default function MemeCard({
  id,
  url,
  title,
  source,
  fallbackQuote,
}: MemeCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const isFallbackAsset = source === 'fallback';

  useEffect(() => {
    setImageFailed(false);
  }, [url]);

  if (imageFailed) {
    return (
      <div className="overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">
        <div className="flex min-h-56 items-center justify-center px-8 py-12 sm:min-h-72 md:min-h-80">
          <blockquote className="max-w-lg text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
              Market Sentiment
            </p>
            <p className="mt-4 text-base font-medium leading-relaxed tracking-tight text-zinc-300">
              &ldquo;{fallbackQuote}&rdquo;
            </p>
            <footer className="mt-6 text-xs text-zinc-600">
              Typography fallback — image unavailable
            </footer>
          </blockquote>
        </div>
        <div className="flex justify-end border-t border-zinc-800 px-4 py-2">
          <FeedbackButtons section="meme" contentId={id} />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/20">
      <img
        src={url}
        alt={title}
        className={
          isFallbackAsset
            ? 'h-48 max-h-48 w-full rounded-lg bg-zinc-950/40 object-contain p-4'
            : 'h-56 w-full object-cover sm:h-72 md:h-80'
        }
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
      <div className="flex items-start justify-between gap-3 border-t border-zinc-800 px-5 py-4">
        <div>
          <p className="font-medium tracking-tight text-zinc-200">{title}</p>
          <p className="mt-1 text-xs text-zinc-600">
            Source:{' '}
            {source === 'reddit' ? 'r/cryptocurrencymemes' : 'curated vault'}
          </p>
        </div>
        <FeedbackButtons section="meme" contentId={id} />
      </div>
    </div>
  );
}
