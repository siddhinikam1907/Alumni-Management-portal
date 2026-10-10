import { Menu, Search, Sparkles } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";
function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Search */}
          <div className="hidden md:flex md:w-72 lg:w-96">
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
              <Search size={18} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search alumni, jobs, mentors..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* AI Button */}
          <button className="hidden items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:flex">
            <Sparkles size={16} />
            Alumni AI
          </button>

          <NotificationBell />

          {/* Profile */}
          <button className="ml-1 flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-violet-600 text-sm font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>

              <p className="text-xs text-slate-500">{user?.role || "User"}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
