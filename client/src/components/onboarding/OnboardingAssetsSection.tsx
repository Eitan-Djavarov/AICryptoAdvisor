import CustomAssetAutocomplete from '../CustomAssetAutocomplete';
import FieldError from '../settings/FieldError';
import {
  OTHER_ASSET_LABEL,
  PRESET_CRYPTO_ASSETS,
} from '../../constants/onboarding';

export interface OnboardingAssetsSectionProps {
  selectedAssets: string[];
  isOtherSelected: boolean;
  customAssets: string[];
  onToggleAsset: (asset: string) => void;
  onToggleOtherAsset: () => void;
  onCustomAssetsChange: (assets: string[]) => void;
  cryptoAssetsError?: string;
}

export default function OnboardingAssetsSection({
  selectedAssets,
  isOtherSelected,
  customAssets,
  onToggleAsset,
  onToggleOtherAsset,
  onCustomAssetsChange,
  cryptoAssetsError,
}: OnboardingAssetsSectionProps) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Step 1
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
        Which crypto assets interest you?
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        Select the assets that matter to your portfolio.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {PRESET_CRYPTO_ASSETS.map((asset) => {
          const isSelected = selectedAssets.includes(asset);

          return (
            <button
              key={asset}
              type="button"
              onClick={() => onToggleAsset(asset)}
              className={`chip-interactive rounded-md border px-4 py-2.5 text-sm font-medium tracking-tight ${
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
          className={`chip-interactive rounded-md border px-4 py-2.5 text-sm font-medium tracking-tight ${
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
          inputId="onboarding-custom-assets"
        />
      ) : null}
      <FieldError message={cryptoAssetsError} />
    </section>
  );
}
