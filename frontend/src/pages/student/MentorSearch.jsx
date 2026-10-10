import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
  Clock3,
  MessageSquare,
  SlidersHorizontal,
  X,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";
import api from "../../services/api";
import { sendMentorRequest } from "../../services/mentorRequestService";

function MentorSearch() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [expertise, setExpertise] = useState("");
  const [preferredMode, setPreferredMode] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  // Mentorship request state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  // Fetch mentors
  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (expertise.trim()) {
        params.expertise = expertise.trim();
      }

      if (preferredMode) {
        params.preferredMode = preferredMode;
      }

      if (availableOnly) {
        params.available = true;
      }

      const response = await api.get("/mentors", {
        params,
      });

      if (response.data.success) {
        setMentors(response.data.mentors || []);
      }
    } catch (err) {
      console.error("Failed to fetch mentors:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load mentors. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  // Search
  const handleSearch = (event) => {
    event.preventDefault();
    fetchMentors();
  };

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setExpertise("");
    setPreferredMode("");
    setAvailableOnly(false);

    setTimeout(() => {
      fetchMentors();
    }, 0);
  };

  // Open request modal
  const openRequestModal = (mentor) => {
    setSelectedMentor(mentor);
    setRequestMessage("");
    setRequestError("");
    setRequestSuccess("");
  };

  // Close request modal
  const closeRequestModal = () => {
    if (sendingRequest) return;

    setSelectedMentor(null);
    setRequestMessage("");
    setRequestError("");
    setRequestSuccess("");
  };

  // Send mentorship request
  const handleRequestMentorship = async () => {
    if (!selectedMentor) return;

    if (!requestMessage.trim()) {
      setRequestError("Please enter a message.");
      return;
    }

    try {
      setSendingRequest(true);
      setRequestError("");
      setRequestSuccess("");

      const data = await sendMentorRequest(
        selectedMentor.alumni?._id,
        requestMessage.trim(),
      );

      if (data.success) {
        setRequestSuccess("Mentorship request sent successfully!");

        setRequestMessage("");

        setTimeout(() => {
          setSelectedMentor(null);
          setRequestSuccess("");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to send mentorship request:", err);

      setRequestError(
        err.response?.data?.message || "Unable to send mentorship request.",
      );
    } finally {
      setSendingRequest(false);
    }
  };

  const hasFilters = search || expertise || preferredMode || availableOnly;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Alumni Network
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Find a Mentor
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Connect with experienced alumni who can guide you in your career,
              technology and professional journey.
            </p>
          </div>

          {/* Mentor count */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4">
            <p className="text-xs font-medium text-indigo-500">
              Available Mentors
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-700">
              {mentors.length}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 lg:flex-row"
          >
            {/* Search input */}
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mentors by name, expertise or topic..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="h-12 rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Search
            </button>

            {/* Filter button */}
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 border-t border-slate-100 pt-4"
            >
              <div className="grid gap-4 md:grid-cols-3">
                {/* Expertise */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    Expertise
                  </label>

                  <input
                    type="text"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g. Java, React"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                {/* Preferred mode */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    Preferred Mode
                  </label>

                  <select
                    value={preferredMode}
                    onChange={(e) => setPreferredMode(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="">All modes</option>

                    <option value="ONLINE">Online</option>

                    <option value="OFFLINE">Offline</option>

                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                {/* Available only */}
                <div className="flex items-end">
                  <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(e) => setAvailableOnly(e.target.checked)}
                      className="h-4 w-4 accent-indigo-600"
                    />

                    <span className="text-sm font-medium text-slate-600">
                      Available mentors only
                    </span>
                  </label>
                </div>
              </div>

              {/* Clear filters */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-rose-600"
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <Loading text="Finding mentors..." />
        ) : mentors.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {mentors.map((mentor, index) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor}
                index={index}
                onRequest={openRequestModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mentorship Request Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-600">
                  Mentorship
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Request Mentorship
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Send a request to{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedMentor.alumni?.name || "this mentor"}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={closeRequestModal}
                disabled={sendingRequest}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mentor summary */}
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-indigo-100 font-bold text-indigo-600">
                {selectedMentor.alumni?.photo ? (
                  <img
                    src={selectedMentor.alumni.photo}
                    alt={selectedMentor.alumni?.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}

                {!selectedMentor.alumni?.photo && (
                  <span>
                    {selectedMentor.alumni?.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "M"}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {selectedMentor.alumni?.name || "Alumni Mentor"}
                </p>

                <p className="text-xs text-slate-500">
                  {selectedMentor.alumni?.companyName || "Professional"}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Message
              </label>

              <textarea
                value={requestMessage}
                onChange={(e) => {
                  setRequestMessage(e.target.value);
                  setRequestError("");
                }}
                rows={5}
                placeholder="Introduce yourself and explain what you would like guidance with..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />

              <p className="mt-2 text-xs text-slate-400">
                A clear message helps the mentor understand how they can help
                you.
              </p>
            </div>

            {/* Request error */}
            {requestError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {requestError}
              </div>
            )}

            {/* Request success */}
            {requestSuccess && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                {requestSuccess}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeRequestModal}
                disabled={sendingRequest}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRequestMentorship}
                disabled={sendingRequest || !requestMessage.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Send size={17} />

                {sendingRequest ? "Sending..." : "Send Request"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MentorCard({ mentor, index, onRequest }) {
  const alumni = mentor.alumni;

  const initials =
    alumni?.name
      ?.split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "M";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Top gradient */}
      <div className="h-24 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600" />

      {/* Content */}
      <div className="relative px-5 pb-5">
        {/* Avatar */}
        <div className="-mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-600 shadow-md">
          {alumni?.photo ? (
            <img
              src={alumni.photo}
              alt={alumni.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}

          {!alumni?.photo && <span>{initials}</span>}
        </div>

        {/* Name */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {alumni?.name || "Alumni Mentor"}
            </h2>

            <p className="mt-1 text-sm font-medium text-indigo-600">
              {alumni?.companyName || "Professional"}
            </p>
          </div>

          {mentor.available && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              Available
            </span>
          )}
        </div>

        {/* Details */}
        <div className="mt-5 space-y-3">
          {alumni?.currentLocation && (
            <InfoRow
              icon={<MapPin size={16} />}
              text={alumni.currentLocation}
            />
          )}

          {mentor.yearsOfExperience !== undefined && (
            <InfoRow
              icon={<BriefcaseBusiness size={16} />}
              text={`${mentor.yearsOfExperience} years experience`}
            />
          )}

          {mentor.preferredMode && (
            <InfoRow icon={<Clock3 size={16} />} text={mentor.preferredMode} />
          )}
        </div>

        {/* Expertise */}
        {mentor.expertise?.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Expertise
            </p>

            <div className="flex flex-wrap gap-1.5">
              {mentor.expertise.slice(0, 4).map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600"
                >
                  {item}
                </span>
              ))}

              {mentor.expertise.length > 4 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  +{mentor.expertise.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mentorship Topics */}
        {mentor.mentorshipTopics?.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mentorship Topics
            </p>

            <p className="text-sm leading-5 text-slate-600">
              {mentor.mentorshipTopics.slice(0, 3).join(", ")}
            </p>
          </div>
        )}

        {/* Request button */}
        <button
          type="button"
          onClick={() => onRequest(mentor)}
          disabled={!mentor.available}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <MessageSquare size={17} />

          {mentor.available ? "Request Mentorship" : "Currently Unavailable"}
        </button>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-500">
      <span className="text-slate-400">{icon}</span>

      <span>{text}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <GraduationCap size={26} className="text-indigo-500" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        No mentors found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Try changing your search or filters to find available alumni mentors.
      </p>
    </div>
  );
}

export default MentorSearch;
