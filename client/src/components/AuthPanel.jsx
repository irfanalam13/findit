
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPanel({
  onAuthenticated,
  initialMode = 'login',
  initialEmail = '',
  showModeToggle = true,
}) {
    
  const { register, verify, resendOtp, login } = useAuth();

  const [mode, setMode] = useState(initialMode);

  const [email, setEmail] = useState(initialEmail);

  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const runAction = async (action) => {
    setBusy(true);
    setMessage('');
    setError('');

    try {
      const response = await action();
      setMessage(response?.message || 'Operation completed successfully.');
      return response;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Something went wrong. Please try again.',
      );
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const response = await runAction(() => register(email, password));

    if (response) {
      setMode('verify');
      setPassword('');
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail || !/^\d{6}$/.test(cleanOtp)) {
      setError('Enter a valid email and six-digit code.');
      return;
    }

    const response = await runAction(() =>
    verify(cleanEmail, cleanOtp)
  );

    if (response) {
      setOtp('');
      setMode('login');
    }
  };

  const handleResend = async () => {
    await runAction(() => resendOtp(email));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const response = await runAction(() => login(email, password));

    if (response) {
      setPassword('');
      onAuthenticated?.();
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        {mode === 'register'
          ? 'Create your Findit account'
          : mode === 'verify'
            ? 'Verify your email'
            : 'Log in to Findit'}
      </h2>

      <p className="mb-6 text-sm text-gray-600">
        {mode === 'register'
          ? 'Register to report lost or found items.'
          : mode === 'verify'
            ? 'Enter the six-digit code sent to your email.'
            : 'Log in to submit and manage your reports.'}
      </p>

      {message && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={
          mode === 'register'
            ? handleRegister
            : mode === 'verify'
              ? handleVerify
              : handleLogin
        }
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="auth-email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email address
          </label>

          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy || mode === 'verify'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            placeholder="you@example.com"
          />
        </div>

        
        {showModeToggle && mode !== 'verify' && (
          <div>
            <label
              htmlFor="auth-password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="auth-password"
              type="password"
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
              required
              minLength={mode === 'register' ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder={
                mode === 'register'
                  ? 'At least 8 characters'
                  : 'Enter your password'
              }
            />
          </div>
        )}

        {mode === 'verify' && (
          <div>
            <label
              htmlFor="auth-otp"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email verification code
            </label>

            <input
              id="auth-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              disabled={busy}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 tracking-[0.3em] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="000000"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy
            ? 'Please wait...'
            : mode === 'register'
              ? 'Create account'
              : mode === 'verify'
                ? 'Verify email'
                : 'Log in'}
        </button>
      </form>

      {mode === 'verify' && (
        <div className="mt-4 space-y-3 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={busy}
            className="text-sm font-medium text-blue-700 hover:underline disabled:opacity-50"
          >
            Resend verification code
          </button>

          <div>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setOtp('');
                setMessage('');
                setError('');
              }}
              disabled={busy}
              className="text-sm text-gray-600 hover:underline"
            >
              Back to registration
            </button>
          </div>
        </div>
      )}

      {mode !== 'verify' && (
        <p className="mt-5 text-center text-sm text-gray-600">
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setMessage('');
              setError('');
            }}
            disabled={busy}
            className="font-semibold text-blue-700 hover:underline"
          >
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
      )}
    </section>
  );
}
