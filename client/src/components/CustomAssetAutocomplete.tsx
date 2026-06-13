import { type KeyboardEvent, type RefObject } from 'react';
import { useCustomAssetSearch } from './asset-search/useCustomAssetSearch';
import CustomAssetChipList from './asset-search/CustomAssetChipList';
import AssetSearchDropdown from './asset-search/AssetSearchDropdown';

export interface CustomAssetAutocompleteProps {
  customAssets: string[];
  onCustomAssetsChange: (assets: string[]) => void;
  selectedPresetAssets: string[];
  inputId?: string;
}

interface SearchInputProps {
  inputId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  dropdownOpen: boolean;
  onSearchQueryChange: (value: string) => void;
  onOpenDropdown: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

function SearchInput({
  inputId,
  inputRef,
  searchQuery,
  dropdownOpen,
  onSearchQueryChange,
  onOpenDropdown,
  onKeyDown,
}: SearchInputProps) {
  return (
    <input
      ref={inputRef}
      id={inputId}
      type="text"
      value={searchQuery}
      onChange={(event) => onSearchQueryChange(event.target.value)}
      onFocus={onOpenDropdown}
      onKeyDown={onKeyDown}
      placeholder="Type to search (e.g. DOGE, LINK, AVAX)..."
      className="input-field w-full rounded-lg px-4 py-3 text-sm"
      autoComplete="off"
      role="combobox"
      aria-expanded={dropdownOpen}
      aria-controls={`${inputId}-listbox`}
      aria-autocomplete="list"
    />
  );
}

export default function CustomAssetAutocomplete({
  customAssets,
  onCustomAssetsChange,
  selectedPresetAssets,
  inputId = 'custom-asset-search',
}: CustomAssetAutocompleteProps) {
  const {
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
  } = useCustomAssetSearch({
    customAssets,
    selectedPresetAssets,
    onCustomAssetsChange,
  });

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

  return (
    <div ref={containerRef} className="relative mt-6">
      <label
        htmlFor={inputId}
        className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500"
      >
        Search &amp; add custom symbols
      </label>

      <CustomAssetChipList
        customAssets={customAssets}
        onRemoveAsset={removeCustomAsset}
      />

      <SearchInput
        inputId={inputId}
        inputRef={inputRef}
        searchQuery={searchQuery}
        dropdownOpen={dropdownOpen}
        onSearchQueryChange={(value) => {
          setSearchQuery(value);
          setDropdownOpen(true);
        }}
        onOpenDropdown={() => setDropdownOpen(true)}
        onKeyDown={handleInputKeyDown}
      />

      <AssetSearchDropdown
        inputId={inputId}
        dropdownOpen={dropdownOpen}
        searchLoading={searchLoading}
        searchQuery={searchQuery}
        searchError={searchError}
        visibleSuggestions={visibleSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />

      <p className="mt-3 text-xs text-zinc-600">
        Search live market data, click to add chips, or press Enter.
      </p>
    </div>
  );
}
