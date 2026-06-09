import { useEffect, useState } from 'react';
import DashboardSkeleton from './DashboardSkeleton';

const ANALYZING_STEPS = [
  { label: 'Calibrating your investor profile...', progress: 25 },
  { label: 'Mapping your asset watchlist...', progress: 50 },
  { label: 'Generating market briefings...', progress: 75 },
  { label: 'Preparing your command center...', progress: 100 },
] as const;

export default function OnboardingSuccessScreen() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStepIndex((current) =>
        current < ANALYZING_STEPS.length - 1 ? current + 1 : current
      );
    }, 650);

    return () => window.clearInterval(interval);
  }, []);

  const currentStep = ANALYZING_STEPS[stepIndex] ?? ANALYZING_STEPS[0];

  return (
    <DashboardSkeleton
      message={currentStep.label}
      showProgress
      progress={currentStep.progress}
    />
  );
}
