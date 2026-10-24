
import { apiRequest } from '../../../lib/api'

export function getItems({ type, category, search } = {}) {
  const params = new URLSearchParams()

  if (type && type !== 'all') params.set('type', type)
  if (category && category !== 'all') {
    params.set('category', category)
  }
  if (search?.trim()) params.set('search', search.trim())

  return apiRequest(`/items?${params.toString()}`)
}


export function createItem(itemData) {
  return apiRequest('/items', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(itemData),
  });
}


export function getItemMatches(itemId) {
  if (!itemId) {
    throw new Error('An item ID is required.');
  }

  return apiRequest(
    `/items/${encodeURIComponent(itemId)}/matches`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
}


export function submitClaim({ lostItemId, foundItemId, message }) {
  return apiRequest('/claims', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      lostItemId,
      foundItemId,
      message,
    }),
  });
}

export function getMyClaims() {
  return apiRequest('/claims/mine', {
    credentials: 'include',
  });
}

export function getReceivedClaims() {
  return apiRequest('/claims/received', {
    credentials: 'include',
  });
}

export function reviewClaim(claimId, decision) {
  return apiRequest(
    `/claims/${encodeURIComponent(claimId)}/review`,
    {
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify({ decision }),
    },
  );
}



export function requestClaimReconsideration(claimId) {
  return apiRequest(
    `/claims/${encodeURIComponent(claimId)}/reconsider`,
    {
      method: 'POST',
      credentials: 'include',
    },
  );
}
