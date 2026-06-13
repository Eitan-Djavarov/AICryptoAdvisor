import type { AssetSearchResult } from '../../types';
import AssetSearchSuggestionRow from './AssetSearchSuggestionRow';

export interface AssetSearchDropdownProps {
  inputId: string;
  dropdownOpen: boolean;
  searchLoading: boolean;
  searchQuery: string;
  searchError: string;
  visibleSuggestions: AssetSearchResult[];
  onSelectSuggestion: (item: AssetSearchResult) => void;
}

export default function AssetSearchDropdown({
  inputId,
  dropdownOpen,
  searchLoading,
  searchQuery,
  searchError,
  visibleSuggestions,
  onSelectSuggestion,
}: AssetSearchDropdownProps) {
  if (!dropdownOpen) {
    return null;
  }

  if (searchLoading) {
    return (
      <div className="absolute z-20 mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500">
        Searching assets...
      </div>
    );
  }

  if (visibleSuggestions.length > 0) {
    return (
      <ul
        id={`${inputId}-listbox`}
        role="listbox"
        className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 py-1"
      >
        {visibleSuggestions.map((item) => (
          <AssetSearchSuggestionRow
            key={item.symbol}
            item={item}
            onSelect={onSelectSuggestion}
          />
        ))}
      </ul>
    );
  }

  if (searchQuery.trim()) {
    return (
      <div className="absolute z-20 mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500">
        {searchError ||
          `No matches — press Enter to add "${searchQuery.trim().toUpperCase()}"`}
      </div>
    );
  }

  return null;
}
