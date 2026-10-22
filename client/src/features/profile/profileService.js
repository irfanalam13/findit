
import { apiRequest } from '../../lib/api';

export async function getMyProfile() {
  return apiRequest('/profiles/me', {
    credentials: 'include',
  });
}

export async function updateMyProfile(profile) {
  return apiRequest('/profiles/me', {
    method: 'PATCH',
    credentials: 'include',
    body: JSON.stringify(profile),
  });
}

export async function getMyReports() {
  return apiRequest('/profiles/me/reports', {
    credentials: 'include',
  });
}
