import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Plus,
  Search,
  MapPin,
  Building2,
  Pencil,
  Trash2,
  X,
  Save,
  ExternalLink,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../../services/jobService";

const emptyForm = {
  title: "",
  companyName: "",
  description: "",
  location: "",
  jobType: "",
  skills: "",
  experience: "Fresher",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "INR",
  salaryPeriod: "YEARLY",
  applicationLink: "",
};

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // FETCH MY JOBS
  // --------------------------------------------------

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyJobs();

      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        setError(data.message || "Failed to fetch your jobs");
      }
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to fetch your jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // OPEN CREATE FORM
  // --------------------------------------------------

  const openCreateForm = () => {
    setEditingJob(null);
    setFormData({ ...emptyForm });

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // --------------------------------------------------
  // OPEN EDIT FORM
  // --------------------------------------------------

  const openEditForm = (job) => {
    setEditingJob(job);

    setFormData({
      title: job.title || "",
      companyName: job.companyName || "",
      description: job.description || "",
      location: job.location || "",
      jobType: job.jobType || "",

      skills: Array.isArray(job.skills)
        ? job.skills.join(", ")
        : job.skills || "",

      experience: job.experience || "Fresher",

      salaryMin:
        job.salary?.min !== null && job.salary?.min !== undefined
          ? String(job.salary.min)
          : "",

      salaryMax:
        job.salary?.max !== null && job.salary?.max !== undefined
          ? String(job.salary.max)
          : "",

      salaryCurrency: job.salary?.currency || "INR",

      salaryPeriod: job.salary?.period || "YEARLY",

      applicationLink: job.applicationLink || "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // --------------------------------------------------
  // CLOSE FORM
  // --------------------------------------------------

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingJob(null);
    setFormData({ ...emptyForm });
    setError("");
  };

  // --------------------------------------------------
  // SUBMIT JOB
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: formData.title.trim(),

        companyName: formData.companyName.trim(),

        description: formData.description.trim(),

        location: formData.location.trim(),

        jobType: formData.jobType,

        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),

        experience: formData.experience.trim() || "Fresher",

        salary: {
          min: formData.salaryMin !== "" ? Number(formData.salaryMin) : null,

          max: formData.salaryMax !== "" ? Number(formData.salaryMax) : null,

          currency: formData.salaryCurrency,

          period: formData.salaryPeriod,
        },

        applicationLink: formData.applicationLink.trim(),
      };

      let data;

      if (editingJob) {
        data = await updateJob(editingJob._id, payload);
      } else {
        data = await createJob(payload);
      }

      if (!data.success) {
        setError(data.message || "Failed to save job");
        return;
      }

      setSuccess(
        editingJob ? "Job updated successfully." : "Job posted successfully.",
      );

      setShowForm(false);
      setEditingJob(null);
      setFormData({ ...emptyForm });

      await fetchJobs();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE JOB
  // --------------------------------------------------

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(jobId);
      setError("");
      setSuccess("");

      const data = await deleteJob(jobId);

      if (!data.success) {
        setError(data.message || "Failed to delete job");
        return;
      }

      setJobs((prev) => prev.filter((job) => job._id !== jobId));

      setSuccess("Job deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // FILTER JOBS
  // --------------------------------------------------

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      job.title?.toLowerCase().includes(searchText) ||
      job.companyName?.toLowerCase().includes(searchText) ||
      job.location?.toLowerCase().includes(searchText);

    const matchesType = !jobType || job.jobType === jobType;

    return matchesSearch && matchesType;
  });

  // --------------------------------------------------
  // SALARY DISPLAY
  // --------------------------------------------------

  const formatSalary = (salary) => {
    if (!salary) return "Salary not specified";

    const { min, max, currency, period } = salary;

    if (min === null && max === null) {
      return "Salary not specified";
    }

    const symbol = currency === "INR" ? "₹" : currency;

    let value = "";

    if (
      min !== null &&
      min !== undefined &&
      max !== null &&
      max !== undefined
    ) {
      value = `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    } else if (min !== null && min !== undefined) {
      value = `From ${symbol}${min.toLocaleString()}`;
    } else {
      value = `Up to ${symbol}${max.toLocaleString()}`;
    }

    const periodText =
      period === "YEARLY" ? "/year" : period === "MONTHLY" ? "/month" : "/hour";

    return `${value} ${periodText}`;
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Jobs</h1>

              <p className="text-sm text-slate-500">
                Manage the jobs you have posted
              </p>
            </div>
          </div>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Post New Job
          </button>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* ERROR */}
        {error && !showForm && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* SEARCH */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search your jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All Job Types</option>

              <option value="FULL_TIME">Full Time</option>

              <option value="PART_TIME">Part Time</option>

              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
        </div>

        {/* JOB LIST */}
        {loading ? (
          <Loading text="Loading your jobs..." />
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <BriefcaseBusiness
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />

            <h2 className="text-lg font-semibold text-slate-800">
              {jobs.length === 0 ? "No jobs posted yet" : "No matching jobs"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {jobs.length === 0
                ? "Post your first job opportunity for students."
                : "Try changing your search or filter."}
            </p>

            {jobs.length === 0 && (
              <button
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={17} />
                Post Your First Job
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {/* TITLE */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900">
                      {job.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={15} />
                        {job.companyName}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={15} />
                        {job.location}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {job.jobType}
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {job.description}
                </p>

                {/* EXPERIENCE + SALARY */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    Experience: {job.experience || "Fresher"}
                  </span>

                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    {formatSalary(job.salary)}
                  </span>
                </div>

                {/* SKILLS */}
                {job.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => openEditForm(job)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/alumni/jobs/${job._id}/applications`)
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    <FileText size={15} />
                    Applications
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    disabled={deletingId === job._id}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={15} />

                    {deletingId === job._id ? "Deleting..." : "Delete"}
                  </button>

                  {job.applicationLink && (
                    <a
                      href={job.applicationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <ExternalLink size={15} />
                      Application Link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              {/* MODAL HEADER */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingJob ? "Edit Job" : "Post New Job"}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {editingJob
                      ? "Update your job information"
                      : "Share a job opportunity with students"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5 p-6">
                {/* TITLE + COMPANY */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Job Title *
                    </label>

                    <input
                      required
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Software Engineer"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Company Name *
                    </label>

                    <input
                      required
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Company name"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* LOCATION + JOB TYPE */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Location *
                    </label>

                    <input
                      required
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Pune"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Job Type *
                    </label>

                    <select
                      required
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">Select job type</option>

                      <option value="FULL_TIME">Full Time</option>

                      <option value="PART_TIME">Part Time</option>

                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>

                {/* EXPERIENCE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Experience
                  </label>

                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Fresher / 0-2 years / 2-5 years"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* SKILLS */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Skills
                  </label>

                  <input
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Java, Spring Boot, React, SQL"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Separate multiple skills with commas.
                  </p>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Job Description *
                  </label>

                  <textarea
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the role, responsibilities and requirements..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* SALARY */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Salary
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                      type="number"
                      min="0"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleChange}
                      placeholder="Minimum"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                    <input
                      type="number"
                      min="0"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleChange}
                      placeholder="Maximum"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                    <select
                      name="salaryCurrency"
                      value={formData.salaryCurrency}
                      onChange={handleChange}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="INR">INR</option>
                    </select>

                    <select
                      name="salaryPeriod"
                      value={formData.salaryPeriod}
                      onChange={handleChange}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="YEARLY">Yearly</option>

                      <option value="MONTHLY">Monthly</option>

                      <option value="HOURLY">Hourly</option>
                    </select>
                  </div>
                </div>

                {/* APPLICATION LINK */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Application Link
                  </label>

                  <input
                    type="url"
                    name="applicationLink"
                    value={formData.applicationLink}
                    onChange={handleChange}
                    placeholder="https://company.com/careers/..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* FORM ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={17} />

                    {saving
                      ? "Saving..."
                      : editingJob
                        ? "Update Job"
                        : "Post Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Jobs;
