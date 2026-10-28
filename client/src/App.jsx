import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MyReportsPage from './pages/MyReportsPage';
import AuthPage from './pages/AuthPage';
import ClaimsPage from './pages/ClaimsPage';
import RewardsPage from './pages/RewardsPage';
import AdminPage from './pages/AdminPage';

import ToastProvider from './components/ToastProvider';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-600">
        Checking your session...
      </div>
    );
  }

  if (!user?.isEmailVerified) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}


function RequireAdmin({ children }) {
  const { refreshUser } = useAuth();
  const location = useLocation();

  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkFailed, setCheckFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAdminAccess() {
      try {
        // Fetch the current user from the backend instead of
        // trusting a potentially stale React context value.
        const freshUser = await refreshUser();

        if (!cancelled) {
          setCurrentUser(freshUser);
          setCheckFailed(!freshUser);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
          setCheckFailed(true);
        }
      } finally {
        if (!cancelled) {
          setCheckingAdmin(false);
        }
      }
    }

    void verifyAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  if (checkingAdmin) {
    return (
      <div className="p-8 text-center text-slate-600">
        Verifying administrator access...
      </div>
    );
  }

  if (checkFailed || !currentUser) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (!currentUser.isEmailVerified) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">
          Administrator access required
        </h1>
        <p className="mt-2 text-slate-600">
          Your current account does not have administrator privileges.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Return home
        </button>
      </div>
    );
  }

  return children;
}


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />

      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />

      <Route
        path="/my-reports"
        element={
          <RequireAuth>
            <MyReportsPage />
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        }
      />

      <Route
        path="/claims"
        element={
          <RequireAuth>
            <ClaimsPage />
          </RequireAuth>
        }
      />

      <Route
        path="/rewards"
        element={
          <RequireAuth>
            <RewardsPage />
          </RequireAuth>
        }
      />

      {/* Keep the fallback route last. */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}