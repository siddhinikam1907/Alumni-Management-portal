import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function AlumniDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    events: 0,
    mentorRequests: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        /*
         * Fetch data that is actually available
         * through our backend.
         */
        const [jobsResponse, eventsResponse, mentorRequestsResponse] =
          await Promise.all([
            api.get("/jobs"),
            api.get("/events"),
            api.get("/mentor-requests/received"),
          ]);

        /*
         * ------------------------------------------------
         * 1. MY JOBS
         * ------------------------------------------------
         *
         * /jobs returns jobs from the backend.
         * We filter them to find jobs posted by
         * the currently logged-in alumni.
         */
        const allJobs = jobsResponse.data?.jobs || [];

        const myJobs = allJobs.filter((job) => {
          const postedById = job?.postedBy?._id || job?.postedBy;

          return postedById === user?._id;
        });

        /*
         * ------------------------------------------------
         * 2. APPLICATIONS RECEIVED
         * ------------------------------------------------
         *
         * Backend provides:
         *
         * GET /api/applications/job/:jobId
         *
         * Therefore, we fetch applications for each
         * of the alumni's own jobs.
         */
        let totalApplications = 0;

        if (myJobs.length > 0) {
          const applicationResponses = await Promise.all(
            myJobs.map((job) => api.get(`/applications/job/${job._id}`)),
          );

          totalApplications = applicationResponses.reduce((total, response) => {
            return total + (response.data?.applications?.length || 0);
          }, 0);
        }

        /*
         * ------------------------------------------------
         * 3. EVENTS
         * ------------------------------------------------
         */
        const events = eventsResponse.data?.events || [];

        /*
         * ------------------------------------------------
         * 4. MENTOR REQUESTS
         * ------------------------------------------------
         */
        const mentorRequests =
          mentorRequestsResponse.data?.mentorRequests ||
          mentorRequestsResponse.data?.requests ||
          [];

        /*
         * ------------------------------------------------
         * UPDATE DASHBOARD
         * ------------------------------------------------
         */
        setStats({
          jobs: myJobs.length,
          applications: totalApplications,
          events: events.length,
          mentorRequests: mentorRequests.length,
        });
      } catch (error) {
        console.error("Failed to load alumni dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    /*
     * Don't call the API until the authenticated
     * user is available.
     */
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading alumni dashboard..." />
      </DashboardLayout>
    );
  }

  const cards = [
    {
      title: "My Jobs",
      value: stats.jobs,
      icon: BriefcaseBusiness,
      description: "Jobs posted",
    },
    {
      title: "Applications",
      value: stats.applications,
      icon: Users,
      description: "Applications received",
    },
    {
      title: "Events",
      value: stats.events,
      icon: CalendarDays,
      description: "Available events",
    },
    {
      title: "Mentor Requests",
      value: stats.mentorRequests,
      icon: GraduationCap,
      description: "Requests received",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Alumni Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your alumni activities and connect with students.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {card.value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {card.description}
                    </p>
                  </div>

                  <div className="rounded-xl bg-indigo-50 p-3">
                    <Icon size={22} className="text-indigo-600" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Welcome Section */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome to the Alumni Portal
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            From here you can manage your profile, post jobs, mentor students,
            respond to mentorship requests, and participate in college events.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AlumniDashboard;
