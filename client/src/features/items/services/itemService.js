
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