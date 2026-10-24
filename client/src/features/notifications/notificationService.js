import { apiRequest } from '../../lib/api';

export function getNotifications() {
  return apiRequest('/notifications', {
    credentials: 'include',
  });
}

export function markNotificationRead(notificationId) {
  return apiRequest(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: 'PATCH',
      credentials: 'include',
    },
  );
}

export function markAllNotificationsRead() {
  return apiRequest('/notifications/read-all', {
    method: 'PATCH',
    credentials: 'include',
  });
}