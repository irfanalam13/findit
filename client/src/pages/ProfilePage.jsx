
import { useEffect, useState } from 'react';
import {
  getMyProfile,
  updateMyProfile,
} from '../features/profile/profileService';
import Navbar from '../components/Navbar';

const EMPTY_PROFILE = {
  name: '',
  username: '',
  bio: '',
  city: '',
  avatarUrl: '',
};

function normalizeProfile(profile = {}) {
  return {
    ...EMPTY_PROFILE,
    ...profile,
    name: profile.name ?? '',
    username: profile.username ?? '',
    bio: profile.bio ?? '',
    city: profile.city ?? '',
    avatarUrl: profile.avatarUrl ?? '',
  };
}

function getErrorMessage(error, fallback) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  return error?.message || fallback;
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return 'U';

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError('');

      try {
        const data = await getMyProfile();

        if (active) {
          setProfile(normalizeProfile(data?.profile));
        }
      } catch (err) {
        if (active) {
          setError(
            getErrorMessage(err, 'Could not load your profile.'),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  function changeField(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        name: profile.name.trim(),
        username: profile.username.trim(),
        bio: profile.bio.trim(),
        city: profile.city.trim(),
      };

      const data = await updateMyProfile(payload);

      setProfile(normalizeProfile(data?.profile ?? payload));
      setMessage('Your profile has been updated successfully.');
    } catch (err) {
      setError(
        getErrorMessage(err, 'Could not update your profile.'),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-12">
          <div
            className="animate-pulse space-y-5"
            role="status"
            aria-label="Loading profile"
          >
            <div className="h-8 w-48 rounded-lg bg-slate-200" />
            <div className="h-48 rounded-2xl bg-white shadow-sm" />
            <div className="h-72 rounded-2xl bg-white shadow-sm" />
          </div>
          <p className="sr-only">Loading your profile...</p>
        </main>
      </div>
    );
  }

  if (error && !profile.name && !profile.username) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <section className="rounded-2xl border border-red-200 bg-white p-6">
            <h1 className="text-xl font-bold text-slate-900">
              Unable to load profile
            </h1>
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Try again
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Findit community
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            My profile
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Manage your personal information and how you appear
            to the Findit community.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-24 bg-gradient-to-r from-indigo-600 to-violet-500" />

              <div className="px-6 pb-6">
                <div className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-700">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={`${profile.name || 'User'} profile`}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    getInitials(profile.name)
                  )}
                </div>

                <h2 className="mt-4 break-words text-xl font-bold text-slate-900">
                  {profile.name || 'Your name'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  @{profile.username || 'choose-a-username'}
                </p>

                {profile.city && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <span aria-hidden="true">📍</span>
                    {profile.city}
                  </p>
                )}

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    About me
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                    {profile.bio || 'Add a short bio to introduce yourself.'}
                  </p>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Profile photo upload is not connected yet. Your
                  existing photo will display when avatarUrl is provided.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <h2 className="font-semibold text-indigo-950">
                Be part of the community
              </h2>
              <p className="mt-2 text-sm leading-6 text-indigo-800">
                Keep your profile up to date so your Findit
                account is ready to help reunite people with
                their lost belongings.
              </p>
            </section>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7 border-b border-slate-100 pb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Personal information
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Update your details below and save your changes.
              </p>
            </div>

            {message && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                {message}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full name
                  <input
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={profile.name}
                    onChange={changeField}
                    minLength={2}
                    maxLength={80}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Your full name"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Username
                  <input
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={profile.username}
                    onChange={changeField}
                    minLength={3}
                    maxLength={24}
                    pattern="[a-zA-Z0-9_]{3,24}"
                    title="Use 3–24 letters, numbers, or underscores."
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="irru_dev"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Letters, numbers and underscores only.
                  </span>
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                City
                <input
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={profile.city}
                  onChange={changeField}
                  maxLength={100}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Kathmandu"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Bio
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={changeField}
                  maxLength={300}
                  rows={5}
                  className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Tell the community a little about yourself."
                />
                <span className="mt-1 block text-right text-xs font-normal text-slate-500">
                  {profile.bio.length}/300 characters
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reload profile
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden="true"
                    />
                  )}
                  {saving ? 'Saving changes...' : 'Save profile'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
