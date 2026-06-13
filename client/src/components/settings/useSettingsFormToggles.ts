import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { ContentType, InvestorType } from '../../types';
import type { SettingsFormState } from './useSettingsPreferencesLoader';

export function useSettingsFormToggles(
  setFormState: Dispatch<SetStateAction<SettingsFormState>>
) {
  const toggleAsset = useCallback((asset: string) => {
    setFormState((current) => ({
      ...current,
      selectedAssets: current.selectedAssets.includes(asset)
        ? current.selectedAssets.filter((item) => item !== asset)
        : [...current.selectedAssets, asset],
    }));
  }, [setFormState]);

  const toggleOtherAsset = useCallback(() => {
    setFormState((current) => ({
      ...current,
      isOtherSelected: !current.isOtherSelected,
      customAssets: current.isOtherSelected ? [] : current.customAssets,
    }));
  }, [setFormState]);

  const selectInvestorType = useCallback((type: InvestorType) => {
    setFormState((current) => ({
      ...current,
      investorType: type,
    }));
  }, [setFormState]);

  const toggleContentType = useCallback((contentType: ContentType) => {
    setFormState((current) => ({
      ...current,
      selectedContentTypes: current.selectedContentTypes.includes(contentType)
        ? current.selectedContentTypes.filter((item) => item !== contentType)
        : [...current.selectedContentTypes, contentType],
    }));
  }, [setFormState]);

  const setOperatorName = useCallback(
    (name: string) => {
      setFormState((current) => ({
        ...current,
        operatorName: name,
      }));
    },
    [setFormState]
  );

  const setCustomAssets = useCallback(
    (assets: string[]) => {
      setFormState((current) => ({
        ...current,
        customAssets: assets,
      }));
    },
    [setFormState]
  );

  return {
    toggleAsset,
    toggleOtherAsset,
    selectInvestorType,
    toggleContentType,
    setOperatorName,
    setCustomAssets,
  };
}
