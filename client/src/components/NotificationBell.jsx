
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, LoaderCircle } from 'lucide-react';

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../features/notifications/notificationService';

function formatTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const data = await getNotifications();

        if (!active) return;

        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setError('');
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not load notifications.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleMarkRead(notificationId) {
    setBusy(notificationId);
    setError('');

    try {
      await markNotificationRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, readAt: notification.readAt || new Date().toISOString() }
            : notification,
        ),
      );

      setUnreadCount((count) => Math.max(0, count - (
        notifications.some(
          (notification) =>
            notification._id === notificationId && !notification.readAt,
        ) ? 1 : 0
      )));
    } catch (err) {
      setError(err.message || 'Could not mark notification as read.');
    } finally {
      setBusy('');
    }
  }

  async function handleMarkAllRead() {
    setBusy('all');
    setError('');

    try {
      await markAllNotificationsRead();

      const readAt = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readAt: notification.readAt || readAt,
        })),
      );

      setUnreadCount(0);
    } catch (err) {
      setError(err.message || 'Could not mark notifications as read.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        <Bell size={17} />
        <span className="sm:hidden">Notifications</span>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <section
            aria-label="Notifications"
            className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
              <div>
                <h2 className="font-bold text-slate-900">Notifications</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {unreadCount} unread
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0 || Boolean(busy)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
            </div>

            {error && (
              <p role="alert" className="p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
                <LoaderCircle size={18} className="animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                You're all caught up. New claim updates will appear here.
              </p>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={
                      notification.readAt ? 'bg-white' : 'bg-indigo-50/70'
                    }
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <span
                          className={
                            notification.readAt
                              ? 'mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-300'
                              : 'mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600'
                          }
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            {formatTime(notification.createdAt)}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-3">
                            <Link
                              to={notification.link || '/claims'}
                              onClick={() => {
                                if (!notification.readAt) {
                                  void handleMarkRead(notification._id);
                                }
                                setOpen(false);
                              }}
                              className="text-xs font-semibold text-indigo-600 hover:underline"
                            >
                              View details
                            </Link>

                            {!notification.readAt && (
                              <button
                                type="button"
                                disabled={Boolean(busy)}
                                onClick={() =>
                                  void handleMarkRead(notification._id)
                                }
                                className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50"
                              >
                                {busy === notification._id
                                  ? 'Saving...'
                                  : 'Mark read'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-slate-100 p-3 text-center">
              <Link
                to="/claims"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                Open claims
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
