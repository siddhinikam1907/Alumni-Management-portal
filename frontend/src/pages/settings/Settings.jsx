import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import { useAuth } from "../../context/AuthContext";

import {
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../services/authService";

function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    jobs: true,
    mentorship: true,
    events: true,
  });

  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [updatingPreference, setUpdatingPreference] = useState(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  /*
   * Fetch notification preferences
   */
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getNotificationPreferences();

        if (data.success) {
          setNotifications({
            jobs: data.preferences?.jobs ?? true,
            mentorship: data.preferences?.mentorship ?? true,
            events: data.preferences?.events ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch notification preferences:", error);
      } finally {
        setLoadingPreferences(false);
      }
    };

    fetchPreferences();
  }, []);

  /*
   * Update one notification preference
   */
  const updateNotification = async (key) => {
    const newValue = !notifications[key];

    // Optimistic UI update
    setNotifications((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      setUpdatingPreference(key);

      const data = await updateNotificationPreferences({
        ...notifications,
        [key]: newValue,
      });

      if (data.success) {
        setNotifications({
          jobs: data.preferences?.jobs ?? true,
          mentorship: data.preferences?.mentorship ?? true,
          events: data.preferences?.events ?? true,
        });
      }
    } catch (error) {
      console.error("Failed to update notification preference:", error);

      // Revert if backend update fails
      setNotifications((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
    } finally {
      setUpdatingPreference(null);
    }
  };

  /*
   * Password input change
   */
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * Change password
   */
  const handleChangePassword = async (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const data = await changePassword({
        currentPassword,
        newPassword,
      });

      if (data.success) {
        alert("Password changed successfully.");

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setShowPasswordForm(false);
      } else {
        alert(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Change password error:", error);

      alert(error.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingPreferences) {
    return (
      <DashboardLayout>
        <Loading text="Loading settings..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your AlumniHub account and preferences.
          </p>
        </div>

        {/* Account */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <UserCircle size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">Account</h2>

                <p className="text-sm text-slate-500">
                  Your account information
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-slate-800">Full Name</p>

                <p className="text-sm text-slate-500">
                  {user?.name || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-slate-800">Email</p>

                <p className="text-sm text-slate-500">
                  {user?.email || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Account Type
                </p>

                <p className="text-sm text-slate-500">{user?.role || "User"}</p>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {user?.role || "USER"}
              </span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Bell size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">Notifications</h2>

                <p className="text-sm text-slate-500">
                  Choose what you want to be notified about.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <SettingToggle
              icon={<BriefcaseBusiness size={19} />}
              title="Job notifications"
              description="Receive updates about job opportunities and applications."
              enabled={notifications.jobs}
              loading={updatingPreference === "jobs"}
              onChange={() => updateNotification("jobs")}
            />

            <SettingToggle
              icon={<Users size={19} />}
              title="Mentorship notifications"
              description="Receive updates about mentor requests and responses."
              enabled={notifications.mentorship}
              loading={updatingPreference === "mentorship"}
              onChange={() => updateNotification("mentorship")}
            />

            <SettingToggle
              icon={<CalendarDays size={19} />}
              title="Event notifications"
              description="Receive updates about alumni events and activities."
              enabled={notifications.events}
              loading={updatingPreference === "events"}
              onChange={() => updateNotification("events")}
            />
          </div>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">Security</h2>

                <p className="text-sm text-slate-500">
                  Manage your account security.
                </p>
              </div>
            </div>
          </div>

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50"
            >
              <LockKeyhole size={20} className="text-slate-400" />

              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  Change Password
                </p>

                <p className="text-sm text-slate-500">
                  Update your account password.
                </p>
              </div>

              <ChevronRight size={18} className="text-slate-400" />
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-5 p-5">
              {/* Current Password */}
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword((prev) => !prev)}
              />

              {/* New Password */}
              <PasswordInput
                label="New Password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                visible={showNewPassword}
                onToggle={() => setShowNewPassword((prev) => !prev)}
              />

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);

                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Logout */}
        <section className="rounded-2xl border border-red-100 bg-white shadow-sm">
          <button
            onClick={() => navigate("/logout")}
            className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-red-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <LogOut size={20} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Logout</p>

              <p className="text-sm text-slate-500">
                Sign out of your AlumniHub account.
              </p>
            </div>

            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </section>
      </div>
    </DashboardLayout>
  );
}

/*
 * Toggle component
 */
function Toggle({ enabled, onChange, loading }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      aria-pressed={enabled}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-indigo-600" : "bg-slate-300"
      } ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

/*
 * Notification setting
 */
function SettingToggle({
  icon,
  title,
  description,
  enabled,
  onChange,
  loading,
}) {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{title}</p>

        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <Toggle enabled={enabled} onChange={onChange} loading={loading} />
    </div>
  );
}

/*
 * Password input
 */
function PasswordInput({ label, name, value, onChange, visible, onToggle }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          placeholder={`Enter ${label.toLowerCase()}`}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default Settings;
