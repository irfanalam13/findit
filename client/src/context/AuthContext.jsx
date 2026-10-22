import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resendVerificationOtp,
  verifyEmail,
} from '../services/authService';

import { AuthContext } from './auth-context';

const extractUser = (response) => {
  return response?.user ?? response?.data?.user ?? null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetchCurrentUser();
      const currentUser = extractUser(response);

      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize authentication without calling a state-updating
  // function directly from the effect body.
  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const response = await fetchCurrentUser();
        const currentUser = extractUser(response);

        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      active = false;
    };
  }, []);

  const register = async (email, password) => {
    return registerUser(email, password);
  };

  const verify = async (email, otp) => {
    return verifyEmail(email, otp);
  };

  const resendOtp = async (email) => {
    return resendVerificationOtp(email);
  };

  const login = async (email, password) => {
    const response = await loginUser(email, password);
    const loggedInUser = extractUser(response);

    if (!loggedInUser) {
      await refreshUser();
    } else {
      setUser(loggedInUser);
      setLoading(false);
    }

    return response;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    register,
    verify,
    resendOtp,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
