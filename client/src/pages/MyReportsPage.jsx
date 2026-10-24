import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, LoaderCircle, Package } from 'lucide-react';
import ItemMatchesPanel from '../components/ItemMatchesPanel';
import Navbar from '../components/Navbar';
import { getMyReports } from '../features/profile/profileService';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getMyReports()
      .then((data) => {
        if (active) setReports(data.reports || []);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.data?.message ||
              err.message ||
              'Could not load your reports.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            YOUR ACTIVITY
          </p>
          <h1 className="mt-1 text-3xl font-bold">My Reports</h1>
          <p className="mt-2 text-sm text-slate-500">
            View the lost and found items you have reported.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
            <LoaderCircle className="animate-spin" size={22} />
            Loading your reports...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        ) : reports.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <ClipboardList
              size={36}
              className="mx-auto text-slate-400"
            />
            <h2 className="mt-4 text-lg font-semibold">
              No reports yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your reports will appear here after you submit them.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Package size={17} />
              Browse Home
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-slate-100 text-slate-400">
                    <Package size={32} />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        item.type === 'lost'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.type}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-600">
                      {item.status || 'active'}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold">
                    {item.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <dl className="mt-4 space-y-2 text-sm text-slate-500">
                    <div>
                      <dt className="inline font-semibold">Location: </dt>
                      <dd className="inline">{item.location}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold">Date: </dt>
                      <dd className="inline">
                        {item.dateOccurred
                          ? new Date(item.dateOccurred).toLocaleDateString()
                          : 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold">Reported: </dt>
                      <dd className="inline">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                  {item.status === 'active' && (
                    <ItemMatchesPanel itemId={item._id} />
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}