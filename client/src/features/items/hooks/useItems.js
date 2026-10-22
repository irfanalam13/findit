import { useCallback, useEffect, useState } from 'react';

import { getItems } from '../services/itemService';

export function useItems({ type, category, search }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshItems = useCallback(async () => {


    try {
      const data = await getItems({ type, category, search });
      setItems(data.items || []);
      return data.items || [];
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Check your backend.'
          : err.message
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [type, category, search]);

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getItems({ type, category, search });

        if (active) {
          setItems(data.items || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message === 'Failed to fetch'
              ? 'Cannot connect to the server. Check your backend.'
              : err.message
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadItems();

    return () => {
      active = false;
    };
  }, [type, category, search]);

  return { items, setItems, loading, error, refreshItems };
}
