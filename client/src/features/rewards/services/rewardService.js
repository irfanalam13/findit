import { apiRequest } from '../../../lib/api';

export function getMyRewards() {
  return apiRequest('/rewards/me', {
    credentials: 'include',
  });
}