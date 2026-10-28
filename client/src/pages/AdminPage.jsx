import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  Package,
  RefreshCw,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';

import Navbar from '../components/Navbar';

import {
  getAdminOverview,
  getAdminUsers,
  getAdminReports,
  getAdminClaims,
  setReportVisibility,
  setUserSuspension,
} from '../features/admin/adminService';

const TABS = ['Overview', 'Users', 'Reports', 'Claims'];

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

function titleCase(value = '') {
  return value.replaceAll('_', ' ');
}

function StatCard({ label, value, icon: Icon, description }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={21} />
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {Number(value || 0).toLocaleString()}
      </p>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </article>
  );
}

function Status({ children, warning = false }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        warning
          ? 'bg-amber-50 text-amber-800'
          : 'bg-slate-100 text-slate-700'
      }`}
    >
      {children}
    </span>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState('Overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const [
        overviewResult,
        usersResult,
        reportsResult,
        claimsResult,
      ] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(),
        getAdminReports(),
        getAdminClaims(),
      ]);

      setOverview(overviewResult.overview);
      setUsers(usersResult.users || []);
      setReports(reportsResult.reports || []);
      setClaims(claimsResult.claims || []);
      setError('');
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not load the admin dashboard.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(false);
  }, [loadDashboard]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) =>
      [
        user.name,
        user.username,
        user.email,
        user.role,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        ),
    );
  }, [users, search]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reports;

    return reports.filter((report) =>
      [
        report.title,
        report.description,
        report.location,
        report.type,
        report.status,
        report.reportedBy?.name,
        report.reportedBy?.email,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        ),
    );
  }, [reports, search]);

  async function handleReportVisibility(report) {
    const hidden = !report.isHidden;
    let reason = '';

    if (hidden) {
      const answer = window.prompt(
        `Why are you hiding "${report.title}"?`,
      );

      if (answer === null) return;

      reason = answer.trim();

      if (reason.length < 4 || reason.length > 300) {
        setError('Enter a moderation reason of 4–300 characters.');
        return;
      }
    }

    setBusyId(report._id);
    setError('');
    setNotice('');

    try {
      const result = await setReportVisibility(
        report._id,
        hidden,
        reason,
      );

      setNotice(result.message || 'Report moderation updated.');
      await loadDashboard(false);
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not update report visibility.',
      );
    } finally {
      setBusyId('');
    }
  }

  async function handleUserSuspension(user) {
    const suspended = !user.isSuspended;
    let reason = '';

    if (suspended) {
      const answer = window.prompt(
        `Why are you suspending ${user.name || user.email}?`,
      );

      if (answer === null) return;

      reason = answer.trim();

      if (reason.length < 4 || reason.length > 300) {
        setError('Enter a suspension reason of 4–300 characters.');
        return;
      }
    }

    setBusyId(user._id);
    setError('');
    setNotice('');

    try {
      const result = await setUserSuspension(
        user._id,
        suspended,
        reason,
      );

      setNotice(result.message || 'User account updated.');
      await loadDashboard(false);
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not update this user.',
      );
    } finally {
      setBusyId('');
    }
  }

  const claimsByStatus = overview?.claims?.byStatus || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <ShieldCheck size={18} />
              FINDIT ADMINISTRATION
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Admin dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Monitor community activity, moderate reports, manage
              accounts, and inspect the claim lifecycle.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading || Boolean(busyId)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {loading ? 'Refreshing...' : 'Refresh dashboard'}
          </button>
        </header>

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {notice}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <nav
          aria-label="Admin sections"
          className="mt-8 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2"
        >
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                setSearch('');
                setError('');
                setNotice('');
              }}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                tab === item
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-slate-500">
            <LoaderCircle size={22} className="animate-spin" />
            Loading admin data...
          </div>
        ) : !overview ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-semibold">Dashboard data is unavailable.</p>
            <p className="mt-2 text-sm text-slate-500">
              Check administrator access and the backend terminal.
            </p>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {tab === 'Overview' && (
              <section className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard
                    label="Registered users"
                    value={overview.users.total}
                    icon={Users}
                    description={`${overview.users.verified} verified accounts`}
                  />

                  <StatCard
                    label="Suspended users"
                    value={overview.users.suspended}
                    icon={ShieldCheck}
                    description="Accounts currently suspended"
                  />

                  <StatCard
                    label="All reports"
                    value={overview.reports.total}
                    icon={Package}
                    description={`${overview.reports.lost} lost · ${overview.reports.found} found`}
                  />

                  <StatCard
                    label="Visible active reports"
                    value={overview.reports.active}
                    icon={Eye}
                    description={`${overview.reports.hidden} hidden by moderation`}
                  />

                  <StatCard
                    label="Pending claims"
                    value={claimsByStatus.pending}
                    icon={ClipboardCheck}
                    description={`${claimsByStatus.accepted || 0} accepted`}
                  />

                  <StatCard
                    label="Completed claims"
                    value={claimsByStatus.completed}
                    icon={CheckCircle2}
                    description={`${overview.claims.total} claims in total`}
                  />

                  <StatCard
                    label="Reward points issued"
                    value={overview.rewards.pointsIssued}
                    icon={Wallet}
                    description={`${overview.rewards.events} reward events`}
                  />

                  <StatCard
                    label="Rejected claims"
                    value={claimsByStatus.rejected}
                    icon={Activity}
                    description="Rejected claim records"
                  />

                  <StatCard
                    label="Resolved reports"
                    value={overview.reports.total - overview.reports.active}
                    icon={CheckCircle2}
                    description="Not currently active and visible"
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-lg font-bold">Administration notes</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Report visibility and item lifecycle are separate:
                    hiding a report does not delete it or mark it resolved.
                    Claim acceptance and handover completion still use the
                    existing claims workflow.
                  </p>
                </div>
              </section>
            )}

            {(tab === 'Users' || tab === 'Reports') && (
              <section className="mt-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      {tab === 'Users' ? 'User management' : 'Report moderation'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {tab === 'Users'
                        ? `${filteredUsers.length} users loaded`
                        : `${filteredReports.length} reports loaded`}
                    </p>
                  </div>

                  <label className="w-full max-w-md">
                    <span className="sr-only">Search</span>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={
                        tab === 'Users'
                          ? 'Search name, username, or email'
                          : 'Search title, location, or reporter'
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                </div>

                {tab === 'Users' ? (
                  <div className="mt-4 space-y-3">
                    {filteredUsers.map((user) => (
                      <article
                        key={user._id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words font-semibold">
                            {user.name || 'Unnamed user'}
                          </h3>
                          <p className="mt-1 break-all text-sm text-slate-600">
                            {user.email}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {user.username ? `@${user.username} · ` : ''}
                            Joined {formatDate(user.createdAt)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Status>{user.role || 'user'}</Status>
                            <Status>
                              {user.isEmailVerified ? 'verified' : 'unverified'}
                            </Status>
                            {user.isSuspended && (
                              <Status warning>Suspended</Status>
                            )}
                          </div>
                          {user.suspensionReason && user.isSuspended && (
                            <p className="mt-2 text-xs text-amber-800">
                              Reason: {user.suspensionReason}
                            </p>
                          )}
                        </div>

                        {user.role !== 'admin' && (
                          <button
                            type="button"
                            disabled={busyId === user._id}
                            onClick={() => void handleUserSuspension(user)}
                            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                              user.isSuspended
                                ? 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                : 'border border-red-200 text-red-700 hover:bg-red-50'
                            }`}
                          >
                            {busyId === user._id
                              ? 'Saving...'
                              : user.isSuspended
                                ? 'Restore account'
                                : 'Suspend account'}
                          </button>
                        )}
                      </article>
                    ))}

                    {filteredUsers.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                        No matching users found.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {filteredReports.map((report) => (
                      <article
                        key={report._id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2">
                            <Status>{report.type}</Status>
                            <Status>{report.status}</Status>
                            {report.isHidden && (
                              <Status warning>Hidden</Status>
                            )}
                          </div>

                          <h3 className="mt-3 break-words font-semibold">
                            {report.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {report.location || 'Location not provided'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Reported by {report.reportedBy?.name || 'Unknown'}
                            {' · '}
                            {formatDate(report.createdAt)}
                          </p>

                          {report.isHidden && report.moderationReason && (
                            <p className="mt-2 text-xs text-amber-800">
                              Moderation reason: {report.moderationReason}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={busyId === report._id}
                          onClick={() => void handleReportVisibility(report)}
                          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                            report.isHidden
                              ? 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              : 'border border-amber-200 text-amber-800 hover:bg-amber-50'
                          }`}
                        >
                          {report.isHidden
                            ? <Eye size={16} />
                            : <EyeOff size={16} />}
                          {busyId === report._id
                            ? 'Saving...'
                            : report.isHidden
                              ? 'Restore report'
                              : 'Hide report'}
                        </button>
                      </article>
                    ))}

                    {filteredReports.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                        No matching reports found.
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}

            {tab === 'Claims' && (
              <section className="mt-6">
                <h2 className="text-xl font-bold">Claim oversight</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing up to 100 recent claims. Review actions remain in
                  the regular claim workflow.
                </p>

                <div className="mt-4 space-y-3">
                  {claims.map((claim) => (
                    <article
                      key={claim._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {claim.lostItem?.title || 'Lost report unavailable'}
                            {' → '}
                            {claim.foundItem?.title || 'Found report unavailable'}
                          </h3>
                          <p className="mt-1 break-all text-xs text-slate-500">
                            Claim ID: {claim._id}
                          </p>
                        </div>

                        <Status
                          warning={['pending', 'reconsideration_requested'].includes(
                            claim.status,
                          )}
                        >
                          {titleCase(claim.status)}
                        </Status>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          Claimant:{' '}
                          <span className="font-medium text-slate-800">
                            {claim.claimant?.name ||
                              claim.claimant?.email ||
                              'Unknown'}
                          </span>
                        </p>
                        <p>
                          Finder:{' '}
                          <span className="font-medium text-slate-800">
                            {claim.foundItem?.reportedBy?.name ||
                              claim.foundItem?.reportedBy?.email ||
                              'Unknown'}
                          </span>
                        </p>
                        <p>
                          Submitted: {formatDate(claim.createdAt)}
                        </p>
                        <p>
                          Handover: {titleCase(claim.status)}
                        </p>
                      </div>
                    </article>
                  ))}

                  {claims.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                      No claims have been submitted yet.
                    </p>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}