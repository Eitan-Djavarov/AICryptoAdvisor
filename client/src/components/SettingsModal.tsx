import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CONTENT_TYPE_OPTIONS,
  INVESTOR_TYPE_OPTIONS,
  OTHER_ASSET_LABEL,
  PRESET_CRYPTO_ASSETS,
} from '../constants/onboarding';
import CustomAssetAutocomplete from './CustomAssetAutocomplete';
import {
  buildCryptoAssets,
  splitCryptoAssets,
} from '../utils/assets';
import {
  extractApiErrorMessage,
  extractValidationErrors,
  type ValidationErrors,
} from '../utils/validation';
import type {
  ContentType,
  GetOnboardingResponse,
  InvestorType,
  UpdateOnboardingResponse,
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-2 text-sm text-red-400">{message}</p>;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSaved,
}: SettingsModalProps) {
  const { setPreferences, updateUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [operatorName, setOperatorName] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customAssets, setCustomAssets] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<InvestorType | null>(null);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>(
    []
  );

  const populateForm = useCallback(
    (
      name: string,
      cryptoAssets: string[],
      type: InvestorType,
      contentTypes: ContentType[]
    ) => {
      const { presetSelected, customAssets: parsedCustomAssets } =
        splitCryptoAssets(cryptoAssets);

      setOperatorName(name);
      setSelectedAssets(presetSelected);
      setIsOtherSelected(parsedCustomAssets.length > 0);
      setCustomAssets(parsedCustomAssets);
      setInvestorType(type);
      setSelectedContentTypes(contentTypes);
    },
    []
  );

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setValidationErrors({});

    try {
      const { data } = await api.get<GetOnboardingResponse>('/onboarding');

      populateForm(
        data.user.name,
        data.preferences.cryptoAssets,
        data.preferences.investorType,
        data.preferences.contentTypes
      );
    } catch (fetchError) {
      setError(
        extractApiErrorMessage(
          fetchError,
          'Failed to load your settings. Please try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, [populateForm]);

  useEffect(() => {
    if (isOpen) {
      void fetchPreferences();
    }
  }, [isOpen, fetchPreferences]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const toggleAsset = (asset: string) => {
    setSelectedAssets((current) =>
      current.includes(asset)
        ? current.filter((item) => item !== asset)
        : [...current, asset]
    );
  };

  const toggleOtherAsset = () => {
    setIsOtherSelected((current) => {
      if (current) {
        setCustomAssets([]);
      }
      return !current;
    });
  };

  const toggleContentType = (contentType: ContentType) => {
    setSelectedContentTypes((current) =>
      current.includes(contentType)
        ? current.filter((item) => item !== contentType)
        : [...current, contentType]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setValidationErrors({});

    const cryptoAssets = buildCryptoAssets(
      selectedAssets,
      isOtherSelected,
      customAssets
    );

    setSubmitting(true);

    try {
      const { data } = await api.put<UpdateOnboardingResponse>('/onboarding', {
        name: operatorName,
        cryptoAssets,
        investorType: investorType ?? '',
        contentTypes: selectedContentTypes,
      });

      setPreferences(data.preferences);
      updateUser(data.user);
      setSuccessMessage('Settings saved — refreshing your dashboard...');

      window.setTimeout(() => {
        onSaved();
        onClose();
      }, 900);
    } catch (submitError) {
      const fieldErrors = extractValidationErrors(submitError);

      if (fieldErrors) {
        setValidationErrors(fieldErrors);
        return;
      }

      setError(
        extractApiErrorMessage(
          submitError,
          'Failed to save settings. Please try again.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close settings"
      />

      <div className="relative z-10 w-full max-w-2xl animate-slide-up-fade">
        <div className="glass-panel max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-800">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-5 sm:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Preferences
              </p>
              <h2
                id="settings-title"
                className="mt-1 text-xl font-semibold tracking-tight text-zinc-50"
              >
                Dashboard Settings
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn-interactive rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200"
            >
              Close
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 px-8 py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-500" />
              <p className="text-sm text-zinc-500">Loading your preferences...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 px-6 py-8 sm:px-8">
              <section>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Operator
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-tight text-zinc-100">
                  Display name
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Shown in your personalized terminal welcome message.
                </p>
                <input
                  id="settings-operator-name"
                  type="text"
                  value={operatorName}
                  onChange={(event) => setOperatorName(event.target.value)}
                  className="mt-5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
                  autoComplete="name"
                />
                <FieldError message={validationErrors.name} />
              </section>

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
                        onClick={() => toggleAsset(asset)}
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
                    onClick={toggleOtherAsset}
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
                    onCustomAssetsChange={setCustomAssets}
                    selectedPresetAssets={selectedAssets}
                    inputId="settings-custom-assets"
                  />
                ) : null}
                <FieldError message={validationErrors.cryptoAssets} />
              </section>

              <section>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Risk Profile
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-tight text-zinc-100">
                  Investment risk profile
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Shapes the tone of your AI market briefings.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {INVESTOR_TYPE_OPTIONS.map((option) => {
                    const isSelected = investorType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setInvestorType(option.value)}
                        className={`card-interactive rounded-lg border p-4 text-left ${
                          isSelected
                            ? 'glass-panel-selected'
                            : 'border-zinc-800 bg-zinc-950'
                        }`}
                      >
                        <p className="text-sm font-medium tracking-tight text-zinc-100">
                          {option.title}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <FieldError message={validationErrors.investorType} />
              </section>

              <section>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Content
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-tight text-zinc-100">
                  Content preferences
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Choose what appears on your personalized dashboard.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {CONTENT_TYPE_OPTIONS.map((option) => {
                    const isSelected = selectedContentTypes.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleContentType(option.value)}
                        className={`card-interactive flex items-start gap-3 rounded-lg border p-4 text-left ${
                          isSelected
                            ? 'glass-panel-selected'
                            : 'border-zinc-800 bg-zinc-950'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] transition-all duration-300 ease-out ${
                            isSelected
                              ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
                              : 'border-zinc-700 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <span>
                          <p className="text-sm font-medium tracking-tight text-zinc-100">
                            {option.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {option.description}
                          </p>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <FieldError message={validationErrors.contentTypes} />
              </section>

              {error ? (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
                  {successMessage}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-interactive rounded-lg border border-zinc-800 bg-zinc-950 px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary rounded-lg px-6 py-2.5 text-sm font-medium"
                >
                  {submitting ? 'Saving changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
