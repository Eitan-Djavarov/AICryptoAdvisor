import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-500" />
        <p className="text-sm font-medium text-zinc-400 sm:text-base">
          Booting your secure session...
        </p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  requireOnboarding = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, onboardingCompleted, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isOnboardingRoute = location.pathname === '/onboarding';

  if (!onboardingCompleted && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireOnboarding && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboardingCompleted && isOnboardingRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
