import { memo, useCallback, useState } from 'react';
import FeedbackButtons from './FeedbackButtons';
import { getInteractionVote } from '../utils/interactions';
import { displayFormattedValue } from '../utils/display';
import type { CoinPriceData, FeedbackType } from '../types';

export interface MarketDataSectionProps {
  prices: CoinPriceData[];
  interactions: Record<string, FeedbackType>;
}

interface CoinPriceRowProps {
  coin: CoinPriceData;
  showFiatChange: boolean;
  onToggleFiatChange: () => void;
  initialVote: FeedbackType | null;
}

const CoinPriceRow = memo(function CoinPriceRow({
  coin,
  showFiatChange,
  onToggleFiatChange,
  initialVote,
}: CoinPriceRowProps) {
  return (
    <div className="card-interactive flex items-center justify-start gap-x-6 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="flex min-w-[5.5rem] shrink-0 items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          <img
            src={coin.image}
            alt={coin.name}
            className="h-5 w-5 object-contain"
          />
        </div>
        <div>
          <p className="font-semibold tracking-tight text-zinc-100">
            {coin.symbol}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{coin.name}</p>
        </div>
      </div>

      <div className="shrink-0">
        <p className="font-mono text-sm font-medium tracking-tight text-zinc-100">
          {displayFormattedValue(coin.formattedCurrentPrice)}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          MCap {displayFormattedValue(coin.formattedMarketCap)}
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleFiatChange}
          className={`rounded-md px-2.5 py-1.5 text-xs font-medium tracking-tight transition-colors duration-200 ${
            coin.isPriceChangePositive
              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
              : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/15'
          }`}
          title="Toggle between percent and fiat change"
        >
          {showFiatChange
            ? displayFormattedValue(coin.priceChangeFiat)
            : displayFormattedValue(coin.priceChangePercent)}
        </button>
        <FeedbackButtons
          section="coin_prices"
          contentId={coin.symbol}
          initialVote={initialVote}
          variant="compact"
        />
      </div>
    </div>
  );
});

function MarketDataSection({ prices, interactions }: MarketDataSectionProps) {
  const [showFiatChange, setShowFiatChange] = useState(false);
  const onToggleFiatChange = useCallback(() => {
    setShowFiatChange((current) => !current);
  }, []);

  return (
    <div className="flex max-h-[580px] min-h-0 flex-col">
      <div className="mb-4 shrink-0">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Market Data
        </p>
        <h2 className="mt-1.5 flex items-center text-base font-semibold tracking-tight sm:text-lg">
          <span
            className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          Live Tickers
        </h2>
        <p className="mt-1.5 text-xs text-zinc-500">
          Your watchlist, priced in real time
        </p>
      </div>

      {prices.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950 px-4 py-6 text-center text-sm text-zinc-600">
          No tickers yet — the market&apos;s taking a coffee break.
        </p>
      ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin">
          {prices.map((coin) => (
            <CoinPriceRow
              key={`${coin.symbol}-${coin.name}`}
              coin={coin}
              showFiatChange={showFiatChange}
              onToggleFiatChange={onToggleFiatChange}
              initialVote={getInteractionVote(
                interactions,
                'coin_prices',
                coin.symbol
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(MarketDataSection);
