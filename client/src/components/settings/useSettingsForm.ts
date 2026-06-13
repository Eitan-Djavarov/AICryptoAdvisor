import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { buildCryptoAssets } from '../../utils/assets';
import {
  extractApiErrorMessage,
  extractValidationErrors,
  type ValidationErrors,
} from '../../utils/validation';
import type { UpdateOnboardingResponse } from '../../types';
import { useSettingsPreferencesLoader } from './useSettingsPreferencesLoader';
import { useSettingsFormToggles } from './useSettingsFormToggles';

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
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const { loading, error, formState, setFormState, setError } =
    useSettingsPreferencesLoader(isOpen);

  const {
    toggleAsset,
    toggleOtherAsset,
    selectInvestorType,
    toggleContentType,
    setOperatorName,
    setCustomAssets,
  } = useSettingsFormToggles(setFormState);

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

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError('');
      setSuccessMessage('');
      setValidationErrors({});

      const cryptoAssets = buildCryptoAssets(
        formState.selectedAssets,
        formState.isOtherSelected,
        formState.customAssets
      );

      setSubmitting(true);

      try {
        const { data } = await api.put<UpdateOnboardingResponse>('/onboarding', {
          name: formState.operatorName,
          cryptoAssets,
          investorType: formState.investorType ?? '',
          contentTypes: formState.selectedContentTypes,
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
    [formState, setPreferences, updateUser, onSaved, onClose, setError]
  );

  return {
    loading,
    submitting,
    error,
    successMessage,
    validationErrors,
    operatorName: formState.operatorName,
    setOperatorName,
    selectedAssets: formState.selectedAssets,
    toggleAsset,
    isOtherSelected: formState.isOtherSelected,
    toggleOtherAsset,
    customAssets: formState.customAssets,
    setCustomAssets,
    investorType: formState.investorType,
    selectInvestorType,
    selectedContentTypes: formState.selectedContentTypes,
    toggleContentType,
    handleSubmit,
  };
}
