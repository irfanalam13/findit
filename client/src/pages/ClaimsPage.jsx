
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LoaderCircle,
  ArrowLeft,
  ClipboardCheck,
  RefreshCw,
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
  return value ? new Date(value).toLocaleDateString() : '—';
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

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {received ? 'Claim received' : 'Claim submitted'}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
          {claim.status.replaceAll('_', ' ')}
        </span>
      </div>

      <h2 className="mt-3 text-lg font-bold text-slate-900">
        {lostItem?.title || 'Lost report unavailable'}
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Possible found item: {foundItem?.title || 'Report unavailable'}
      </p>

      {received && claim.claimant && (
        <p className="mt-2 text-sm text-slate-600">
          Claimant:{' '}
          {claim.claimant.name ||
            claim.claimant.username ||
            'Findit user'}
        </p>
      )}

      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
        {claim.message || 'No message provided.'}
      </p>

      <p className="mt-3 text-xs text-slate-500">
        Submitted {formatDate(claim.createdAt)}
        {claim.reviewedAt
          ? ` · Reviewed ${formatDate(claim.reviewedAt)}`
          : ''}
        {claim.reconsiderationRequestedAt
          ? ` · Reconsideration requested ${formatDate(
              claim.reconsiderationRequestedAt,
            )}`
          : ''}
      </p>

      {/* Finder reviews a new claim or a reconsideration request. */}
      {received && canReview && (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => onReview(claim._id, 'accepted')}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reviewingId === claim._id ? 'Saving...' : 'Reject claim'}
          </button>
        </div>
      )}

      {/* Claimant may ask the finder to reconsider a rejection. */}
      {!received && claim.status === 'rejected' && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
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
            className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reconsideringId === claim._id
              ? 'Requesting...'
              : 'Request reconsideration'}
          </button>
        </div>
      )}

      {!received && claim.status === 'reconsideration_requested' && (
        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          Reconsideration requested. Waiting for the finder to review your
          claim again.
        </p>
      )}

      {/* Both participants must confirm the handover. */}
      {claim.status === 'accepted' && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">
            Confirm item handover
          </p>

          <p className="mt-1 text-sm text-amber-800">
            Both users must confirm before the reports are resolved and
            reward points are awarded.
          </p>

          <div className="mt-3 space-y-2 text-sm text-amber-950">
            <p>
              <span className="font-medium">Claimant:</span>{' '}
              {claim.claimantConfirmedReturnAt
                ? `Confirmed ${formatDate(
                    claim.claimantConfirmedReturnAt,
                  )}`
                : 'Waiting for confirmation'}
            </p>

            <p>
              <span className="font-medium">Finder:</span>{' '}
              {claim.finderConfirmedReturnAt
                ? `Confirmed ${formatDate(
                    claim.finderConfirmedReturnAt,
                  )}`
                : 'Waiting for confirmation'}
            </p>
          </div>

          {(
            (received && !claim.finderConfirmedReturnAt) ||
            (!received && !claim.claimantConfirmedReturnAt)
          ) && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onConfirmReturn(claim._id)}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirmingId === claim._id
                ? 'Confirming...'
                : received
                  ? 'Confirm I handed over the item'
                  : 'Confirm I received the item'}
            </button>
          )}

          {claim.claimantConfirmedReturnAt &&
            claim.finderConfirmedReturnAt && (
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                Both confirmations received. Finalizing handover...
              </p>
            )}
        </div>
      )}

      {claim.status === 'completed' && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-semibold">Item handover completed</p>
          <p className="mt-1">
            Both users confirmed the return. The finder should receive
            the configured reward points.
          </p>
        </div>
      )}
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
    if (!silent) {
      setLoading(true);
    }

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

  // Initial load and automatic refresh every 15 seconds.
  // useEffect(() => {
  //   void loadClaims();

  //   const intervalId = window.setInterval(() => {
  //     void loadClaims(true);
  //   }, 15000);

  //   return () => window.clearInterval(intervalId);
  // }, [loadClaims]);
  useEffect(() => {
    let active = true;

    const fetchClaims = async () => {
      try {
        const [mine, received] = await Promise.all([
          getMyClaims(),
          getReceivedClaims(),
        ]);

        if (!active) return;

        setError('');
        setMyClaims(mine.claims || []);
        setReceivedClaims(received.claims || []);
      } catch (err) {
        if (active) {
          setError(
            err.data?.message ||
              err.message ||
              'Could not load claims. Try refreshing.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    // Load claims when the page opens.
    void fetchClaims();

    // Refresh the claims inbox every 15 seconds.
    const intervalId = window.setInterval(() => {
      void fetchClaims();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
    }, []);

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

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/my-reports"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft size={16} />
          Back to My Reports
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              CLAIM MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold">Claims</h1>

            <p className="mt-2 text-sm text-slate-600">
              Manage your claims, review requests, and confirm item returns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadClaims()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {loading ? 'Refreshing...' : 'Refresh claims'}
          </button>
        </div>

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {notice}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
            <LoaderCircle className="animate-spin" size={22} />
            Loading claims...
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            <section>
              <div className="flex items-center gap-2">
                <ClipboardCheck size={20} className="text-indigo-600" />
                <h2 className="text-xl font-bold">Claims I submitted</h2>
              </div>

              {myClaims.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                  You have not submitted any claims yet. Find a possible
                  match in My Reports to get started.
                </p>
              ) : (
                <div className="mt-4 grid gap-4">
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
              <h2 className="text-xl font-bold">Claims I received</h2>

              {receivedClaims.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                  No one has claimed an item from your found reports yet.
                  New claims appear here while this page is open.
                </p>
              ) : (
                <div className="mt-4 grid gap-4">
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
