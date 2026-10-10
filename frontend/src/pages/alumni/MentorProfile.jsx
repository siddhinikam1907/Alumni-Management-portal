import { useEffect, useState } from "react";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Laptop,
  Save,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getMyMentorProfile,
  createMentorProfile,
  updateMentorProfile,
} from "../../services/mentorService";

function MentorProfile() {
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    expertise: "",
    yearsOfExperience: 0,
    mentorshipTopics: "",
    preferredMode: "ONLINE",
    available: true,
    bio: "",
  });

  useEffect(() => {
    loadMentorProfile();
  }, []);

  const loadMentorProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyMentorProfile();

      if (data.success) {
        const profile = data.mentorProfile;

        setMentorProfile(profile);

        setFormData({
          expertise: Array.isArray(profile.expertise)
            ? profile.expertise.join(", ")
            : profile.expertise || "",

          yearsOfExperience: profile.yearsOfExperience ?? 0,

          mentorshipTopics: Array.isArray(profile.mentorshipTopics)
            ? profile.mentorshipTopics.join(", ")
            : profile.mentorshipTopics || "",

          preferredMode: profile.preferredMode || "ONLINE",

          available: profile.available !== undefined ? profile.available : true,

          bio: profile.bio || "",
        });
      }
    } catch (error) {
      // 404 simply means the alumni has not created a mentor profile yet
      if (error.response?.status === 404) {
        setMentorProfile(null);
        setEditing(true);
      } else {
        setError(
          error.response?.data?.message || "Failed to load mentor profile",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const convertToArray = (value) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const expertise = convertToArray(formData.expertise);
    const mentorshipTopics = convertToArray(formData.mentorshipTopics);

    if (expertise.length === 0) {
      setError("Please add at least one area of expertise.");
      return;
    }

    if (Number(formData.yearsOfExperience) < 0) {
      setError("Years of experience cannot be negative.");
      return;
    }

    const payload = {
      expertise,
      yearsOfExperience: Number(formData.yearsOfExperience),
      mentorshipTopics,
      preferredMode: formData.preferredMode,
      available: formData.available,
      bio: formData.bio.trim(),
    };

    try {
      setSaving(true);

      let data;

      if (mentorProfile) {
        data = await updateMentorProfile(payload);
      } else {
        data = await createMentorProfile(payload);
      }

      if (data.success) {
        setMentorProfile(data.mentorProfile);

        setFormData({
          expertise: Array.isArray(data.mentorProfile.expertise)
            ? data.mentorProfile.expertise.join(", ")
            : "",

          yearsOfExperience: data.mentorProfile.yearsOfExperience ?? 0,

          mentorshipTopics: Array.isArray(data.mentorProfile.mentorshipTopics)
            ? data.mentorProfile.mentorshipTopics.join(", ")
            : "",

          preferredMode: data.mentorProfile.preferredMode || "ONLINE",

          available:
            data.mentorProfile.available !== undefined
              ? data.mentorProfile.available
              : true,

          bio: data.mentorProfile.bio || "",
        });

        setEditing(false);
        setSuccess(
          mentorProfile
            ? "Mentor profile updated successfully."
            : "Mentor profile created successfully.",
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to save mentor profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!mentorProfile) {
      return;
    }

    setFormData({
      expertise: Array.isArray(mentorProfile.expertise)
        ? mentorProfile.expertise.join(", ")
        : "",

      yearsOfExperience: mentorProfile.yearsOfExperience ?? 0,

      mentorshipTopics: Array.isArray(mentorProfile.mentorshipTopics)
        ? mentorProfile.mentorshipTopics.join(", ")
        : "",

      preferredMode: mentorProfile.preferredMode || "ONLINE",

      available:
        mentorProfile.available !== undefined ? mentorProfile.available : true,

      bio: mentorProfile.bio || "",
    });

    setEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading mentor profile..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
                <GraduationCap size={22} />
              </div>

              <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Mentorship
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Mentor Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Share your experience and help students grow.
            </p>
          </div>

          {mentorProfile && !editing && (
            <button
              onClick={() => {
                setEditing(true);
                setSuccess("");
                setError("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* No profile */}
        {!mentorProfile && editing && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="flex gap-3">
              <div className="mt-0.5 text-indigo-600">
                <GraduationCap size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-indigo-900">
                  Become a Mentor
                </h2>

                <p className="mt-1 text-sm leading-6 text-indigo-700">
                  Create your mentor profile so students can discover you based
                  on your expertise and mentorship interests.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View Mode */}
        {mentorProfile && !editing && (
          <>
            {/* Profile Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-indigo-600 shadow">
                    {mentorProfile.alumni?.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "A"}
                  </div>

                  <div className="text-white">
                    <h2 className="text-2xl font-bold">
                      {mentorProfile.alumni?.name || "Alumni Mentor"}
                    </h2>

                    <p className="mt-1 text-sm text-indigo-100">
                      {mentorProfile.alumni?.email}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm">
                      {mentorProfile.available ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-green-300" />
                          Available for Mentorship
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          Currently Unavailable
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <Briefcase size={20} className="text-indigo-600" />

                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Experience
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {mentorProfile.yearsOfExperience}{" "}
                    {mentorProfile.yearsOfExperience === 1 ? "Year" : "Years"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <Laptop size={20} className="text-indigo-600" />

                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Mode
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {mentorProfile.preferredMode}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <Users size={20} className="text-indigo-600" />

                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Mentor Status
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {mentorProfile.available ? "Available" : "Unavailable"}
                  </p>
                </div>
              </div>
            </div>

            {/* Expertise */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                  <Briefcase size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Areas of Expertise
                  </h2>

                  <p className="text-xs text-slate-500">
                    Skills you can guide students in
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {mentorProfile.expertise?.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Mentorship Topics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
                  <BookOpen size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Mentorship Topics
                  </h2>

                  <p className="text-xs text-slate-500">
                    Topics students can discuss with you
                  </p>
                </div>
              </div>

              {mentorProfile.mentorshipTopics?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mentorProfile.mentorshipTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No mentorship topics added yet.
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <UserRound size={18} />
                </div>

                <h2 className="font-semibold text-slate-900">About Me</h2>
              </div>

              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                {mentorProfile.bio || "No bio added yet."}
              </p>
            </div>
          </>
        )}

        {/* Create / Edit Form */}
        {editing && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {mentorProfile
                  ? "Edit Mentor Profile"
                  : "Create Mentor Profile"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide information that helps students understand how you can
                mentor them.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Expertise */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Areas of Expertise *
                </label>

                <input
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  placeholder="Java, React, Machine Learning, Career Guidance"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Separate multiple skills with commas.
                </p>
              </div>

              {/* Experience */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Years of Experience *
                </label>

                <input
                  type="number"
                  name="yearsOfExperience"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Preferred Mode */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Preferred Mentorship Mode
                </label>

                <select
                  name="preferredMode"
                  value={formData.preferredMode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="BOTH">Online & Offline</option>
                </select>
              </div>

              {/* Topics */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mentorship Topics
                </label>

                <input
                  type="text"
                  name="mentorshipTopics"
                  value={formData.mentorshipTopics}
                  onChange={handleChange}
                  placeholder="Interview Preparation, Career Guidance, DSA"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Separate multiple topics with commas.
                </p>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mentor Bio
                </label>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell students about your professional experience and how you can help them..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Availability */}
              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Available for mentorship
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Students will be able to send you mentor requests when
                      this is enabled.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              {mentorProfile && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : mentorProfile
                    ? "Save Changes"
                    : "Create Mentor Profile"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MentorProfile;
