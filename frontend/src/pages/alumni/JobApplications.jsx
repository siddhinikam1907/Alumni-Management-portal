import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  MapPin,
  FileText,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  Clock3,
  ExternalLink,
  LoaderCircle,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getJobApplications,
  updateApplicationStatus,
} from "../../services/applicationService";

import { getJobById } from "../../services/jobService";

function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobData, applicationData] = await Promise.all([
        getJobById(jobId),
        getJobApplications(jobId),
      ]);

      if (jobData.success) {
        setJob(jobData.job);
      }

      if (applicationData.success) {
        setApplications(applicationData.applications || []);
      } else {
        setError(applicationData.message || "Failed to fetch applications");
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message || "Failed to fetch job applications",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      setError("");
      setSuccess("");

      const data = await updateApplicationStatus(applicationId, status);

      if (!data.success) {
        setError(data.message || "Failed to update application status");
        return;
      }

      setApplications((prev) =>
        prev.map((application) =>
          application._id === applicationId
            ? {
                ...application,
                status,
              }
            : application,
        ),
      );

      setSuccess("Application status updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message || "Failed to update application status",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "SHORTLISTED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "SELECTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "SHORTLISTED":
        return <Clock3 size={15} />;

      case "SELECTED":
        return <CheckCircle2 size={15} />;

      case "REJECTED":
        return <XCircle size={15} />;

      default:
        return <Clock3 size={15} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

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
      <div className="mx-auto max-w-6xl space-y-6">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/alumni/jobs")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to My Jobs
        </button>

        {/* JOB HEADER */}
        {job && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <BriefcaseBusiness size={24} />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      {job.title}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Applications received for this job
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={16} />
                    {job.companyName}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={16} />
                    {job.location}
                  </span>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {job.jobType}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-5 py-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {applications.length}
                </p>

                <p className="text-xs font-medium text-slate-500">
                  Applications
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* APPLICATIONS */}
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FileText size={44} className="mx-auto mb-4 text-slate-300" />

            <h2 className="text-lg font-semibold text-slate-800">
              No applications yet
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Students who apply for this job will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {applications.map((application) => {
              const applicant = application.applicant;

              return (
                <div
                  key={application._id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {/* APPLICANT HEADER */}
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <User size={22} />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {applicant?.name || "Unknown Applicant"}
                        </h2>

                        {applicant?.email && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <Mail size={14} />
                            {applicant.email}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          Applied on {formatDate(application.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div
                      className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                        application.status,
                      )}`}
                    >
                      {getStatusIcon(application.status)}

                      {application.status}
                    </div>
                  </div>

                  {/* COVER LETTER */}
                  {application.coverLetter && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <h3 className="mb-2 text-sm font-semibold text-slate-700">
                        Cover Letter
                      </h3>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* RESUME */}
                  {application.resume && (
                    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                          <FileText size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {application.resume.fileName || "Resume"}
                          </p>

                          <p className="text-xs text-slate-400">
                            Applicant Resume
                          </p>
                        </div>
                      </div>

                      {application.resume.fileUrl && (
                        <a
                          href={application.resume.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                        >
                          <ExternalLink size={16} />
                          View Resume
                        </a>
                      )}
                    </div>
                  )}

                  {/* STATUS ACTIONS */}
                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      Update application status
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(application._id, "SHORTLISTED")
                        }
                        disabled={updatingId === application._id}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Shortlist
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(application._id, "REJECTED")
                        }
                        disabled={updatingId === application._id}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(application._id, "SELECTED")
                        }
                        disabled={updatingId === application._id}
                        className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Select
                      </button>

                      {updatingId === application._id && (
                        <LoaderCircle
                          size={18}
                          className="animate-spin text-slate-400"
                        />
                      )}
                    </div>
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

export default JobApplications;
