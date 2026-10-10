import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Building2,
  GraduationCap,
  BriefcaseBusiness,
  ExternalLink,
  Mail,
  Phone,
  CalendarDays,
  UserRound,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";
import { getAlumniById } from "../../services/alumniService";

function AlumniProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAlumniById(id);

        if (data.success) {
          setAlumni(data.alumni);
        } else {
          setError("Unable to load alumni profile.");
        }
      } catch (err) {
        console.error("Failed to fetch alumni profile:", err);

        setError(
          err.response?.data?.message || "Unable to load alumni profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading alumni profile..." />
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !alumni) {
    return (
      <DashboardLayout>
        <div className="flex min-h-125 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <UserRound className="text-rose-500" size={30} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Profile not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error || "This alumni profile could not be found."}
            </p>

            <button
              onClick={() => navigate("/student/alumni")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <ArrowLeft size={17} />
              Back to Alumni
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Generate initials
  const initials = alumni.name
    ?.split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* Back button */}
        <button
          onClick={() => navigate("/student/alumni")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Alumni
        </button>

        {/* Profile Hero */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Cover */}
          <div className="h-40 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600" />

          {/* Profile information */}
          <div className="px-6 pb-8 sm:px-8">
            <div className="-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {/* Avatar */}
                <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-indigo-100 text-4xl font-bold text-indigo-600 shadow-lg">
                  {alumni.photo ? (
                    <img
                      src={alumni.photo}
                      alt={alumni.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}

                  <span>{initials}</span>
                </div>

                {/* Name and basic information */}
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {alumni.name}
                  </h1>

                  <p className="mt-1 text-base text-indigo-600">
                    {alumni.companyName || "Professional"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    {alumni.currentLocation && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={15} />
                        {alumni.currentLocation}
                      </span>
                    )}

                    {alumni.passoutYear && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={15} />
                        Class of {alumni.passoutYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* LinkedIn */}
              {alumni.linkedinUrl && (
                <a
                  href={alumni.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                >
                  <ExternalLink size={17} />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 lg:col-span-2">
            {/* Professional Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Professional Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  icon={<Building2 size={19} />}
                  label="Current Company"
                  value={alumni.companyName}
                />

                <InfoItem
                  icon={<BriefcaseBusiness size={19} />}
                  label="Area of Expertise"
                  value={
                    alumni.areaOfExpertise?.length
                      ? alumni.areaOfExpertise.join(", ")
                      : "Not specified"
                  }
                />

                <InfoItem
                  icon={<GraduationCap size={19} />}
                  label="Department"
                  value={alumni.department}
                />

                <InfoItem
                  icon={<GraduationCap size={19} />}
                  label="Passout Year"
                  value={alumni.passoutYear}
                />

                <InfoItem
                  icon={<MapPin size={19} />}
                  label="Current Location"
                  value={alumni.currentLocation}
                />

                <InfoItem
                  icon={<MapPin size={19} />}
                  label="Native Place"
                  value={alumni.nativePlace}
                />
              </div>
            </section>

            {/* Expertise */}
            {alumni.areaOfExpertise?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Areas of Expertise
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {alumni.areaOfExpertise.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Previous Companies */}
            {alumni.previousCompanies?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Previous Companies
                </h2>

                <div className="mt-4 space-y-3">
                  {alumni.previousCompanies.map((company) => (
                    <div
                      key={company}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                        <Building2 size={17} />
                      </div>

                      <span className="text-sm font-medium text-slate-700">
                        {company}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Contact */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Contact Information
              </h2>

              <div className="mt-5 space-y-4">
                {alumni.email && (
                  <ContactItem
                    icon={<Mail size={18} />}
                    label="Email"
                    value={alumni.email}
                  />
                )}

                {alumni.mobileNo && (
                  <ContactItem
                    icon={<Phone size={18} />}
                    label="Mobile"
                    value={alumni.mobileNo}
                  />
                )}

                {alumni.dob && (
                  <ContactItem
                    icon={<CalendarDays size={18} />}
                    label="Date of Birth"
                    value={new Date(alumni.dob).toLocaleDateString()}
                  />
                )}
              </div>
            </section>

            {/* Alumni at a glance */}
            <section className="rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
              <p className="text-sm font-medium text-indigo-100">
                Alumni Network
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Connect with {alumni.name?.split(" ")[0]}
              </h2>

              <p className="mt-2 text-sm leading-6 text-indigo-100">
                Explore their professional journey and areas of expertise.
              </p>

              {alumni.linkedinUrl && (
                <a
                  href={alumni.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                  <ExternalLink size={17} />
                  View LinkedIn
                </a>
              )}
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-700">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        <p className="mt-1 break-all text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

export default AlumniProfile;
