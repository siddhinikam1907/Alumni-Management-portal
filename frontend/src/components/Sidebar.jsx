import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BriefcaseBusiness,
  FileText,
  Bell,
  CalendarDays,
  UserCircle,
  BarChart3,
  Settings,
  Sparkles,
  X,
  UserRoundCheck,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigationByRole = {
  STUDENT: [
    {
      label: "Dashboard",
      path: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Find Alumni",
      path: "/student/alumni",
      icon: Users,
    },
    {
      label: "Find Mentor",
      path: "/student/mentors",
      icon: GraduationCap,
    },
    {
      label: "Mentor Requests",
      path: "/student/mentor-requests",
      icon: UserRoundCheck,
    },
    {
      label: "Jobs",
      path: "/student/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Applications",
      path: "/student/applications",
      icon: FileText,
    },
    {
      label: "Events",
      path: "/student/events",
      icon: CalendarDays,
    },
    {
      label: "My Profile",
      path: "/student/profile",
      icon: UserCircle,
    },
  ],

  ALUMNI: [
    {
      label: "Dashboard",
      path: "/alumni/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      path: "/alumni/profile",
      icon: UserCircle,
    },
    {
      label: "My Jobs",
      path: "/alumni/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Mentor Profile",
      path: "/alumni/mentor-profile",
      icon: GraduationCap,
    },
    {
      label: "Mentor Requests",
      path: "/alumni/mentor-requests",
      icon: UserRoundCheck,
    },
    {
      label: "Events",
      path: "/alumni/events",
      icon: CalendarDays,
    },
  ],

  ADMIN: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Alumni Directory",
      path: "/admin/alumni",
      icon: GraduationCap,
    },
    {
      label: "Events Management",
      path: "/admin/events",
      icon: CalendarDays,
    },
    {
      label: "Alumni Engagement",
      path: "/admin/engagement",
      icon: BarChart3,
    },
    {
      label: "Jobs Management",
      path: "/admin/jobs",
      icon: BriefcaseBusiness,
    },
  ],
};

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navigation = navigationByRole[user?.role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <GraduationCap size={22} />
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                AlumniHub
              </h1>

              <p className="text-[11px] font-medium text-slate-400">
                Connect • Grow • Engage
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User information */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-indigo-50 to-violet-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>

              <p className="text-xs font-medium text-indigo-600">
                {user?.role || "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={19}
                        className={
                          isActive
                            ? "text-indigo-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }
                      />

                      <span>{item.label}</span>

                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Common section */}
          <div className="mt-8">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Account
            </p>

            {/* Notifications */}
            <NavLink
              to="/notifications"
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Bell
                size={19}
                className="text-slate-400 group-hover:text-slate-600"
              />
              Notifications
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Settings
                size={19}
                className="text-slate-400 group-hover:text-slate-600"
              />
              Settings
            </NavLink>

            {/* Logout */}
            <button
              onClick={() => {
                onClose();
                navigate("/logout");
              }}
              className="group mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut
                size={19}
                className="text-slate-400 group-hover:text-red-500"
              />
              Logout
            </button>
          </div>
        </nav>

        {/* AI Assistant card */}
        <div className="p-4">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-200">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5" />

            <div className="relative">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Sparkles size={18} />
              </div>

              <h3 className="text-sm font-semibold">Meet Alumni AI</h3>

              <p className="mt-1 text-xs leading-5 text-indigo-100">
                Find alumni, mentors and opportunities using natural language.
              </p>

              <button
                onClick={() => {
                  onClose();
                  navigate("/ask-ai");
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                <Sparkles size={14} />
                Ask AI
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
