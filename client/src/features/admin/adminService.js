import { apiRequest } from '../../lib/api';

export function getAdminOverview() {
  return apiRequest('/admin/overview');
}

export function getAdminUsers(search = '') {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set('search', search.trim());
  }

  params.set('limit', '100');

  return apiRequest(`/admin/users?${params.toString()}`);
}

export function getAdminReports() {
  return apiRequest('/admin/reports?limit=100');
}

export function getAdminClaims() {
  return apiRequest('/admin/claims?limit=100');
}

export function setReportVisibility(reportId, hidden, reason = '') {
  return apiRequest(
    `/admin/reports/${encodeURIComponent(reportId)}/visibility`,
    {
      method: 'PATCH',
      body: JSON.stringify({ hidden, reason }),
    },
  );
}

export function setUserSuspension(userId, suspended, reason = '') {
  return apiRequest(
    `/admin/users/${encodeURIComponent(userId)}/suspension`,
    {
      method: 'PATCH',
      body: JSON.stringify({ suspended, reason }),
    },
  );
}