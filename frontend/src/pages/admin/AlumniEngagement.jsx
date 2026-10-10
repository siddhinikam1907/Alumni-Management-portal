import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Handshake,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  getAlumniEngagement,
  getAlumniContributions,
} from "../../services/analyticsService";

function AlumniEngagement() {
  const [engagement, setEngagement] = useState(null);
  const [contributions, setContributions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setError("");

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
    } catch (err) {
      console.error("Failed to load alumni engagement:", err);

      setError(
        err.response?.data?.message || "Failed to load alumni engagement data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const stats = [
    {
      label: "Total Alumni",
      value: engagement?.totalAlumni ?? 0,
      icon: Users,
    },
    {
      label: "Registered Alumni",
      value: engagement?.registeredAlumni ?? 0,
      icon: UserCheck,
    },
    {
      label: "Jobs Posted",
      value: engagement?.totalJobsPosted ?? 0,
      icon: BriefcaseBusiness,
    },
    {
      label: "Active Mentors",
      value: engagement?.totalMentors ?? 0,
      icon: Handshake,
    },
    {
      label: "Mentorship Requests",
      value: engagement?.totalMentorRequests ?? 0,
      icon: Handshake,
    },
    {
      label: "Accepted Mentorships",
      value: engagement?.acceptedMentorRequests ?? 0,
      icon: UserCheck,
    },
    {
      label: "Event Registrations",
      value: engagement?.totalEventRegistrations ?? 0,
      icon: CalendarDays,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Alumni Engagement
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor how alumni are participating in the college portal.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {loading ? "—" : stat.value}
                    </p>
                  </div>

                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contributions */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Alumni Contributions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Contributions made by registered alumni through jobs, mentoring
              and events.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading engagement data...
            </div>
          ) : contributions.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No registered alumni contributions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Alumni
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                      Jobs
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                      Mentor
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                      Accepted Mentorships
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                      Events
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {contributions.map((item) => (
                    <tr key={item.alumni.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {item.alumni.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.alumni.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-center">
                        {item.contributions.jobsPosted}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {item.contributions.mentor ? "Yes" : "No"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {item.contributions.mentorshipRequestsAccepted}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {item.contributions.eventRegistrations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AlumniEngagement;
