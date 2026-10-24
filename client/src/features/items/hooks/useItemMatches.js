import { useCallback, useEffect, useState } from 'react';

import { getItemMatches } from '../services/itemService';

export function useItemMatches(itemId, enabled = true) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = useCallback(async () => {
    if (!itemId || !enabled) {
      return [];
    }

    setLoading(true);
    setError('');

    try {
      const data = await getItemMatches(itemId);
      const nextMatches = data?.matches || [];

      setMatches(nextMatches);
      return nextMatches;
    } catch (err) {
      setError(
        err.message || 'Could not load potential matches.'
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [itemId, enabled]);

  const refreshMatches = useCallback(() => {
    return loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    if (!itemId || !enabled) {
      return undefined;
    }

    let active = true;

    const fetchMatches = async () => {
      try {
        const data = await getItemMatches(itemId);

        if (active) {
          setMatches(data?.matches || []);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Could not load potential matches.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchMatches();

    return () => {
      active = false;
    };
  }, [itemId, enabled]);

  return {
    matches: itemId && enabled ? matches : [],
    loading: Boolean(itemId && enabled && loading),
    error: itemId && enabled ? error : '',
    refreshMatches,
  };
}
