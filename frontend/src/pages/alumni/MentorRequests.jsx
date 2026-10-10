import { useEffect, useState } from "react";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  MessageSquare,
  UserRound,
  GraduationCap,
  MapPin,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getReceivedMentorRequests,
  updateMentorRequestStatus,
} from "../../services/mentorRequestService";

function MentorRequests() {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  /*
   * ------------------------------------------
   * FETCH REQUESTS
   * ------------------------------------------
   */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReceivedMentorRequests();

      if (data.success) {
        /*
         * Backend response may use mentorRequests
         * or requests.
         *
         * We support both.
         */
        setRequests(data.mentorRequests || data.requests || []);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch mentor requests:", err);

      setError(
        err.response?.data?.message || "Unable to load mentorship requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ------------------------------------------
   * INITIAL LOAD
   * ------------------------------------------
   */
  useEffect(() => {
    fetchRequests();
  }, []);

  /*
   * ------------------------------------------
   * UPDATE REQUEST STATUS
   * ------------------------------------------
   */
  const handleStatusUpdate = async (requestId, status) => {
    try {
      setUpdatingId(requestId);
      setError("");

      const data = await updateMentorRequestStatus(requestId, status);

      if (data.success) {
        /*
         * Update the request locally so we don't
         * need to reload the entire page.
         */
        setRequests((currentRequests) =>
          currentRequests.map((request) =>
            request._id === requestId
              ? {
                  ...request,
                  status,
                }
              : request,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to update mentor request:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update the mentorship request.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * ------------------------------------------
   * REQUEST COUNTS
   * ------------------------------------------
   */
  const pendingRequests = requests.filter(
    (request) => request.status === "PENDING",
  );

  const acceptedRequests = requests.filter(
    (request) => request.status === "ACCEPTED",
  );

  const rejectedRequests = requests.filter(
    (request) => request.status === "REJECTED",
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Mentorship</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Mentor Requests
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review students who have requested mentorship from you.
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

        {/* Summary Cards */}
        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Pending"
            value={pendingRequests.length}
            icon={<Clock3 size={20} />}
            bg="bg-amber-50"
            text="text-amber-600"
          />

          <SummaryCard
            label="Accepted"
            value={acceptedRequests.length}
            icon={<CheckCircle2 size={20} />}
            bg="bg-emerald-50"
            text="text-emerald-600"
          />

          <SummaryCard
            label="Rejected"
            value={rejectedRequests.length}
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

        {/* Requests */}
        {loading ? (
          <Loading text="Loading mentor requests..." />
        ) : requests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {requests.map((request, index) => (
              <RequestCard
                key={request._id}
                request={request}
                index={index}
                updatingId={updatingId}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/*
 * ==========================================
 * SUMMARY CARD
 * ==========================================
 */
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

/*
 * ==========================================
 * REQUEST CARD
 * ==========================================
 */
function RequestCard({ request, index, updatingId, onStatusUpdate }) {
  const student = request.student;

  const studentName = student?.name || "Student";

  const studentEmail = student?.email || "";

  const studentPhoto = student?.photo || student?.alumni?.photo || "";

  const initials =
    studentName
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  const isPending = request.status === "PENDING";

  const isUpdating = updatingId === request._id;

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
      {/* Top Section */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Student */}
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-600">
            {studentPhoto ? (
              <img
                src={studentPhoto}
                alt={studentName}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* Student Details */}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{studentName}</h2>

            {studentEmail && (
              <p className="mt-1 text-sm text-slate-500">{studentEmail}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
              {student?.department && (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap size={14} />
                  {student.department}
                </span>
              )}

              {student?.currentLocation && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} />
                  {student.currentLocation}
                </span>
              )}
            </div>
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
                Student's message
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {request.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Request Date */}
      {request.createdAt && (
        <div className="mt-4">
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

      {/* Actions */}
      {isPending && (
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          {/* Reject */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onStatusUpdate(request._id, "REJECTED")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={17} />

            {isUpdating ? "Updating..." : "Reject"}
          </button>

          {/* Accept */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onStatusUpdate(request._id, "ACCEPTED")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={17} />

            {isUpdating ? "Updating..." : "Accept"}
          </button>
        </div>
      )}

      {/* Completed Status */}
      {!isPending && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            {request.status === "ACCEPTED"
              ? "You accepted this mentorship request."
              : "You rejected this mentorship request."}
          </p>
        </div>
      )}
    </motion.div>
  );
}

/*
 * ==========================================
 * STATUS BADGE
 * ==========================================
 */
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

/*
 * ==========================================
 * EMPTY STATE
 * ==========================================
 */
function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <UserRound size={26} className="text-indigo-500" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        No mentorship requests
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        When students request mentorship from you, their requests will appear
        here.
      </p>
    </div>
  );
}

export default MentorRequests;
