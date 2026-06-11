import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { buildCryptoAssets, splitCryptoAssets } from '../../utils/assets';
import {
  extractApiErrorMessage,
  extractValidationErrors,
  type ValidationErrors,
} from '../../utils/validation';
import type {
  ContentType,
  GetOnboardingResponse,
  InvestorType,
  UpdateOnboardingResponse,
} from '../../types';

interface UseSettingsFormOptions {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function useSettingsForm({
  isOpen,
  onClose,
  onSaved,
}: UseSettingsFormOptions) {
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

  const toggleAsset = useCallback((asset: string) => {
    setSelectedAssets((current) =>
      current.includes(asset)
        ? current.filter((item) => item !== asset)
        : [...current, asset]
    );
  }, []);

  const toggleOtherAsset = useCallback(() => {
    setIsOtherSelected((current) => {
      if (current) {
        setCustomAssets([]);
      }
      return !current;
    });
  }, []);

  const selectInvestorType = useCallback((type: InvestorType) => {
    setInvestorType(type);
  }, []);

  const toggleContentType = useCallback((contentType: ContentType) => {
    setSelectedContentTypes((current) =>
      current.includes(contentType)
        ? current.filter((item) => item !== contentType)
        : [...current, contentType]
    );
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
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
    },
    [
      selectedAssets,
      isOtherSelected,
      customAssets,
      operatorName,
      investorType,
      selectedContentTypes,
      setPreferences,
      updateUser,
      onSaved,
      onClose,
    ]
  );

  return {
    loading,
    submitting,
    error,
    successMessage,
    validationErrors,
    operatorName,
    setOperatorName,
    selectedAssets,
    toggleAsset,
    isOtherSelected,
    toggleOtherAsset,
    customAssets,
    setCustomAssets,
    investorType,
    selectInvestorType,
    selectedContentTypes,
    toggleContentType,
    handleSubmit,
  };
}
