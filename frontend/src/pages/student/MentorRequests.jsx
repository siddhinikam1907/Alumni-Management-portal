import { useEffect, useState } from "react";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  MessageSquare,
  UserRound,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";
import { getMyMentorRequests } from "../../services/mentorRequestService";

function MentorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyMentorRequests();

      if (data.success) {
        setRequests(data.mentorRequests || data.requests || []);
      }
    } catch (err) {
      console.error("Failed to fetch mentor requests:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your mentorship requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING",
  ).length;

  const acceptedCount = requests.filter(
    (request) => request.status === "ACCEPTED",
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "REJECTED",
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Mentorship</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              My Mentor Requests
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track the mentorship requests you have sent to alumni.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Pending"
            value={pendingCount}
            icon={<Clock3 size={20} />}
            bg="bg-amber-50"
            text="text-amber-600"
          />

          <SummaryCard
            label="Accepted"
            value={acceptedCount}
            icon={<CheckCircle2 size={20} />}
            bg="bg-emerald-50"
            text="text-emerald-600"
          />

          <SummaryCard
            label="Rejected"
            value={rejectedCount}
            icon={<XCircle size={20} />}
            bg="bg-rose-50"
            text="text-rose-600"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm text-rose-600">{error}</p>

            <button
              type="button"
              onClick={fetchRequests}
              className="text-sm font-semibold text-rose-700 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <Loading text="Loading your mentor requests..." />
        ) : requests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <MentorRequestCard
                key={request._id}
                request={request}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, icon, bg, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${text}`}
        >
          {icon}
        </div>

        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {label} Requests
      </p>
    </div>
  );
}

function MentorRequestCard({ request, index }) {
  const mentor = request.mentor;

  const mentorName = mentor?.alumni?.name || mentor?.name || "Alumni Mentor";

  const company = mentor?.alumni?.companyName || "Professional";

  const location = mentor?.alumni?.currentLocation;

  const photo = mentor?.alumni?.photo;

  const initials =
    mentorName
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "M";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.04,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        {/* Mentor information */}
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-600">
            {photo ? (
              <img
                src={photo}
                alt={mentorName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}

            {!photo && <span>{initials}</span>}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{mentorName}</h2>

            <p className="mt-1 text-sm font-medium text-indigo-600">
              {company}
            </p>

            {location && (
              <p className="mt-1 text-sm text-slate-500">{location}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <StatusBadge status={request.status} />
      </div>

      {/* Message */}
      {request.message && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <MessageSquare
              size={17}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Your message
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {request.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mentor details */}
      {mentor && (
        <div className="mt-5 flex flex-wrap gap-3">
          {mentor.yearsOfExperience !== undefined && (
            <InfoTag
              icon={<BriefcaseBusiness size={14} />}
              text={`${mentor.yearsOfExperience} years experience`}
            />
          )}

          {mentor.preferredMode && (
            <InfoTag
              icon={<UserRound size={14} />}
              text={mentor.preferredMode}
            />
          )}

          {mentor.expertise?.length > 0 && (
            <InfoTag
              icon={<CheckCircle2 size={14} />}
              text={mentor.expertise.slice(0, 2).join(", ")}
            />
          )}
        </div>
      )}

      {/* Date */}
      {request.createdAt && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            Requested on{" "}
            {new Date(request.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function StatusBadge({ status }) {
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
        <CheckCircle2 size={15} />
        Accepted
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600">
        <XCircle size={15} />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
      <Clock3 size={15} />
      Pending
    </span>
  );
}

function InfoTag({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500">
      {icon}
      {text}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <MessageSquare size={26} className="text-indigo-500" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        No mentorship requests yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Find an alumni mentor and send your first mentorship request to start
        building a professional connection.
      </p>
    </div>
  );
}

export default MentorRequests;
