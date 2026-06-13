import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../services/api';
import type { AssetSearchResponse, AssetSearchResult } from '../../types';

const SEARCH_DEBOUNCE_MS = 300;

interface UseCustomAssetSearchOptions {
  customAssets: string[];
  selectedPresetAssets: string[];
  onCustomAssetsChange: (assets: string[]) => void;
}

export function useCustomAssetSearch({
  customAssets,
  selectedPresetAssets,
  onCustomAssetsChange,
}: UseCustomAssetSearchOptions) {
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

  const removeCustomAsset = useCallback(
    (symbol: string) => {
      onCustomAssetsChange(
        customAssets.filter(
          (asset) => asset.toUpperCase() !== symbol.toUpperCase()
        )
      );
    },
    [customAssets, onCustomAssetsChange]
  );

  const handleSelectSuggestion = useCallback(
    (item: AssetSearchResult) => {
      addCustomAsset(item.symbol);
    },
    [addCustomAsset]
  );

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

  return {
    containerRef,
    inputRef,
    searchQuery,
    setSearchQuery,
    dropdownOpen,
    setDropdownOpen,
    searchLoading,
    searchError,
    visibleSuggestions,
    addCustomAsset,
    removeCustomAsset,
    handleSelectSuggestion,
  };
}
