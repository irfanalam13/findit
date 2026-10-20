
import { useState } from 'react';
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { registerUser } from '../services/authService';

export default function RegisterForm({ onRegistered, onLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (name.length < 2 || name.length > 80) {
      setError('Enter your full name (2–80 characters).');
      return;
    }

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError('Your password exceeds the maximum supported length.');
      return;
    }

    if (password !== form.confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setBusy(true);

    try {
      const response = await registerUser({
        name,
        email,
        password,
      });

      // Registration succeeded: continue to email verification.
      onRegistered?.({
        name,
        email,
        message: response.message,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to create your account. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50';

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
      <div className="mb-7">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
          <UserRound size={50} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your Findit account
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Join the community helping people recover lost belongings.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-slate-700">
            Full name
          </label>

          <div className="relative">
            <UserRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              value={form.name}
              onChange={updateField}
              disabled={busy}
              placeholder="Enter your full name"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-700">
            Email address
          </label>

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={form.email}
              onChange={updateField}
              disabled={busy}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>

          <div className="relative">
            <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={updateField}
              disabled={busy}
              placeholder="At least 8 characters"
              className={`${inputClass} pr-8`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Use at least 8 characters and avoid reusing another password.
          </p>
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">
            Confirm password
          </label>

          <div className="relative">
            <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={updateField}
              disabled={busy}
              placeholder="Enter your password again"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-indigo-600" />
        <p className="text-xs leading-5 text-slate-600">
          We will send a verification code to your email. You must verify your
          account before submitting lost or found reports.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onLogin}
          disabled={busy}
          className="font-semibold text-indigo-700 hover:underline"
        >
          Log in
        </button>
      </p>
    </section>
  );
}
