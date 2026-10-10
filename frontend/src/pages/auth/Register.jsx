import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  UserPlus,
  Phone,
  MapPin,
  Building2,
  CalendarDays,
  ExternalLink,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",

    // Alumni fields
    passoutYear: "",
    department: "",
    nativePlace: "",
    currentLocation: "",
    companyName: "",
    previousCompanies: "",
    areaOfExpertise: "",
    linkedinUrl: "",
    mobileNo: "",
    photo: "",
    dob: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------------
    // Common validation
    // -----------------------------------

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    // -----------------------------------
    // Alumni validation
    // -----------------------------------

    if (formData.role === "ALUMNI") {
      if (!formData.passoutYear) {
        setError("Please enter your passout year.");
        return;
      }

      if (!formData.department.trim()) {
        setError("Please enter your department.");
        return;
      }

      if (!formData.nativePlace.trim()) {
        setError("Please enter your native place.");
        return;
      }

      if (!formData.currentLocation.trim()) {
        setError("Please enter your current location.");
        return;
      }

      if (!formData.companyName.trim()) {
        setError("Please enter your current company.");
        return;
      }

      if (!formData.mobileNo.trim()) {
        setError("Please enter your mobile number.");
        return;
      }

      if (!formData.dob) {
        setError("Please enter your date of birth.");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      // -----------------------------------
      // Alumni payload
      // -----------------------------------

      if (formData.role === "ALUMNI") {
        payload.passoutYear = Number(formData.passoutYear);

        payload.department = formData.department.trim();

        payload.nativePlace = formData.nativePlace.trim();

        payload.currentLocation = formData.currentLocation.trim();

        payload.companyName = formData.companyName.trim();

        payload.previousCompanies = formData.previousCompanies
          .split(",")
          .map((company) => company.trim())
          .filter(Boolean);

        payload.areaOfExpertise = formData.areaOfExpertise
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

        payload.linkedinUrl = formData.linkedinUrl.trim();

        payload.mobileNo = formData.mobileNo.trim();

        payload.photo = formData.photo.trim();

        payload.dob = formData.dob;
      }

      const data = await register(payload);

      if (!data.success) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Unable to register. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ================= LEFT PANEL ================= */}

        <div className="hidden bg-indigo-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <GraduationCap size={25} />
              </div>

              <div>
                <h1 className="text-xl font-bold">AlumniConnect</h1>

                <p className="text-sm text-indigo-200">
                  Alumni Management Portal
                </p>
              </div>
            </div>

            <div className="mt-24 max-w-lg">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-200">
                Join the community
              </p>

              <h2 className="text-5xl font-bold leading-tight">
                Connect.
                <br />
                Learn.
                <br />
                Grow together.
              </h2>

              <p className="mt-6 text-lg leading-8 text-indigo-100">
                Build meaningful connections between students, alumni and the
                college community.
              </p>
            </div>
          </div>

          <div className="text-sm text-indigo-200">
            Alumni Management & Engagement Portal
          </div>
        </div>

        {/* ================= FORM ================= */}

        <div className="flex justify-center px-6 py-10">
          <div className="w-full max-w-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Join the alumni community and start connecting.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ================= ACCOUNT ================= */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Account Information
                </h3>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    icon={<User size={17} />}
                  />

                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail size={17} />}
                  />

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= ROLE ================= */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Account Type
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleChange("STUDENT")}
                    className={`rounded-xl border p-5 text-left ${
                      formData.role === "STUDENT"
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                        : "border-slate-200"
                    }`}
                  >
                    <GraduationCap size={24} className="text-indigo-600" />

                    <p className="mt-2 font-semibold">Student</p>

                    <p className="mt-1 text-xs text-slate-500">
                      Find alumni, mentors and opportunities.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange("ALUMNI")}
                    className={`rounded-xl border p-5 text-left ${
                      formData.role === "ALUMNI"
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                        : "border-slate-200"
                    }`}
                  >
                    <BriefcaseBusiness size={24} className="text-indigo-600" />

                    <p className="mt-2 font-semibold">Alumni</p>

                    <p className="mt-1 text-xs text-slate-500">
                      Mentor students and share opportunities.
                    </p>
                  </button>
                </div>
              </div>

              {/* ================= ALUMNI DETAILS ================= */}

              {formData.role === "ALUMNI" && (
                <div className="space-y-6">
                  {/* Basic Alumni Information */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900">
                      Alumni Information
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Complete your alumni profile to connect with the college
                      community.
                    </p>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <InputField
                        label="Passout Year"
                        name="passoutYear"
                        type="number"
                        value={formData.passoutYear}
                        onChange={handleChange}
                        icon={<GraduationCap size={17} />}
                      />

                      <InputField
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="CSE"
                        icon={<GraduationCap size={17} />}
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
                        label="Current Company"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        icon={<Building2 size={17} />}
                      />

                      <InputField
                        label="Mobile Number"
                        name="mobileNo"
                        value={formData.mobileNo}
                        onChange={handleChange}
                        icon={<Phone size={17} />}
                      />

                      <InputField
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        icon={<CalendarDays size={17} />}
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
                    <h3 className="text-lg font-bold text-slate-900">
                      Professional Information
                    </h3>

                    <div className="mt-5 space-y-5">
                      <TextAreaField
                        label="Previous Companies"
                        name="previousCompanies"
                        value={formData.previousCompanies}
                        onChange={handleChange}
                        placeholder="TCS, Infosys, Wipro"
                        icon={<Building2 size={17} />}
                      />

                      <TextAreaField
                        label="Area of Expertise"
                        name="areaOfExpertise"
                        value={formData.areaOfExpertise}
                        onChange={handleChange}
                        placeholder="Java, React, MongoDB, AI"
                        icon={<BriefcaseBusiness size={17} />}
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
                </div>
              )}

              {/* ================= SUBMIT ================= */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={18} />

                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= INPUT ================= */

function InputField({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder = "",
  type = "text",
}) {
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
          type={type}
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

/* ================= TEXTAREA ================= */

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

export default Register;
