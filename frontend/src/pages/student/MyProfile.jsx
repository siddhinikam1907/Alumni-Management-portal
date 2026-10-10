import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  ExternalLink,
  GraduationCap,
  MapPin,
  Phone,
  UserCircle,
  Users,
  Globe,
  Save,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getMyStudentProfile,
  updateStudentProfile,
} from "../../services/studentProfileService";

import { useAuth } from "../../context/AuthContext";

function MyProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // --------------------------------------------------
  // Fetch profile
  // --------------------------------------------------

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getMyStudentProfile();

      if (data.success) {
        setProfile(data.profile);
        setFormData(createFormData(data.profile));
      }
    } catch (error) {
      console.error("Failed to fetch student profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Create frontend form data
  // --------------------------------------------------

  const createFormData = (profile) => {
    return {
      mobileNo: profile?.mobileNo || "",

      dob: profile?.dob ? profile.dob.split("T")[0] : "",

      nativePlace: profile?.nativePlace || "",
      currentLocation: profile?.currentLocation || "",

      college: profile?.college || "",
      department: profile?.department || "",

      enrollmentYear: profile?.enrollmentYear || "",

      expectedGraduationYear: profile?.expectedGraduationYear || "",

      currentYear: profile?.currentYear || "",

      cgpa: profile?.cgpa ?? "",

      /*
       * IMPORTANT:
       * Convert arrays into strings for editing.
       *
       * Example:
       * ["Java", "React", "Node.js"]
       *
       * becomes:
       * "Java, React, Node.js"
       */
      skills: profile?.skills?.join(", ") || "",

      areaOfExpertise: profile?.areaOfExpertise?.join(", ") || "",

      careerInterests: profile?.careerInterests?.join(", ") || "",

      linkedinUrl: profile?.linkedinUrl || "",

      githubUrl: profile?.githubUrl || "",

      portfolioUrl: profile?.portfolioUrl || "",

      photo: profile?.photo || "",

      resumeUrl: profile?.resumeUrl || "",

      profileVisibility: {
        alumni: profile?.profileVisibility?.alumni ?? true,

        mentors: profile?.profileVisibility?.mentors ?? true,
      },
    };
  };

  // --------------------------------------------------
  // Normal input change
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Array input change
  // --------------------------------------------------
  //
  // IMPORTANT:
  // We DO NOT split here.
  //
  // The user is allowed to type:
  //
  // Java React Node.js
  //
  // or:
  //
  // Java, React, Node.js
  //
  // Spaces and commas remain untouched.
  //
  // Conversion happens only during save.
  // --------------------------------------------------

  const handleArrayChange = (event, field) => {
    const { value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --------------------------------------------------
  // Convert comma-separated string into array
  // --------------------------------------------------

  const convertToArray = (value) => {
    if (!value || !value.trim()) {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // --------------------------------------------------
  // Visibility change
  // --------------------------------------------------

  const handleVisibilityChange = (field) => {
    setFormData((prev) => ({
      ...prev,

      profileVisibility: {
        ...prev.profileVisibility,

        [field]: !prev.profileVisibility[field],
      },
    }));
  };

  // --------------------------------------------------
  // Save profile
  // --------------------------------------------------

  const handleSave = async () => {
    try {
      setSaving(true);

      const dataToSend = {
        ...formData,

        /*
         * Convert the three text fields back into arrays
         * before sending them to MongoDB.
         */

        skills: convertToArray(formData.skills),

        areaOfExpertise: convertToArray(formData.areaOfExpertise),

        careerInterests: convertToArray(formData.careerInterests),

        enrollmentYear:
          formData.enrollmentYear === ""
            ? undefined
            : Number(formData.enrollmentYear),

        expectedGraduationYear:
          formData.expectedGraduationYear === ""
            ? undefined
            : Number(formData.expectedGraduationYear),

        cgpa: formData.cgpa === "" ? undefined : Number(formData.cgpa),
      };

      const data = await updateStudentProfile(dataToSend);

      if (data.success) {
        setProfile(data.profile);

        /*
         * Convert the saved arrays back into strings
         * for the next editing session.
         */
        setFormData(createFormData(data.profile));

        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to update student profile:", error);

      alert(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Cancel editing
  // --------------------------------------------------

  const handleCancel = () => {
    setFormData(createFormData(profile));
    setEditing(false);
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading your profile..." />
      </DashboardLayout>
    );
  }

  // --------------------------------------------------
  // First-time student
  // --------------------------------------------------

  if (!profile || !formData) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <UserCircle size={48} className="mx-auto text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Complete your profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your student profile has not been created yet.
            </p>

            <button
              onClick={() => {
                const emptyProfile = {
                  user,
                  profileVisibility: {
                    alumni: true,
                    mentors: true,
                  },
                };

                setProfile(emptyProfile);

                setFormData({
                  mobileNo: "",
                  dob: "",
                  nativePlace: "",
                  currentLocation: "",

                  college: "",
                  department: "",
                  enrollmentYear: "",
                  expectedGraduationYear: "",
                  currentYear: "",
                  cgpa: "",

                  /*
                   * Keep these as strings while editing.
                   */
                  skills: "",
                  areaOfExpertise: "",
                  careerInterests: "",

                  linkedinUrl: "",
                  githubUrl: "",
                  portfolioUrl: "",

                  photo: "",
                  resumeUrl: "",

                  profileVisibility: {
                    alumni: true,
                    mentors: true,
                  },
                });

                setEditing(true);
              }}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Create Profile
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --------------------------------------------------
  // Main page
  // --------------------------------------------------

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your personal, academic and career information.
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save size={17} />

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Header */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-32 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-linear-to-br from-indigo-600 to-violet-600 text-3xl font-bold text-white shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {user?.name || "Student"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {profile.department || "Department not added"}
                </p>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  {profile.college && (
                    <span className="flex items-center gap-1">
                      <GraduationCap size={14} />
                      {profile.college}
                    </span>
                  )}

                  {profile.currentLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {profile.currentLocation}
                    </span>
                  )}
                </div>
              </div>

              <span className="self-start rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 sm:self-auto">
                STUDENT
              </span>
            </div>
          </div>
        </section>

        {/* Personal Information */}

        <ProfileSection
          icon={<UserCircle size={21} />}
          title="Personal Information"
          description="Your basic personal information"
        >
          {editing ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Mobile Number"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                icon={<Phone size={16} />}
              />

              <InputField
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                icon={<CalendarDays size={16} />}
              />

              <InputField
                label="Native Place"
                name="nativePlace"
                value={formData.nativePlace}
                onChange={handleChange}
                icon={<MapPin size={16} />}
              />

              <InputField
                label="Current Location"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
                icon={<MapPin size={16} />}
              />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem label="Full Name" value={user?.name} />

              <InfoItem label="Email" value={user?.email} />

              <InfoItem label="Mobile Number" value={profile.mobileNo} />

              <InfoItem label="Date of Birth" value={formatDate(profile.dob)} />

              <InfoItem label="Native Place" value={profile.nativePlace} />

              <InfoItem
                label="Current Location"
                value={profile.currentLocation}
              />
            </div>
          )}
        </ProfileSection>

        {/* Academic Information */}

        <ProfileSection
          icon={<GraduationCap size={21} />}
          title="Academic Information"
          description="Your educational background"
        >
          {editing ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="College / Institute"
                name="college"
                value={formData.college}
                onChange={handleChange}
              />

              <InputField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />

              <InputField
                label="Enrollment Year"
                name="enrollmentYear"
                type="number"
                value={formData.enrollmentYear}
                onChange={handleChange}
              />

              <InputField
                label="Expected Graduation Year"
                name="expectedGraduationYear"
                type="number"
                value={formData.expectedGraduationYear}
                onChange={handleChange}
              />

              <InputField
                label="Current Year"
                name="currentYear"
                value={formData.currentYear}
                onChange={handleChange}
              />

              <InputField
                label="CGPA"
                name="cgpa"
                type="number"
                step="0.01"
                value={formData.cgpa}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem label="College / Institute" value={profile.college} />

              <InfoItem label="Department" value={profile.department} />

              <InfoItem
                label="Enrollment Year"
                value={profile.enrollmentYear}
              />

              <InfoItem
                label="Expected Graduation"
                value={profile.expectedGraduationYear}
              />

              <InfoItem label="Current Year" value={profile.currentYear} />

              <InfoItem label="CGPA" value={profile.cgpa} />
            </div>
          )}
        </ProfileSection>

        {/* Career */}

        <ProfileSection
          icon={<BriefcaseBusiness size={21} />}
          title="Career & Skills"
          description="Help alumni and mentors understand your interests"
        >
          {editing ? (
            <div className="space-y-5">
              <ArrayInput
                label="Skills"
                value={formData.skills}
                field="skills"
                onChange={handleArrayChange}
                placeholder="Java, React, Node.js, MongoDB"
              />

              <ArrayInput
                label="Areas of Expertise"
                value={formData.areaOfExpertise}
                field="areaOfExpertise"
                onChange={handleArrayChange}
                placeholder="Web Development, Backend Development"
              />

              <ArrayInput
                label="Career Interests"
                value={formData.careerInterests}
                field="careerInterests"
                onChange={handleArrayChange}
                placeholder="Software Engineering, AI, Full Stack"
              />
            </div>
          ) : (
            <div className="space-y-5">
              <TagGroup title="Skills" values={profile.skills} />

              <TagGroup
                title="Areas of Expertise"
                values={profile.areaOfExpertise}
              />

              <TagGroup
                title="Career Interests"
                values={profile.careerInterests}
              />
            </div>
          )}
        </ProfileSection>

        {/* Professional Links */}

        <ProfileSection
          icon={<Globe size={21} />}
          title="Professional Links"
          description="Connect your professional profiles"
        >
          {editing ? (
            <div className="grid gap-5">
              <InputField
                label="LinkedIn URL"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
              />

              <InputField
                label="GitHub URL"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
              />

              <InputField
                label="Portfolio URL"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <SocialLink label="LinkedIn" url={profile.linkedinUrl} />

              <SocialLink label="GitHub" url={profile.githubUrl} />

              <SocialLink label="Portfolio" url={profile.portfolioUrl} />
            </div>
          )}
        </ProfileSection>

        {/* Visibility */}

        <ProfileSection
          icon={<Users size={21} />}
          title="Profile Visibility"
          description="Control who can discover your profile"
        >
          {editing ? (
            <div className="space-y-4">
              <VisibilityToggle
                title="Visible to Alumni"
                description="Allow alumni to view your student profile."
                enabled={formData.profileVisibility.alumni}
                onChange={() => handleVisibilityChange("alumni")}
              />

              <VisibilityToggle
                title="Visible to Mentors"
                description="Allow mentors to view your student profile."
                enabled={formData.profileVisibility.mentors}
                onChange={() => handleVisibilityChange("mentors")}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <VisibilityStatus
                label="Visible to Alumni"
                enabled={profile.profileVisibility?.alumni}
              />

              <VisibilityStatus
                label="Visible to Mentors"
                enabled={profile.profileVisibility?.mentors}
              />
            </div>
          )}
        </ProfileSection>
      </div>
    </DashboardLayout>
  );
}

/* ==================================================
   COMPONENTS
================================================== */

function ProfileSection({ icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {icon}
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>

            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  step,
  icon,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          step={step}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
}

function ArrayInput({ label, value, field, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="text"
        /*
         * value is now a STRING while editing.
         *
         * Therefore:
         * space works
         * comma works
         * backspace works
         * normal typing works
         */
        value={value}
        onChange={(event) => onChange(event, field)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
      />

      <p className="mt-1.5 text-xs text-slate-400">
        Separate multiple values with commas.
      </p>
    </div>
  );
}

function TagGroup({ title, values = [] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{title}</p>

      {values.length === 0 ? (
        <p className="text-sm text-slate-400">Not added yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"
            >
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialLink({ label, url }) {
  if (!url) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <ExternalLink size={18} className="text-slate-400" />

        <span className="text-sm text-slate-400">{label} not added</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
    >
      <span className="flex-1">{label}</span>

      <ExternalLink size={15} />
    </a>
  );
}

function VisibilityToggle({ title, description, enabled, onChange }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{title}</p>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function VisibilityStatus({ label, enabled }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
      <span className="text-sm font-medium text-slate-700">{label}</span>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          enabled
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {enabled ? "Visible" : "Hidden"}
      </span>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default MyProfile;
