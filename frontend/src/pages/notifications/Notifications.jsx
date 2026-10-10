import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCheck,
  GraduationCap,
  UserRoundCheck,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();

      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);

      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading notifications..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with your AlumniHub activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCheck size={17} />

              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Bell size={28} />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No notifications
              </h2>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                You're all caught up. New activity will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function NotificationItem({ notification, onRead }) {
  const icon = getNotificationIcon(notification.type);

  return (
    <div
      className={`flex gap-4 p-5 transition ${
        notification.isRead ? "bg-white" : "bg-indigo-50/40"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          notification.isRead
            ? "bg-slate-100 text-slate-500"
            : "bg-indigo-100 text-indigo-600"
        }`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3
              className={`text-sm ${
                notification.isRead
                  ? "font-medium text-slate-700"
                  : "font-semibold text-slate-900"
              }`}
            >
              {notification.title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {notification.message}
            </p>
          </div>

          {!notification.isRead && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {formatDate(notification.createdAt)}
          </p>

          {!notification.isRead && (
            <button
              onClick={() => onRead(notification._id)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getNotificationIcon(type) {
  switch (type) {
    case "JOB_APPLICATION":
    case "APPLICATION_STATUS":
      return <BriefcaseBusiness size={20} />;

    case "MENTOR_REQUEST":
    case "MENTOR_REQUEST_STATUS":
      return <UserRoundCheck size={20} />;

    case "EVENT":
      return <CalendarDays size={20} />;

    default:
      return <GraduationCap size={20} />;
  }
}

function formatDate(date) {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default Notifications;
