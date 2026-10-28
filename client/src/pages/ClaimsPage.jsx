
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LoaderCircle,
  ArrowLeft,
  ClipboardCheck,
  RefreshCw,
  BadgeCheck,
  ShieldAlert,
  UserRound,
  MapPin,
  CalendarDays,
  Package,
  CheckCircle2,
  Clock3,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import {
  getMyClaims,
  getReceivedClaims,
  reviewClaim,
  requestClaimReconsideration,
  confirmClaimReturn,
} from '../features/items/services/itemService';

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-blue-50 text-blue-700',
    accepted: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    reconsideration_requested: 'bg-amber-50 text-amber-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {(status || 'unknown').replaceAll('_', ' ')}
    </span>
  );
}

function UserInfo({ user, label }) {
  if (!user) return null;

  const displayName =
    user.name || user.username || 'Findit user';

  return (
    <div className="flex min-w-0 items-center gap-3">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt=""
          className="h-11 w-11 shrink-0 rounded-full border border-slate-200 object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <UserRound size={21} />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>

        <p className="truncate text-sm font-semibold text-slate-900">
          {displayName}
        </p>

        {user.username && (
          <p className="truncate text-xs text-slate-500">
            @{user.username}
          </p>
        )}

        {user.isEmailVerified === true && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <BadgeCheck size={13} />
            Email verified
          </span>
        )}

        {user.isEmailVerified === false && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
            <ShieldAlert size={13} />
            Email not verified
          </span>
        )}
      </div>
    </div>
  );
}

function ItemSummary({ item, label, fallback }) {
  if (!item) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-sm text-slate-500">{fallback}</p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title || 'Reported item'}
          className="h-20 w-20 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400">
          <Package size={30} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words font-semibold text-slate-900">
          {item.title || 'Untitled report'}
        </p>

        {item.type && (
          <p className="mt-1 text-xs capitalize text-slate-600">
            {item.type} item
          </p>
        )}

        {item.location && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span>{item.location}</span>
          </p>
        )}

        {item.dateOccurred && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
            <CalendarDays size={14} />
            {formatDate(item.dateOccurred)}
          </p>
        )}
      </div>
    </div>
  );
}

function ClaimCard({
  claim,
  received,
  onReview,
  reviewingId,
  onReconsider,
  reconsideringId,
  onConfirmReturn,
  confirmingId,
}) {
  const busy =
    reviewingId === claim._id ||
    reconsideringId === claim._id ||
    confirmingId === claim._id;

  const lostItem = claim.lostItem;
  const foundItem = claim.foundItem;

  const canReview = [
    'pending',
    'reconsideration_requested',
  ].includes(claim.status);

  const claimantConfirmed = Boolean(claim.claimantConfirmedReturnAt);
  const finderConfirmed = Boolean(claim.finderConfirmedReturnAt);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {received ? 'Claim received' : 'Claim submitted'}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Claim ID: {claim._id}
          </p>
        </div>

        <StatusBadge status={claim.status} />
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {lostItem?.title || 'Lost report unavailable'}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Possible found item:{' '}
            <span className="font-medium text-slate-800">
              {foundItem?.title || 'Report unavailable'}
            </span>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ItemSummary
            item={lostItem}
            label="Lost item"
            fallback="Lost item details are unavailable."
          />

          <ItemSummary
            item={foundItem}
            label="Found item"
            fallback="Found item details are unavailable."
          />
        </div>

        {received && claim.claimant && (
          <div className="rounded-xl border border-slate-200 p-4">
            <UserInfo user={claim.claimant} label="Claimant" />
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Claim message
          </p>

          <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {claim.message || 'No message provided.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Claim timeline
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="text-slate-600">
                Submitted{' '}
                <span className="font-medium text-slate-800">
                  {formatDate(claim.createdAt)}
                </span>
              </p>
            </div>

            {claim.reviewedAt && (
              <div className="flex items-start gap-2">
                <ClipboardCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-slate-400"
                />
                <p className="text-slate-600">
                  Reviewed{' '}
                  <span className="font-medium text-slate-800">
                    {formatDate(claim.reviewedAt)}
                  </span>
                </p>
              </div>
            )}

            {claim.reconsiderationRequestedAt && (
              <div className="flex items-start gap-2">
                <RefreshCw
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <p className="text-slate-600">
                  Reconsideration requested{' '}
                  <span className="font-medium text-slate-800">
                    {formatDate(claim.reconsiderationRequestedAt)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {received && canReview && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <p className="font-semibold text-slate-900">
              Review this claim
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Check the claimant's message and report details before making
              your decision.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => onReview(claim._id, 'accepted')}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reviewingId === claim._id
                  ? 'Saving...'
                  : claim.status === 'reconsideration_requested'
                    ? 'Accept reconsideration'
                    : 'Accept claim'}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => onReview(claim._id, 'rejected')}
                className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reviewingId === claim._id ? 'Saving...' : 'Reject claim'}
              </button>
            </div>
          </div>
        )}

        {!received && claim.status === 'rejected' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-900">
              Claim rejected
            </p>

            <p className="mt-1 text-sm text-amber-800">
              If you believe this was a mistake, you can ask the finder to
              review your claim again.
            </p>

            <button
              type="button"
              disabled={busy}
              onClick={() => onReconsider(claim._id)}
              className="mt-3 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reconsideringId === claim._id
                ? 'Requesting...'
                : 'Request reconsideration'}
            </button>
          </div>
        )}

        {!received && claim.status === 'reconsideration_requested' && (
          <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            Reconsideration requested. The finder needs to review your claim
            again.
          </p>
        )}

        {claim.status === 'accepted' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-950">
              Confirm item handover
            </h3>

            <p className="mt-1 text-sm leading-5 text-amber-900">
              Both the claimant and finder must confirm the handover before
              the claim is completed and eligible reward points are issued.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                {claimantConfirmed ? (
                  <CheckCircle2 size={17} className="text-emerald-600" />
                ) : (
                  <Clock3 size={17} className="text-amber-600" />
                )}

                <span className="font-medium text-slate-800">
                  Claimant:
                </span>

                <span className="text-slate-600">
                  {claimantConfirmed
                    ? `Confirmed ${formatDate(claim.claimantConfirmedReturnAt)}`
                    : 'Waiting for confirmation'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {finderConfirmed ? (
                  <CheckCircle2 size={17} className="text-emerald-600" />
                ) : (
                  <Clock3 size={17} className="text-amber-600" />
                )}

                <span className="font-medium text-slate-800">
                  Finder:
                </span>

                <span className="text-slate-600">
                  {finderConfirmed
                    ? `Confirmed ${formatDate(claim.finderConfirmedReturnAt)}`
                    : 'Waiting for confirmation'}
                </span>
              </div>
            </div>

            {((received && !finderConfirmed) ||
              (!received && !claimantConfirmed)) && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onConfirmReturn(claim._id)}
                className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {confirmingId === claim._id
                  ? 'Confirming...'
                  : received
                    ? 'Confirm I handed over the item'
                    : 'Confirm I received the item'}
              </button>
            )}

            {claimantConfirmed && finderConfirmed && (
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                Both confirmations received. Finalizing handover...
              </p>
            )}
          </div>
        )}

        {claim.status === 'completed' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-700" />
              <h3 className="font-semibold text-emerald-900">
                Item handover completed
              </h3>
            </div>

            <p className="mt-2 text-sm leading-5 text-emerald-800">
              Both users confirmed the return. The claim is complete and
              eligible for the configured reward process.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export default function ClaimsPage() {
  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState('');
  const [reconsideringId, setReconsideringId] = useState('');
  const [confirmingId, setConfirmingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadClaims = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const [mine, received] = await Promise.all([
        getMyClaims(),
        getReceivedClaims(),
      ]);

      setMyClaims(mine.claims || []);
      setReceivedClaims(received.claims || []);
      setError('');
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not load claims. Try refreshing.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => {
      void loadClaims();
    }, 0);

    const intervalId = window.setInterval(() => {
      void loadClaims(true);
    }, 15000);

    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [loadClaims]);

  async function handleReview(claimId, decision) {
    setReviewingId(claimId);
    setError('');
    setNotice('');

    try {
      const result = await reviewClaim(claimId, decision);

      setNotice(
        result.message ||
          (decision === 'accepted'
            ? 'Claim accepted.'
            : 'Claim rejected.'),
      );

      await loadClaims(true);
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not update the claim.',
      );
    } finally {
      setReviewingId('');
    }
  }

  async function handleReconsideration(claimId) {
    setReconsideringId(claimId);
    setError('');
    setNotice('');

    try {
      const result = await requestClaimReconsideration(claimId);

      setNotice(
        result.message || 'Reconsideration requested successfully.',
      );

      await loadClaims(true);
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not request reconsideration.',
      );
    } finally {
      setReconsideringId('');
    }
  }

  async function handleConfirmReturn(claimId) {
    setConfirmingId(claimId);
    setError('');
    setNotice('');

    try {
      const result = await confirmClaimReturn(claimId);

      setNotice(
        result.message || 'Your handover confirmation has been saved.',
      );

      await loadClaims(true);
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not confirm the handover.',
      );
    } finally {
      setConfirmingId('');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/my-reports"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft size={16} />
          Back to My Reports
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-indigo-600">
              CLAIM MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Claims
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Review claims, follow reconsideration requests, and confirm
              returned items.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadClaims()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {loading ? 'Refreshing...' : 'Refresh claims'}
          </button>
        </div>

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {notice}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
            <LoaderCircle className="animate-spin" size={22} />
            Loading claims...
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            <section>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
                  <ClipboardCheck size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Claims I submitted
                  </h2>
                  <p className="text-sm text-slate-500">
                    Claims you submitted for lost items
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                  {myClaims.length}
                </span>
              </div>

              {myClaims.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <Package
                    size={32}
                    className="mx-auto text-slate-400"
                  />
                  <p className="mt-3 font-semibold text-slate-800">
                    No submitted claims yet
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Find a possible match in My Reports to get started.
                  </p>
                  <Link
                    to="/my-reports"
                    className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Go to My Reports
                  </Link>
                </div>
              ) : (
                <div className="mt-4 grid gap-5">
                  {myClaims.map((claim) => (
                    <ClaimCard
                      key={claim._id}
                      claim={claim}
                      received={false}
                      reviewingId={reviewingId}
                      onReview={handleReview}
                      onReconsider={handleReconsideration}
                      reconsideringId={reconsideringId}
                      onConfirmReturn={handleConfirmReturn}
                      confirmingId={confirmingId}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <ClipboardCheck size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Claims I received
                  </h2>
                  <p className="text-sm text-slate-500">
                    Claims submitted against your found reports
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                  {receivedClaims.length}
                </span>
              </div>

              {receivedClaims.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <UserRound
                    size={32}
                    className="mx-auto text-slate-400"
                  />
                  <p className="mt-3 font-semibold text-slate-800">
                    No claims received
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Claims against your found reports will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-5">
                  {receivedClaims.map((claim) => (
                    <ClaimCard
                      key={claim._id}
                      claim={claim}
                      received
                      reviewingId={reviewingId}
                      onReview={handleReview}
                      onReconsider={handleReconsideration}
                      reconsideringId={reconsideringId}
                      onConfirmReturn={handleConfirmReturn}
                      confirmingId={confirmingId}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
