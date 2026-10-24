
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
}) {
  const busy =
    reviewingId === claim._id ||
    reconsideringId === claim._id;

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

      {received && canReview && (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy || Boolean(reviewingId) || Boolean(reconsideringId)}
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
            disabled={busy || Boolean(reviewingId) || Boolean(reconsideringId)}
            onClick={() => onReview(claim._id, 'rejected')}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reviewingId === claim._id ? 'Saving...' : 'Reject claim'}
          </button>
        </div>
      )}

      {!received && claim.status === 'rejected' && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Claim rejected
          </p>

          <p className="mt-1 text-sm text-amber-800">
            If you believe the claim was rejected by mistake, you can ask
            the finder to review it again.
          </p>

          <button
            type="button"
            disabled={
              busy ||
              Boolean(reviewingId) ||
              Boolean(reconsideringId)
            }
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

      {claim.status === 'accepted' && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Claim accepted. The physical handover still needs to be confirmed.
        </p>
      )}

      {claim.status === 'completed' && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Item handover completed.
        </p>
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
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadClaims = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    setError('');

    try {
      const [mine, received] = await Promise.all([
        getMyClaims(),
        getReceivedClaims(),
      ]);

      setMyClaims(mine.claims || []);
      setReceivedClaims(received.claims || []);
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not load claims. Try refreshing.',
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadClaims();

    // Refresh the inbox every 15 seconds while this page is open.
    const intervalId = window.setInterval(() => {
      void loadClaims(true);
    }, 15000);

    return () => window.clearInterval(intervalId);
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
              Track your submitted claims and review requests for items
              you reported as found.
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
                  New claims will appear here while this page is open.
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
