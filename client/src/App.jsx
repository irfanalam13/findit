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
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-600">
        Checking administrator access...
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

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
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