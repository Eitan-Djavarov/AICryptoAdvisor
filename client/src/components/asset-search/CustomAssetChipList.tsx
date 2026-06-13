export interface CustomAssetChipListProps {
  customAssets: string[];
  onRemoveAsset: (symbol: string) => void;
}

export default function CustomAssetChipList({
  customAssets,
  onRemoveAsset,
}: CustomAssetChipListProps) {
  if (customAssets.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {customAssets.map((symbol) => (
        <span
          key={symbol}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium tracking-tight text-zinc-200"
        >
          {symbol}
          <button
            type="button"
            onClick={() => onRemoveAsset(symbol)}
            className="btn-interactive flex h-4 w-4 items-center justify-center rounded text-zinc-500 hover:text-zinc-200"
            aria-label={`Remove ${symbol}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
