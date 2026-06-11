import {
  OTHER_ASSET_LABEL,
  PRESET_CRYPTO_ASSETS,
} from '../../constants/onboarding';
import CustomAssetAutocomplete from '../CustomAssetAutocomplete';
import FieldError from './FieldError';

export interface SystemTabProps {
  selectedAssets: string[];
  onToggleAsset: (asset: string) => void;
  isOtherSelected: boolean;
  onToggleOtherAsset: () => void;
  customAssets: string[];
  onCustomAssetsChange: (assets: string[]) => void;
  cryptoAssetsError?: string;
}

export default function SystemTab({
  selectedAssets,
  onToggleAsset,
  isOtherSelected,
  onToggleOtherAsset,
  customAssets,
  onCustomAssetsChange,
  cryptoAssetsError,
}: SystemTabProps) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Watchlist
      </p>
      <h3 className="mt-2 text-base font-semibold tracking-tight text-zinc-100">
        Crypto assets
      </h3>
      <p className="mt-2 text-sm text-zinc-500">
        Update the assets powering your prices and news feed.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {PRESET_CRYPTO_ASSETS.map((asset) => {
          const isSelected = selectedAssets.includes(asset);
          return (
            <button
              key={asset}
              type="button"
              onClick={() => onToggleAsset(asset)}
              className={`chip-interactive rounded-md border px-4 py-2 text-sm font-medium tracking-tight ${
                isSelected
                  ? 'border-zinc-600 bg-zinc-900 text-zinc-100'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400'
              }`}
            >
              {asset}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onToggleOtherAsset}
          className={`chip-interactive rounded-md border px-4 py-2 text-sm font-medium tracking-tight ${
            isOtherSelected
              ? 'border-zinc-600 bg-zinc-900 text-zinc-100'
              : 'border-zinc-800 bg-zinc-950 text-zinc-400'
          }`}
        >
          {OTHER_ASSET_LABEL}
        </button>
      </div>

      {isOtherSelected ? (
        <CustomAssetAutocomplete
          customAssets={customAssets}
          onCustomAssetsChange={onCustomAssetsChange}
          selectedPresetAssets={selectedAssets}
          inputId="settings-custom-assets"
        />
      ) : null}
      <FieldError message={cryptoAssetsError} />
    </section>
  );
}
