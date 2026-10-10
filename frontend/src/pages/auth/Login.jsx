import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(formData);

      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      // Redirect according to role
      if (data.user.role === "STUDENT") {
        navigate("/student/dashboard");
      } else if (data.user.role === "ALUMNI") {
        navigate("/alumni/dashboard");
      } else if (data.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to connect to the server",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Left branding section */}
      <div className="relative hidden overflow-hidden bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 lg:flex">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3 text-white">
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
              <Users size={24} />
            </div>

            <div>
              <h1 className="font-bold">AlumniConnect</h1>
              <p className="text-xs text-indigo-200">Alumni Network</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-lg"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-indigo-100 backdrop-blur">
              <Sparkles size={16} />
              AI-Powered Alumni Network
            </div>

            <h2 className="text-5xl font-bold leading-tight text-white xl:text-6xl">
              Your network
              <br />
              is your <span className="text-indigo-200">opportunity.</span>
            </h2>

            <p className="mt-6 max-w-md text-lg leading-8 text-indigo-100">
              Connect with alumni, discover mentors, explore opportunities and
              grow together.
            </p>
          </motion.div>

          <p className="text-sm text-indigo-200">
            Connect • Collaborate • Grow
          </p>
        </div>
      </div>

      {/* Login section */}
      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 p-3 text-white">
              <Users size={22} />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">AlumniConnect</h1>
              <p className="text-xs text-slate-400">Alumni Network</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back 👋
            </h2>

            <p className="mt-2 text-slate-500">
              Sign in to continue to your alumni network.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50">
                <Mail size={19} className="text-slate-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50">
                <Lock size={19} className="text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 transition hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="flex w-full items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
