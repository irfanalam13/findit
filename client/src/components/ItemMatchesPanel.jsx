
import { useItemMatches } from '../features/items/hooks/useItemMatches';

export default function ItemMatchesPanel({ itemId }) {
  const {
    matches,
    loading,
    error,
    refreshMatches,
  } = useItemMatches(itemId);

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
          </article>
        ))}
      </div>
    </section>
  );
}
