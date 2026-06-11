import { api } from './api';
import type { ApiErrorResponse, DashboardResponse } from '../types';

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>('/dashboard');
  return data;
}

export function getDashboardErrorMessage(error: unknown): string {
  const responseMessage = (
    error as { response?: { data?: ApiErrorResponse } }
  ).response?.data?.message;

  return typeof responseMessage === 'string'
    ? responseMessage
    : 'The terminal glitched. Give it another shot.';
}

export function isOnboardingRequiredError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 400
  );
}
