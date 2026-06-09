import {
  INVESTOR_TYPES,
  type InvestorType,
} from '../constants/domain';

export interface InvestorProfileMeta {
  welcomeMessage: string;
  terminalTitle: string;
  calibratedLabel: string;
}

const PRODUCT_BRAND_TITLE = 'AI Crypto Advisor';
const DEFAULT_INVESTOR_TYPE_LABEL = 'Investor';

function isInvestorType(value: string): value is InvestorType {
  return (INVESTOR_TYPES as readonly string[]).includes(value);
}

function resolveInvestorTypeLabel(investorType: string): string {
  if (isInvestorType(investorType)) {
    return investorType;
  }

  return DEFAULT_INVESTOR_TYPE_LABEL;
}

function resolveDisplayName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : 'Investor';
}

export function resolveInvestorProfileMeta(
  investorType: string,
  operatorName: string
): InvestorProfileMeta {
  const typeLabel = resolveInvestorTypeLabel(investorType);
  const displayName = resolveDisplayName(operatorName);

  return {
    welcomeMessage: `Welcome back, ${displayName}`,
    terminalTitle: PRODUCT_BRAND_TITLE,
    calibratedLabel: `Mode: ${typeLabel}`,
  };
}
