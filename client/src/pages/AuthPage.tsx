import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

type AuthTab = 'login' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, onboardingCompleted, loading } =
    useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <LoadingSpinner label="Verifying your session..." size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate to={onboardingCompleted ? '/dashboard' : '/onboarding'} replace />
    );
  }

  const validateForm = (): string | null => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (activeTab === 'signup' && !name.trim()) return 'Name is required';
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const authenticatedUser =
        activeTab === 'login'
          ? await login(email.trim(), password)
          : await register(name.trim(), email.trim(), password);

      navigate(
        authenticatedUser.onboardingCompleted ? '/dashboard' : '/onboarding'
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
            <span className="text-lg font-semibold tracking-tight text-zinc-300">
              ₿
            </span>
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            AI Crypto Advisor
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            Sign in to your terminal
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Institutional-grade crypto intelligence
          </p>
        </div>

        <div className="glass-panel overflow-hidden rounded-xl">
          <div className="grid grid-cols-2 border-b border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`btn-interactive px-4 py-4 text-sm font-medium transition-all duration-300 ease-out ${
                activeTab === 'login'
                  ? 'border-b border-zinc-100 bg-zinc-900 text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
              className={`btn-interactive px-4 py-4 text-sm font-medium transition-all duration-300 ease-out ${
                activeTab === 'signup'
                  ? 'border-b border-zinc-100 bg-zinc-900 text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            {activeTab === 'signup' ? (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                  className="input-field w-full rounded-lg px-4 py-3 text-sm"
                  autoComplete="name"
                />
              </div>
            ) : null}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="input-field w-full rounded-lg px-4 py-3 text-sm"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                className="input-field w-full rounded-lg px-4 py-3 text-sm"
                autoComplete={
                  activeTab === 'login' ? 'current-password' : 'new-password'
                }
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/30 border-t-zinc-950" />
                  {activeTab === 'login'
                    ? 'Signing in...'
                    : 'Creating account...'}
                </>
              ) : activeTab === 'login' ? (
                'Enter Terminal'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
