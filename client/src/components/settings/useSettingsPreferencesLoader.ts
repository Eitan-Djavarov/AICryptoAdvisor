import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { splitCryptoAssets } from '../../utils/assets';
import { extractApiErrorMessage } from '../../utils/validation';
import type { ContentType, GetOnboardingResponse, InvestorType } from '../../types';

export interface SettingsFormState {
  operatorName: string;
  selectedAssets: string[];
  isOtherSelected: boolean;
  customAssets: string[];
  investorType: InvestorType | null;
  selectedContentTypes: ContentType[];
}

export function useSettingsPreferencesLoader(isOpen: boolean) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState<SettingsFormState>({
    operatorName: '',
    selectedAssets: [],
    isOtherSelected: false,
    customAssets: [],
    investorType: null,
    selectedContentTypes: [],
  });

  const populateForm = useCallback(
    (
      name: string,
      cryptoAssets: string[],
      type: InvestorType,
      contentTypes: ContentType[]
    ) => {
      const { presetSelected, customAssets: parsedCustomAssets } =
        splitCryptoAssets(cryptoAssets);

      setFormState({
        operatorName: name,
        selectedAssets: presetSelected,
        isOtherSelected: parsedCustomAssets.length > 0,
        customAssets: parsedCustomAssets,
        investorType: type,
        selectedContentTypes: contentTypes,
      });
    },
    []
  );

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError('');

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

  return {
    loading,
    error,
    formState,
    setFormState,
    setError,
  };
}
