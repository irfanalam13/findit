
import { useEffect, useState } from 'react';
import {
  getMyProfile,
  updateMyProfile,
} from '../features/profile/profileService';
import Navbar from '../components/Navbar';
export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    bio: '',
    city: '',
    avatarUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((data) => {
        if (active) {
          setProfile(data.profile);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Could not load profile.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function changeField(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const data = await updateMyProfile({
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
        city: profile.city,
      });

      setProfile(data.profile);
      setMessage('Profile saved successfully.');
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          'Could not update profile.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-8">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">My profile</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage how you appear in the Findit community.
          </p>

          <div className="my-6 flex items-center gap-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Your profile"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
            )}

            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-sm text-slate-500">
                @{profile.username || 'choose-a-username'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Profile photo upload is a separate step below.
              </p>
            </div>
          </div>

          {message && (
            <p role="status" className="mb-4 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="mb-4 text-sm text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium">
              Full name
              <input
                name="name"
                value={profile.name}
                onChange={changeField}
                minLength={2}
                maxLength={80}
                required
                className="mt-2 w-full rounded-xl border p-3"
              />
            </label>

            <label className="block text-sm font-medium">
              Username
              <input
                name="username"
                value={profile.username}
                onChange={changeField}
                minLength={3}
                maxLength={24}
                pattern="[a-zA-Z0-9_]{3,24}"
                required
                className="mt-2 w-full rounded-xl border p-3"
                placeholder="irru_dev"
              />
            </label>

            <label className="block text-sm font-medium">
              Bio
              <textarea
                name="bio"
                value={profile.bio}
                onChange={changeField}
                maxLength={300}
                rows={4}
                className="mt-2 w-full rounded-xl border p-3"
                placeholder="Tell the community a little about yourself."
              />
            </label>

            <label className="block text-sm font-medium">
              City
              <input
                name="city"
                value={profile.city}
                onChange={changeField}
                maxLength={100}
                className="mt-2 w-full rounded-xl border p-3"
                placeholder="Kathmandu"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
