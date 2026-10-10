import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  Search,
  Filter,
  Clock3,
  IndianRupee,
  ExternalLink,
  FileText,
  X,
  Upload,
  Send,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import { getAllJobs, getJobById } from "../../services/jobService";

import { applyForJob } from "../../services/applicationService";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  const [applyLoading, setApplyLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const data = await getAllJobs();

      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        !search ||
        job.title?.toLowerCase().includes(searchValue) ||
        job.companyName?.toLowerCase().includes(searchValue) ||
        job.description?.toLowerCase().includes(searchValue) ||
        job.skills?.some((skill) => skill.toLowerCase().includes(searchValue));

      const matchesType = !jobType || job.jobType === jobType;

      const matchesLocation =
        !location ||
        job.location?.toLowerCase().includes(location.toLowerCase());

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobs, search, jobType, location]);

  const clearFilters = () => {
    setSearch("");
    setJobType("");
    setLocation("");
  };

  const openJob = async (jobId) => {
    try {
      setError("");

      const data = await getJobById(jobId);

      if (data.success) {
        setSelectedJob(data.job);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load job details.");
    }
  };

  const openApply = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
    setResume(null);
    setCoverLetter("");
    setMessage("");
    setError("");
  };

  const closeApply = () => {
    if (applyLoading) return;

    setShowApplyModal(false);
    setResume(null);
    setCoverLetter("");
  };

  const handleApply = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!resume) {
      setError("Please upload your resume.");
      return;
    }

    try {
      setApplyLoading(true);

      const formData = new FormData();

      formData.append("resume", resume);
      formData.append("coverLetter", coverLetter);

      const data = await applyForJob(selectedJob._id, formData);

      if (!data.success) {
        setError(data.message || "Failed to submit application.");
        return;
      }

      setMessage("Application submitted successfully!");

      setTimeout(() => {
        closeApply();
      }, 1200);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplyLoading(false);
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

  const formatSalary = (salary) => {
    if (!salary) return "Salary not specified";

    if (salary.min === null && salary.max === null) {
      return "Salary not specified";
    }

    const currency = salary.currency === "INR" ? "₹" : salary.currency || "";

    if (salary.min !== null && salary.max !== null) {
      return `${currency}${salary.min} - ${currency}${salary.max}`;
    }

    if (salary.min !== null) {
      return `From ${currency}${salary.min}`;
    }

    return `Up to ${currency}${salary.max}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading jobs..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Career Opportunities
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">Find Jobs</h1>

          <p className="mt-2 text-sm text-slate-500">
            Discover jobs and internships shared by alumni and apply directly
            through the portal.
          </p>
        </div>

        {/* Error */}
        {error && !showApplyModal && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_200px_200px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Filter size={17} />
              Clear
            </button>
          </div>
        </div>

        {/* Job count */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}{" "}
            found
          </p>
        </div>

        {/* Jobs */}
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <BriefcaseBusiness size={40} className="mx-auto text-slate-300" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No jobs found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Job heading */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <BriefcaseBusiness size={21} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {job.title}
                      </h3>

                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <Building2 size={14} />
                        {job.companyName}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {formatJobType(job.jobType)}
                  </span>
                </div>

                {/* Location */}
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} />
                  {job.location}
                </div>

                {/* Experience */}
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 size={16} />
                  {job.experience || "Fresher"}
                </div>

                {/* Salary */}
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <IndianRupee size={16} />
                  {formatSalary(job.salary)}
                </div>

                {/* Description */}
                <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
                  {job.description}
                </p>

                {/* Skills */}
                {job.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}

                    {job.skills.length > 5 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                        +{job.skills.length - 5}
                      </span>
                    )}
                  </div>
                )}

                {/* Posted by */}
                {job.postedBy && (
                  <p className="mt-4 text-xs text-slate-400">
                    Posted by {job.postedBy.name}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-auto flex gap-3 pt-6">
                  <button
                    onClick={() => openJob(job._id)}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => openApply(job)}
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= JOB DETAILS MODAL ================= */}

      {selectedJob && !showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedJob.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedJob.companyName}
                </p>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={<MapPin size={17} />}
                  label="Location"
                  value={selectedJob.location}
                />

                <InfoItem
                  icon={<BriefcaseBusiness size={17} />}
                  label="Job Type"
                  value={formatJobType(selectedJob.jobType)}
                />

                <InfoItem
                  icon={<Clock3 size={17} />}
                  label="Experience"
                  value={selectedJob.experience || "Fresher"}
                />

                <InfoItem
                  icon={<IndianRupee size={17} />}
                  label="Salary"
                  value={formatSalary(selectedJob.salary)}
                />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Job Description
                </h3>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.skills?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Required Skills
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.postedBy && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Posted by</p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedJob.postedBy.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {selectedJob.postedBy.email}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>

                <button
                  onClick={() => openApply(selectedJob)}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= APPLY MODAL ================= */}

      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Apply for {selectedJob.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedJob.companyName}
                </p>
              </div>

              <button
                onClick={closeApply}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {message}
                </div>
              )}

              {/* Resume */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Resume *
                </label>

                <div className="rounded-xl border border-dashed border-slate-300 p-5">
                  <div className="flex items-center gap-3">
                    <Upload size={20} className="text-indigo-600" />

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Upload your resume
                      </p>

                      <p className="text-xs text-slate-500">PDF, DOC or DOCX</p>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="mt-4 block w-full text-sm text-slate-500"
                  />

                  {resume && (
                    <p className="mt-2 text-xs font-medium text-indigo-600">
                      Selected: {resume.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Cover letter */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cover Letter
                </label>

                <textarea
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write a short message to the employer..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                disabled={applyLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applyLoading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send size={17} />
                    Submit Application
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value || "Not specified"}
      </p>
    </div>
  );
}

export default Jobs;
