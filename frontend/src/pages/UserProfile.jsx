import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API_BASE = "http://localhost:8000/api/v1";

/* ─── Helper: auth headers ─────────────────────────────────────────────── */
function getAuthHeaders(isJson = true) {
  const stored = localStorage.getItem("videotb_user");
  const parsedUser = stored ? JSON.parse(stored) : null;
  const token = parsedUser?.accessToken;
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (isJson) headers["Content-Type"] = "application/json";
  return headers;
}

/* ─── Spinner ───────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/* ─── Toast notification ────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-7 right-7 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl backdrop-blur-md border max-w-sm
        ${isSuccess
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}
    >
      {isSuccess ? (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        type="button"
        aria-label="Dismiss"
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
      >
        ×
      </button>
    </div>
  );
}

/* ─── Shared error banner ───────────────────────────────────────────────── */
function ErrorBanner({ message }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5"
    >
      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

/* ─── Tab definitions ───────────────────────────────────────────────────── */
const TABS = [
  { id: "overview",  label: "Overview",        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "account",   label: "Account Details",  icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { id: "password",  label: "Change Password",  icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  { id: "avatar",    label: "Avatar",           icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "cover",     label: "Cover Image",      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "history",   label: "Watch History",    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
];

/* ══════════════════════════════════════════════════════════════════════════
   PROFILE HERO
══════════════════════════════════════════════════════════════════════════ */
function ProfileHero({ user }) {
  const initials = (user.fullname || user.username || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative rounded-2xl mb-6 border border-white/[0.07] bg-[#18181c]">

      {/* Cover image — contains its own overflow */}
      <div className="relative w-full h-44 rounded-t-2xl overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f3460]">
        {user.coverImage ? (
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover block" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/25 via-blue-600/20 to-violet-600/10" />
        )}
        {/* Bottom fade so avatar blends in */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#18181c]/80" />
      </div>

      {/* Identity row — avatar overlaps the cover via negative margin */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 px-7 pb-6 pt-0">
        {/* Avatar — pulled up with negative margin, z-index keeps it above cover */}
        <div className="relative -mt-12 z-10 flex-shrink-0 w-24 h-24 rounded-full border-[3px] border-[#18181c] bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center overflow-hidden shadow-lg shadow-violet-500/30">
          {user.avatar ? (
            <img src={user.avatar} alt={`${user.username} avatar`} className="w-full h-full object-cover block" />
          ) : (
            <span className="text-2xl font-bold text-white tracking-tight">{initials}</span>
          )}
          {/* Online dot */}
          <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#18181c]" aria-hidden="true" />
        </div>

        {/* Name / username / email */}
        <div className="pb-1 min-w-0">
          <h2 className="text-xl font-bold text-white leading-tight mb-0.5">{user.fullname || "—"}</h2>
          <p className="text-sm text-violet-300 font-medium mb-0.5">@{user.username}</p>
          <p className="text-xs text-zinc-500">{user.email}</p>
        </div>
      </div>
    </div>
  );

}

/* ══════════════════════════════════════════════════════════════════════════
   OVERVIEW PANEL
══════════════════════════════════════════════════════════════════════════ */
function OverviewPanel({ user, logout, navigate }) {
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/users/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });
    } catch { /* ignore */ }
    finally {
      logout();
      navigate("/login");
    }
  };

  const rows = [
    { label: "Full Name", value: user.fullname || "—",       icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Username",  value: `@${user.username || "—"}`, icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" },
    { label: "Email",     value: user.email || "—",          icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  ];

  return (
    <div className="bg-[#18181c] border border-white/[0.07] rounded-2xl p-8">
      <h2 className="text-lg font-bold text-white mb-1">Account Overview</h2>
      <p className="text-sm text-zinc-500 mb-6">Your current profile information.</p>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {rows.map(({ label, value, icon }) => (
          <div key={label} className="flex items-center gap-3 bg-[#222228] border border-white/[0.07] rounded-xl p-4 hover:border-violet-500/25 transition-colors duration-200">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-300 flex-shrink-0">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-white truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Images preview */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Avatar</p>
          {user.avatar
            ? <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-white/[0.08]" />
            : <div className="w-16 h-16 rounded-full bg-[#222228] border border-dashed border-white/[0.1] flex items-center justify-center text-zinc-600 text-xs">None</div>}
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Cover Image</p>
          {user.coverImage
            ? <img src={user.coverImage} alt="Cover" className="w-full max-w-xs h-20 rounded-xl object-cover border border-white/[0.08]" />
            : <div className="w-full max-w-xs h-20 rounded-xl bg-[#222228] border border-dashed border-white/[0.1] flex items-center justify-center text-zinc-600 text-xs">None</div>}
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-white/[0.06] pt-6">
        <button
          id="profile-logout-btn"
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/18 hover:border-red-500/45 hover:-translate-y-px transition-all duration-200"
        >
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ACCOUNT DETAILS PANEL
══════════════════════════════════════════════════════════════════════════ */
function AccountPanel({ user, login, showToast }) {
  const [form, setForm] = useState({ fullname: user.fullname || "", email: user.email || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullname.trim()) { setError("Full name is required."); return; }
    if (!form.email.trim())    { setError("Email is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/update-account`, {
        method: "PATCH",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ fullname: form.fullname.trim(), email: form.email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed.");

      const stored = localStorage.getItem("videotb_user");
      const parsedUser = stored ? JSON.parse(stored) : {};
      login({ ...parsedUser, fullname: form.fullname.trim(), email: form.email.trim() });
      showToast("Account details updated!", "success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#222228] border border-white/[0.08] text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 hover:border-white/[0.14]";

  return (
    <div className="bg-[#18181c] border border-white/[0.07] rounded-2xl p-8">
      <h2 className="text-lg font-bold text-white mb-1">Update Account Details</h2>
      <p className="text-sm text-zinc-500 mb-6">Change your display name or email address.</p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="account-fullname" className="text-sm font-medium text-zinc-300">Full Name</label>
          <input id="account-fullname" type="text" name="fullname" value={form.fullname} onChange={handleChange} placeholder="John Doe" autoComplete="name" className={inputCls} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="account-email" className="text-sm font-medium text-zinc-300">Email Address</label>
          <input id="account-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" className={inputCls} />
        </div>

        <button
          id="account-save-btn"
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 self-start mt-1 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold px-7 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all duration-200 shadow-lg shadow-violet-600/25"
        >
          {loading ? <><Spinner /> Saving...</> : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CHANGE PASSWORD PANEL
══════════════════════════════════════════════════════════════════════════ */
function PasswordPanel({ showToast }) {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.oldPassword)               { setError("Current password is required."); return; }
    if (!form.newPassword)               { setError("New password is required."); return; }
    if (form.newPassword.length < 8)     { setError("New password must be at least 8 characters."); return; }
    if (form.newPassword !== form.confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/change-password`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ oldPassword: form.oldPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Password change failed.");
      setForm({ oldPassword: "", newPassword: "", confirm: "" });
      showToast("Password changed successfully!", "success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#222228] border border-white/[0.08] text-white placeholder-zinc-600 rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 hover:border-white/[0.14]";

  const EyeOpen = () => (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const EyeOff = () => (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="bg-[#18181c] border border-white/[0.07] rounded-2xl p-8">
      <h2 className="text-lg font-bold text-white mb-1">Change Password</h2>
      <p className="text-sm text-zinc-500 mb-6">Choose a strong password of at least 8 characters.</p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md" noValidate>
        {/* Current password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pwd-old" className="text-sm font-medium text-zinc-300">Current Password</label>
          <div className="relative">
            <input id="pwd-old" type={showOld ? "text" : "password"} name="oldPassword" value={form.oldPassword} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" className={inputCls} />
            <button type="button" onClick={() => setShowOld(!showOld)} aria-label={showOld ? "Hide" : "Show"} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-violet-300 transition-colors duration-150">
              {showOld ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pwd-new" className="text-sm font-medium text-zinc-300">New Password</label>
          <div className="relative">
            <input id="pwd-new" type={showNew ? "text" : "password"} name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Min. 8 characters" autoComplete="new-password" className={inputCls} />
            <button type="button" onClick={() => setShowNew(!showNew)} aria-label={showNew ? "Hide" : "Show"} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-violet-300 transition-colors duration-150">
              {showNew ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
        </div>

        {/* Confirm */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pwd-confirm" className="text-sm font-medium text-zinc-300">Confirm New Password</label>
          <input id="pwd-confirm" type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="Repeat new password" autoComplete="new-password" className={`w-full bg-[#222228] border border-white/[0.08] text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 hover:border-white/[0.14]`} />
          {form.newPassword && form.confirm && (
            <p className={`text-xs font-medium mt-1 ${form.newPassword === form.confirm ? "text-emerald-400" : "text-red-400"}`}>
              {form.newPassword === form.confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}
        </div>

        <button
          id="pwd-submit-btn"
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 self-start mt-1 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold px-7 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all duration-200 shadow-lg shadow-violet-600/25"
        >
          {loading ? <><Spinner /> Updating...</> : "Update Password"}
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   AVATAR PANEL
══════════════════════════════════════════════════════════════════════════ */
function AvatarPanel({ user, login, showToast }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (f.size > 5 * 1024 * 1024)    { setError("Image must be smaller than 5 MB."); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select an image first."); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch(`${API_BASE}/users/avatar`, {
        method: "PATCH",
        credentials: "include",
        headers: getAuthHeaders(false),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Avatar update failed.");
      const newUrl = data?.data?.avatar || preview;
      const stored = localStorage.getItem("videotb_user");
      const parsedUser = stored ? JSON.parse(stored) : {};
      login({ ...parsedUser, avatar: newUrl });
      showToast("Avatar updated!", "success");
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentAvatar = preview || user.avatar;
  const initials = (user.fullname || user.username || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-[#18181c] border border-white/[0.07] rounded-2xl p-8">
      <h2 className="text-lg font-bold text-white mb-1">Update Avatar</h2>
      <p className="text-sm text-zinc-500 mb-6">Upload a new profile picture. Max 5 MB.</p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md" noValidate>
        {/* Clickable avatar preview */}
        <div className="flex flex-col items-start gap-3">
          <label htmlFor="avatar-file-input" className="cursor-pointer group flex flex-col items-center gap-3">
            <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-white/20 group-hover:border-violet-500/60 overflow-hidden flex items-center justify-center bg-[#222228] transition-all duration-200">
              {currentAvatar ? (
                <img src={currentAvatar} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-violet-400">{initials}</span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 text-white text-xs font-semibold">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Change
              </div>
            </div>
            <p className="text-xs text-zinc-500">Click to browse (jpg, png, webp)</p>
          </label>
          <input
            id="avatar-file-input"
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
            aria-label="Upload avatar image"
          />
        </div>

        {/* File chip */}
        {file && (
          <div className="flex items-center gap-2 bg-[#222228] border border-white/[0.08] rounded-full px-4 py-1.5 text-sm text-zinc-400 max-w-xs">
            <span className="truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="ml-auto text-zinc-600 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0"
              aria-label="Remove file"
            >×</button>
          </div>
        )}

        <button
          id="avatar-submit-btn"
          type="submit"
          disabled={loading || !file}
          className="flex items-center justify-center gap-2 self-start bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold px-7 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all duration-200 shadow-lg shadow-violet-600/25"
        >
          {loading ? <><Spinner /> Uploading...</> : "Upload Avatar"}
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   COVER IMAGE PANEL
══════════════════════════════════════════════════════════════════════════ */
function CoverPanel({ user, login, showToast }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (f.size > 10 * 1024 * 1024)   { setError("Image must be smaller than 10 MB."); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select an image first."); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("coverImage", file);
      const res = await fetch(`${API_BASE}/users/cover-image`, {
        method: "PATCH",
        credentials: "include",
        headers: getAuthHeaders(false),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Cover image update failed.");
      const newUrl = data?.data?.coverImage || preview;
      const stored = localStorage.getItem("videotb_user");
      const parsedUser = stored ? JSON.parse(stored) : {};
      login({ ...parsedUser, coverImage: newUrl });
      showToast("Cover image updated!", "success");
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#18181c] border border-white/[0.07] rounded-2xl p-8">
      <h2 className="text-lg font-bold text-white mb-1">Update Cover Image</h2>
      <p className="text-sm text-zinc-500 mb-6">Recommended: 1500×500 px. Max 10 MB.</p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl" noValidate>
        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop cover image here or click to browse"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full h-40 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200 outline-none
            ${dragging
              ? "border-violet-500 bg-violet-500/8"
              : "border-white/[0.1] bg-[#222228] hover:border-violet-500/50 hover:bg-[#2a2a32] focus-visible:border-violet-500/60"
            }`}
        >
          {preview || user.coverImage ? (
            <img src={preview || user.coverImage} alt="Cover preview" className="w-full h-full object-cover block" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-600 px-4 text-center pointer-events-none">
              <svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Drag & drop or <span className="text-violet-400 underline">browse</span></p>
              <p className="text-xs opacity-60">PNG, JPG, WebP up to 10 MB</p>
            </div>
          )}
        </div>

        <input
          id="cover-file-input"
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => processFile(e.target.files[0])}
          className="hidden"
          aria-label="Upload cover image"
        />

        {/* File chip */}
        {file && (
          <div className="flex items-center gap-2 bg-[#222228] border border-white/[0.08] rounded-full px-4 py-1.5 text-sm text-zinc-400 max-w-xs">
            <span className="truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="ml-auto text-zinc-600 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0"
              aria-label="Remove file"
            >×</button>
          </div>
        )}

        <button
          id="cover-submit-btn"
          type="submit"
          disabled={loading || !file}
          className="flex items-center justify-center gap-2 self-start bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold px-7 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all duration-200 shadow-lg shadow-violet-600/25"
        >
          {loading ? <><Spinner /> Uploading...</> : "Upload Cover Image"}
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   WATCH HISTORY PANEL
══════════════════════════════════════════════════════════════════════════ */
function HistoryPanel({ navigate }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/users/watch-history`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (res.status === 401 || res.status === 403) { navigate("/login"); return; }
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          setVideos(list);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load watch history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="bg-[#18181c] border border-white/[0.07] rounded-2xl p-8">
      <h2 className="text-lg font-bold text-white mb-1">Watch History</h2>
      <p className="text-sm text-zinc-500 mb-6">Videos you have watched recently.</p>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        /* Skeletons */
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center bg-[#222228] border border-white/[0.07] rounded-xl p-3" aria-hidden="true">
              <div className="w-24 h-14 rounded-lg bg-[#2a2a32] flex-shrink-0 animate-pulse" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3 w-4/5 rounded bg-[#2a2a32] animate-pulse" />
                <div className="h-2.5 w-2/5 rounded bg-[#2a2a32] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        /* Empty */
        <div className="flex flex-col items-center gap-4 py-16 text-zinc-600 text-center">
          <svg width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" className="opacity-30" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base">No watch history yet</p>
          <a
            href="/home"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-88 hover:-translate-y-px transition-all duration-200"
          >
            Browse Videos
          </a>
        </div>
      ) : (
        /* List */
        <ul className="flex flex-col gap-3" aria-label="Watch history">
          {videos.map((v, i) => {
            const thumb   = v.thumbnail || v.thumbnailUrl || null;
            const title   = v.title || "Untitled";
            const channel = v.owner?.username || v.channel || "";
            const views   = v.views != null ? `${Number(v.views).toLocaleString()} views` : "";
            return (
              <li key={v._id || v.id || i} className="flex gap-3 items-center bg-[#222228] border border-white/[0.07] rounded-xl p-3 hover:border-violet-500/25 hover:translate-x-1 transition-all duration-200">
                <div className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#2a2a32] flex items-center justify-center">
                  {thumb ? (
                    <img src={thumb} alt={title} className="w-full h-full object-cover block" loading="lazy" />
                  ) : (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-zinc-600" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate mb-0.5">{title}</p>
                  {channel && <p className="text-xs text-zinc-400 mb-0.5">{channel}</p>}
                  {views   && <p className="text-xs text-zinc-600">{views}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function UserProfile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const dismissToast = () => setToast(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto p-7 pb-12" id="main-content">
          <h1 className="sr-only">My Profile - VideoTB</h1>

          {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}

          <ProfileHero user={user} />

          {/* Tab bar */}
          <div
            role="tablist"
            aria-label="Profile sections"
            className="flex flex-wrap gap-1 mb-5 bg-[#18181c] border border-white/[0.07] rounded-2xl p-1.5"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? "bg-gradient-to-r from-violet-600/20 to-blue-600/15 text-violet-300 border border-violet-500/30"
                    : "text-zinc-400 hover:bg-[#222228] hover:text-white border border-transparent"
                  }`}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panels */}
          <div>
            {activeTab === "overview"  && <OverviewPanel  user={user} logout={logout} navigate={navigate} />}
            {activeTab === "account"   && <AccountPanel   user={user} login={login}   showToast={showToast} />}
            {activeTab === "password"  && <PasswordPanel  showToast={showToast} />}
            {activeTab === "avatar"    && <AvatarPanel    user={user} login={login}   showToast={showToast} />}
            {activeTab === "cover"     && <CoverPanel     user={user} login={login}   showToast={showToast} />}
            {activeTab === "history"   && <HistoryPanel   navigate={navigate} />}
          </div>
        </main>
      </div>
    </>
  );
}
