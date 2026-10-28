import { useCallback, useEffect, useState } from 'react';
import {
  Trophy,
  Sparkles,
  PackageCheck,
  Clock3,
  RefreshCw,
  AlertCircle,
  MapPin,
  CalendarDays,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import { getMyRewards } from '../features/rewards/services/rewardService';

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

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-500">
          {label}
        </span>

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={21} />
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </article>
  );
}

export default function RewardsPage() {
  const [summary, setSummary] = useState({
    totalPoints: 0,
    rewardCount: 0,
  });

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRewards = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const result = await getMyRewards();

      setSummary({
        totalPoints: result.summary?.totalPoints ?? 0,
        rewardCount: result.summary?.rewardCount ?? 0,
      });

      setRewards(
        Array.isArray(result.rewards) ? result.rewards : [],
      );

      setError('');
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not load your rewards. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRewards(true);
  }, [loadRewards]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-indigo-600">
              COMMUNITY CONTRIBUTIONS
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              My Rewards
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Track the points you have earned by helping return
              lost items to their owners.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadRewards()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {loading ? 'Loading...' : 'Refresh rewards'}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load rewards</p>
              <p className="mt-1">{error}</p>

              <button
                type="button"
                onClick={() => void loadRewards()}
                className="mt-3 font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading your rewards...
          </div>
        ) : (
          <>
            <section
              aria-label="Reward summary"
              className="mt-8 grid gap-4 sm:grid-cols-2"
            >
              <StatCard
                icon={Trophy}
                label="Lifetime points"
                value={summary.totalPoints.toLocaleString()}
                description="Total points earned from confirmed returns"
              />

              <StatCard
                icon={PackageCheck}
                label="Reward events"
                value={summary.rewardCount.toLocaleString()}
                description="Recorded reward transactions"
              />
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Sparkles size={21} />
                </span>

                <div>
                  <h2 className="text-xl font-bold">
                    Reward history
                  </h2>
                  <p className="text-sm text-slate-500">
                    Your latest points earned
                  </p>
                </div>
              </div>

              {rewards.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                  <Trophy
                    size={36}
                    className="mx-auto text-slate-300"
                  />

                  <h3 className="mt-4 font-semibold text-slate-800">
                    Your reward journey starts here
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    When you help return a found item and both
                    participants confirm the handover, your eligible
                    reward points will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {rewards.map((reward) => (
                    <article
                      key={reward._id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <PackageCheck size={23} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-semibold text-slate-900">
                          {reward.item?.title ||
                            'Confirmed item return'}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {reward.reason === 'confirmed_return'
                            ? 'Reward for a confirmed item return'
                            : (reward.reason || 'Reward')
                                .replaceAll('_', ' ')}
                        </p>

                        {reward.item?.category && (
                          <p className="mt-1 text-xs capitalize text-slate-500">
                            Category: {reward.item.category}
                          </p>
                        )}

                        {reward.item?.location && (
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0"
                            />
                            <span>{reward.item.location}</span>
                          </p>
                        )}

                        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <CalendarDays size={14} />
                          Earned {formatDate(reward.createdAt)}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xl font-bold text-emerald-700">
                          +{reward.points}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          points
                        </p>
                      </div>
                    </article>
                  ))}

                  {rewards.length === 100 && (
                    <p className="pt-2 text-center text-xs text-slate-500">
                      Showing your 100 most recent reward records.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <Clock3
                  size={19}
                  className="mt-0.5 shrink-0 text-slate-500"
                />

                <p className="text-sm leading-6 text-slate-600">
                  Points are currently a record of contributions.
                  Redeeming points for benefits is not part of this
                  step.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}