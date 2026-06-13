import type { CoinPriceData } from '../types';
import { displayFormattedValue } from '../utils/display';

interface TickerMarqueeProps {
  tickers: CoinPriceData[];
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function TickerNode({ ticker }: { ticker: CoinPriceData }) {
  const isPositive = ticker.isPriceChangePositive;

  return (
    <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-6">
      <span className="font-medium tracking-tight text-zinc-300">
        {ticker.symbol}
      </span>
      <span className="text-zinc-400">
        {displayFormattedValue(ticker.formattedCurrentPrice)}
      </span>
      <span className={isPositive ? 'text-emerald-500' : 'text-rose-500'}>
        ({displayFormattedValue(ticker.priceChangePercent)})
      </span>
    </span>
  );
}

function TickerTrack({
  tickers,
  trackKey,
  ariaHidden = false,
}: {
  tickers: CoinPriceData[];
  trackKey: string;
  ariaHidden?: boolean;
}) {
  return (
    <div className="marquee-group" aria-hidden={ariaHidden || undefined}>
      {tickers.map((ticker) => (
        <TickerNode key={`${trackKey}-${ticker.symbol}`} ticker={ticker} />
      ))}
    </div>
  );
}

export default function TickerMarquee({ tickers }: TickerMarqueeProps) {
  if (tickers.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 h-9 border-t border-zinc-800 bg-zinc-950 font-mono text-xs"
      role="marquee"
      aria-label="Live benchmark crypto prices"
    >
      <div className="marquee-container h-full overflow-hidden pr-[4.5rem]">
        <div className="marquee-track">
          <TickerTrack tickers={tickers} trackKey="primary" />
          <TickerTrack tickers={tickers} trackKey="duplicate" ariaHidden />
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        className="btn-interactive fixed bottom-0 right-0 z-50 flex h-9 select-none items-center border-l border-zinc-800 bg-zinc-950 px-3 font-mono text-xs text-zinc-400 pointer-events-auto hover:text-zinc-200"
        aria-label="Scroll to top"
      >
        ↑ TOP
      </button>
    </div>
  );
}
