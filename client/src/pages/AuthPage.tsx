import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthPageHeader from '../components/auth/AuthPageHeader';
import AuthTabSwitcher, { type AuthTab } from '../components/auth/AuthTabSwitcher';
import AuthFormFields from '../components/auth/AuthFormFields';
import AuthFormActions from '../components/auth/AuthFormActions';

export default function AuthPage() {
  const navigate = useNavigate();
  const {
    login,
    register,
    isAuthenticated,
    onboardingCompleted,
    loading: authLoading,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
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

  const handleSelectTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setError('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-md">
        <AuthPageHeader />

        <div className="glass-panel overflow-hidden rounded-xl">
          <AuthTabSwitcher activeTab={activeTab} onSelectTab={handleSelectTab} />

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            <AuthFormFields
              activeTab={activeTab}
              name={name}
              email={email}
              password={password}
              showPassword={showPassword}
              onNameChange={setName}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onToggleShowPassword={() =>
                setShowPassword((current) => !current)
              }
            />

            <AuthFormActions
              activeTab={activeTab}
              loading={loading}
              error={error}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
