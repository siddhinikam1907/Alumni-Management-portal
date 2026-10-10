import { useEffect, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";
import { getAlumni, getAlumniById } from "../../services/alumniService";

// ==========================================
// GET PROFILE INITIALS
// ==========================================

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "AL";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// ==========================================
// FORMAT LIST / ARRAY VALUES
// ==========================================

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "—";
  }

  return value || "—";
};

// ==========================================
// MAIN COMPONENT
// ==========================================

function AlumniManagement() {
  const [alumni, setAlumni] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FILTERS
  // ==========================================

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [location, setLocation] = useState("");

  // ==========================================
  // PAGINATION
  // ==========================================

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalAlumni: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
  });

  // ==========================================
  // PROFILE MODAL
  // ==========================================

  const [selectedAlumni, setSelectedAlumni] = useState(null);

  // ==========================================
  // FETCH ALUMNI
  // ==========================================

  const fetchAlumni = async (requestedPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const data = await getAlumni({
        search: search.trim() || undefined,
        department: department || undefined,
        passoutYear: passoutYear || undefined,
        currentLocation: location.trim() || undefined,
        page: requestedPage,
        limit: 20,
      });

      if (data.success) {
        setAlumni(data.alumni || []);

        setPagination({
          totalAlumni: data.totalAlumni || 0,
          totalPages: data.totalPages || 0,
          page: data.page || requestedPage,
          limit: data.limit || 20,
        });
      } else {
        setError(data.message || "Failed to fetch alumni.");
      }
    } catch (err) {
      console.error("Failed to fetch alumni:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch alumni. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // FETCH ALUMNI WITH CUSTOM FILTERS
  // ==========================================

  const fetchAlumniWithFilters = async ({
    search: searchValue,
    department: departmentValue,
    passoutYear: yearValue,
    location: locationValue,
    page: requestedPage,
  }) => {
    try {
      setLoading(true);
      setError("");

      const data = await getAlumni({
        search: searchValue.trim() || undefined,
        department: departmentValue || undefined,
        passoutYear: yearValue || undefined,
        currentLocation: locationValue.trim() || undefined,
        page: requestedPage,
        limit: 20,
      });

      if (data.success) {
        setAlumni(data.alumni || []);

        setPagination({
          totalAlumni: data.totalAlumni || 0,
          totalPages: data.totalPages || 0,
          page: data.page || requestedPage,
          limit: data.limit || 20,
        });
      } else {
        setError(data.message || "Failed to fetch alumni.");
      }
    } catch (err) {
      console.error("Failed to fetch alumni:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch alumni. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchAlumni(1);
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlumni(page);
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);

    fetchAlumni(1);
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearch("");
    setDepartment("");
    setPassoutYear("");
    setLocation("");
    setPage(1);

    fetchAlumniWithFilters({
      search: "",
      department: "",
      passoutYear: "",
      location: "",
      page: 1,
    });
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === page) {
      return;
    }

    setPage(newPage);

    fetchAlumni(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // VIEW PROFILE
  // ==========================================

  const handleViewProfile = async (id) => {
    try {
      setProfileLoading(true);

      const data = await getAlumniById(id);

      if (data.success) {
        setSelectedAlumni(data.alumni);
      }
    } catch (err) {
      console.error("Failed to fetch alumni profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && alumni.length === 0) {
    return (
      <DashboardLayout>
        <Loading text="Loading alumni..." />
      </DashboardLayout>
    );
  }

  // ==========================================
  // CURRENT PAGE COMPANY COUNT
  // ==========================================

  const companiesOnPage = new Set(
    alumni.map((person) => person.companyName).filter(Boolean),
  ).size;

  // ==========================================
  // RESULTS RANGE
  // ==========================================

  const startResult =
    pagination.totalAlumni === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;

  const endResult = Math.min(
    pagination.page * pagination.limit,
    pagination.totalAlumni,
  );

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* =========================================
            HEADER
        ========================================= */}

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Alumni Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage alumni profiles.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =========================================
            SUMMARY CARDS
        ========================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* TOTAL ALUMNI */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Users size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Total Alumni</p>

                <p className="text-2xl font-bold text-slate-900">
                  {pagination.totalAlumni.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* CURRENT RESULTS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <Search size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Current Page</p>

                <p className="text-2xl font-bold text-slate-900">
                  {alumni.length}
                </p>
              </div>
            </div>
          </div>

          {/* COMPANIES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Building2 size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Companies on Page</p>

                <p className="text-2xl font-bold text-slate-900">
                  {companiesOnPage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            FILTERS
        ========================================= */}

        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* SEARCH */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search alumni..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* DEPARTMENT */}

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
            >
              <option value="">All Departments</option>

              <option value="Computer Science">Computer Science</option>

              <option value="Information Technology">
                Information Technology
              </option>

              <option value="Electrical">Electrical</option>

              <option value="Mechanical">Mechanical</option>

              <option value="Civil">Civil</option>
            </select>

            {/* PASSOUT YEAR */}

            <select
              value={passoutYear}
              onChange={(e) => setPassoutYear(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
            >
              <option value="">All Passout Years</option>

              {Array.from({ length: 21 }, (_, index) => 2026 - index).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ),
              )}
            </select>

            {/* LOCATION */}

            <input
              type="text"
              placeholder="Current location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Search
            </button>

            {(search || department || passoutYear || location) && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </form>

        {/* =========================================
            RESULTS INFO
        ========================================= */}

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {pagination.totalAlumni === 0
              ? "No alumni found"
              : `Showing ${startResult}–${endResult} of ${pagination.totalAlumni.toLocaleString()}`}
          </p>

          {loading && (
            <RefreshCw size={18} className="animate-spin text-indigo-600" />
          )}
        </div>

        {/* =========================================
            TABLE
        ========================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-250">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Alumni
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Passout
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Company
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {alumni.map((person) => (
                  <tr key={person._id} className="transition hover:bg-slate-50">
                    {/* ALUMNI */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* INITIALS AVATAR */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-sm">
                          {getInitials(person.name)}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {person.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {person.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DEPARTMENT */}

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {person.department || "—"}
                    </td>

                    {/* YEAR */}

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {person.passoutYear || "—"}
                    </td>

                    {/* COMPANY */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {person.companyName || "—"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {formatValue(person.areaOfExpertise)}
                      </p>
                    </td>

                    {/* LOCATION */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin size={15} />

                        {person.currentLocation || "—"}
                      </div>
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleViewProfile(person._id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY */}

          {alumni.length === 0 && !loading && (
            <div className="py-16 text-center">
              <Users size={40} className="mx-auto text-slate-300" />

              <p className="mt-3 font-medium text-slate-700">No alumni found</p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}

          {/* =========================================
              PAGINATION
          ========================================= */}

          {pagination.totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {startResult} to {endResult} of{" "}
                {pagination.totalAlumni.toLocaleString()}
              </p>

              <div className="flex items-center gap-2">
                {/* PREVIOUS */}

                <button
                  disabled={page === 1 || loading}
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* PAGE */}

                <span className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
                  {page} / {pagination.totalPages}
                </span>

                {/* NEXT */}

                <button
                  disabled={page === pagination.totalPages || loading}
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          PROFILE MODAL
      ========================================= */}

      {selectedAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Alumni Profile
              </h2>

              <button
                onClick={() => setSelectedAlumni(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* PROFILE */}

            <div className="p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                {/* INITIALS PROFILE AVATAR */}

                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-violet-600 text-3xl font-bold text-white shadow-lg">
                  {getInitials(selectedAlumni.name)}
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedAlumni.name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {selectedAlumni.email}
                  </p>

                  <p className="mt-1 text-sm text-indigo-600">
                    {formatValue(selectedAlumni.areaOfExpertise)}
                  </p>
                </div>
              </div>

              {/* PROFILE DETAILS */}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ProfileField
                  label="Department"
                  value={selectedAlumni.department}
                />

                <ProfileField
                  label="Passout Year"
                  value={selectedAlumni.passoutYear}
                />

                <ProfileField
                  label="Company"
                  value={selectedAlumni.companyName}
                />

                <ProfileField
                  label="Current Location"
                  value={selectedAlumni.currentLocation}
                />

                <ProfileField
                  label="Native Place"
                  value={selectedAlumni.nativePlace}
                />

                <ProfileField
                  label="Date of Birth"
                  value={selectedAlumni.dob}
                />

                <ProfileField label="Mobile" value={selectedAlumni.mobileNo} />

                <ProfileField
                  label="Expertise"
                  value={formatValue(selectedAlumni.areaOfExpertise)}
                />
              </div>

              {/* PREVIOUS COMPANIES */}

              <div className="mt-4">
                <ProfileField
                  label="Previous Companies"
                  value={formatValue(selectedAlumni.previousCompanies)}
                />
              </div>

              {/* LINKEDIN */}

              {selectedAlumni.linkedinUrl && (
                <div className="mt-6">
                  <a
                    href={
                      selectedAlumni.linkedinUrl.startsWith("http")
                        ? selectedAlumni.linkedinUrl
                        : `https://${selectedAlumni.linkedinUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    <ExternalLink size={17} />
                    View LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* =========================================
          PROFILE LOADING
      ========================================= */}

      {profileLoading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/30">
          <div className="rounded-xl bg-white px-6 py-4 shadow-xl">
            <div className="flex items-center gap-3">
              <RefreshCw size={20} className="animate-spin text-indigo-600" />

              <span className="text-sm font-medium text-slate-700">
                Loading profile...
              </span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ==========================================
// PROFILE FIELD
// ==========================================

function ProfileField({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {formatValue(value)}
      </p>
    </div>
  );
}

export default AlumniManagement;
