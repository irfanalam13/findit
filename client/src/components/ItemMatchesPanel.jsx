
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useItemMatches } from '../features/items/hooks/useItemMatches';
import { submitClaim } from '../features/items/services/itemService';

export default function ItemMatchesPanel({ itemId, itemType }) {
  const {
    matches,
    loading,
    error,
    refreshMatches,
  } = useItemMatches(itemId);

  const [claimingId, setClaimingId] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [claimError, setClaimError] = useState('');

  async function handleClaim(foundItemId) {
    setClaimingId(foundItemId);
    setNotice('');
    setClaimError('');

    try {
      const result = await submitClaim({
        lostItemId: itemId,
        foundItemId,
        message,
      });

      setNotice(
        result.duplicate
          ? 'You have already submitted this claim.'
          : 'Your claim was submitted successfully.',
      );
      setMessage('');
    } catch (err) {
      setClaimError(
        err.data?.message ||
          err.message ||
          'Could not submit your claim.',
      );
    } finally {
      setClaimingId('');
    }
  }

  return (
    <section className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            Potential matches
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Suggestions are not proof of ownership.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refreshMatches()}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <p className="mt-4 text-sm text-slate-500">
          Finding possible matches...
        </p>
      )}

      {error && (
        <div role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <p role="status" className="mt-4 text-sm text-emerald-700">
          {notice}{' '}
          <Link className="font-semibold underline" to="/claims">
            View claims
          </Link>
        </p>
      )}

      {claimError && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {claimError}
        </p>
      )}

      {!loading && !error && matches.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">
          No strong candidates yet. New reports may match later.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {matches.map(({ item, score, reasons }) => (
          <article
            key={item._id}
            className="rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-indigo-600">
                  {item.type} report
                </p>
                <h4 className="mt-1 font-semibold text-slate-900">
                  {item.title}
                </h4>
              </div>

              <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-800">
                {score}/100
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              {item.description}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {item.location} ·{' '}
              {item.dateOccurred
                ? new Date(item.dateOccurred).toLocaleDateString()
                : 'Date unknown'}
            </p>

            {reasons.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {reasons.map((reason) => (
                  <li
                    key={reason}
                    className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            )}

            {itemType === 'lost' && item.type === 'found' && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <label
                  htmlFor={`claim-message-${item._id}`}
                  className="block text-sm font-medium text-slate-700"
                >
                  Message to the finder (optional)
                </label>

                <textarea
                  id={`claim-message-${item._id}`}
                  // value={claimingId === item._id ? message : undefined}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={1000}
                  rows={2}
                  placeholder="Describe why you believe this item is yours. Avoid posting sensitive information."
                  className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => void handleClaim(item._id)}
                  disabled={Boolean(claimingId)}
                  className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {claimingId === item._id
                    ? 'Submitting...'
                    : 'Submit claim'}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
