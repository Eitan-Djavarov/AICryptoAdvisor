import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOADING_MESSAGES } from '../components/DashboardSkeleton';
import {
  getDashboard,
  getDashboardErrorMessage,
  isOnboardingRequiredError,
} from '../services/dashboard.service';
import type { DashboardResponse } from '../types';

export function useDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingMessageIndex(
        (current) => (current + 1) % LOADING_MESSAGES.length
      );
    }, 1400);

    return () => window.clearInterval(interval);
  }, [loading]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (fetchError) {
      setError(getDashboardErrorMessage(fetchError));

      if (isOnboardingRequiredError(fetchError)) {
        navigate('/onboarding');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSettingsSaved = useCallback(() => {
    setDashboard(null);
    setLoading(true);
    void refresh();
  }, [refresh]);

  return {
    dashboard,
    loading,
    loadingMessage: LOADING_MESSAGES[loadingMessageIndex] ?? LOADING_MESSAGES[0],
    error,
    refresh,
    handleSettingsSaved,
  };
}
