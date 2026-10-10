import { useEffect, useState } from "react";
import {
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
  BriefcaseBusiness,
  ExternalLink,
  CalendarDays,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getMyAlumniProfile,
  updateMyAlumniProfile,
} from "../../services/alumniService";

function AlumniProfile() {
  const [alumni, setAlumni] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    nativePlace: "",
    currentLocation: "",
    companyName: "",
    previousCompanies: "",
    areaOfExpertise: "",
    linkedinUrl: "",
    mobileNo: "",
    photo: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const data = await getMyAlumniProfile();

        if (data.success) {
          const profile = data.alumni;

          setAlumni(profile);

          setFormData({
            name: profile.name || "",
            nativePlace: profile.nativePlace || "",
            currentLocation: profile.currentLocation || "",
            companyName: profile.companyName || "",

            previousCompanies: Array.isArray(profile.previousCompanies)
              ? profile.previousCompanies.join(", ")
              : profile.previousCompanies || "",

            areaOfExpertise: Array.isArray(profile.areaOfExpertise)
              ? profile.areaOfExpertise.join(", ")
              : profile.areaOfExpertise || "",

            linkedinUrl: profile.linkedinUrl || "",
            mobileNo: profile.mobileNo || "",
            photo: profile.photo || "",
          });
        } else {
          setError(data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message || "Failed to load your alumni profile",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...formData,

        previousCompanies: formData.previousCompanies
          .split(",")
          .map((company) => company.trim())
          .filter(Boolean),

        areaOfExpertise: formData.areaOfExpertise
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const data = await updateMyAlumniProfile(payload);

      if (data.success) {
        setAlumni(data.alumni);

        setSuccess("Profile updated successfully.");

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading your profile..." />
      </DashboardLayout>
    );
  }

  if (error && !alumni) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-medium text-red-700">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  const initials = alumni.name
    ?.split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">Alumni Portal</p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">My Profile</h1>

          <p className="mt-2 text-sm text-slate-500">
            View and update your alumni profile information.
          </p>
        </div>
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

        {/* Alerts */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Basic Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <InputField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={<User size={17} />}
              />

              <InputField
                label="Mobile Number"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                icon={<Phone size={17} />}
              />

              <ReadOnlyField
                label="Email"
                value={alumni?.email}
                icon={<Mail size={17} />}
              />

              <ReadOnlyField
                label="Department"
                value={alumni?.department}
                icon={<GraduationCap size={17} />}
              />

              <ReadOnlyField
                label="Passout Year"
                value={alumni?.passoutYear}
                icon={<CalendarDays size={17} />}
              />

              <InputField
                label="Native Place"
                name="nativePlace"
                value={formData.nativePlace}
                onChange={handleChange}
                icon={<MapPin size={17} />}
              />

              <InputField
                label="Current Location"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
                icon={<MapPin size={17} />}
              />

              <InputField
                label="Photo URL"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                icon={<User size={17} />}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Professional Information
            </h2>

            <div className="mt-5 space-y-5">
              <InputField
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                icon={<Building2 size={17} />}
              />

              <TextAreaField
                label="Area of Expertise"
                name="areaOfExpertise"
                value={formData.areaOfExpertise}
                onChange={handleChange}
                placeholder="Example: Java, React, MongoDB, AI"
                icon={<BriefcaseBusiness size={17} />}
              />

              <TextAreaField
                label="Previous Companies"
                name="previousCompanies"
                value={formData.previousCompanies}
                onChange={handleChange}
                placeholder="Example: Infosys, TCS, Wipro"
                icon={<Building2 size={17} />}
              />
              <InputField
                label="LinkedIn URL"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                icon={<ExternalLink size={17} />}
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

/* ---------------- Input ---------------- */

function InputField({ label, name, value, onChange, icon, placeholder = "" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>
  );
}

/* ---------------- Textarea ---------------- */

function TextAreaField({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-3 text-slate-400">
          {icon}
        </div>

        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>
  );
}

/* ---------------- Read Only ---------------- */

function ReadOnlyField({ label, value, icon }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type="text"
          value={value || ""}
          readOnly
          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none"
        />
      </div>
    </div>
  );
}

export default AlumniProfile;
