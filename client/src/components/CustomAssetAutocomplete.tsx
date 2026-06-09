import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { api } from '../services/api';
import type { AssetSearchResponse, AssetSearchResult } from '../types';

interface CustomAssetAutocompleteProps {
  customAssets: string[];
  onCustomAssetsChange: (assets: string[]) => void;
  selectedPresetAssets: string[];
  inputId?: string;
}

const SEARCH_DEBOUNCE_MS = 300;

function formatQuickViewPrice(value: number): string {
  if (value <= 0) {
    return '—';
  }

  if (value >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value >= 100 ? 0 : 2,
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatQuickViewChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export default function CustomAssetAutocomplete({
  customAssets,
  onCustomAssetsChange,
  selectedPresetAssets,
  inputId = 'custom-asset-search',
}: CustomAssetAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AssetSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const selectedSymbols = useMemo(() => {
    return new Set(
      [...selectedPresetAssets, ...customAssets].map((symbol) =>
        symbol.toUpperCase()
      )
    );
  }, [selectedPresetAssets, customAssets]);

  const visibleSuggestions = useMemo(() => {
    return suggestions.filter(
      (item) => !selectedSymbols.has(item.symbol.toUpperCase())
    );
  }, [suggestions, selectedSymbols]);

  const addCustomAsset = useCallback(
    (rawSymbol: string) => {
      const symbol = rawSymbol.trim().toUpperCase();

      if (!symbol || selectedSymbols.has(symbol)) {
        return false;
      }

      onCustomAssetsChange([...customAssets, symbol]);
      setSearchQuery('');
      setDropdownOpen(true);
      inputRef.current?.focus();
      return true;
    },
    [customAssets, onCustomAssetsChange, selectedSymbols]
  );

  const removeCustomAsset = (symbol: string) => {
    onCustomAssetsChange(
      customAssets.filter((asset) => asset.toUpperCase() !== symbol.toUpperCase())
    );
  };

  const handleSelectSuggestion = (item: AssetSearchResult) => {
    addCustomAsset(item.symbol);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (searchQuery.trim()) {
        addCustomAsset(searchQuery);
      } else {
        const firstSuggestion = visibleSuggestions[0];
        if (firstSuggestion) {
          handleSelectSuggestion(firstSuggestion);
        }
      }
      return;
    }

    if (event.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (!dropdownOpen) {
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      setSearchLoading(true);
      setSearchError('');

      void api
        .get<AssetSearchResponse>('/assets/search', {
          params: { q: searchQuery },
          signal: controller.signal,
        })
        .then(({ data }) => {
          setSuggestions(data.results);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          setSuggestions([]);
          setSearchError('Unable to load asset search results.');
          console.error('[CustomAssetAutocomplete] search failed:', error);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setSearchLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery, dropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative mt-6">
      <label
        htmlFor={inputId}
        className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500"
      >
        Search &amp; add custom symbols
      </label>

      {customAssets.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {customAssets.map((symbol) => (
            <span
              key={symbol}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium tracking-tight text-zinc-200"
            >
              {symbol}
              <button
                type="button"
                onClick={() => removeCustomAsset(symbol)}
                className="btn-interactive flex h-4 w-4 items-center justify-center rounded text-zinc-500 hover:text-zinc-200"
                aria-label={`Remove ${symbol}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value);
          setDropdownOpen(true);
        }}
        onFocus={() => setDropdownOpen(true)}
        onKeyDown={handleInputKeyDown}
        placeholder="Type to search (e.g. DOGE, LINK, AVAX)..."
        className="input-field w-full rounded-lg px-4 py-3 text-sm"
        autoComplete="off"
        role="combobox"
        aria-expanded={dropdownOpen}
        aria-controls={`${inputId}-listbox`}
        aria-autocomplete="list"
      />

      {dropdownOpen && searchLoading ? (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500">
          Searching assets...
        </div>
      ) : null}

      {dropdownOpen && !searchLoading && visibleSuggestions.length > 0 ? (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 py-1"
        >
          {visibleSuggestions.map((item) => {
            const isPositive = item.change24h >= 0;

            return (
              <li key={item.symbol} role="option">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelectSuggestion(item)}
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
                      {formatQuickViewPrice(item.price)}
                    </p>
                    <p
                      className={`tracking-tight ${
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {formatQuickViewChange(item.change24h)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {dropdownOpen &&
      !searchLoading &&
      searchQuery.trim() &&
      visibleSuggestions.length === 0 ? (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500">
          {searchError ||
            `No matches — press Enter to add "${searchQuery.trim().toUpperCase()}"`}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-zinc-600">
        Search live market data, click to add chips, or press Enter.
      </p>
    </div>
  );
}
