import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:8000/api/v1";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic HTML/JS validation
    if (!form.identifier.trim()) {
      setError("Email or username is required.");
      return;
    }
    if (!form.password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      // Send both fields — backend accepts either email or username and will match whichever is valid
      const payload = {
        email: form.identifier.trim(),
        username: form.identifier.trim(),
        password: form.password,
      };

      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Login failed. Please try again.");
      }

      // Contract: { success: true, data: { user: {...}, accessToken: "..." } }
      const { user, accessToken } = data.data;
      login({ ...user, accessToken });
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12">
      {/* Background glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/40">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">VideōTB</span>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          <h1 className="text-white text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-zinc-400 text-sm mb-7">Sign in to continue to your account</p>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email / Username */}
            <div>
              <label htmlFor="login-identifier" className="block text-zinc-300 text-sm font-medium mb-1.5">
                Email or Username
              </label>
              <input
                id="login-identifier"
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="you@example.com or @username"
                autoComplete="username"
                className="w-full bg-[#242424] border border-white/[0.08] text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 hover:border-white/[0.14]"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-zinc-300 text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-[#242424] border border-white/[0.08] text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 hover:border-white/[0.14]"
              />
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-zinc-600 text-xs">New here?</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <p className="text-center text-zinc-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-red-400 hover:text-red-300 font-medium transition-colors duration-150"
            >
              Signup
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-6">
          © {new Date().getFullYear()} VideōTB. All rights reserved.
        </p>
      </div>
    </div>
  );
}
