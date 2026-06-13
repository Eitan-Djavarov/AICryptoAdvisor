import { Eye, EyeOff } from 'lucide-react';
import type { AuthTab } from './AuthTabSwitcher';

export interface AuthFormFieldsProps {
  activeTab: AuthTab;
  name: string;
  email: string;
  password: string;
  showPassword: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
}

export default function AuthFormFields({
  activeTab,
  name,
  email,
  password,
  showPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onToggleShowPassword,
}: AuthFormFieldsProps) {
  return (
    <>
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
            onChange={(event) => onNameChange(event.target.value)}
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
          onChange={(event) => onEmailChange(event.target.value)}
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
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Minimum 8 characters"
            className="input-field w-full rounded-lg px-4 py-3 pr-11 text-sm"
            autoComplete={
              activeTab === 'login' ? 'current-password' : 'new-password'
            }
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
