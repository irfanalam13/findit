
import { getErrorMessage } from './errorHandler'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function apiRequest(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body &&
        !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : {}

  if (!response.ok) {
    const error = new Error(
      data.message ||
        data.error ||
        `Request failed with status ${response.status}`
    )

    error.status = response.status
    error.data = data

    throw error
  }

  return data
}
