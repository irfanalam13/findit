import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  LoaderCircle,
  Package,
  RefreshCw,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import ItemCard from '../components/ItemCard';
import ItemFormModal from '../components/ItemFormModal';
import { useItems } from '../features/items/hooks/useItems';

const categories = [
  'all',
  'electronics',
  'wallet',
  'keys',
  'documents',
  'clothing',
  'bags',
  'accessories',
  'other',
];

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');

  const [modalOpen, setModalOpen] = useState(
    () =>
      new URLSearchParams(location.search).get('openReport') === '1'
  );

  const [notice, setNotice] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    items,
    loading,
    error,
    refreshItems,
  } = useItems({ type, category, search });

  const lostCount = items.filter(
    (item) => item.type === 'lost'
  ).length;

  const foundCount = items.filter(
    (item) => item.type === 'found'
  ).length;

  function clearReportQuery() {
    if (
      new URLSearchParams(location.search).get('openReport') === '1'
    ) {
      navigate(
        {
          pathname: location.pathname,
          search: '',
          hash: location.hash,
        },
        { replace: true }
      );
    }
  }

  function handleCloseReport() {
    setModalOpen(false);
    clearReportQuery();
  }

  function handleCreated() {
    setModalOpen(false);
    setNotice('Your item report has been created.');
    clearReportQuery();
    void refreshItems();
  }

  function handleReportClick() {
    setNotice('');
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar onReportClick={handleReportClick} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-indigo-950 px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Bringing lost belongings home
            </span>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Lost something?
              <br />
              <span className="text-indigo-300">
                Let's find it.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-100 sm:text-base">
              Search community reports, report something you've found,
              and help belongings get back to their rightful owners.
            </p>

            <div className="mt-7">
              <SearchBar
                value={search}
                onChange={setSearch}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Active reports"
            value={items.length}
            icon={Package}
            color="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            label="Lost items"
            value={lostCount}
            icon={AlertCircle}
            color="bg-amber-50 text-amber-600"
          />

          <StatCard
            label="Found items"
            value={foundCount}
            icon={AlertCircle}
            color="bg-emerald-50 text-emerald-600"
          />
        </section>

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-indigo-600">
                COMMUNITY BOARD
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Browse reports
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search reports and explore the latest items.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ['all', 'All items'],
                ['lost', 'Lost'],
                ['found', 'Found'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    type === value
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold capitalize ${
                  category === value
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                {value === 'all' ? 'All categories' : value}
              </button>
            ))}
          </div>

          {notice && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800"
            >
              {notice}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void refreshItems()}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-800"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
              <LoaderCircle
                className="animate-spin"
                size={22}
              />
              Loading reports...
            </div>
          ) : !error && items.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <Package
                className="mx-auto text-slate-400"
                size={36}
              />

              <h3 className="mt-4 text-lg font-semibold">
                No reports found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another filter or create the first report.
              </p>

              <button
                type="button"
                onClick={handleReportClick}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Report an item
              </button>
            </div>
          ) : !error ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onView={(selected) => setSelectedItem(selected)}
                />
              ))}
            </div>
          ) : null}
        </section>

        <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          FindIt · Helping communities reunite people with their belongings.
        </footer>
      </main>

      {modalOpen && (
        <ItemFormModal
          onClose={handleCloseReport}
          onCreated={handleCreated}
        />
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="item-detail-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-indigo-600">
                  {selectedItem.type} report
                </p>

                <h2
                  id="item-detail-title"
                  className="mt-1 text-xl font-bold"
                >
                  {selectedItem.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {selectedItem.imageUrl && (
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="mt-4 max-h-64 w-full rounded-xl object-cover"
              />
            )}

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {selectedItem.description}
            </p>

            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="inline font-semibold">
                  Category:{' '}
                </dt>
                <dd className="inline capitalize">
                  {selectedItem.category}
                </dd>
              </div>

              <div>
                <dt className="inline font-semibold">Color: </dt>
                <dd className="inline">
                  {selectedItem.color || 'Not specified'}
                </dd>
              </div>

              <div>
                <dt className="inline font-semibold">
                  Location:{' '}
                </dt>
                <dd className="inline">
                  {selectedItem.location}
                </dd>
              </div>

              <div>
                <dt className="inline font-semibold">Date: </dt>
                <dd className="inline">
                  {selectedItem.dateOccurred
                    ? new Date(
                        selectedItem.dateOccurred
                      ).toLocaleDateString()
                    : 'Not specified'}
                </dd>
              </div>
            </dl>

            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              Ownership claims and verified contact options will be
              added in a later phase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
