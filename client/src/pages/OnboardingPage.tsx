import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CustomAssetAutocomplete from '../components/CustomAssetAutocomplete';
import OnboardingSuccessScreen from '../components/OnboardingSuccessScreen';
import {
  CONTENT_TYPE_OPTIONS,
  INVESTOR_TYPE_OPTIONS,
  OTHER_ASSET_LABEL,
  PRESET_CRYPTO_ASSETS,
} from '../constants/onboarding';
import { buildCryptoAssets } from '../utils/assets';
import {
  extractApiErrorMessage,
  extractValidationErrors,
  type ValidationErrors,
} from '../utils/validation';
import type {
  ContentType,
  InvestorType,
  OnboardingResponse,
} from '../types';

const ANALYZING_DELAY_MS = 2600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-2 text-sm text-red-400">{message}</p>;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser, setPreferences } = useAuth();

  const [operatorName, setOperatorName] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customAssets, setCustomAssets] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<InvestorType | null>(null);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>(
    []
  );
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<'form' | 'analyzing'>('form');

  useEffect(() => {
    if (user?.name) {
      setOperatorName(user.name);
    }
  }, [user?.name]);

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
    setValidationErrors({});

    const cryptoAssets = buildCryptoAssets(
      selectedAssets,
      isOtherSelected,
      customAssets
    );

    setSubmitting(true);

    try {
      const { data } = await api.post<OnboardingResponse>('/onboarding', {
        name: operatorName,
        cryptoAssets,
        investorType: investorType ?? '',
        contentTypes: selectedContentTypes,
      });

      setPhase('analyzing');
      await delay(ANALYZING_DELAY_MS);

      updateUser(data.user);
      setPreferences(data.preferences);
      navigate('/dashboard');
    } catch (submitError) {
      const fieldErrors = extractValidationErrors(submitError);

      if (fieldErrors) {
        setValidationErrors(fieldErrors);
        setPhase('form');
        return;
      }

      setError(
        extractApiErrorMessage(
          submitError,
          'Failed to save preferences. Please try again.'
        )
      );
      setPhase('form');
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'analyzing') {
    return <OnboardingSuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Profile Setup
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Configure your trading desk
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-500 sm:text-base">
            Three decisions to personalize your market data, intelligence feed,
            and daily briefings.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel space-y-10 rounded-xl p-6 sm:p-8 lg:p-10"
        >
          <section>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Operator
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
              What should we call you?
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              This name appears in your terminal welcome message.
            </p>
            <input
              id="onboarding-operator-name"
              type="text"
              value={operatorName}
              onChange={(event) => setOperatorName(event.target.value)}
              className="mt-6 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
              autoComplete="name"
            />
            <FieldError message={validationErrors.name} />
          </section>

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
                    onClick={() => toggleAsset(asset)}
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
                onClick={toggleOtherAsset}
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
                onCustomAssetsChange={setCustomAssets}
                selectedPresetAssets={selectedAssets}
                inputId="onboarding-custom-assets"
              />
            ) : null}
            <FieldError message={validationErrors.cryptoAssets} />
          </section>

          <section>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Step 2
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
              What kind of investor are you?
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              This shapes your AI briefing tone and risk framing.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {INVESTOR_TYPE_OPTIONS.map((option) => {
                const isSelected = investorType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setInvestorType(option.value)}
                    className={`card-interactive rounded-lg border p-5 text-left ${
                      isSelected
                        ? 'glass-panel-selected'
                        : 'border-zinc-800 bg-zinc-950'
                    }`}
                  >
                    <p className="font-medium tracking-tight text-zinc-100">
                      {option.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
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
              Step 3
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
              What content do you want to see?
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Choose the data lanes for your dashboard.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {CONTENT_TYPE_OPTIONS.map((option) => {
                const isSelected = selectedContentTypes.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleContentType(option.value)}
                    className={`card-interactive flex items-start gap-3 rounded-lg border p-5 text-left ${
                      isSelected
                        ? 'glass-panel-selected'
                        : 'border-zinc-800 bg-zinc-950'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] transition-all duration-300 ease-out ${
                        isSelected
                          ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
                          : 'border-zinc-700 bg-transparent text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span>
                      <p className="font-medium tracking-tight text-zinc-100">
                        {option.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
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

          <button
            type="submit"
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-medium"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/30 border-t-zinc-950" />
                Saving preferences...
              </>
            ) : (
              'Launch Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
