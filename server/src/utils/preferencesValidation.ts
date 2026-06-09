import {
  CONTENT_TYPES,
  INVESTOR_TYPES,
  type ContentType,
  type InvestorType,
} from '../constants/domain';
import {
  normalizeCryptoAssets,
  validateCryptoAssets,
} from './assets';

export type PreferencesValidationErrors = Record<string, string>;

export interface SanitizedPreferencesInput {
  name: string;
  cryptoAssets: string[];
  investorType: InvestorType;
  contentTypes: ContentType[];
}

interface PreferencesBody {
  name?: string;
  cryptoAssets?: string[];
  investorType?: string;
  contentTypes?: string[];
}

function isInvestorType(value: string): value is InvestorType {
  return (INVESTOR_TYPES as readonly string[]).includes(value);
}

function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}

export function validatePreferencesBody(
  body: PreferencesBody
):
  | { ok: true; data: SanitizedPreferencesInput }
  | { ok: false; validationErrors: PreferencesValidationErrors } {
  const errors: PreferencesValidationErrors = {};

  if (typeof body.name !== 'string' || !body.name.trim()) {
    errors.name = 'Operator name cannot be empty';
  }

  const { cryptoAssets, investorType, contentTypes } = body;

  if (!Array.isArray(cryptoAssets) || cryptoAssets.length === 0) {
    errors.cryptoAssets =
      'Select at least one crypto asset or add custom symbols under Other +';
  } else {
    const sanitizedAssets = normalizeCryptoAssets(cryptoAssets);
    const assetValidationError = validateCryptoAssets(sanitizedAssets);

    if (assetValidationError) {
      errors.cryptoAssets = assetValidationError;
    }
  }

  if (typeof investorType !== 'string' || !investorType.trim()) {
    errors.investorType = 'Select your investor risk profile.';
  } else if (!isInvestorType(investorType)) {
    errors.investorType = `investorType must be one of: ${INVESTOR_TYPES.join(', ')}`;
  }

  if (!Array.isArray(contentTypes) || contentTypes.length === 0) {
    errors.contentTypes = 'Please select at least one section';
  } else {
    const invalidContentType = contentTypes.find(
      (type) => typeof type !== 'string' || !isContentType(type)
    );

    if (invalidContentType !== undefined) {
      errors.contentTypes = `Each contentType must be one of: ${CONTENT_TYPES.join(', ')}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, validationErrors: errors };
  }

  const sanitizedAssets = normalizeCryptoAssets(cryptoAssets as string[]);

  return {
    ok: true,
    data: {
      name: (body.name as string).trim(),
      cryptoAssets: sanitizedAssets,
      investorType: investorType as InvestorType,
      contentTypes: [...new Set(contentTypes as ContentType[])],
    },
  };
}
