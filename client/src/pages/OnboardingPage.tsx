import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import OnboardingSuccessScreen from '../components/OnboardingSuccessScreen';
import OnboardingHeader from '../components/onboarding/OnboardingHeader';
import OnboardingOperatorSection from '../components/onboarding/OnboardingOperatorSection';
import OnboardingAssetsSection from '../components/onboarding/OnboardingAssetsSection';
import OnboardingInvestorSection from '../components/onboarding/OnboardingInvestorSection';
import OnboardingContentSection from '../components/onboarding/OnboardingContentSection';
import OnboardingFormActions from '../components/onboarding/OnboardingFormActions';
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
        <OnboardingHeader />

        <form
          onSubmit={handleSubmit}
          className="glass-panel space-y-10 rounded-xl p-6 sm:p-8 lg:p-10"
        >
          <OnboardingOperatorSection
            operatorName={operatorName}
            onOperatorNameChange={setOperatorName}
            nameError={validationErrors.name}
          />

          <OnboardingAssetsSection
            selectedAssets={selectedAssets}
            isOtherSelected={isOtherSelected}
            customAssets={customAssets}
            onToggleAsset={toggleAsset}
            onToggleOtherAsset={toggleOtherAsset}
            onCustomAssetsChange={setCustomAssets}
            cryptoAssetsError={validationErrors.cryptoAssets}
          />

          <OnboardingInvestorSection
            investorType={investorType}
            onSelectInvestorType={setInvestorType}
            investorTypeError={validationErrors.investorType}
          />

          <OnboardingContentSection
            selectedContentTypes={selectedContentTypes}
            onToggleContentType={toggleContentType}
            contentTypesError={validationErrors.contentTypes}
          />

          <OnboardingFormActions error={error} submitting={submitting} />
        </form>
      </div>
    </div>
  );
}
