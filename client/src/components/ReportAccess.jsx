
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPanel from './AuthPanel';

export default function ReportAccess({ children }) {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Checking your session...
      </div>
    );
  }

  if (user?.isEmailVerified) {
    return children;
  }

  return (
    <section className="mx-auto max-w-2xl p-4">
      {!showAuth ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Log in to submit a report
          </h2>

          <p className="mt-2 text-gray-600">
            You can browse reports publicly. To report a lost or found item,
            log in with your verified email account.
          </p>

          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="mt-4 rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
          >
            Log in or register
          </button>
        </div>
      ) : (
        <AuthPanel onAuthenticated={() => setShowAuth(false)} />
      )}
    </section>
  );
}
