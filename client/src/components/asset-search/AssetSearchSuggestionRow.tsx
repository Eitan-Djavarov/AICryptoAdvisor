import { displayFormattedValue } from '../../utils/display';
import type { AssetSearchResult } from '../../types';

export interface AssetSearchSuggestionRowProps {
  item: AssetSearchResult;
  onSelect: (item: AssetSearchResult) => void;
}

export default function AssetSearchSuggestionRow({
  item,
  onSelect,
}: AssetSearchSuggestionRowProps) {
  return (
    <li role="option">
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onSelect(item)}
        className="btn-interactive flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-zinc-900"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-tight text-zinc-200">
            {item.symbol}
          </p>
          <p className="truncate text-xs text-zinc-500">{item.name}</p>
        </div>
        <div className="shrink-0 text-right font-mono text-xs">
          <p className="tracking-tight text-zinc-300">
            {displayFormattedValue(item.formattedPrice)}
          </p>
          <p
            className={`tracking-tight ${
              item.isChangePositive ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {displayFormattedValue(item.formattedChange24h)}
          </p>
        </div>
      </button>
    </li>
  );
}
