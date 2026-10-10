import { useEffect, useState } from "react";
import {
  Users,
  UserRoundCheck,
  BriefcaseBusiness,
  GraduationCap,
  MessageCircle,
  UserCheck,
  CalendarCheck,
  TrendingUp,
  Award,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getAlumniEngagement,
  getAlumniContributions,
} from "../../services/analyticsService";

function AdminDashboard() {
  const [engagement, setEngagement] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardData = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [engagementData, contributionData] = await Promise.all([
        getAlumniEngagement(),
        getAlumniContributions(),
      ]);

      if (engagementData.success) {
        setEngagement(engagementData.engagement);
      }

      if (contributionData.success) {
        setContributions(contributionData.contributions || []);
      }
    } catch (error) {
      console.error("Admin dashboard error:", error);

      setError(
        error.response?.data?.message || "Failed to load admin dashboard data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading text="Loading admin dashboard..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor alumni engagement, mentorship, jobs and events.
            </p>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* ENGAGEMENT OVERVIEW */}
        {/* ================================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Engagement Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overall activity across the alumni portal.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Total Alumni */}

            <StatCard
              title="Total Alumni"
              value={engagement?.totalAlumni ?? 0}
              icon={Users}
              description="Alumni in the directory"
            />

            {/* Registered Alumni */}

            <StatCard
              title="Registered Alumni"
              value={engagement?.registeredAlumni ?? 0}
              icon={UserRoundCheck}
              description="Alumni with portal accounts"
            />

            {/* Jobs */}

            <StatCard
              title="Jobs Posted"
              value={engagement?.totalJobsPosted ?? 0}
              icon={BriefcaseBusiness}
              description="Opportunities shared"
            />

            {/* Mentors */}

            <StatCard
              title="Active Mentors"
              value={engagement?.totalMentors ?? 0}
              icon={GraduationCap}
              description="Available mentors"
            />

            {/* Mentorship Requests */}

            <StatCard
              title="Mentorship Requests"
              value={engagement?.totalMentorRequests ?? 0}
              icon={MessageCircle}
              description="Total requests"
            />

            {/* Accepted Mentorships */}

            <StatCard
              title="Accepted Mentorships"
              value={engagement?.acceptedMentorRequests ?? 0}
              icon={UserCheck}
              description="Accepted requests"
            />

            {/* Event Registrations */}

            <StatCard
              title="Event Registrations"
              value={engagement?.totalEventRegistrations ?? 0}
              icon={CalendarCheck}
              description="Total registrations"
            />
          </div>
        </section>

        {/* ================================================== */}
        {/* ALUMNI CONTRIBUTIONS */}
        {/* ================================================== */}

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Alumni Contributions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View how registered alumni are contributing through jobs,
                mentoring and events.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp size={17} />
              {contributions.length} registered alumni
            </div>
          </div>

          <ContributionTable contributions={contributions} />
        </section>

        {/* ================================================== */}
        {/* CONTRIBUTION EXPLANATION */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-violet-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <Award size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                How contribution is calculated
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contribution activity is calculated for registered alumni based
                on jobs posted, having an active mentor profile, accepted
                mentorship requests and event registrations.
              </p>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <ContributionRule label="Job posted" value="+1" />

                <ContributionRule label="Active mentor profile" value="+1" />

                <ContributionRule
                  label="Accepted mentorship request"
                  value="+1"
                />

                <ContributionRule label="Event registration" value="+1" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={21} />
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   CONTRIBUTION TABLE
============================================================ */

function ContributionTable({ contributions }) {
  if (!contributions.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Users className="mx-auto text-slate-300" size={40} />

        <h3 className="mt-4 text-base font-semibold text-slate-800">
          No registered alumni contributions found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Contribution data will appear here once registered alumni start using
          the portal.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Alumni
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Jobs
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mentor
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Requests
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Accepted
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Events
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Activity
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {contributions.map((item, index) => {
              const contribution = item.contributions;

              return (
                <motion.tr
                  key={item.alumni.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: index * 0.03,
                  }}
                  className="transition hover:bg-slate-50"
                >
                  {/* Alumni */}

                  <td className="whitespace-nowrap px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.alumni.name || "Unknown"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.alumni.email || "No email"}
                      </p>
                    </div>
                  </td>

                  {/* Jobs */}

                  <td className="px-5 py-4 text-center">
                    <ContributionNumber value={contribution.jobsPosted} />
                  </td>

                  {/* Mentor */}

                  <td className="px-5 py-4 text-center">
                    {contribution.mentor ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        No
                      </span>
                    )}
                  </td>

                  {/* Requests */}

                  <td className="px-5 py-4 text-center">
                    <ContributionNumber
                      value={contribution.mentorshipRequestsReceived}
                    />
                  </td>

                  {/* Accepted */}

                  <td className="px-5 py-4 text-center">
                    <ContributionNumber
                      value={contribution.mentorshipRequestsAccepted}
                    />
                  </td>

                  {/* Events */}

                  <td className="px-5 py-4 text-center">
                    <ContributionNumber
                      value={contribution.eventRegistrations}
                    />
                  </td>

                  {/* Activity */}

                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      <TrendingUp size={13} />
                      Active
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   CONTRIBUTION NUMBER
============================================================ */

function ContributionNumber({ value }) {
  return <span className="font-semibold text-slate-700">{value ?? 0}</span>;
}

/* ============================================================
   CONTRIBUTION RULE
============================================================ */

function ContributionRule({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2">
      <span>{label}</span>

      <span className="font-semibold text-indigo-600">{value}</span>
    </div>
  );
}

export default AdminDashboard;
