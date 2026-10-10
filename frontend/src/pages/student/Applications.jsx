import { useEffect, useState } from "react";
import {
  FileText,
  Building2,
  MapPin,
  Clock3,
  CalendarDays,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import { getMyApplications } from "../../services/applicationService";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const data = await getMyApplications();

      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load your applications.");
    } finally {
      setLoading(false);
    }
  };

  const formatJobType = (type) => {
    switch (type) {
      case "FULL_TIME":
        return "Full Time";
      case "PART_TIME":
        return "Part Time";
      case "INTERNSHIP":
        return "Internship";
      default:
        return type;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-50 text-blue-700";
      case "SHORTLISTED":
        return "bg-amber-50 text-amber-700";
      case "SELECTED":
        return "bg-green-50 text-green-700";
      case "REJECTED":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatStatus = (status) => {
    return status
      ?.toLowerCase()
      .replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading applications..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Career Activity
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            My Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track the jobs you have applied for and monitor their application
            status.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Applications"
            value={applications.length}
            icon={<FileText size={20} />}
          />

          <StatCard
            label="Applied"
            value={applications.filter((a) => a.status === "APPLIED").length}
            icon={<Clock3 size={20} />}
          />

          <StatCard
            label="Shortlisted"
            value={
              applications.filter((a) => a.status === "SHORTLISTED").length
            }
            icon={<FileText size={20} />}
          />

          <StatCard
            label="Selected"
            value={applications.filter((a) => a.status === "SELECTED").length}
            icon={<FileText size={20} />}
          />
        </div>

        {/* Applications */}
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <FileText size={42} className="mx-auto text-slate-300" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No applications yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Jobs you apply for will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const job = application.job;

              return (
                <div
                  key={application._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <BriefcaseIcon />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {job?.title || "Job no longer available"}
                        </h3>

                        {job?.companyName && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                            <Building2 size={14} />
                            {job.companyName}
                          </p>
                        )}

                        {job?.location && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                            <MapPin size={14} />
                            {job.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                          application.status,
                        )}`}
                      >
                        {formatStatus(application.status)}
                      </span>

                      <p className="text-xs text-slate-400">
                        Applied on {formatDate(application.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {job?.jobType && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {formatJobType(job.jobType)}
                      </span>
                    )}

                    {job?.skills?.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export default Applications;
