import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:8000/api/v1";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic client-side type validation
    if (!file.type.startsWith("image/")) {
      setError("Avatar must be an image file (jpg, png, webp, etc.).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image must be smaller than 5 MB.");
      return;
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Cover image must be an image file (jpg, png, webp, etc.).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Cover image must be smaller than 10 MB.");
      return;
    }
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
    setError("");
  };

  const validate = () => {
    if (!form.fullname.trim()) return "Full name is required.";
    if (!form.username.trim()) return "Username is required.";
    if (form.username.includes(" ")) return "Username must not contain spaces.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullname", form.fullname.trim());
      formData.append("username", form.username.trim().toLowerCase());
      formData.append("email", form.email.trim().toLowerCase());
      formData.append("password", form.password);
      if (avatar) formData.append("avatar", avatar);
      if (coverImage) formData.append("coverImage", coverImage);

      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Registration failed. Please try again.");
      }

      // Registration successful — send user to login to authenticate
      navigate("/login");
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
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[120px]" />
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
          <h1 className="text-white text-2xl font-semibold mb-1">Create your account</h1>
          <p className="text-zinc-400 text-sm mb-7">Join the community and start sharing</p>

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
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="relative group cursor-pointer">
                <label htmlFor="signup-avatar" className="cursor-pointer block">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 group-hover:border-red-500/60 overflow-hidden flex items-center justify-center bg-[#242424] transition-all duration-200">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[9px] font-medium uppercase tracking-wider">Avatar</span>
                      </div>
                    )}
                  </div>
                  {avatarPreview && (
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                      </svg>
                    </div>
                  )}
                </label>
                <input
                  id="signup-avatar"
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-zinc-600 text-xs">Click to upload avatar (optional)</p>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label htmlFor="signup-cover" className="block text-zinc-300 text-sm font-medium mb-1.5">
                Cover Image
                <span className="ml-1.5 text-zinc-600 font-normal">(optional)</span>
              </label>
              <label
                htmlFor="signup-cover"
                className="group flex items-center justify-center gap-3 w-full h-24 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-red-500/50 bg-[#242424] cursor-pointer overflow-hidden relative transition-all duration-200"
              >
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Upload cover image</span>
                  </div>
                )}
              </label>
              <input
                id="signup-cover"
                type="file"
                name="coverImage"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="signup-fullname" className="block text-zinc-300 text-sm font-medium mb-1.5">
                Full Name
              </label>
              <input
                id="signup-fullname"
                type="text"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
                className="w-full bg-[#242424] border border-white/[0.08] text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 hover:border-white/[0.14]"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="signup-username" className="block text-zinc-300 text-sm font-medium mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">@</span>
                <input
                  id="signup-username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  autoComplete="username"
                  className="w-full bg-[#242424] border border-white/[0.08] text-white placeholder-zinc-600 rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 hover:border-white/[0.14]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-zinc-300 text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-[#242424] border border-white/[0.08] text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 hover:border-white/[0.14]"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-zinc-300 text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="w-full bg-[#242424] border border-white/[0.08] text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 hover:border-white/[0.14]"
              />
            </div>

            {/* Submit */}
            <button
              id="signup-submit-btn"
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
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-zinc-600 text-xs">Already a member?</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <p className="text-center text-zinc-500 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-red-400 hover:text-red-300 font-medium transition-colors duration-150"
            >
              Sign in
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
