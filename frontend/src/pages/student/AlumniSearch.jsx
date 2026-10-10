import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Building2,
  GraduationCap,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";
import { getAlumni } from "../../services/alumniService";

function AlumniSearch() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalAlumni: 0,
    totalPages: 0,
    page: 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);

  const fetchAlumni = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const data = await getAlumni({
        search: search.trim() || undefined,
        department: department || undefined,
        passoutYear: passoutYear || undefined,
        currentLocation: currentLocation.trim() || undefined,
        page: requestedPage,
        limit: 12,
      });

      if (data.success) {
        setAlumni(data.alumni || []);

        setPagination({
          totalAlumni: data.totalAlumni || 0,
          totalPages: data.totalPages || 0,
          page: data.page || requestedPage,
          limit: data.limit || 12,
        });
      }
    } catch (err) {
      console.error("Failed to fetch alumni:", err);
      setError("Unable to load alumni. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni(1);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    fetchAlumni(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchAlumni(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearch("");
    setDepartment("");
    setPassoutYear("");
    setCurrentLocation("");
    setPage(1);

    setTimeout(() => {
      fetchAlumni(1);
    }, 0);
  };

  const hasFilters = search || department || passoutYear || currentLocation;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-7"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Alumni Network
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Find Alumni
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Discover alumni by their company, location, expertise, department
              and graduation year.
            </p>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5">
            <p className="text-xs font-medium text-indigo-500">
              Alumni Network
            </p>

            <p className="text-lg font-bold text-indigo-700">
              {pagination.totalAlumni.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <form onSubmit={handleSearch}>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, company, location or expertise..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 border-t border-slate-100 pt-4"
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                >
                  <option value="">All Departments</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                </select>

                <select
                  value={passoutYear}
                  onChange={(event) => setPassoutYear(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
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

                <input
                  value={currentLocation}
                  onChange={(event) => setCurrentLocation(event.target.value)}
                  placeholder="Current location"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Loading text="Finding alumni..." />
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {pagination.totalAlumni === 0
                ? "No alumni found"
                : `Showing ${(page - 1) * pagination.limit + 1}–${Math.min(
                    page * pagination.limit,
                    pagination.totalAlumni,
                  )} of ${pagination.totalAlumni.toLocaleString()}`}
            </p>
          </div>

          {alumni.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {alumni.map((person, index) => (
                <AlumniCard key={person._id} person={person} index={index} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <div className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700">
                {page} / {pagination.totalPages}
              </div>

              <button
                disabled={page === pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function AlumniCard({ person, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Cover */}
      <div className="h-20 bg-linear-to-r from-indigo-500 via-indigo-600 to-violet-600" />

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="-mt-10">
          <div className="relative -mt-12 ml-6 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-indigo-100 shadow-lg">
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}

            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-indigo-600">
              {person.name
                ?.split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-900">
              {person.name}
            </h3>

            <p className="mt-1 text-sm font-medium text-indigo-600">
              {person.companyName || "Professional"}
            </p>
          </div>

          {person.linkedinUrl && (
            <a
              href={person.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              <ExternalLink size={16} />
              LinkedIn
            </a>
          )}
        </div>

        {/* Information */}
        <div className="mt-4 space-y-2.5">
          <InfoRow icon={MapPin} text={person.currentLocation} />

          <InfoRow
            icon={GraduationCap}
            text={`${person.department || "Department"} • ${
              person.passoutYear || "Year"
            }`}
          />

          <InfoRow
            icon={BriefcaseBusiness}
            text={
              person.areaOfExpertise?.length
                ? person.areaOfExpertise.join(", ")
                : "Expertise not specified"
            }
          />
        </div>

        {/* Expertise tags */}
        {person.areaOfExpertise?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {person.areaOfExpertise.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
              >
                {skill}
              </span>
            ))}

            {person.areaOfExpertise.length > 3 && (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                +{person.areaOfExpertise.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action */}
        <Link
          to={`/student/alumni/${person._id}`}
          className="mt-5 flex w-full items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-500">
      <Icon size={16} className="shrink-0 text-slate-400" />

      <span className="truncate">{text || "Not specified"}</span>
    </div>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Search size={25} className="text-slate-400" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-800">
        No alumni found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        We couldn't find anyone matching your search criteria. Try changing your
        filters or search terms.
      </p>

      <button
        onClick={onClear}
        className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Clear Filters
      </button>
    </div>
  );
}

export default AlumniSearch;
