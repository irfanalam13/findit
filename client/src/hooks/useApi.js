
import { useCallback, useState } from 'react'
import { notify } from '../lib/toast'
import { handleError } from '../lib/errorHandler'

export default function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (
      apiFunction,
      {
        successMessage,
        errorMessage = 'The operation failed.',
        showSuccess = Boolean(successMessage),
        showError = true,
      } = {}
    ) => {
      setLoading(true)
      setError(null)

      try {
        const result = await apiFunction()

        if (showSuccess && successMessage) {
          notify.success(successMessage)
        }

        return result
      } catch (err) {
        const message = handleError(err, errorMessage)

        setError(message)

        if (showError) {
          notify.error(message)
        }

        // Return null so callers can handle failure without
        // producing an unhandled rejected promise.
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { execute, loading, error, setError }
}
