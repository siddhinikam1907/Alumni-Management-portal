import {
  Users,
  GraduationCap,
  BriefcaseBusiness,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/AuthContext";
import { getStudentDashboardStats } from "../../services/dashboardService";

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getStudentDashboardStats();

        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading your dashboard..." />
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: "Alumni Network",
      value: stats?.alumniCount ?? 0,
      description: "Registered alumni",
      icon: Users,
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Available Mentors",
      value: stats?.mentorCount ?? 0,
      description: "Ready to mentor",
      icon: GraduationCap,
      gradient: "from-violet-500 to-violet-600",
    },
    {
      title: "Opportunities",
      value: stats?.jobCount ?? 0,
      description: "Active jobs",
      icon: BriefcaseBusiness,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Upcoming Events",
      value: stats?.eventCount ?? 0,
      description: "Events to explore",
      icon: CalendarDays,
      gradient: "from-cyan-500 to-cyan-600",
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-medium text-indigo-600">Student Dashboard</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back, {user?.name || "Student"} 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Discover alumni, opportunities and mentors from your network.
        </p>
      </motion.div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${stat.gradient} text-white shadow-lg`}
                >
                  <Icon size={21} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-slate-300 transition group-hover:text-indigo-500"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {stat.title}
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {stat.value.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* AI Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="relative mt-8 overflow-hidden rounded-3xl bg-linear-to-r from-indigo-600 via-indigo-600 to-violet-600 p-6 shadow-xl shadow-indigo-200 sm:p-8"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
              <Sparkles size={22} />
            </div>

            <h2 className="text-2xl font-bold text-white">
              Meet your Alumni AI
            </h2>

            <p className="mt-2 leading-6 text-indigo-100">
              Find the right alumni, discover mentors and explore career
              opportunities using natural language.
            </p>
          </div>

          <button
            onClick={() => navigate("/ask-ai")}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            <Sparkles size={17} />
            Ask Alumni AI
          </button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
