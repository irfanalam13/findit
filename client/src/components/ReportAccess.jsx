
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RegisterForm from './RegisterForm';
import AuthPanel from './AuthPanel';

export default function ReportAccess({ children }) {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState('login');
  const [pendingEmail, setPendingEmail] = useState('');



  if (loading) {
    return (
      <div className="p-6 text-center text-slate-600">
        Checking your session...
      </div>
    );
  }

  if (user?.isEmailVerified) {
    return children;
  }

  return (
    <section className="mx-auto w-full max-w-lg">
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-lg px-4 py-3 text-sm font-semibold ${
            mode === 'login'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600'
          }`}
        >
          Log in
        </button>

        <button
          type="button"
          onClick={() => setMode('register')}
          className={`rounded-lg px-4 py-3 text-sm font-semibold ${
            mode === 'register'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600'
          }`}
        >
          Create account
        </button>
      </div>

      {mode === 'register' ? (
        <RegisterForm
          onRegistered={({ email }) => {
            setPendingEmail(email);
            setMode('verify');
          }}
          onLogin={() => setMode('login')}
        />
                ) : mode === 'verify' ? (
        <AuthPanel
          key={pendingEmail}
          initialMode="verify"
          initialEmail={pendingEmail}
        />
      ) : (
        <AuthPanel initialMode="login" />
      )}
    </section>
  );
}
