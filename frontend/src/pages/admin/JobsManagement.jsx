import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../../services/jobService";

import {
  getJobApplications,
  updateApplicationStatus,
} from "../../services/applicationService";

function JobsManagement() {
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);

  const [showJobForm, setShowJobForm] = useState(false);

  const [editingJob, setEditingJob] = useState(null);

  const [applications, setApplications] = useState([]);

  const [showApplications, setShowApplications] = useState(false);

  const [applicationLoading, setApplicationLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    companyName: "",
    description: "",
    location: "",
    jobType: "FULL_TIME",
    skills: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "INR",
    salaryPeriod: "YEARLY",
    applicationLink: "",
  });

  const fetchJobs = async () => {
    try {
      setError("");

      const data = await getAllJobs();

      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);

      setError(err.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const filteredJobs = jobs.filter((job) => {
    const value = search.toLowerCase();

    return (
      job.title?.toLowerCase().includes(value) ||
      job.companyName?.toLowerCase().includes(value) ||
      job.location?.toLowerCase().includes(value) ||
      job.description?.toLowerCase().includes(value)
    );
  });

  const openCreateForm = () => {
    setEditingJob(null);

    setForm({
      title: "",
      companyName: "",
      description: "",
      location: "",
      jobType: "FULL_TIME",
      skills: "",
      experience: "",
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "INR",
      salaryPeriod: "YEARLY",
      applicationLink: "",
    });

    setShowJobForm(true);
  };

  const openEditForm = (job) => {
    setEditingJob(job);

    setForm({
      title: job.title || "",
      companyName: job.companyName || "",
      description: job.description || "",
      location: job.location || "",
      jobType: job.jobType || "FULL_TIME",
      skills: job.skills?.join(", ") || "",
      experience: job.experience || "",
      salaryMin: job.salary?.min || "",
      salaryMax: job.salary?.max || "",
      salaryCurrency: job.salary?.currency || "INR",
      salaryPeriod: job.salary?.period || "YEARLY",
      applicationLink: job.applicationLink || "",
    });

    setShowJobForm(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const jobData = {
        title: form.title,
        companyName: form.companyName,
        description: form.description,
        location: form.location,
        jobType: form.jobType,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        experience: form.experience,
        salary: {
          min: Number(form.salaryMin) || 0,
          max: Number(form.salaryMax) || 0,
          currency: form.salaryCurrency,
          period: form.salaryPeriod,
        },
        applicationLink: form.applicationLink,
      };

      if (editingJob) {
        await updateJob(editingJob._id, jobData);
      } else {
        await createJob(jobData);
      }

      setShowJobForm(false);

      await fetchJobs();
    } catch (err) {
      console.error("Failed to save job:", err);

      setError(err.response?.data?.message || "Failed to save job.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmed) return;

    try {
      await deleteJob(id);

      await fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete job.");
    }
  };

  const handleApplications = async (job) => {
    try {
      setSelectedJob(job);
      setShowApplications(true);
      setApplicationLoading(true);

      const data = await getJobApplications(job._id);

      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load applications.");
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status);

      if (selectedJob) {
        await handleApplications(selectedJob);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update application status.",
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Jobs Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage jobs posted by alumni and the college.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus size={17} />
              Post Job
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, companies, locations..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* Jobs */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">All Jobs</h2>

            <p className="text-sm text-slate-500">
              {filteredJobs.length} jobs found
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No jobs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Job
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Company
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Posted By
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {job.title}
                        </p>

                        <p className="text-xs text-slate-500">{job.location}</p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {job.companyName}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {job.jobType}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {job.postedBy?.name || "Admin"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            title="View"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() => handleApplications(job)}
                            className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                            title="Applications"
                          >
                            <Users size={17} />
                          </button>

                          <button
                            onClick={() => openEditForm(job)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            onClick={() => handleDelete(job._id)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Job Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingJob ? "Edit Job" : "Post New Job"}
                </h2>

                <button
                  onClick={() => setShowJobForm(false)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Job title"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />

                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Company name"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Job description"
                  required
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />

                  <select
                    name="jobType"
                    value={form.jobType}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  >
                    <option value="FULL_TIME">Full Time</option>

                    <option value="PART_TIME">Part Time</option>

                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="Skills (comma separated)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />

                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Experience"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    name="salaryMin"
                    value={form.salaryMin}
                    onChange={handleChange}
                    placeholder="Minimum salary"
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />

                  <input
                    type="number"
                    name="salaryMax"
                    value={form.salaryMax}
                    onChange={handleChange}
                    placeholder="Maximum salary"
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <select
                  name="salaryPeriod"
                  value={form.salaryPeriod}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                >
                  <option value="YEARLY">Yearly</option>

                  <option value="MONTHLY">Monthly</option>

                  <option value="HOURLY">Hourly</option>
                </select>

                <input
                  name="applicationLink"
                  value={form.applicationLink}
                  onChange={handleChange}
                  placeholder="Application URL"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700"
                >
                  {editingJob ? "Update Job" : "Post Job"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Applications Modal */}
        {showApplications && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Applications</h2>

                  <p className="text-sm text-slate-500">{selectedJob.title}</p>
                </div>

                <button
                  onClick={() => setShowApplications(false)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              {applicationLoading ? (
                <div className="p-8 text-center text-slate-500">
                  Loading applications...
                </div>
              ) : applications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No applications yet.
                </div>
              ) : (
                <div className="overflow-x-auto p-6">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-3 text-left text-xs uppercase text-slate-500">
                          Applicant
                        </th>

                        <th className="px-3 py-3 text-left text-xs uppercase text-slate-500">
                          Status
                        </th>

                        <th className="px-3 py-3 text-left text-xs uppercase text-slate-500">
                          Resume
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {applications.map((application) => (
                        <tr
                          key={application._id}
                          className="border-b border-slate-100"
                        >
                          <td className="px-3 py-4">
                            <p className="font-medium">
                              {application.applicant?.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {application.applicant?.email}
                            </p>
                          </td>

                          <td className="px-3 py-4">
                            <select
                              value={application.status}
                              onChange={(e) =>
                                handleApplicationStatus(
                                  application._id,
                                  e.target.value,
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                              <option value="APPLIED">Applied</option>

                              <option value="SHORTLISTED">Shortlisted</option>

                              <option value="REJECTED">Rejected</option>

                              <option value="SELECTED">Selected</option>
                            </select>
                          </td>

                          <td className="px-3 py-4">
                            {application.resume?.fileUrl && (
                              <a
                                href={application.resume.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-indigo-600 hover:underline"
                              >
                                View Resume
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default JobsManagement;
