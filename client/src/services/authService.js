
import api from './api';


export const registerUser = async ({ name, email, password }) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
  });

  return response.data;
};


export const verifyEmail = async (email, otp) => {
  const response = await api.post('/auth/verify-email', {
    email: email.trim().toLowerCase(),
    otp: otp.trim(),
  });

  return response.data;
};

export const resendVerificationOtp = async (email) => {
  const response = await api.post('/auth/resend-verification', {
    email,
  });

  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
