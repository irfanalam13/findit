
import { useCallback, useEffect, useState } from 'react'
import { getItems } from '../services/itemService'

export function useItems({ type, category, search }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshItems = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getItems({ type, category, search })
      setItems(data.items || [])
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Check your backend.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }, [type, category, search])

  useEffect(() => {
    refreshItems()
  }, [refreshItems])

  return { items, setItems, loading, error, refreshItems }
}
