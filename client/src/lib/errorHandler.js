
export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (!error) return fallback

  // API or regular JavaScript errors
  if (error.message && error.message !== 'Failed to fetch') {
    return error.message
  }

  // Network errors
  if (
    error.message === 'Failed to fetch' ||
    error.name === 'TypeError'
  ) {
    return 'Unable to connect to the server. Please try again.'
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return 'Please check your input and try again.'
  }

  return fallback
}

export function handleError(error, fallback) {
  const message = getErrorMessage(error, fallback)

  console.error('[FindIt Error]', error)

  return message
}
